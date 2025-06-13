# Script para configurar o ambiente de desenvolvimento ESP32

# Funções auxiliares
function Write-Step {
    param($Message)
    Write-Host "`n>> $Message" -ForegroundColor Cyan
}

function Test-Command {
    param($Command)
    
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Verificar requisitos
Write-Step "Verificando requisitos..."

if (-not (Test-Command "python")) {
    Write-Host "Python não encontrado. Por favor, instale Python 3.x" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "git")) {
    Write-Host "Git não encontrado. Por favor, instale Git" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "code")) {
    Write-Host "VS Code não encontrado. Por favor, instale Visual Studio Code" -ForegroundColor Red
    exit 1
}

# Instalar/Atualizar PlatformIO
Write-Step "Configurando PlatformIO..."
python -m pip install -U platformio

# Criar estrutura de diretórios
Write-Step "Criando estrutura de diretórios..."
$dirs = @(
    "src",
    "lib/AC/include",
    "lib/AC/src",
    "lib/IR/include",
    "lib/IR/src",
    "lib/Network/include",
    "lib/Network/src",
    ".vscode"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Criado: $dir"
    }
}

# Configurar projeto PlatformIO
Write-Step "Configurando projeto PlatformIO..."
pio project init --ide vscode
pio pkg update

# Instalar plataforma ESP32
Write-Step "Instalando plataforma ESP32..."
pio platform install espressif32

# Instalar dependências
Write-Step "Instalando bibliotecas..."
$libs = @(
    "knolleary/PubSubClient",
    "bblanchon/ArduinoJson",
    "adafruit/DHT sensor library",
    "adafruit/Adafruit Unified Sensor",
    "z3t0/IRremote"
)

foreach ($lib in $libs) {
    Write-Host "Instalando $lib..."
    pio lib install "$lib"
}

# Criar arquivo de configuração
Write-Step "Configurando ambiente..."
if (-not (Test-Path "src/config.h")) {
    Copy-Item "src/config.example.h" "src/config.h"
    Write-Host "Arquivo config.h criado. Por favor, configure suas credenciais."
}

# Compilar projeto
Write-Step "Compilando projeto..."
pio run

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nAmbiente configurado com sucesso!" -ForegroundColor Green
    Write-Host "`nPróximos passos:"
    Write-Host "1. Configure suas credenciais em src/config.h"
    Write-Host "2. Conecte seu ESP32"
    Write-Host "3. Execute 'pio run -t upload' para fazer upload"
    Write-Host "4. Use 'pio device monitor' para monitorar"
    Write-Host "`nConsulte DEBUG.md para solução de problemas"
} else {
    Write-Host "`nErro na configuração. Consulte DEBUG.md" -ForegroundColor Red
}