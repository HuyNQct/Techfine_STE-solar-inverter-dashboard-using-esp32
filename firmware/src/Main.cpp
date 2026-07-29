#include <Arduino.h>
#include <WiFi.h>
#include "ThingSpeak.h"
#include <ArduinoOTA.h>
#include <TelnetStream.h>
#include "../include/Config.h"
#include "utils.h"
#include "parse_data.h"

#ifdef ENABLE_TELEGRAM
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
WiFiClientSecure clientTCP;
UniversalTelegramBot bot(BOT_TOKEN, clientTCP);
#endif

WiFiClient client;
HardwareSerial InverterSerial(2);

// ==============================================================
// CORE 0: XỬ LÝ TÁC VỤ MẠNG (THINGSPEAK, TELEGRAM, OTA)
// ==============================================================
void networkTask(void *pvParameters)
{
    unsigned long lastCloudSyncTask = 0;

    for (;;)
    {
        unsigned long now = millis();

        // Tự động kiểm tra kết nối mạng và reconnect nếu lỗi
        if (WiFi.status() != WL_CONNECTED && (now - lastWifiCheck >= WIFI_CHECK_INTERVAL))
        {
            WiFi.disconnect();
            WiFi.reconnect();
            lastWifiCheck = now;
        }

        // Bắt tín hiệu nạp firmware qua OTA
        if (WiFi.status() == WL_CONNECTED)
        {
            ArduinoOTA.handle();
        }

#ifdef ENABLE_TELEGRAM
        // Xử lý hàng đợi tin nhắn telegram
        if (WiFi.status() == WL_CONNECTED)
        {
            uint8_t msgCode; // mã thông báo
            while (xQueueReceive(telegramQueue, &msgCode, 0) == pdTRUE)
            {
                String msg = "";
                switch (msgCode)
                {
                case 1: msg = "💀 NGUY HIỂM: Mất Data khi đang tải nặng! Đã chuyển bớt sang Lưới."; break;
                case 2: msg = "⚠️ QUÁ TẢI! Đã chuyển bớt sang Lưới."; break;
                case 3: msg = "✅ Tải ổn. Kéo về Solar."; break;
                case 4: msg = "⚠️ CÚP ĐIỆN!"; break;
                case 5: msg = "✅ CÓ ĐIỆN LẠI."; break;
                case 6: msg = "🔴 PIN CẠN!"; break;
                }
                if (msg != "") bot.sendMessage(CHAT_ID, msg, "");
            }
        }
#endif

        // Đồng bộ thingSpeak định kì CLOUD_INTERVAL ms
        if ((now - lastCloudSyncTask >= CLOUD_INTERVAL) && (WiFi.status() == WL_CONNECTED) && isValidData)
        {
            lastCloudSyncTask = now;

            if (xSemaphoreTake(dataMutex, portMAX_DELAY)) // khoá mutex
            // Đảm bảo core 1 không ghi đè dữ liệu mới vào đúng lúc core 0 đang đọc
            {
                ThingSpeak.setField(1, g_batVolt);
                ThingSpeak.setField(2, g_chargeCur);
                ThingSpeak.setField(3, g_pvPower);
                ThingSpeak.setField(4, g_acLoad);
                ThingSpeak.setField(5, g_temp);
                ThingSpeak.setField(6, g_gridVolt);
                ThingSpeak.setField(7, g_batCap);
                ThingSpeak.setField(8, isRunningOnGrid ? 1.0f : 0.0f);

                xSemaphoreGive(dataMutex); // nhả mutex

                int status = ThingSpeak.writeFields(THINGSPEAK_CHANNEL, THINGSPEAK_WRITE_KEY); // push data
                if (status != 200) // push không thành công
                {
                    DEBUG_PRINT("❌ ThingSpeak ERROR: ");
                    DEBUG_PRINTLN(status);
                }
            }
        }

        vTaskDelay(pdMS_TO_TICKS(10)); // delay 10ms
    }
}

// ==============================================================
// SETUP: KHỞI TẠO HỆ THỐNG
// ==============================================================
void setup()
{
    Serial.begin(115200); // USB debug
    InverterSerial.begin(2400, SERIAL_8N1, RX_PIN, TX_PIN); // giao tiếp RS485 inverter: baud 2400, RX=GPIO25, TX=GPIO26

#ifdef ENABLE_ATS
    // Khởi tạo relay cho bộ chuyển mạch ATS
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW); // mặc định dùng solar
#endif

#ifdef ENABLE_TELEGRAM
    telegramQueue = xQueueCreate(10, sizeof(uint8_t)); // hàng chờ lưu tối đa 10 cảnh báo telegram
    clientTCP.setInsecure();  // bỏ kiểm tra SSL certificate để telegram bot hoạt động
#endif

    // Tạo mutex
    dataMutex = xSemaphoreCreateMutex();   // bảo vệ biến lưu thông số điện
    serialMutex = xSemaphoreCreateMutex(); // cố định giao tiếp serial

    // Khởi tạo mạng
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    // check wifi
    Serial.print("Đang bat WiFi...");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi OK!");

    TelnetStream.begin();     // khởi tạo telnet debug qua mạng nội bộ
    ThingSpeak.begin(client); // khởi tạo ThinksSpeak

    DEBUG_PRINT("IP CUA ESP32 LA: ");
    DEBUG_PRINTLN(WiFi.localIP());

    // cấu hình OTA
    // Đặt tên và mật khẩu
    ArduinoOTA.setHostname(OTA_HOSTNAME); // tên OTA
    ArduinoOTA.setPassword(OTA_PASSWORD);  // mật khẩu OTA

    // Bắt đầu nạp
    ArduinoOTA.onStart([](){
        isUpdatingOTA = true;
        otaStartTime = millis();
        // Khóa trạng thái relay hiện tại để tránh sập nguồn khi đang nạp code
        if (isRunningOnGrid)
        {
            DEBUG_PRINTLN("OTA Start: Đang gánh tải Lưới, khoá relay.");
        }
        else
        {
            digitalWrite(RELAY_PIN, LOW);
            DEBUG_PRINTLN("OTA Start: Đã khóa relay ở Solar.");
        }
    });

    // OTA lỗi
    ArduinoOTA.onError([](ota_error_t error){
        isUpdatingOTA = false;
        DEBUG_PRINTF("❌ Lỗi OTA [%u]\n", error);
    });

    // Nạp thành công, reboot
    ArduinoOTA.onEnd([](){ DEBUG_PRINTLN("\n✅ Nạp OTA thành công! Khởi động lại..."); });
    ArduinoOTA.begin();

    // Cố định task mạng chạy trên core 0
    xTaskCreatePinnedToCore(networkTask, "NetworkTask", 8192/* 8KB */, NULL, 1, NULL, 0);
    DEBUG_PRINTLN("🚀 Hệ Thống Đã Khởi Động");
}

// ==============================================================
// CORE 1 (LOOP): LẤY MẪU SERIAL, PHÂN TÍCH DATA & LOGIC ATS
// ==============================================================
void loop() {
    unsigned long now = millis();

    // Ưu tiên OTA, khoá logic ATS
    if (isUpdatingOTA)
    {
        if (now - otaStartTime > 90000) isUpdatingOTA = false;
        else return;
    }

    // Gửi lệnh QPIGS truy vấn thông số xuống inverter theo chu kỳ
    if (now - lastCommandTime >= READ_INTERVAL)
    {
        lastCommandTime = now;
        InverterSerial.print("QPIGS\xB7\xA9\r");
    }

    // Xoá frame lỗi khi bị treo quá 300ms
    if (rxIndex > 0 && now - lastByteTime > 300)
    {
        rxIndex = 0;
    }

    // phân tích dâta thu được
    while (InverterSerial.available())
    {
        char c = InverterSerial.read();
        lastByteTime = millis();

        if (c == '\r') // kí tự kết thúc chuỗi của inverter
        {
            rxBuffer[rxIndex] = '\0';

            if (strlen(rxBuffer) > 20) // chỉ nhận frame hợp lệ có độ dài > 20
            {
                InverterData parsedData;
                if (parseInverterData(rxBuffer, parsedData)) // bóc data thành công
                {
                    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) // khoá mutex trước khi gửi
                    {
                        g_gridVolt  = parsedData.gridVolt;
                        g_acLoad    = parsedData.acLoad;
                        g_batVolt   = parsedData.batVolt;
                        g_chargeCur = parsedData.chargeCur;
                        g_batCap    = parsedData.batCap;
                        g_temp      = parsedData.temp;
                        g_pvPower   = parsedData.pvPower;

                        isValidData = true;
                        lastValidDataTime = now;

                        xSemaphoreGive(dataMutex);
                    }
                }
                else
                {
                    // Nếu lỗi data liên tiếp 3 lần, bật cờ mù data
                    if (badFrameCount >= 3)
                    {
                        if (xSemaphoreTake(dataMutex, portMAX_DELAY))
                        {
                            isValidData = false;
                            xSemaphoreGive(dataMutex);
                        }
                    }
                }
            }
            rxIndex = 0; // reset chuỗi
        }
        else
        {
            if (rxIndex < MAX_RX_LEN - 1) rxBuffer[rxIndex++] = c;
        }
    }

    // Cơ chế Fail-Safe (Watchdog)
    // Nếu quá 15s không nhận được data, bật cờ mù data
    if (isValidData && (now - lastValidDataTime > DATA_TIMEOUT))
    {
        isValidData = false;
        DEBUG_PRINTLN("❌ WATCHDOG: Timeout > 15s. Mù Data!");
    }

    // Xử lí sự cố mù data
    if (!isValidData && lastValidDataTime > 0 && (now - lastValidDataTime > DATA_TIMEOUT))
    {
        if (!isRunningOnGrid) // Nếu đang chạy trên solar
        {
            bool wasHighRisk = false;

            if (xSemaphoreTake(dataMutex, portMAX_DELAY))
            {
                wasHighRisk = (g_acLoad > HEAVY_LOAD); // tải nặng
                xSemaphoreGive(dataMutex);
            }

            // Nếu đang tải nặng, thì ép sang điện lưới cho an toàn
            if (wasHighRisk)
            {
#ifdef ENABLE_ATS
                digitalWrite(RELAY_PIN, HIGH);
                isRunningOnGrid = true;
                lastSwitchTime = now;
                DEBUG_PRINTLN("🚨 FAIL-SAFE: Tải nặng. Ép sang Lưới!");
#endif

#ifdef ENABLE_TELEGRAM
                if (now - lastMsg_Overload > COOLDOWN) // tránh spam
                {
                    uint8_t code = 1; xQueueSend(telegramQueue, &code, 0); // báo telegram
                    lastMsg_Overload = now;
                }
#endif
            }
        }
    }

    // Logic ATS bảo vệ
    else if (isValidData)
    {
        float localAcLoad = 0, localGridVolt = 0, localBatVolt = 0;
        if (xSemaphoreTake(dataMutex, portMAX_DELAY))
        {
            localAcLoad = g_acLoad;
            localGridVolt = g_gridVolt;
            localBatVolt = g_batVolt;
            xSemaphoreGive(dataMutex);
        }

#ifdef ENABLE_ATS
        // Chống lặp relay, khoá trạng thái một khoảng thời gian sau khi chuyển
        bool canSwitch = (now - lastSwitchTime > SWITCH_LOCKOUT);

        if (canSwitch)
        {
            // Điều kiện ép sang lưới: Sắp quá tải, đang chạy solar, điện áp lưới ổn, không mất điện
            if (localAcLoad > MAX_INVERTER_LOAD && !isRunningOnGrid && localGridVolt > GRID_VALID_VOLTAGE && !isGridLost)
            {
                digitalWrite(RELAY_PIN, HIGH);
                isRunningOnGrid = true;
                lastSwitchTime = now;

                DEBUG_PRINTLN("🔄 SOLAR -> GRID (Quá Tải)");

    #ifdef ENABLE_TELEGRAM
                // Thông báo telegram
                if (now - lastMsg_Overload > COOLDOWN)
                {
                    uint8_t code = 2; xQueueSend(telegramQueue, &code, 0);
                    lastMsg_Overload = now;
                }
    #endif
            }

            // Điều kiện về lại solar: Tải thấp hơn công suất tối đa solar, đang chạy điện lưới
            else if (localAcLoad < MAX_SOLAR_LOAD && isRunningOnGrid)
            {
                digitalWrite(RELAY_PIN, LOW);
                isRunningOnGrid = false;
                lastSwitchTime = now;
                DEBUG_PRINTLN("🔄 GRID -> SOLAR");

    #ifdef ENABLE_TELEGRAM
                // thông báo telegram
                if (now - lastMsg_BackToSolar > COOLDOWN)
                {
                    uint8_t code = 3; xQueueSend(telegramQueue, &code, 0);
                    lastMsg_BackToSolar = now;
                }
    #endif
            }
        }
#endif

        // ==============================================================
        // CÁC CẢNH BÁO TELEGRAM VÀ DEBUG
        // ==============================================================
        if (localGridVolt < GRID_LOST_VOLTAGE && !isGridLost)
        {
            isGridLost = true;
            DEBUG_PRINTLN("⚠️ MẤT ĐIỆN");
#ifdef ENABLE_TELEGRAM
            if (now - lastMsg_GridLost > COOLDOWN)
            {
                uint8_t code = 4; xQueueSend(telegramQueue, &code, 0);
                lastMsg_GridLost = now;
            }
#endif
        }
        else if (localGridVolt > GRID_RESTORE_VOLTAGE && isGridLost)
        {
            isGridLost = false;
            DEBUG_PRINTLN("✅ CÓ ĐIỆN LƯỚI LẠI");
#ifdef ENABLE_TELEGRAM
            if (now - lastMsg_GridLost > COOLDOWN)
            {
                uint8_t code = 5; xQueueSend(telegramQueue, &code, 0);
                lastMsg_GridLost = now;
            }
#endif
        }

        if (localBatVolt <= BATTERY_LOW_VOLTAGE && !isBatteryLow)
        {
            isBatteryLow = true;
            DEBUG_PRINTLN("🔴 PIN YẾU");
#ifdef ENABLE_TELEGRAM
            if (now - lastMsg_BatteryLow > COOLDOWN)
            {
                uint8_t code = 6; xQueueSend(telegramQueue, &code, 0);
                lastMsg_BatteryLow = now;
            }
#endif
        }
        else if (localBatVolt >= BATTERY_RECOVER_VOLTAGE && isBatteryLow)
        {
            isBatteryLow = false;
        }
    }
}