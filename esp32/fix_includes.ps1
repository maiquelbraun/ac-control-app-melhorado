# Script para corrigir problemas de include do Arduino ESP32

Write-Host "Corrigindo configuração do Arduino ESP32..." -ForegroundColor Cyan

# Helpers
function Test-PlatformIO {
    $pio = Get-Command pio -ErrorAction SilentlyContinue
    return $null -ne $pio
}

function Get-PlatformIOPath {
    if ($IsWindows) {
        return "$env:USERPROFILE\.platformio"
    } else {
        return "$env:HOME\.platformio"
    }
}

function Initialize-Directories {
    $dirs = @(
        '.vscode',
        'include',
        'lib',
        'src'
    )
    
    foreach ($dir in $dirs) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "Criado diretório: $dir" -ForegroundColor Green
        }
    }
}

# Verifica PlatformIO
if (-not (Test-PlatformIO)) {
    Write-Host "Instalando PlatformIO..." -ForegroundColor Yellow
    python -m pip install -U platformio
}

# Paths
$pioPath = Get-PlatformIOPath
$arduinoPath = Join-Path $pioPath "packages/framework-arduinoespressif32"
$toolchainPath = Join-Path $pioPath "packages/toolchain-xtensa-esp32"

# Instala/Atualiza ESP32
Write-Host "Instalando plataforma ESP32..." -ForegroundColor Yellow
pio platform install espressif32

# Cria estrutura
Initialize-Directories

# Configura VSCode
$cppProperties = @{
    configurations = @(
        @{
            name = "ESP32"
            includePath = @(
                "${workspaceFolder}/**",
                "$arduinoPath/**",
                "$arduinoPath/cores/esp32/**",
                "$arduinoPath/tools/sdk/esp32/include/**",
                "$arduinoPath/libraries/**",
                "$toolchainPath/xtensa-esp32-elf/include/**",
                "$toolchainPath/lib/gcc/xtensa-esp32-elf/**",
                "${workspaceFolder}/.pio/libdeps/esp32dev/**"
            )
            browse = @{
                path = @(
                    "${workspaceFolder}",
                    $arduinoPath,
                    $toolchainPath
                )
                limitSymbolsToIncludedHeaders = $true
            }
            defines = @(
                "ARDUINO=100",
                "ESP32=1",
                "PLATFORMIO=60106",
                "F_CPU=240000000L"
            )
            cStandard = "c11"
            cppStandard = "c++17"
            intelliSenseMode = "gcc-x86"
            compilerPath = "$toolchainPath/bin/xtensa-esp32-elf-gcc.exe"
        }
    )
    version = 4
}

# Salva configuração
$cppProperties | ConvertTo-Json -Depth 10 | Set-Content .vscode/c_cpp_properties.json

# Configura ambiente
Write-Host "Configurando ambiente..." -ForegroundColor Yellow
pio project init --ide vscode
pio run --target clean

# Verifica arquivos necessários
$requiredFiles = @(
    "$arduinoPath/cores/esp32/Arduino.h",
    "$toolchainPath/bin/xtensa-esp32-elf-gcc.exe"
)

$missingFiles = $false
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "Arquivo não encontrado: $file" -ForegroundColor Red
        $missingFiles = $true
    }
}

if ($missingFiles) {
    Write-Host "`nAlguns arquivos necessários estão faltando." -ForegroundColor Red
    Write-Host "Tente reinstalar a plataforma ESP32:" -ForegroundColor Yellow
    Write-Host "pio platform uninstall espressif32"
    Write-Host "pio platform install espressif32"
} else {
    Write-Host "`nConfiguração concluída com sucesso!" -ForegroundColor Green
    Write-Host "Tente recarregar o VSCode (Ctrl+Shift+P -> Reload Window)"
}

# Instruções
Write-Host "`nPróximos passos:"
Write-Host "1. Abra o VS Code nesta pasta"
Write-Host "2. Instale as extensões recomendadas"
Write-Host "3. Recarregue a janela do VS Code"
Write-Host "4. Compile com: pio run"
Write-Host "5. Upload com: pio run -t upload"