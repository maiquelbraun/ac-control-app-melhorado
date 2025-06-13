#ifndef IR_SENDER_H
#define IR_SENDER_H

#include <Arduino.h>
#include <IRremote.h>

class IRSender {
public:
    IRSender(uint8_t pin);
    void begin();
    void sendNECCommand(uint16_t address, uint16_t command);
    void sendRaw(const uint16_t buf[], uint16_t len, uint16_t hz = 38);

private:
    uint8_t _pin;
    IRsend _irsend;
};

#endif // IR_SENDER_H