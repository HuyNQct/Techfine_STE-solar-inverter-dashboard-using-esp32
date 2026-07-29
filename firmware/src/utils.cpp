#include "../include/utils.h"

// ================= TRẠNG THÁI VÀ TIMER =================
// Trạng thái
bool isRunningOnGrid = false;
bool isValidData = false;
bool isBatteryLow = false;
bool isGridLost = false;
bool isUpdatingOTA = false;
int badFrameCount = 0;

//timer
unsigned long lastSwitchTime = 0;
unsigned long lastCommandTime = 0;
unsigned long lastCloudSync = 0;
unsigned long lastWifiCheck = 0;
unsigned long lastValidDataTime = 0;

unsigned long lastMsg_GridLost = 0;
unsigned long lastMsg_Overload = 0;
unsigned long lastMsg_BatteryLow = 0;
unsigned long lastMsg_BackToSolar = 0;
unsigned long otaStartTime = 0;

// ================= BỘ NHỚ & BIẾN TOÀN CỤC =================
//const int MAX_RX_LEN = 128;
char rxBuffer[MAX_RX_LEN];
int rxIndex = 0;
unsigned long lastByteTime = 0;

float g_batVolt = 0.0;
float g_chargeCur = 0.0;
float g_pvPower = 0.0;
float g_acLoad = 0.0;
float g_temp = 0.0;
float g_gridVolt = 0.0;
float g_batCap = 0.0;

SemaphoreHandle_t dataMutex;
SemaphoreHandle_t serialMutex;
QueueHandle_t telegramQueue;