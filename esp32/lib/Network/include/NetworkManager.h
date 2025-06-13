#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include "ACController.h"

class NetworkManager {
public:
    // Constants
    static const uint16_t STATUS_UPDATE_INTERVAL = 5000;  // 5 seconds
    static const uint16_t RECONNECT_DELAY = 5000;         // 5 seconds
    static const uint8_t MAX_RECONNECT_ATTEMPTS = 5;
    static const uint16_t PING_INTERVAL = 30000;          // 30 seconds
    static const uint16_t WATCHDOG_TIMEOUT = 120000;      // 2 minutes

    NetworkManager(const char* deviceId, ACController& ac);
    void begin(const char* ssid, const char* password,
              const char* mqttServer, uint16_t mqttPort,
              const char* mqttUser, const char* mqttPassword);
    void update();
    bool isConnected() const;
    const char* getLastError() const;
    void setCallback(void (*callback)(const char* topic, const char* message));
    
private:
    enum class ErrorCode {
        NONE,
        WIFI_CONNECTION_FAILED,
        MQTT_CONNECTION_FAILED,
        PUBLISH_FAILED,
        SUBSCRIBE_FAILED
    };

    void connectWiFi();
    void connectMQTT();
    void publishStatus();
    void publishError(const char* error);
    void handlePing();
    void resetWatchdog();
    static void mqttCallback(char* topic, byte* payload, unsigned int length);
    
    const char* _deviceId;
    const char* _ssid;
    const char* _password;
    const char* _mqttServer;
    uint16_t _mqttPort;
    const char* _mqttUser;
    const char* _mqttPassword;
    
    WiFiClient _wifiClient;
    PubSubClient _mqttClient;
    ACController& _ac;
    
    unsigned long _lastStatusUpdate;
    unsigned long _lastPing;
    unsigned long _lastWatchdogReset;
    unsigned long _lastReconnectAttempt;
    uint8_t _reconnectAttempts;
    
    String _statusTopic;
    String _commandTopic;
    String _errorTopic;
    String _pingTopic;
    
    ErrorCode _lastError;
    void (*_userCallback)(const char* topic, const char* message);
    
    static NetworkManager* _instance;
};

#endif // NETWORK_MANAGER_H