# Script para inicializar o projeto PlatformIO

Write-Host "Inicializando projeto ESP32..." -ForegroundColor Cyan

# Verifica se o PlatformIO CLI está instalado
$platformio = Get-Command pio -ErrorAction SilentlyContinue
if (-not $platformio) {
    Write-Host "PlatformIO CLI não encontrado. Instalando..." -ForegroundColor Yellow
    python -m pip install platformio
}

# Atualiza o PlatformIO
Write-Host "Atualizando PlatformIO..." -ForegroundColor Yellow
pio upgrade

# Instala as dependências do projeto
Write-Host "Instalando dependências..." -ForegroundColor Yellow
pio lib install

# Atualiza as bibliotecas
Write-Host "Atualizando bibliotecas..." -ForegroundColor Yellow
pio lib update

# Cria estrutura de diretórios se não existir
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
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Criado diretório: $dir" -ForegroundColor Green
    }
}

# Compila o projeto para verificar
Write-Host "Compilando projeto..." -ForegroundColor Yellow
pio run

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nProjeto inicializado com sucesso!" -ForegroundColor Green
    Write-Host "`nPróximos passos:"
    Write-Host "1. Configure src/config.h com suas credenciais"
    Write-Host "2. Compile com: pio run"
    Write-Host "3. Upload com: pio run -t upload"
    Write-Host "4. Monitor com: pio device monitor"
} else {
    Write-Host "`nErro ao inicializar projeto!" -ForegroundColor Red
    Write-Host "Verifique os erros acima e tente novamente."
}