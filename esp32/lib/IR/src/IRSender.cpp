#include "IRSender.h"

IRSender::IRSender(uint8_t pin) : _pin(pin), _irsend(pin) {
}

void IRSender::begin() {
    // IRsend is initialized in constructor
}

void IRSender::sendNECCommand(uint16_t address, uint16_t command) {
    // Combinando endereço e comando em um único código NEC de 32 bits
    // Formato NEC: address(16 bits) + command(16 bits)
    uint32_t code = ((uint32_t)address << 16) | command;
    
    // Envia o código usando o protocolo NEC
    _irsend.sendNEC(code, 32); // 32 bits
    
    delay(100); // Pequeno delay entre comandos
}

void IRSender::sendRaw(const uint16_t buf[], uint16_t len, uint16_t hz) {
    // Envia dados raw na frequência especificada
    _irsend.sendRaw(buf, len, hz);
    delay(100);
}