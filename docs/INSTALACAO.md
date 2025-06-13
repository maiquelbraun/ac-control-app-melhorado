# Guia de Instalação e Configuração - AC Control App

## Pré-requisitos

### Software Necessário
- **Node.js** 18.0 ou superior
- **npm** ou **yarn**
- **Git**
- **Mosquitto MQTT Broker**
- **OpenSSL** (para certificados SSL)

### Hardware Recomendado
- **Servidor**: 2GB RAM, 10GB espaço em disco
- **ESP32**: Modelo WROOM-32 ou similar
- **Emissor IR**: Compatível com ESP32

## Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/ac-control-app.git
cd ac-control-app
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:

```env
# Banco de Dados
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# MQTT
NEXT_PUBLIC_MQTT_HOST="localhost"
NEXT_PUBLIC_MQTT_PORT="1883"
NEXT_PUBLIC_MQTT_USERNAME="admin"
NEXT_PUBLIC_MQTT_PASSWORD="admin123"
NEXT_PUBLIC_MQTT_SSL="false"
```

### 4. Configure o Banco de Dados

```bash
npx prisma db push
```

### 5. Crie o Primeiro Usuário Administrador

Execute o script de seed ou use a API de registro:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@exemplo.com",
    "password": "senha123",
    "name": "Administrador",
    "role": "ADMIN"
  }'
```

## Configuração do Mosquitto MQTT

### Windows

1. **Baixe e instale o Mosquitto**:
   - Acesse: https://mosquitto.org/download/
   - Baixe a versão para Windows
   - Execute o instalador

2. **Configure o Mosquitto**:
   ```powershell
   # Copie o arquivo de configuração
   Copy-Item "mosquitto/mosquitto.conf" "C:\Program Files\mosquitto\mosquitto.conf"
   
   # Crie diretórios necessários
   New-Item -ItemType Directory -Path "C:\mosquitto\data"
   New-Item -ItemType Directory -Path "C:\mosquitto\log"
   New-Item -ItemType Directory -Path "C:\mosquitto\config"
   ```

3. **Crie usuário e senha**:
   ```powershell
   cd "C:\Program Files\mosquitto"
   .\mosquitto_passwd.exe -c C:\mosquitto\config\passwd admin
   # Digite a senha quando solicitado
   ```

4. **Instale como serviço**:
   ```powershell
   # Execute como Administrador
   .\mosquitto.exe install
   net start mosquitto
   ```

### Linux (Ubuntu/Debian)

1. **Instale o Mosquitto**:
   ```bash
   sudo apt update
   sudo apt install mosquitto mosquitto-clients
   ```

2. **Configure o Mosquitto**:
   ```bash
   # Copie o arquivo de configuração
   sudo cp mosquitto/mosquitto.conf /etc/mosquitto/mosquitto.conf
   
   # Crie usuário e senha
   sudo mosquitto_passwd -c /etc/mosquitto/passwd admin
   ```

3. **Inicie o serviço**:
   ```bash
   sudo systemctl enable mosquitto
   sudo systemctl start mosquitto
   ```

### Configuração SSL (Produção)

1. **Gere certificados**:
   ```bash
   # Crie diretório para certificados
   mkdir -p /etc/mosquitto/certs
   cd /etc/mosquitto/certs
   
   # Gere CA
   openssl genrsa -out ca.key 2048
   openssl req -new -x509 -days 365 -key ca.key -out ca.crt
   
   # Gere certificado do servidor
   openssl genrsa -out server.key 2048
   openssl req -new -key server.key -out server.csr
   openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365
   ```

2. **Atualize a configuração**:
   ```conf
   # /etc/mosquitto/mosquitto.conf
   listener 8883
   cafile /etc/mosquitto/certs/ca.crt
   certfile /etc/mosquitto/certs/server.crt
   keyfile /etc/mosquitto/certs/server.key
   ```

3. **Atualize variáveis de ambiente**:
   ```env
   NEXT_PUBLIC_MQTT_PORT="8883"
   NEXT_PUBLIC_MQTT_SSL="true"
   ```

## Configuração dos Dispositivos ESP32

### 1. Prepare o Ambiente Arduino

1. Instale o Arduino IDE
2. Adicione o suporte ao ESP32:
   - File → Preferences
   - Additional Board Manager URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager → Pesquise "ESP32" e instale

### 2. Instale as Bibliotecas

No Arduino IDE, vá em Tools → Manage Libraries e instale:
- `WiFi` (built-in)
- `PubSubClient`
- `ArduinoJson`
- `IRremoteESP8266`

### 3. Configure o Código

Edite o arquivo `esp32_climatizador_controller.cpp`:

```cpp
// Configurações WiFi
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";

// Configurações MQTT
const char* mqtt_server = "192.168.1.100"; // IP do servidor
const int mqtt_port = 1883;
const char* mqtt_user = "admin";
const char* mqtt_password = "admin123";
const char* device_id = "esp32-001"; // ID único para cada dispositivo
```

### 4. Upload do Código

1. Conecte o ESP32 via USB
2. Selecione a placa: Tools → Board → ESP32 Dev Module
3. Selecione a porta: Tools → Port
4. Clique em Upload

### 5. Registre o Dispositivo

Após o upload, registre o dispositivo na aplicação:

```bash
curl -X POST http://localhost:3000/api/dispositivos-controle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "idEsp32": "esp32-001",
    "modeloEsp32": "ESP32-WROOM-32",
    "versaoFirmware": "1.0.0"
  }'
```

## Execução

### Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### Produção

1. **Build da aplicação**:
   ```bash
   npm run build
   ```

2. **Inicie o servidor**:
   ```bash
   npm start
   ```

### Docker (Opcional)

1. **Crie o Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build e execute**:
   ```bash
   docker build -t ac-control-app .
   docker run -p 3000:3000 ac-control-app
   ```

## Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes com watch mode
npm run test:watch

# Testes com coverage
npm run test:coverage
```

### Testar Conexão MQTT

```bash
# Subscrever em tópicos
mosquitto_sub -h localhost -p 1883 -t "ac-control/#" -u admin -P admin123

# Publicar teste
mosquitto_pub -h localhost -p 1883 -t "ac-control/test" -m "Hello World" -u admin -P admin123
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão MQTT**:
   - Verifique se o Mosquitto está rodando
   - Confirme usuário e senha
   - Teste conectividade de rede

2. **ESP32 não conecta**:
   - Verifique credenciais WiFi
   - Confirme IP do servidor MQTT
   - Verifique logs no Serial Monitor

3. **Erro de banco de dados**:
   - Execute `npx prisma db push` novamente
   - Verifique permissões do arquivo de banco

4. **Erro de autenticação**:
   - Verifique NEXTAUTH_SECRET
   - Confirme NEXTAUTH_URL
   - Limpe cookies do navegador

### Logs

- **Aplicação**: Console do navegador e terminal
- **Mosquitto**: 
  - Windows: `C:\mosquitto\log\mosquitto.log`
  - Linux: `/var/log/mosquitto/mosquitto.log`
- **ESP32**: Serial Monitor do Arduino IDE

### Monitoramento

Para produção, considere:
- **Prometheus + Grafana** para métricas
- **ELK Stack** para logs centralizados
- **Uptime monitoring** para disponibilidade

## Backup e Recuperação

### Backup do Banco de Dados

```bash
# SQLite
cp prisma/dev.db backup/dev.db.$(date +%Y%m%d_%H%M%S)

# PostgreSQL (produção)
pg_dump ac_control_db > backup/ac_control_$(date +%Y%m%d_%H%M%S).sql
```

### Backup das Configurações

```bash
# Backup completo
tar -czf backup/ac-control-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  .env.local \
  prisma/dev.db \
  mosquitto/mosquitto.conf
```

## Atualizações

### Atualizar a Aplicação

```bash
git pull origin main
npm install
npx prisma db push
npm run build
npm start
```

### Atualizar Firmware ESP32

1. Modifique o código conforme necessário
2. Atualize a versão no código
3. Faça upload para os dispositivos
4. Atualize a versão no banco de dados via API

## Suporte

Para suporte técnico:
- **Issues**: GitHub Issues
- **Documentação**: `/docs` no repositório
- **Email**: suporte@exemplo.com

