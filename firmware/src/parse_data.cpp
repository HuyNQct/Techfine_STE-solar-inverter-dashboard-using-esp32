#include "../include/parse_data.h"

#include "Config.h"
#include "utils.h"

// ============== Hàm tách chuỗi ================
#define MAX_INVERTER_FIELDS 21
// Tách chuỗi data thô từ RS485 "(230.0 50.0 24.5..." thành mảng số thực.
int parseInverterFrame(const char* data, float* out, int maxFields)
{
    const char* p = (data[0] == '(') ? data + 1 : data; // nhảy khỏi dấu ( đầu frame nếu có
    int count = 0;

    while (*p && count < maxFields)
    {
        while (*p == ' ') p++; // dịch con trỏ bỏ qua các dấu cách ' '
        if (*p == ')' || *p == '\0') break; // dừng khi gặp ')' hoặc hết chuối

        char* end;
        float val = strtof(p, &end);

        if (end == p) break; // con trỏ end không thay đổi —> gặp kí tự rác

        out[count++] = val;
        p = end;
    }

    return count;
}

// ============= Hàm xử lý, xác thực dữ liệu ===============
// Vị trí các thông số trong mảng trả về của lệnh QPIGS (Inverter STE)
#define IDX_GRID_VOLT   0
#define IDX_AC_LOAD     5
#define IDX_BAT_VOLT    8
#define IDX_CHARGE_CUR  9
#define IDX_BAT_CAP     10
#define IDX_TEMP        11
#define IDX_PV_POWER    19

bool parseInverterData(const char* data, InverterData& out)
{
    float fields[MAX_INVERTER_FIELDS] = {0};
    int count = parseInverterFrame(data, fields, MAX_INVERTER_FIELDS);

    // Lọc nhiễu: Đủ trường dữ liệu, ngưỡng điện áp chuẩn
    if (count < MIN_FIELDS_EXPECTED || fields[IDX_BAT_VOLT] < BAT_VOLT_MIN_VALID || fields[IDX_BAT_VOLT] > BAT_VOLT_MAX_VALID)
    {
        badFrameCount++;
        return false;
    }

    out.gridVolt  = fields[IDX_GRID_VOLT];
    out.acLoad    = fields[IDX_AC_LOAD];
    out.batVolt   = fields[IDX_BAT_VOLT];
    out.chargeCur = fields[IDX_CHARGE_CUR];
    out.batCap    = fields[IDX_BAT_CAP];
    out.temp      = fields[IDX_TEMP];
    out.pvPower   = fields[IDX_PV_POWER];

    badFrameCount = 0;

    return true;
}