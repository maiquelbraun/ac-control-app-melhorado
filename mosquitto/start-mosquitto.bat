@echo off
echo Verificando servico do Mosquitto...

sc query "mosquitto" | find "RUNNING" > nul
if %ERRORLEVEL% equ 0 (
    echo Servico Mosquitto ja esta em execucao.
) else (
    echo Iniciando servico Mosquitto...
    net start mosquitto
    if %ERRORLEVEL% equ 0 (
        echo Servico Mosquitto iniciado com sucesso.
    ) else (
        echo Erro ao iniciar servico Mosquitto. Tentando instalar...
        "C:\Program Files\mosquitto\mosquitto.exe" install
        if %ERRORLEVEL% equ 0 (
            echo Servico instalado. Iniciando...
            net start mosquitto
            if %ERRORLEVEL% equ 0 (
                echo Servico Mosquitto iniciado com sucesso.
            ) else (
                echo Falha ao iniciar servico. Execute como Administrador.
                pause
                exit /b 1
            )
        ) else (
            echo Falha ao instalar servico. Verifique se o Mosquitto esta instalado em C:\Program Files\mosquitto
            pause
            exit /b 1
        )
    )
)

echo.
echo Status atual do servico:
sc query "mosquitto"

echo.
echo Verificando conexao MQTT...
"C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -p 1883 -t "test" -m "test" -u "admin" -P "admin123"
if %ERRORLEVEL% equ 0 (
    echo Conexao MQTT OK.
) else (
    echo Falha na conexao MQTT. Verifique as configuracoes.
)

echo.
echo Para parar o servico, use: net stop mosquitto
echo Para ver os logs: type "C:\Program Files\mosquitto\mosquitto.log"

pause