# Guia de Debug PlatformIO

## Erros Comuns

### 1. "Cannot open source file 'Arduino.h'"

Este erro ocorre quando o PlatformIO não encontra os arquivos de cabeçalho do Arduino ESP32.

Soluções:
```bash
# 1. Reinstale o framework
pio platform uninstall espressif32
pio platform install espressif32

# 2. Force o download das dependências
pio pkg update

# 3. Limpe o projeto
pio run -t clean
```

### 2. Problemas de Include Path

Se o VSCode não encontrar os includes:

1. Delete a pasta `.pio` e `.vscode`
2. Execute:
   ```bash
   pio project init --ide vscode
   ```

3. Ou adicione manualmente ao `c_cpp_properties.json`:
   ```json
   {
     "configurations": [
       {
         "includePath": [
           "${workspaceFolder}/**",
           "~/.platformio/packages/framework-arduinoespressif32/cores/esp32",
           "~/.platformio/packages/framework-arduinoespressif32/tools/sdk/esp32/include",
           "~/.platformio/packages/framework-arduinoespressif32/variants/esp32"
         ]
       }
     ]
   }
   ```

### 3. Erros de Compilação

Se houver erros de compilação:

1. Verifique versões das bibliotecas em `platformio.ini`:
   ```ini
   lib_deps = 
       knolleary/PubSubClient @ ^2.8
       bblanchon/ArduinoJson @ ^6.21.3
   ```

2. Atualize o framework:
   ```ini
   platform_packages =
       platformio/framework-arduinoespressif32 @ ~3.20007.0
   ```

3. Limpe e recompile:
   ```bash
   pio run -t clean
   pio run
   ```

### 4. ESP32 não detectado

Se a porta COM não for detectada:

1. Instale drivers CH340/CP2102:
   - Windows: [Driver CP2102](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
   - Linux: Já incluído no kernel

2. Verifique permissões (Linux/Mac):
   ```bash
   sudo usermod -a -G dialout $USER
   ```

3. Configure porta manualmente em `platformio.ini`:
   ```ini
   upload_port = COM3  # Windows
   upload_port = /dev/ttyUSB0  # Linux
   ```

### 5. Debug do PlatformIO

Para mais informações sobre o ambiente:

```bash
# Informações do ambiente
pio system info

# Status das bibliotecas
pio lib list

# Diagnosticar projeto
pio check

# Verificar memória
pio run -t size
```

### 6. Logs e Monitoramento

1. Monitor serial com filtros:
   ```ini
   monitor_filters = 
       esp32_exception_decoder
       time
       log2file
   ```

2. Debug via porta serial:
   ```bash
   pio device monitor -f esp32_exception_decoder -b 115200
   ```

3. Logs em arquivo:
   ```bash
   pio device monitor > log.txt
   ```

## Links Úteis

1. [PlatformIO ESP32 Docs](https://docs.platformio.org/en/latest/platforms/espressif32.html)
2. [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)
3. [PlatformIO Debugging Guide](https://docs.platformio.org/en/latest/plus/debugging.html)