# Script para instalar PlatformIO CLI e ferramentas necessárias

# Verifica se está sendo executado como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Este script precisa ser executado como Administrador"
    exit 1
}

# Verifica Python
Write-Host "Verificando Python..." -ForegroundColor Cyan
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Error "Python não encontrado. Por favor, instale Python 3.x de https://www.python.org/"
    exit 1
}

# Atualiza pip
Write-Host "Atualizando pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Instala platformio
Write-Host "Instalando PlatformIO..." -ForegroundColor Yellow
python -m pip install -U platformio

# Adiciona ao PATH
$platformioPath = "$env:USERPROFILE\.platformio\penv\Scripts"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if (-not $currentPath.Contains($platformioPath)) {
    Write-Host "Adicionando PlatformIO ao PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$platformioPath", "User")
    $env:Path = "$env:Path;$platformioPath"
}

# Verifica instalação
Write-Host "Verificando instalação..." -ForegroundColor Yellow
$pio = Get-Command pio -ErrorAction SilentlyContinue

if ($pio) {
    Write-Host "`nPlatformIO instalado com sucesso!" -ForegroundColor Green
    Write-Host "Versão instalada: $(pio --version)"
    
    Write-Host "`nPróximos passos:"
    Write-Host "1. Feche e abra novamente o PowerShell"
    Write-Host "2. Execute: pio run -t upload"
    Write-Host "3. Para monitorar: pio device monitor"
} else {
    Write-Host "`nErro na instalação do PlatformIO!" -ForegroundColor Red
    Write-Host "Tente reiniciar o PowerShell e executar 'pio --version'"
}

# Instala VSCode se necessário
$vscode = Get-Command code -ErrorAction SilentlyContinue
if (-not $vscode) {
    Write-Host "`nVSCode não encontrado. Deseja instalar? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'S') {
        # Download VSCode
        $url = "https://update.code.visualstudio.com/latest/win32-x64-user/stable"
        $output = "$env:TEMP\VSCodeSetup.exe"
        
        Write-Host "Baixando VSCode..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $url -OutFile $output
        
        # Instala VSCode
        Write-Host "Instalando VSCode..." -ForegroundColor Yellow
        Start-Process -FilePath $output -Args "/SILENT /MERGETASKS=!runcode" -Wait
        
        Write-Host "VSCode instalado!" -ForegroundColor Green
        Write-Host "Instale a extensão PlatformIO IDE no VSCode"
    }
}

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')