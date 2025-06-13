# Script principal para setup do projeto AC Control

Write-Host "Iniciando setup do AC Control..." -ForegroundColor Cyan

# Funções auxiliares
function Test-Command {
    param($Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Write-Step {
    param($Message)
    Write-Host "`n>> $Message" -ForegroundColor Cyan
}

# Verifica requisitos
Write-Step "Verificando requisitos..."

$requirements = @(
    @{Name = "Node.js"; Command = "node"; URL = "https://nodejs.org/" },
    @{Name = "Python"; Command = "python"; URL = "https://www.python.org/" },
    @{Name = "Git"; Command = "git"; URL = "https://git-scm.com/" }
)

$missingRequirements = $false
foreach ($req in $requirements) {
    if (-not (Test-Command $req.Command)) {
        Write-Host "❌ $($req.Name) não encontrado. Instale em: $($req.URL)" -ForegroundColor Red
        $missingRequirements = $true
    } else {
        Write-Host "✓ $($req.Name) encontrado" -ForegroundColor Green
    }
}

if ($missingRequirements) {
    Write-Error "Instale os requisitos faltantes e execute novamente"
    exit 1
}

# Frontend/Backend
Write-Step "Configurando aplicação web..."
Push-Location
try {
    # Instala dependências Node.js
    npm install

    # Verifica instalação
    npm run build

    # Cria arquivo .env se não existir
    if (-not (Test-Path .env)) {
        Copy-Item .env.example .env -Force
        Write-Host "Arquivo .env criado. Configure suas variáveis de ambiente." -ForegroundColor Yellow
    }
} finally {
    Pop-Location
}

# Mosquitto
Write-Step "Configurando Mosquitto MQTT Broker..."
Push-Location mosquitto
try {
    # Instala serviço
    ./install-service.ps1
    
    # Inicia serviço
    Start-Service Mosquitto
} finally {
    Pop-Location
}

# ESP32
Write-Step "Configurando ambiente ESP32..."
Push-Location esp32
try {
    # Fix includes
    ./fix_includes.ps1
    
    # Setup PlatformIO
    ./setup_platformio.ps1

    # Cria config.h
    if (-not (Test-Path src/config.h)) {
        Copy-Item src/config.example.h src/config.h
        Write-Host "Arquivo config.h criado. Configure suas credenciais." -ForegroundColor Yellow
    }
} finally {
    Pop-Location
}

# Instruções finais
Write-Host "`nSetup concluído!" -ForegroundColor Green
Write-Host "`nPróximos passos:"
Write-Host "1. Configure as variáveis em .env"
Write-Host "2. Configure as credenciais em esp32/src/config.h"
Write-Host "3. Inicie a aplicação:"
Write-Host "   npm run dev"
Write-Host "4. Upload do firmware:"
Write-Host "   cd esp32"
Write-Host "   pio run -t upload"

Write-Host "`nConsulte o README de cada componente para mais detalhes."