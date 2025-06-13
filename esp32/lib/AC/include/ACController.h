#ifndef AC_CONTROLLER_H
#define AC_CONTROLLER_H

#include <Arduino.h>
#include "IRSender.h"
#include <DHT.h>
#include <ArduinoJson.h>

// Modos de operação do ar condicionado
enum class ACMode {
    AUTO,
    COOL,
    DRY,
    FAN
};

// Velocidades do ventilador
enum class FanSpeed {
    AUTO,
    LOW,
    MEDIUM,
    HIGH
};

class ACController {
public:
    ACController(uint8_t irPin, uint8_t dhtPin);
    void begin();
    void update();

    // Comandos
    void turnOn();
    void turnOff();
    void setTemperature(uint8_t temp);
    void setMode(ACMode mode);
    void setFanSpeed(FanSpeed speed);

    // Estado
    bool isOn() const { return _isOn; }
    float getCurrentTemperature() const { return _currentTemp; }
    float getCurrentHumidity() const { return _currentHumidity; }
    uint8_t getTargetTemperature() const { return _targetTemp; }
    ACMode getMode() const { return _mode; }
    FanSpeed getFanSpeed() const { return _fanSpeed; }

    // MQTT
    String getStatusJson() const;

private:
    IRSender _irSender;
    DHT _dht;
    bool _isOn;
    float _currentTemp;
    float _currentHumidity;
    uint8_t _targetTemp;
    ACMode _mode;
    FanSpeed _fanSpeed;
    unsigned long _lastSensorUpdate;

    void readSensors();
};

#endif // AC_CONTROLLER_H