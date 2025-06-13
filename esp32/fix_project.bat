@echo off
echo Corrigindo projeto ESP32...

REM Verifica se esta rodando como administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Por favor, execute este script como Administrador!
    echo Clique com botao direito -^> Executar como administrador
    pause
    exit /b 1
)

REM 1. Limpa tudo
echo Limpando projeto...
rmdir /s /q .pio 2>nul
rmdir /s /q .vscode 2>nul
del platformio.ini 2>nul

REM 2. Cria estrutura básica
echo Criando estrutura...
mkdir src 2>nul
mkdir lib 2>nul
mkdir include 2>nul

REM 3. Cria platformio.ini
echo Criando platformio.ini...
echo ; PlatformIO Project Configuration> platformio.ini
echo [env:esp32dev]>> platformio.ini
echo platform = espressif32>> platformio.ini
echo board = esp32dev>> platformio.ini
echo framework = arduino>> platformio.ini
echo monitor_speed = 115200>> platformio.ini
echo lib_deps =>> platformio.ini
echo     knolleary/PubSubClient@^2.8>> platformio.ini
echo     bblanchon/ArduinoJson@^6.21.3>> platformio.ini
echo     adafruit/DHT sensor library@^1.4.4>> platformio.ini
echo     adafruit/Adafruit Unified Sensor@^1.1.9>> platformio.ini
echo     z3t0/IRremote@2.6.0>> platformio.ini
echo build_flags =>> platformio.ini
echo     -D MQTT_MAX_PACKET_SIZE=1024>> platformio.ini
echo     -std=gnu++17>> platformio.ini
echo monitor_filters = esp32_exception_decoder>> platformio.ini

REM 4. Instala PlatformIO
echo Instalando PlatformIO...
python -m pip install -U platformio

REM 5. Inicializa projeto
echo Inicializando projeto...
pio project init --ide vscode

REM 6. Instala plataforma
echo Instalando plataforma ESP32...
pio platform install espressif32

REM 7. Compila
echo Compilando projeto...
pio run

echo.
echo Configuracao concluida!
echo Execute 'pio run' para compilar
echo Execute 'pio run -t upload' para fazer upload
pause