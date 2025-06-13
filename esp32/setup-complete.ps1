# Script unificado para configurar o ambiente ESP32

# Muda para o diretório do script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path $scriptPath

function Write-Step {
    param($Message)
    Write-Host "`n>> $Message" -ForegroundColor Cyan
}

function Test-Command {
    param($Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Verifica se está rodando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Este script precisa ser executado como Administrador"
    exit 1
}

Write-Step "Iniciando setup do projeto ESP32..."

# 1. Verificar Python
Write-Step "Verificando Python..."
if (-not (Test-Command "python")) {
    Write-Host "Python não encontrado. Por favor, instale Python 3.x de python.org" -ForegroundColor Red
    exit 1
}

# 2. Instalar/Atualizar PIP
python -m pip install --upgrade pip

# 3. Instalar PlatformIO
Write-Step "Instalando PlatformIO..."
python -m pip install -U platformio

# 4. Adicionar PlatformIO ao PATH
$pioPath = "$env:USERPROFILE\.platformio\penv\Scripts"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if (-not $currentPath.Contains($pioPath)) {
    Write-Host "Adicionando PlatformIO ao PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$pioPath", "User")
    $env:Path = "$env:Path;$pioPath"
}

# 5. Limpar ambiente
Write-Step "Limpando ambiente..."
Remove-Item -Recurse -Force .pio -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vscode -ErrorAction SilentlyContinue

# 6. Instalar plataforma ESP32
Write-Step "Instalando plataforma ESP32..."
$platformResult = pio platform install espressif32 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nErro ao instalar plataforma ESP32:" -ForegroundColor Red
    Write-Host $platformResult
    exit 1
}

# 7. Instalar bibliotecas
Write-Step "Instalando bibliotecas..."
$libraries = @(
    "knolleary/PubSubClient",
    "bblanchon/ArduinoJson",
    "adafruit/DHT sensor library",
    "adafruit/Adafruit Unified Sensor",
    "z3t0/IRremote"
)

foreach ($lib in $libraries) {
    Write-Host "Instalando $lib..."
    pio lib install "$lib"
}

# 8. Configurar projeto
Write-Step "Configurando projeto..."
pio project init --ide vscode

# 9. Criar config.h se não existir
if (-not (Test-Path src/config.h)) {
    Write-Step "Criando arquivo de configuração..."
    Copy-Item src/config.example.h src/config.h
    Write-Host "Arquivo config.h criado. Configure suas credenciais." -ForegroundColor Yellow
}

# 10. Compilar projeto
Write-Step "Compilando projeto..."
$buildResult = pio run 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSetup concluído com sucesso!" -ForegroundColor Green
    Write-Host "`nPróximos passos:"
    Write-Host "1. Configure suas credenciais em src/config.h"
    Write-Host "2. Conecte o ESP32"
    Write-Host "3. Execute: pio run -t upload"
    Write-Host "4. Monitor: pio device monitor"
} else {
    Write-Host "`nErro durante o setup!" -ForegroundColor Red
    Write-Host "Detalhes do erro:" -ForegroundColor Yellow
    Write-Host $buildResult
    Write-Host "`nSoluções:"
    Write-Host "1. Execute 'pio run -v' para logs detalhados"
    Write-Host "2. Consulte TROUBLESHOOTING.md"
    Write-Host "3. Verifique se todos os requisitos estão instalados"
}

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')