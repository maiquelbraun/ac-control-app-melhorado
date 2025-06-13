#include "ACController.h"
#include <ArduinoJson.h>
#include "../../src/config.h"

ACController::ACController(uint8_t irPin, uint8_t dhtPin)
    : _irSender(irPin),
      _dht(dhtPin, DHT22),
      _isOn(false),
      _currentTemp(0.0f),
      _currentHumidity(0.0f),
      _targetTemp(23),
      _mode(ACMode::AUTO),
      _fanSpeed(FanSpeed::AUTO),
      _lastSensorUpdate(0)
{
}

void ACController::begin() {
    _irSender.begin();
    _dht.begin();
}

void ACController::update() {
    unsigned long now = millis();
    if (now - _lastSensorUpdate >= 2000) { // Atualiza a cada 2 segundos
        readSensors();
        _lastSensorUpdate = now;
    }
}

void ACController::readSensors() {
    float temp = _dht.readTemperature();
    float humidity = _dht.readHumidity();
    
    if (!isnan(temp)) {
        _currentTemp = temp;
    }
    if (!isnan(humidity)) {
        _currentHumidity = humidity;
    }
}

void ACController::turnOn() {
    if (!_isOn) {
        _isOn = true;
        _irSender.sendNECCommand(IRCodes::POWER_ON >> 16, IRCodes::POWER_ON & 0xFFFF);
    }
}

void ACController::turnOff() {
    if (_isOn) {
        _isOn = false;
        _irSender.sendNECCommand(IRCodes::POWER_OFF >> 16, IRCodes::POWER_OFF & 0xFFFF);
    }
}

void ACController::setTemperature(uint8_t temp) {
    if (temp >= 16 && temp <= 30) {
        _targetTemp = temp;
        if (_isOn) {
            uint32_t cmd = IRCodes::TEMP_BASE + (temp - 16);
            _irSender.sendNECCommand(cmd >> 16, cmd & 0xFFFF);
        }
    }
}

void ACController::setMode(ACMode mode) {
    _mode = mode;
    if (_isOn) {
        uint32_t cmd;
        switch (mode) {
            case ACMode::COOL:
                cmd = IRCodes::MODE_COOL;
                break;
            case ACMode::DRY:
                return; // Modo DRY não implementado no exemplo
            case ACMode::FAN:
                cmd = IRCodes::MODE_FAN;
                break;
            case ACMode::AUTO:
            default:
                cmd = IRCodes::MODE_AUTO;
                break;
        }
        _irSender.sendNECCommand(cmd >> 16, cmd & 0xFFFF);
    }
}

void ACController::setFanSpeed(FanSpeed speed) {
    _fanSpeed = speed;
    if (_isOn) {
        uint32_t cmd;
        switch (speed) {
            case FanSpeed::LOW:
                cmd = IRCodes::FAN_LOW;
                break;
            case FanSpeed::MEDIUM:
                cmd = IRCodes::FAN_MED;
                break;
            case FanSpeed::HIGH:
                cmd = IRCodes::FAN_HIGH;
                break;
            case FanSpeed::AUTO:
            default:
                cmd = IRCodes::FAN_AUTO;
                break;
        }
        _irSender.sendNECCommand(cmd >> 16, cmd & 0xFFFF);
    }
}

String ACController::getStatusJson() const {
    StaticJsonDocument<200> doc;
    
    doc["online"] = true;
    doc["ligado"] = _isOn;
    doc["temperaturaAtual"] = _currentTemp;
    doc["umidade"] = _currentHumidity;
    doc["temperaturaDesejada"] = _targetTemp;
    
    const char* modeStr;
    switch (_mode) {
        case ACMode::COOL:
            modeStr = "REFRIGERAR";
            break;
        case ACMode::DRY:
            modeStr = "DESUMIDIFICAR";
            break;
        case ACMode::FAN:
            modeStr = "VENTILAR";
            break;
        case ACMode::AUTO:
        default:
            modeStr = "AUTOMATICO";
            break;
    }
    doc["modoOperacao"] = modeStr;

    const char* fanStr;
    switch (_fanSpeed) {
        case FanSpeed::LOW:
            fanStr = "BAIXA";
            break;
        case FanSpeed::MEDIUM:
            fanStr = "MEDIA";
            break;
        case FanSpeed::HIGH:
            fanStr = "ALTA";
            break;
        case FanSpeed::AUTO:
        default:
            fanStr = "AUTOMATICO";
            break;
    }
    doc["velocidadeVentilador"] = fanStr;

    String output;
    serializeJson(doc, output);
    return output;
}