#pragma once
#include <Arduino.h>

struct InverterData {
    float gridVolt, acLoad, batVolt, chargeCur, batCap, temp, pvPower;
};

int parseInverterFrame(const char* data, float* out, int maxFields);
bool parseInverterData(const char* data, InverterData& out);