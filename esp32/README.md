# ESP32 AC Controller

Firmware para controle de ar condicionado usando ESP32.

## Instalação

### Requisitos
- Windows 10 ou superior
- Python 3.x instalado ([Download Python](https://www.python.org/downloads/))
- Acesso de administrador

### Passos

1. Execute a instalação:
   - Clique duplo em `setup.bat`
   - Ou no PowerShell (como Admin):
     ```powershell
     .\setup-complete.ps1
     ```

2. Configure o dispositivo:
   - Edite `src/config.h`
   ```cpp
   // WiFi
   #define WIFI_SSID "sua_rede"
   #define WIFI_PASSWORD "sua_senha"

   // MQTT
   #define MQTT_SERVER "localhost"
   #define MQTT_PORT 1883
   ```

3. Upload e monitoramento:
   ```powershell
   # Compilar e enviar
   pio run -t upload

   # Monitorar
   pio device monitor
   ```

## Solução de Problemas

Se encontrar erros durante a instalação:

1. "Python não encontrado":
   - Instale Python 3.x
   - Adicione ao PATH durante instalação
   - Reinicie o computador

2. "Erro de compilação":
   - Execute com logs detalhados:
     ```powershell
     pio run -v
     ```
   - Verifique erros em `.pio/build.log`

3. "Porta não encontrada":
   - Verifique conexão USB
   - Instale drivers CH340/CP2102
   - Use outra porta USB

Para mais ajuda:
- Consulte `TROUBLESHOOTING.md`
- Execute `pio system info`
- Verifique se todos os requisitos estão instalados

## Estrutura do Projeto

```
esp32/
├── src/              # Código principal
│   ├── main.cpp
│   ├── config.h
│   └── config.example.h
├── lib/              # Bibliotecas
│   ├── AC/          # Controle do AC
│   ├── IR/          # Envio IR
│   └── Network/     # WiFi + MQTT
└── scripts/         # Automação
    └── setup.bat    # Instalação
```

## Suporte

Se precisar de ajuda:
1. Verifique os logs de erro
2. Consulte a documentação
3. Abra uma issue descrevendo o problema

## Licença

MIT License - veja LICENSE.md