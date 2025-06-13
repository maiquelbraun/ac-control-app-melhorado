# AC Control App

Sistema de controle de ar condicionado com interface web e comunicação MQTT.

## Requisitos

- Node.js 18+
- SQLite
- Mosquitto MQTT Broker
- OpenSSL (para certificados SSL)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ac-control-app.git
cd ac-control-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```
Edite o arquivo `.env.local` com suas configurações.

4. Configure o banco de dados:
```bash
npx prisma db push
```

## Configuração do Mosquitto MQTT Broker

1. Instale o Mosquitto:
   - Windows: [Download](https://mosquitto.org/download/)
   - Linux: `sudo apt install mosquitto mosquitto-clients`

2. Configure o Mosquitto:
```bash
cd mosquitto
```

3. Execute o script de instalação:
   - Windows (PowerShell Admin):
   ```powershell
   .\install-service.ps1
   ```
   - Linux:
   ```bash
   sudo cp mosquitto.conf /etc/mosquitto/mosquitto.conf
   sudo systemctl restart mosquitto
   ```

## Desenvolvimento

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse http://localhost:3000

## Estrutura MQTT

### Tópicos

- `ac-control/dispositivos/{idEsp32}/status` - Status do dispositivo
- `ac-control/dispositivos/{idEsp32}/comando` - Comandos para o dispositivo
- `ac-control/climatizadores/{id}/status` - Status do climatizador
- `ac-control/climatizadores/{id}/comando` - Comandos para o climatizador
- `sistema/status` - Status geral do sistema

### Formato das Mensagens

Status do Dispositivo:
```json
{
  "online": true,
  "timestamp": 1623456789,
  "error": null
}
```

Comando para Dispositivo:
```json
{
  "comando": "LIGAR",
  "parametros": {
    "temperatura": 23,
    "modo": "REFRIGERAR",
    "velocidade": "AUTO"
  }
}
```

## Produção

1. Crie o build:
```bash
npm run build
```

2. Inicie o servidor:
```bash
npm start
```

## Segurança

1. Em produção:
   - Altere as credenciais MQTT padrão
   - Use certificados SSL próprios
   - Configure firewall adequadamente
   - Use variáveis de ambiente seguras

2. Acesso ao Broker:
   - Restrinja o acesso por IP
   - Use ACLs para controle de tópicos
   - Monitore tentativas de acesso

## Troubleshooting

1. Verificar status do Mosquitto:
```bash
# Windows
Get-Service Mosquitto

# Linux
systemctl status mosquitto
```

2. Testar conexão MQTT:
```bash
mosquitto_sub -h localhost -p 1883 -t "test" -u "admin" -P "admin123"
```

3. Logs do Mosquitto:
```bash
# Windows
Get-Content C:\mosquitto\log\mosquitto.log -Tail 50

# Linux
tail -f /var/log/mosquitto/mosquitto.log
```

## Licença

MIT License - veja [LICENSE](LICENSE) para mais detalhes.
