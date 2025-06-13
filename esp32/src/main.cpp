#include <Arduino.h>
#include "config.h"
#include "ACController.h"
#include "NetworkManager.h"

// Instanciar objetos
ACController ac(PIN_IR_LED, PIN_DHT);
NetworkManager network(DEVICE_ID, ac);

void setup() {
  // Iniciar comunicação serial
  if (DEBUG_ENABLED) {
    Serial.begin(DEBUG_BAUD_RATE);
    Serial.println("\nIniciando AC Control...");
  }

  // Configurar LED de status
  pinMode(PIN_STATUS, OUTPUT);
  digitalWrite(PIN_STATUS, LOW);

  // Inicializar controle do ar condicionado
  ac.begin();

  // Conectar à rede e MQTT
  network.begin(
    WIFI_SSID, 
    WIFI_PASSWORD,
    MQTT_SERVER, 
    MQTT_PORT,
    MQTT_USER, 
    MQTT_PASSWORD
  );
}

void loop() {
  // Atualizar conexões de rede
  network.update();

  // Atualizar leituras do ar condicionado
  ac.update();

  // LED de status - pisca rápido quando desconectado
  static unsigned long lastBlink = 0;
  if (!network.isConnected()) {
    if (millis() - lastBlink >= 100) {
      digitalWrite(PIN_STATUS, !digitalRead(PIN_STATUS));
      lastBlink = millis();
    }
  } else {
    // LED de status - pisca lento quando conectado
    if (millis() - lastBlink >= 1000) {
      digitalWrite(PIN_STATUS, !digitalRead(PIN_STATUS));
      lastBlink = millis();
    }
  }

  // Pequeno delay para evitar sobrecarga
  delay(10);
}