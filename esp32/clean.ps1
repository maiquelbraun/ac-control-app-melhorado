# Script para limpar completamente o projeto e forçar reconstrução

Write-Host "Limpando projeto ESP32..." -ForegroundColor Cyan

# Remove diretórios de build e cache
$dirsToRemove = @(
    '.pio',
    '.vscode/.browse.c_cpp.db*',
    '.vscode/c_cpp_properties.json',
    '.vscode/launch.json',
    '.vscode/ipch'
)

foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        Write-Host "Removendo $dir..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $dir
    }
}

# Remove arquivos temporários
$filesToRemove = Get-ChildItem -Recurse -Include @(
    '*.o',
    '*.d',
    '*.elf',
    '*.bin',
    '*.map',
    '*.a',
    '*.log'
)

foreach ($file in $filesToRemove) {
    Write-Host "Removendo $($file.FullName)..." -ForegroundColor Yellow
    Remove-Item -Force $file
}

# Limpa PlatformIO
Write-Host "Limpando cache do PlatformIO..." -ForegroundColor Yellow
pio run -t clean

# Reinstala dependências
Write-Host "Reinstalando dependências..." -ForegroundColor Yellow
pio lib uninstall "*"
pio lib install `
    "knolleary/PubSubClient" `
    "bblanchon/ArduinoJson" `
    "adafruit/DHT sensor library" `
    "adafruit/Adafruit Unified Sensor" `
    "z3t0/IRremote"

# Reconfigura projeto
Write-Host "Reconfigurando projeto..." -ForegroundColor Yellow
pio project init --ide vscode

# Compila
Write-Host "Compilando..." -ForegroundColor Yellow
pio run

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nLimpeza e reconstrução concluídas com sucesso!" -ForegroundColor Green
    Write-Host "`nPróximos passos:"
    Write-Host "1. Reinicie o VS Code"
    Write-Host "2. Aguarde a reindexação do IntelliSense"
    Write-Host "3. Tente compilar novamente com 'pio run'"
} else {
    Write-Host "`nErro durante a reconstrução!" -ForegroundColor Red
    Write-Host "Verifique os erros acima ou execute:"
    Write-Host "pio run -v"
    Write-Host "para ver logs detalhados"
}

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')