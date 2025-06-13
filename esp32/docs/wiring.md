# Esquema de Conexões ESP32

## Componentes

1. ESP32 DevKit
2. Sensor DHT22
3. LED Infravermelho (IR)
4. Resistor 100Ω
5. Transistor NPN (2N2222 ou similar)
6. Resistor 1kΩ (para o transistor)

## Pinagem

```
ESP32       DHT22       LED IR + TRANSISTOR
┌────┐      ┌────┐          LED IR
│    │      │    │         ┌──►
│ 3V3├──────┤VCC │    3.3V ┌┴┐
│    │      │    │         └┬┘
│ G15├──────┤DATA│         100Ω
│    │      │    │          │
│ GND├──────┤GND │          │
│    │      └────┘     G4  ┌┴┐
│    │                     │ │ 2N2222
│    │                 1kΩ │ │
│    │                 ┌───┤ │
│    │                 │   └┬┘
│    │                 │    │
└────┘                 └────┴─── GND
```

## Notas

1. DHT22:
   - VCC: 3.3V do ESP32
   - DATA: GPIO15
   - GND: Terra comum

2. LED IR:
   - Ânodo (+) -> Resistor 100Ω -> 3.3V
   - Cátodo (-) -> Coletor do transistor
   - Base do transistor -> Resistor 1kΩ -> GPIO4
   - Emissor do transistor -> GND

3. Recomendações:
   - Use fonte de alimentação estável
   - Mantenha cabos curtos
   - Evite interferência do DHT22 no sinal IR
   - Posicione o LED IR próximo ao receptor do ar condicionado

## Teste de Hardware

1. LED Built-in (GPIO2):
   ```cpp
   pinMode(2, OUTPUT);
   digitalWrite(2, HIGH);  // Liga
   digitalWrite(2, LOW);   // Desliga
   ```

2. DHT22:
   ```cpp
   #include <DHT.h>
   DHT dht(15, DHT22);
   float temp = dht.readTemperature();
   float humid = dht.readHumidity();
   ```

3. LED IR:
   ```cpp
   pinMode(4, OUTPUT);
   // Simular sinal 38kHz
   for(int i=0; i<100; i++) {
     digitalWrite(4, HIGH);
     delayMicroseconds(13);
     digitalWrite(4, LOW);
     delayMicroseconds(13);
   }
   ```

## Verificação

1. Tensões:
   - 3.3V nos pontos corretos
   - GND comum em todos os componentes
   - ~0.7V na base do transistor quando ativo

2. Sinais:
   - DHT22: Pulsos de dados na linha DATA
   - LED IR: Piscar visível com câmera de celular
   - LED Built-in: Piscando regularmente

3. Temperatura:
   - Leituras estáveis do DHT22
   - Precisão de ±0.5°C
   - Atualização a cada 2 segundos