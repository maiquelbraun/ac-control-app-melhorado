#include "NetworkManager.h"
#include <ArduinoJson.h>

NetworkManager* NetworkManager::_instance = nullptr;

NetworkManager::NetworkManager(const char* deviceId, ACController& ac)
    : _deviceId(deviceId),
      _ac(ac),
      _mqttClient(_wifiClient),
      _lastStatusUpdate(0),
      _reconnectAttempts(0),
      _lastReconnectAttempt(0) {
    _instance = this;
    _statusTopic = String("ac-control/dispositivos/") + _deviceId + "/status";
    _commandTopic = String("ac-control/dispositivos/") + _deviceId + "/comando";
}

void NetworkManager::begin(const char* ssid, const char* password,
                         const char* mqttServer, uint16_t mqttPort,
                         const char* mqttUser, const char* mqttPassword) {
    _ssid = ssid;
    _password = password;
    _mqttServer = mqttServer;
    _mqttPort = mqttPort;
    _mqttUser = mqttUser;
    _mqttPassword = mqttPassword;

    connectWiFi();
    
    _mqttClient.setServer(_mqttServer, _mqttPort);
    _mqttClient.setCallback([](char* topic, byte* payload, unsigned int length) {
        if (_instance) {
            _instance->mqttCallback(topic, payload, length);
        }
    });
}

void NetworkManager::update() {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
    }

    if (!_mqttClient.connected()) {
        unsigned long now = millis();
        if (now - _lastReconnectAttempt > RECONNECT_DELAY) {
            _lastReconnectAttempt = now;
            if (_reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                connectMQTT();
            }
        }
    } else {
        _mqttClient.loop();
        _reconnectAttempts = 0; // Reset counter on successful connection

        unsigned long now = millis();
        if (now - _lastStatusUpdate >= STATUS_UPDATE_INTERVAL) {
            publishStatus();
            _lastStatusUpdate = now;
        }
    }
}

void NetworkManager::connectWiFi() {
    if (WiFi.status() == WL_CONNECTED) return;

    Serial.print("Conectando ao WiFi");
    WiFi.begin(_ssid, _password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi conectado");
        Serial.println("IP: " + WiFi.localIP().toString());
    } else {
        Serial.println("\nFalha ao conectar ao WiFi");
    }
}

void NetworkManager::connectMQTT() {
    Serial.println("Conectando ao MQTT...");
    
    if (_mqttClient.connect(_deviceId, _mqttUser, _mqttPassword)) {
        Serial.println("Conectado ao broker MQTT");
        _mqttClient.subscribe(_commandTopic.c_str());
        publishStatus();
        _reconnectAttempts = 0;
    } else {
        Serial.println("Falha na conexão MQTT");
        _reconnectAttempts++;
        if (_reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            Serial.println("Máximo de tentativas atingido. Aguardando próximo ciclo.");
        }
    }
}

void NetworkManager::publishStatus() {
    String status = _ac.getStatusJson();
    _mqttClient.publish(_statusTopic.c_str(), status.c_str(), true);
}

void NetworkManager::mqttCallback(char* topic, byte* payload, unsigned int length) {
    char message[length + 1];
    memcpy(message, payload, length);
    message[length] = '\0';

    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
        Serial.println("Erro ao parsear comando JSON");
        return;
    }

    const char* comando = doc["comando"];
    if (!comando) return;

    if (strcmp(comando, "LIGAR") == 0) {
        _ac.turnOn();
    }
    else if (strcmp(comando, "DESLIGAR") == 0) {
        _ac.turnOff();
    }
    else if (strcmp(comando, "TEMPERATURA") == 0) {
        uint8_t temp = doc["parametros"]["temperatura"];
        _ac.setTemperature(temp);
    }
    else if (strcmp(comando, "MODO_OPERACAO") == 0) {
        const char* modo = doc["parametros"]["modo"];
        if (strcmp(modo, "REFRIGERAR") == 0) {
            _ac.setMode(ACMode::COOL);
        }
        else if (strcmp(modo, "VENTILAR") == 0) {
            _ac.setMode(ACMode::FAN);
        }
        else if (strcmp(modo, "DESUMIDIFICAR") == 0) {
            _ac.setMode(ACMode::DRY);
        }
        else {
            _ac.setMode(ACMode::AUTO);
        }
    }
    else if (strcmp(comando, "VELOCIDADE") == 0) {
        const char* velocidade = doc["parametros"]["velocidade"];
        if (strcmp(velocidade, "BAIXA") == 0) {
            _ac.setFanSpeed(FanSpeed::LOW);
        }
        else if (strcmp(velocidade, "MEDIA") == 0) {
            _ac.setFanSpeed(FanSpeed::MEDIUM);
        }
        else if (strcmp(velocidade, "ALTA") == 0) {
            _ac.setFanSpeed(FanSpeed::HIGH);
        }
        else {
            _ac.setFanSpeed(FanSpeed::AUTO);
        }
    }

    // Publica o novo status após executar o comando
    publishStatus();
}

bool NetworkManager::isConnected() const {
    return WiFi.status() == WL_CONNECTED && _mqttClient.connected();
}