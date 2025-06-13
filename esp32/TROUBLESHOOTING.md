# Guia de Solução de Problemas - ESP32

## Problemas Comuns

### 1. Comando 'pio' não encontrado

```powershell
# Solução 1: Instale usando o script
./install_platformio.ps1

# Solução 2: Instale manualmente
python -m pip install -U platformio
```

### 2. Erros de Include no VSCode

1. Limpe os caches:
   ```powershell
   Remove-Item -Recurse -Force .pio, .vscode
   ```

2. Reinstale as extensões:
   - PlatformIO IDE
   - C/C++
   - ESP-IDF

3. Configure o IntelliSense:
   - Ctrl+Shift+P
   - PlatformIO: Rebuild IntelliSense Index

### 3. Falha no Upload

1. Verifique a porta:
   ```powershell
   # Lista portas disponíveis
   pio device list
   ```

2. Drivers:
   - CP2102: [Silicon Labs](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
   - CH340: [WCH](http://www.wch.cn/download/CH341SER_EXE.html)

3. Durante o upload:
   - Pressione e segure BOOT
   - Clique em EN/RST
   - Solte BOOT após iniciar o upload

### 4. Erros de Compilação

1. Limpe o projeto:
   ```powershell
   pio run -t clean
   ```

2. Atualize bibliotecas:
   ```powershell
   pio pkg update
   ```

3. Verifique platformio.ini:
   ```ini
   [env:esp32dev]
   platform = espressif32
   board = esp32dev
   framework = arduino
   monitor_speed = 115200
   ```

### 5. Problemas com Arduino.h

1. Reinstale o framework:
   ```powershell
   pio platform uninstall espressif32
   pio platform install espressif32
   ```

2. Verifique paths no c_cpp_properties.json:
   ```json
   {
     "includePath": [
       "${workspaceFolder}/**",
       "~/.platformio/packages/framework-arduinoespressif32/**"
     ]
   }
   ```

### 6. Monitoramento Serial

1. Problemas de acesso:
   ```powershell
   # Windows: Use outro terminal
   pio device monitor --port COM3

   # Linux: Adicione usuário ao grupo
   sudo usermod -a -G dialout $USER
   ```

2. Filtros úteis:
   ```powershell
   # Com timestamp
   pio device monitor --filter time

   # Com decodificação de exceções
   pio device monitor --filter esp32_exception_decoder
   ```

### 7. VSCode não reconhece o projeto

1. Recarregue o projeto:
   ```powershell
   pio project init --ide vscode
   ```

2. Configure workspace:
   ```json
   {
     "folders": [
       {
         "path": "."
       }
     ],
     "settings": {
       "files.associations": {
         "*.ino": "cpp"
       }
     }
   }
   ```

### 8. Debug

1. Configure debug_tool em platformio.ini:
   ```ini
   debug_tool = esp-prog
   debug_init_break = tbreak setup
   ```

2. Use monitor com logs:
   ```powershell
   pio device monitor --filter time --filter log2file
   ```

## Links Úteis

1. [PlatformIO Debug Guide](https://docs.platformio.org/en/latest/plus/debugging.html)
2. [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)
3. [USB Drivers](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/establish-serial-connection.html)

Para outros problemas, consulte a [documentação oficial](https://docs.platformio.org/) ou abra uma issue.