#ifndef CONFIG_H
#define CONFIG_H

#include <stdint.h>

// Serial debug
#define DEBUG_ENABLED true         // Habilita logs serial
#define DEBUG_BAUD_RATE 115200    // Velocidade da porta serial

// WiFi
#define WIFI_SSID "SUA_REDE_WIFI"
#define WIFI_PASSWORD "SUA_SENHA_WIFI"

// MQTT
#define MQTT_SERVER "localhost"     // IP ou hostname do broker
#define MQTT_PORT 1883             // Porta padrão
#define MQTT_USER "admin"          // Usuário configurado no Mosquitto
#define MQTT_PASSWORD "admin123"    // Senha configurada no Mosquitto

// Identificação do dispositivo
#define DEVICE_ID "ESP32_001"      // ID único para cada ESP32

// Pinos (GPIO)
#define PIN_IR_LED 4              // LED IR + transistor
#define PIN_DHT 15                // Sensor DHT22
#define PIN_STATUS 2              // LED de status (built-in)

// Intervalos (ms)
#define STATUS_UPDATE_INTERVAL 5000    // 5 segundos entre atualizações
#define MQTT_RECONNECT_DELAY 5000      // 5 segundos entre tentativas
#define MAX_RECONNECT_ATTEMPTS 5       // Máximo de tentativas

// Códigos IR - Substitua pelos códigos do seu ar condicionado
// Use um receptor IR para capturar os códigos corretos
namespace IRCodes {
    // Power
    constexpr uint32_t POWER_ON  = 0x12345678;    // Ligar
    constexpr uint32_t POWER_OFF = 0x87654321;    // Desligar
    
    // Temperatura (base + (temp - 16))
    constexpr uint32_t TEMP_BASE = 0x10000000;    
    
    // Modos de operação
    constexpr uint32_t MODE_COOL = 0xABCDEF01;    // Refrigerar
    constexpr uint32_t MODE_FAN  = 0xBCDEF012;    // Ventilar
    constexpr uint32_t MODE_AUTO = 0xCDEF0123;    // Automático
    
    // Velocidades do ventilador
    constexpr uint32_t FAN_LOW  = 0xDEF01234;     // Baixa
    constexpr uint32_t FAN_MED  = 0xEF012345;     // Média
    constexpr uint32_t FAN_HIGH = 0xF0123456;     // Alta
    constexpr uint32_t FAN_AUTO = 0x01234567;     // Automático
}

// Tópicos MQTT
#define MQTT_STATUS_TOPIC "ac-control/dispositivos/" DEVICE_ID "/status"
#define MQTT_COMMAND_TOPIC "ac-control/dispositivos/" DEVICE_ID "/comando"

#endif // CONFIG_H