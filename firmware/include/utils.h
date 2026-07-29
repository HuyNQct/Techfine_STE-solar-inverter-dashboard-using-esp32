#pragma once
#include <Arduino.h>
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#include <freertos/queue.h>
#include <TelnetStream.h>

// ================= TRẠNG THÁI VÀ TIMER =================
// Cờ trạng thái hệ thống
extern bool isValidData;     // cờ báo hiệu chuỗi data từ inverter đọc được là hợp lệ
extern bool isRunningOnGrid; // cờ trạng thái ATS: true = đang chạy lưới (Ép do quá tải), false = đang chạy solar
extern bool isBatteryLow;    // cờ báo pin thấp
extern bool isGridLost;      // cờ báo mất điện lưới
extern bool isUpdatingOTA;   // cờ khóa hệ thống khi đang nạp code
extern int badFrameCount;    // đếm số frame lỗi liên tiếp

// Timer
extern unsigned long lastSwitchTime;    // lưu thời điểm ATS đảo mạch (Dùng để khóa chéo, chống nhảy relay liên tục)
extern unsigned long lastCommandTime;   // chu kỳ gửi lệnh truy vấn Modbus xuống Inverter
extern unsigned long lastCloudSync;     // chu kỳ đẩy data lên ThingSpeak
extern unsigned long lastWifiCheck;     // chu kỳ kiểm tra và reconnect wifi
extern unsigned long lastValidDataTime; // thời điểm cuối cùng nhận data chuẩn (Dùng cho fail-safe)
// Chống spam tin nhắn
extern unsigned long lastMsg_GridLost;
extern unsigned long lastMsg_Overload;
extern unsigned long lastMsg_BatteryLow;
extern unsigned long lastMsg_BackToSolar;
extern unsigned long otaStartTime;

// ================= BỘ NHỚ VÀ BIẾN TOÀN CỤC =================
// Bộ đệm nhận data thô từ cổng RS485
const int MAX_RX_LEN = 128;
extern char rxBuffer[MAX_RX_LEN];
extern int rxIndex;
extern unsigned long lastByteTime;
// Biến lưu thông số điện
extern float g_batVolt;   //1. áp pin (V)
extern float g_chargeCur; //2. dòng điện (A)
extern float g_pvPower;   //3. công suất PV (W)
extern float g_acLoad;    //4. công suất tải (W)
extern float g_temp;      //5. nhiệt độ (C)
extern float g_gridVolt;  //6. áp lưới vào (V)
extern float g_batCap;    //7. dung lượng pin (%)

// FreeRTOS Handlers
extern SemaphoreHandle_t dataMutex;
extern SemaphoreHandle_t serialMutex;
extern QueueHandle_t telegramQueue;

// In Log ra Serial và TelnetStream(wìfi) PRINTF
// In
#define DEBUG_PRINT(x) if(xSemaphoreTake(serialMutex, pdMS_TO_TICKS(10))) { \
Serial.print(x); \
TelnetStream.print(x); \
xSemaphoreGive(serialMutex); \
}
// In và xuống dòng
#define DEBUG_PRINTLN(x) if(xSemaphoreTake(serialMutex, pdMS_TO_TICKS(10))) { \
Serial.println(x); \
TelnetStream.println(x); \
xSemaphoreGive(serialMutex); \
}
// In kèm biến
#define DEBUG_PRINTF(x, ...) if(xSemaphoreTake(serialMutex, pdMS_TO_TICKS(10))) { \
Serial.printf(x, __VA_ARGS__); \
TelnetStream.printf(x, __VA_ARGS__); \
xSemaphoreGive(serialMutex); \
}