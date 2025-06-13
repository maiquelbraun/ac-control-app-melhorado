# Configuração do Mosquitto MQTT Broker

Este diretório contém os arquivos necessários para configurar o Mosquitto MQTT Broker no Windows.

## Pré-requisitos

1. Instale o Mosquitto Broker:
   - Baixe o instalador em: https://mosquitto.org/download/
   - Instale com a opção "Service" selecionada

2. Instale o OpenSSL:
   - Baixe em: https://slproweb.com/products/Win32OpenSSL.html
   - Adicione ao PATH do sistema

## Instalação

1. Abra o PowerShell como Administrador

2. Navegue até este diretório:
   ```powershell
   cd path/to/ac-control-app/mosquitto
   ```

3. Execute o script de instalação:
   ```powershell
   .\install-service.ps1
   ```

O script irá:
- Criar os diretórios necessários
- Configurar o Mosquitto
- Gerar certificados SSL
- Criar usuário padrão
- Instalar e iniciar o serviço

## Configurações Padrão

- **Porta**: 1883
- **Usuário**: admin
- **Senha**: admin123
- **SSL**: Habilitado
- **Persistência**: Habilitada

## Estrutura de Diretórios

```
C:\mosquitto\
├── config\
│   ├── mosquitto.conf
│   └── passwd
├── data\
├── log\
└── certs\
    ├── ca.crt
    ├── ca.key
    ├── server.crt
    └── server.key
```

## Segurança

⚠️ **IMPORTANTE**: Em ambiente de produção:
1. Altere as credenciais padrão
2. Use certificados SSL próprios
3. Configure firewall adequadamente
4. Revise as permissões dos diretórios

## Tópicos MQTT

Padrão de tópicos do sistema:

```
ac-control/
├── dispositivos/
│   └── {idEsp32}/
│       ├── status
│       └── comando
├── climatizadores/
│   └── {id}/
│       ├── status
│       └── comando
└── sistema/
    └── status
```

## Alterando Senhas

Para adicionar/alterar usuários:
```powershell
mosquitto_passwd -b C:\mosquitto\config\passwd username password
```

## Logs

Os logs são salvos em:
```
C:\mosquitto\log\mosquitto.log
```

## Troubleshooting

1. Verifique status do serviço:
   ```powershell
   Get-Service Mosquitto
   ```

2. Reinicie o serviço:
   ```powershell
   Restart-Service Mosquitto
   ```

3. Verifique logs:
   ```powershell
   Get-Content C:\mosquitto\log\mosquitto.log -Tail 50
   ```

4. Teste conexão:
   ```powershell
   mosquitto_sub -h localhost -p 1883 -t "test" -u "admin" -P "admin123"