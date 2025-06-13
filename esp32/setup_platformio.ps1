# Script para configurar o ambiente PlatformIO com ESP32

Write-Host "Configurando ambiente PlatformIO para ESP32..." -ForegroundColor Cyan

# Verifica se o Python está instalado
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python não encontrado. Por favor, instale o Python 3.x"
    exit 1
}

# Instala/Atualiza PlatformIO
Write-Host "Instalando/Atualizando PlatformIO..." -ForegroundColor Yellow
python -m pip install -U platformio

# Cria diretório .vscode se não existir
if (-not (Test-Path .vscode)) {
    New-Item -ItemType Directory -Path .vscode
}

# Configura c_cpp_properties.json
$cppProperties = @{
    configurations = @(
        @{
            name = "ESP32"
            includePath = @(
                "`${workspaceFolder}/**",
                "C:/Users/`${env:USERNAME}/.platformio/packages/framework-arduinoespressif32/**",
                "C:/Users/`${env:USERNAME}/.platformio/packages/framework-arduinoespressif32/tools/sdk/esp32/include/**",
                "C:/Users/`${env:USERNAME}/.platformio/packages/framework-arduinoespressif32/cores/esp32/**",
                "C:/Users/`${env:USERNAME}/.platformio/packages/toolchain-xtensa-esp32/xtensa-esp32-elf/**",
                "C:/Users/`${env:USERNAME}/.platformio/packages/toolchain-xtensa-esp32/lib/gcc/xtensa-esp32-elf/**",
                "`${workspaceFolder}/.pio/libdeps/esp32dev/**"
            )
            defines = @(
                "ARDUINO=100",
                "ESP32=1",
                "PLATFORMIO=60106"
            )
            compilerPath = "C:/Users/`${env:USERNAME}/.platformio/packages/toolchain-xtensa-esp32/bin/xtensa-esp32-elf-gcc.exe"
            cStandard = "c11"
            cppStandard = "c++17"
            intelliSenseMode = "gcc-x86"
        }
    )
    version = 4
}

# Salva configuração
$cppProperties | ConvertTo-Json -Depth 10 | Set-Content .vscode/c_cpp_properties.json

# Instala plataforma ESP32
Write-Host "Instalando plataforma ESP32..." -ForegroundColor Yellow
pio platform install espressif32

# Instala bibliotecas necessárias
Write-Host "Instalando bibliotecas..." -ForegroundColor Yellow
pio lib install `
    "knolleary/PubSubClient" `
    "bblanchon/ArduinoJson" `
    "adafruit/DHT sensor library" `
    "adafruit/Adafruit Unified Sensor" `
    "z3t0/IRremote"

# Atualiza ambiente
Write-Host "Atualizando ambiente..." -ForegroundColor Yellow
pio project init --ide vscode
pio project config --update

# Limpa e compila
Write-Host "Compilando projeto..." -ForegroundColor Yellow
pio run --target clean
pio run

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nAmbiente configurado com sucesso!" -ForegroundColor Green
    Write-Host "Para compilar: pio run"
    Write-Host "Para upload: pio run -t upload"
    Write-Host "Para monitorar: pio device monitor"
} else {
    Write-Host "`nErro na configuração!" -ForegroundColor Red
    Write-Host "Verifique os erros acima e consulte DEBUG.md"
}