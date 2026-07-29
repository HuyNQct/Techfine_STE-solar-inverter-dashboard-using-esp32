#include <Arduino.h>

#define RXD2 25
#define TXD2 26

// The QPIGS command + CRC + Carriage Return
const byte qpigs_cmd[] = {0x51, 0x50, 0x49, 0x47, 0x53, 0xB7, 0xA9, 0x0D};

void setup()
{
    Serial.begin(115200);

    // Tweak this baud rate if your inverter is acting deaf
    Serial2.begin(2400, SERIAL_8N1, RXD2, TXD2);
    delay(2000);
}

void loop()
{
    Serial.println("\n[+] Sending QPIGS...");
    Serial2.write(qpigs_cmd, sizeof(qpigs_cmd));

    long startTime = millis();
    String response = "";
    bool gotData = false;

    // Wait up to 2 seconds for a reply
    while (millis() - startTime < 2000)
{
    if (Serial2.available())
{
    char c = Serial2.read();
    response += c;
    gotData = true;

    // We break the loop on \r or \n.
    // If they send neither, the 2000ms timeout will still catch the data.
    if (c == '\r' || c == '\n')
{
    break;
}
}
}

    if (gotData)
{
    Serial.println("=========================================");
    Serial.print("[SUCCESS] Data: ");
    Serial.println(response);
    Serial.println("=========================================");
}
    else
{
    Serial.println("[-] No response!");
}

    delay(5000);
}