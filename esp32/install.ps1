# Script principal de instalação e configuração do projeto ESP32

Write-Host "Instalando e configurando projeto ESP32..." -ForegroundColor Cyan

function Write-Step {
    param($Message)
    Write-Host "`n>> $Message" -ForegroundColor Cyan
}

# Verifica se está rodando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Este script precisa ser executado como Administrador"
    exit 1
}

# 1. Instala PlatformIO
Write-Step "Instalando PlatformIO..."
./install_platformio.ps1

# 2. Configura ambiente
Write-Step "Configurando ambiente de desenvolvimento..."
./setup_platformio.ps1

# 3. Corrige includes
Write-Step "Corrigindo includes..."
./fix_includes.ps1

# 4. Configura projeto
Write-Step "Configurando projeto..."

# Copia config.h se não existir
if (-not (Test-Path src/config.h)) {
    Copy-Item src/config.example.h src/config.h
    Write-Host "Arquivo config.h criado. Configure suas credenciais." -ForegroundColor Yellow
}

# Compila projeto
Write-Step "Compilando projeto..."
pio run

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nInstalação concluída com sucesso!" -ForegroundColor Green
    Write-Host "`nPróximos passos:"
    Write-Host "1. Configure suas credenciais em src/config.h"
    Write-Host "2. Conecte o ESP32 via USB"
    Write-Host "3. Execute os comandos:"
    Write-Host "   pio run -t upload"
    Write-Host "   pio device monitor"
} else {
    Write-Host "`nErro durante a instalação!" -ForegroundColor Red
    Write-Host "Tente executar ./rebuild.ps1 para corrigir problemas"
    Write-Host "Ou consulte TROUBLESHOOTING.md para mais soluções"
}

# Instruções extras
Write-Host "`nComandos úteis:"
Write-Host "- Para reconstruir projeto: ./rebuild.ps1"
Write-Host "- Para upload: pio run -t upload"
Write-Host "- Para monitorar: pio device monitor"
Write-Host "- Para limpar: pio run -t clean"

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')