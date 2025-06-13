# Script para validar a configuração do projeto ESP32

function Write-Status {
    param(
        [string]$Message,
        [bool]$Success
    )
    
    $color = if ($Success) { "Green" } else { "Red" }
    $status = if ($Success) { "✓" } else { "✗" }
    
    Write-Host "[$status] $Message" -ForegroundColor $color
}

Write-Host "Validando projeto ESP32..." -ForegroundColor Cyan
$errors = 0

# 1. Verifica Python e PlatformIO
Write-Host "`nVerificando ferramentas..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
$pythonOk = $LASTEXITCODE -eq 0
Write-Status "Python instalado ($pythonVersion)" $pythonOk
if (-not $pythonOk) { $errors++ }

$pioVersion = pio --version 2>&1
$pioOk = $LASTEXITCODE -eq 0
Write-Status "PlatformIO instalado ($pioVersion)" $pioOk
if (-not $pioOk) { $errors++ }

# 2. Verifica estrutura de diretórios
Write-Host "`nVerificando estrutura..." -ForegroundColor Yellow
$dirs = @(
    "src",
    "lib/AC/include",
    "lib/AC/src",
    "lib/IR/include",
    "lib/IR/src",
    "lib/Network/include",
    "lib/Network/src"
)

foreach ($dir in $dirs) {
    $exists = Test-Path $dir
    Write-Status "Diretório $dir" $exists
    if (-not $exists) { $errors++ }
}

# 3. Verifica arquivos essenciais
Write-Host "`nVerificando arquivos..." -ForegroundColor Yellow
$files = @(
    "platformio.ini",
    "src/main.cpp",
    "src/config.h",
    "lib/AC/include/ACController.h",
    "lib/IR/include/IRSender.h",
    "lib/Network/include/NetworkManager.h"
)

foreach ($file in $files) {
    $exists = Test-Path $file
    Write-Status "Arquivo $file" $exists
    if (-not $exists) { $errors++ }
}

# 4. Verifica configuração
Write-Host "`nVerificando configuração..." -ForegroundColor Yellow
$config = Get-Content "platformio.ini" -ErrorAction SilentlyContinue
$configOk = $config -match "platform = espressif32"
Write-Status "Configuração PlatformIO" $configOk
if (-not $configOk) { $errors++ }

# 5. Verifica dependências
Write-Host "`nVerificando bibliotecas..." -ForegroundColor Yellow
$libs = pio lib list 2>&1
$libsOk = $LASTEXITCODE -eq 0
Write-Status "Bibliotecas PlatformIO" $libsOk
if (-not $libsOk) { $errors++ }

# 6. Testa compilação
Write-Host "`nTestando compilação..." -ForegroundColor Yellow
$buildOutput = pio run 2>&1
$buildOk = $LASTEXITCODE -eq 0
Write-Status "Compilação do projeto" $buildOk
if (-not $buildOk) { $errors++ }

# Resultado final
Write-Host "`nResultado da validação:" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "Projeto configurado corretamente!" -ForegroundColor Green
    Write-Host "Pronto para fazer upload: pio run -t upload"
} else {
    Write-Host "Encontrados $errors problemas!" -ForegroundColor Red
    Write-Host "Execute ./clean.ps1 e tente novamente"
    Write-Host "Ou consulte TROUBLESHOOTING.md"
}

exit $errors