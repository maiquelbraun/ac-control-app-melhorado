# Script para instalar o serviço do Mosquitto MQTT Broker
param(
    [string]$InstallPath = "C:\Program Files\mosquitto",
    [string]$ConfigPath = ".\mosquitto.conf"
)

# Verifica se está rodando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Este script precisa ser executado como Administrador"
    exit 1
}

# Verifica se o Mosquitto está instalado
if (-not (Test-Path $InstallPath)) {
    Write-Error "Mosquitto não encontrado em $InstallPath. Por favor, instale o Mosquitto primeiro."
    exit 1
}

# Verifica se o arquivo de configuração existe
if (-not (Test-Path $ConfigPath)) {
    Write-Error "Arquivo de configuração não encontrado em $ConfigPath"
    exit 1
}

# Funções auxiliares
function Stop-MosquittoService {
    $service = Get-Service -Name "Mosquitto" -ErrorAction SilentlyContinue
    if ($null -ne $service) {
        if ($service.Status -eq "Running") {
            Write-Host "Parando serviço do Mosquitto..."
            Stop-Service -Name "Mosquitto"
            Start-Sleep -Seconds 2
        }
    }
}

function Remove-MosquittoService {
    $service = Get-Service -Name "Mosquitto" -ErrorAction SilentlyContinue
    if ($null -ne $service) {
        Write-Host "Removendo serviço existente..."
        & "$InstallPath\mosquitto" uninstall
        Start-Sleep -Seconds 2
    }
}

function Install-MosquittoService {
    Write-Host "Instalando serviço..."
    & "$InstallPath\mosquitto" install
    Start-Sleep -Seconds 2
}

function Copy-ConfigFile {
    Write-Host "Copiando arquivo de configuração..."
    Copy-Item -Path $ConfigPath -Destination "$InstallPath\mosquitto.conf" -Force
}

function Start-MosquittoService {
    Write-Host "Iniciando serviço..."
    Start-Service -Name "Mosquitto"
}

# Execução principal
try {
    Stop-MosquittoService
    Remove-MosquittoService
    Install-MosquittoService
    Copy-ConfigFile
    Start-MosquittoService

    Write-Host "`nServiço instalado e iniciado com sucesso!" -ForegroundColor Green
    Write-Host "Verifique os logs em: $InstallPath\mosquitto.log`n"
} catch {
    Write-Error "Erro durante a instalação: $_"
    exit 1
}