// ac-control-app/esp32_climatizador_controller.cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <IRremoteESP8266.h>
#include <ir_Coolix.h>

// Configurações
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";
const char* mqtt_server = "192.168.1.100"; // Substitua pelo IP do seu servidor MQTT
const int mqtt_port = 1883; // Porta padrão MQTT (não WebSocket)
const char* mqtt_user = "user";
const char* mqtt_password = "password";
const char* device_id = "esp32-climatizador";

WiFiClient espClient;
PubSubClient client(espClient);
IRsend irsend(4); // Pino do emissor IR
IRCoolixAC ac(&irsend); // Objeto para o protocolo do AC

// Tópicos MQTT
#define TOPICO_COMANDOS "climaControl/+/command"
#define TOPICO_STATUS "climaControl/%s/status"

// Variáveis de estado
bool acLigado = false;
int temperaturaAtual = 22;

void setup_wifi() {
  delay(10);
  Serial.begin(115200);
  Serial.println("Conectando a rede...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

// Callback para mensagens MQTT recebidas
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("] ");
  
  // Converter payload para string terminada em null
  char message[length + 1];
  for (unsigned int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';
  
  Serial.println(message);
  
  // Processar comando
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  if (error) {
    Serial.println("Erro ao deserializar JSON");
    return;
  }
  
  const char* acao = doc["acao"];
  int valor = doc["valor"];

  if (strcmp(acao, "ligar") == 0) {
    ac.on();
    ac.setFan(kCoolixFanAuto);
    ac.setMode(kCoolixCool);
    ac.setTemp(temperaturaAtual);
    ac.send();
    acLigado = true;
    Serial.println("AC Ligado");
  } else if (strcmp(acao, "desligar") == 0) {
    ac.off();
    ac.send();
    acLigado = false;
    Serial.println("AC Desligado");
  } else if (strcmp(acao, "set_temperatura") == 0) {
    temperaturaAtual = valor;
    ac.setTemp(temperaturaAtual);
    if (!acLigado) {
      ac.on();
      acLigado = true;
    }
    ac.send();
    Serial.println("Temperatura ajustada para: " + String(temperaturaAtual));
  }
  
  // Publicar o novo estado após o comando
  publish_status();
}

void reconnect_mqtt() {
  while (!client.connected()) {
    Serial.print("Tentando se conectar ao MQTT...");
    if (client.connect(device_id, mqtt_user, mqtt_password)) {
      Serial.println("Conectado ao MQTT!");
      client.subscribe(TOPICO_COMANDOS);
      break;
    } else {
      Serial.println("Falha na conexão. Tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void publish_status() {
  StaticJsonDocument<100> statusDoc;
  statusDoc["ligado"] = acLigado;
  statusDoc["temperatura"] = temperaturaAtual;
  
  char buffer[100];
  serializeJson(statusDoc, buffer);
  client.publish(String("climaControl/") + device_id + "/status", buffer, strlen(buffer));
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();
  
  // Publicar estado a cada 5 segundos
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 5000) {
    lastPublish = millis();
    publish_status();
  }
  
  delay(100);
}
