@echo off
echo Iniciando setup do projeto ESP32...

REM Verifica se esta rodando como administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Por favor, execute este script como Administrador!
    echo Clique com botao direito -^> Executar como administrador
    pause
    exit /b 1
)

REM Obtém o diretório do script atual
SET "SCRIPT_DIR=%~dp0"

REM Muda para o diretório do script
cd /d "%SCRIPT_DIR%"

REM Executa o script PowerShell completo usando caminho absoluto
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%SCRIPT_DIR%setup-complete.ps1'"

REM Aguarda input do usuário
echo.
echo Pressione qualquer tecla para sair...
pause > nul