#pragma once

// ================= MODULE BẬT/TẮT =================
#define ENABLE_ATS       // comment dòng này lại (thêm // đầu dòng) nếu không dùng bộ chuyển mạch ATS
#define ENABLE_TELEGRAM  // comment dòng này lại (thêm // đầu dòng) nếu không dùng thông báo Telegram



// ================= CẤU HÌNH HỆ SOLAR ===============
const float MAX_INVERTER_LOAD = 2900.0f; // công suất chịu tải tối đa của inverter, lấy xuống 100W cho an toàn (VD:3kW —> 2900.0)
const float HEAVY_LOAD        = 2500.0f; // công suất tải được coi là nặng, tuỳ vào công suất tối đa của inverter(VD:3kW —> 2500.0)
const float MAX_SOLAR_LOAD    = 1100.0f; // công suất tối đa của hệ pin mặt trời (VD: 1100.0)



// ================= NGƯỠNG ĐIỆN ÁP ====================
constexpr float BATTERY_LOW_VOLTAGE     = 24.4f; // áp pin yếu nếu nhỏ hơn
constexpr float BATTERY_RECOVER_VOLTAGE = 26.5f; // áp pin ổn định nếu lớn hơn

constexpr float GRID_LOST_VOLTAGE    = 50.0f;   // mức điện áp lưới coi là mất điện nếu nhỏ hơn
constexpr float GRID_VALID_VOLTAGE   = 180.0f;  // mức điện áp lưới coi là ổn nếu lớn hơn
constexpr float GRID_RESTORE_VOLTAGE = 200.0f;  // mức điện áp lưới coi là có điện trở lại nếu lớn hơn

// Dải điện áp vật lý hợp lệ để lọc nhiễu RS485
// Hệ 24V: Min 20.0, Max 32.0 | Hệ 12V: Min 10.0, Max 16.0 | Hệ 48V: Min 40.0, Max 64.0
constexpr float BAT_VOLT_MIN_VALID = 20.0f; // Mặc định đang sử dụng hệ 24V
constexpr float BAT_VOLT_MAX_VALID = 32.0f;

// Số lượng thông số tối thiểu cần đọc được từ lệnh QPIGS
constexpr int MIN_FIELDS_EXPECTED = 20;



// ================= CẤU HÌNH MẠNG ================
constexpr const char* WIFI_SSID     = "Your SSID";        // tên mạng wifi gia đình
constexpr const char* WIFI_PASSWORD = "Your password";    // mật khẩu wifi gia đình
constexpr const char* OTA_HOSTNAME = "Your hostnama";     // mật khẩu wifi gia đình
constexpr const char* OTA_PASSWORD = "Your OTA password"; // mật khẩu wifi gia đình



// ================= CẤU HÌNH CLOUD =================
constexpr unsigned long THINGSPEAK_CHANNEL = 0;          // ThinkSpeak Channel ID
constexpr const char* THINGSPEAK_WRITE_KEY = "Your API"; // ThinkSpeak API

constexpr const char* BOT_TOKEN =  "Your TOKEN";   // bot token
constexpr const char* CHAT_ID   =  "Your chat ID"; // chat ID



// ================= PHẦN CỨNG & TIMEOUT =================
constexpr uint8_t RELAY_PIN = 5; // relay ở chân GPIO5
constexpr uint8_t RX_PIN = 25; // RX ở chân GPIO25
constexpr uint8_t TX_PIN = 26; // TX ở chân GPIO26

constexpr uint32_t SWITCH_LOCKOUT      = 180000UL; // 3 phút khóa chéo relay
constexpr uint32_t COOLDOWN            = 30000UL;  // 30s chống spam tin nhắn
constexpr uint32_t READ_INTERVAL       = 1000UL;
constexpr uint32_t CLOUD_INTERVAL      = 20000UL;
constexpr uint32_t WIFI_CHECK_INTERVAL = 10000UL;
constexpr uint32_t DATA_TIMEOUT        = 15000UL;  // 15s mất data sẽ kích hoạt fail-safe
