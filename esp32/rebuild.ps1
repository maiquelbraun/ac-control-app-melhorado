# Script para reconstruir o projeto e reconfigurar IntelliSense

Write-Host "Reconstruindo projeto ESP32..." -ForegroundColor Cyan

# Remove caches
Write-Host "Limpando caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .pio -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vscode/.browse* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vscode/c_cpp_properties.json -ErrorAction SilentlyContinue

# Reinstala plataforma ESP32
Write-Host "Reinstalando plataforma ESP32..." -ForegroundColor Yellow
pio platform uninstall espressif32
pio platform install espressif32

# Reconfigura projeto
Write-Host "Reconfigurando projeto..." -ForegroundColor Yellow
pio project init --ide vscode
pio run -t clean

# Instala bibliotecas
Write-Host "Instalando bibliotecas..." -ForegroundColor Yellow
pio lib install `
    "knolleary/PubSubClient" `
    "bblanchon/ArduinoJson" `
    "adafruit/DHT sensor library" `
    "adafruit/Adafruit Unified Sensor" `
    "z3t0/IRremote"

# Compila
Write-Host "Compilando..." -ForegroundColor Yellow
pio run

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nProjeto reconstruído com sucesso!" -ForegroundColor Green
    Write-Host "`nPróximos passos:"
    Write-Host "1. Feche o VS Code"
    Write-Host "2. Abra novamente usando o workspace:"
    Write-Host "   code ac-control-esp32.code-workspace"
    Write-Host "3. Aguarde o IntelliSense reindexar"
} else {
    Write-Host "`nErro na reconstrução!" -ForegroundColor Red
    Write-Host "Verifique os erros acima e consulte TROUBLESHOOTING.md"
}

# Instruções extras
Write-Host "`nSe ainda houver problemas com includes:"
Write-Host "1. Ctrl+Shift+P -> C/C++: Reset IntelliSense Database"
Write-Host "2. Ctrl+Shift+P -> C/C++: Select IntelliSense Configuration"
Write-Host "3. Selecione a configuração 'ESP32'"

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')