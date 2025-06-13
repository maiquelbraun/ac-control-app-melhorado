@echo off
echo Iniciando instalacao do projeto ESP32...
echo.

REM Verifica se esta rodando como administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Por favor, execute este script como Administrador!
    echo Clique com botao direito -^> Executar como administrador
    pause
    exit /b 1
)

REM Configura PowerShell
powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force"

REM Executa scripts em sequencia
echo Instalando PlatformIO e dependencias...
powershell -File install_platformio.ps1
if %errorlevel% neq 0 goto :error

echo.
echo Configurando ambiente...
powershell -File setup_platformio.ps1
if %errorlevel% neq 0 goto :rebuild

echo.
echo Validando instalacao...
powershell -File validate.ps1
if %errorlevel% neq 0 goto :rebuild

echo.
echo Instalacao concluida com sucesso!
goto :end

:rebuild
echo.
echo Tentando reconstruir...
powershell -File rebuild.ps1
if %errorlevel% neq 0 goto :clean

echo.
echo Reconstrucao concluida!
goto :end

:clean
echo.
echo Tentando limpeza completa...
powershell -File clean.ps1
if %errorlevel% neq 0 goto :error
goto :validate

:validate
echo.
echo Validando novamente...
powershell -File validate.ps1
if %errorlevel% neq 0 goto :error
goto :end

:error
echo.
echo Erro durante a instalacao!
echo Verifique os erros acima ou consulte TROUBLESHOOTING.md

:end
echo.
echo Pressione qualquer tecla para sair...
pause > nul