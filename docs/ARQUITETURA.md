# Arquitetura do Sistema - AC Control App

## Visão Geral

O AC Control App é um sistema IoT distribuído que integra uma aplicação web moderna com dispositivos ESP32 para controle remoto de climatizadores. A arquitetura segue padrões de microserviços e comunicação assíncrona via MQTT.

## Diagrama de Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   MQTT Broker   │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (Mosquitto)   │
│                 │    │                 │    │                 │
│ - React UI      │    │ - REST APIs     │    │ - Pub/Sub       │
│ - Material-UI   │    │ - Authentication│    │ - SSL/TLS       │
│ - MQTT Client   │    │ - Authorization │    │ - Persistence   │
│ - State Mgmt    │    │ - Business Logic│    │ - ACL           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   Database      │              │
         └──────────────►│   (SQLite)      │              │
                        │                 │              │
                        │ - Prisma ORM    │              │
                        │ - Relational    │              │
                        │ - ACID          │              │
                        └─────────────────┘              │
                                                         │
┌─────────────────┐    ┌─────────────────┐              │
│   ESP32 Device  │    │   ESP32 Device  │              │
│   (Controller)  │◄───┤   (Controller)  │◄─────────────┘
│                 │    │                 │
│ - WiFi          │    │ - WiFi          │
│ - MQTT Client   │    │ - MQTT Client   │
│ - IR Transmitter│    │ - IR Transmitter│
│ - Sensors       │    │ - Sensors       │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   AC Unit 1     │    │   AC Unit 2     │
│   (Climatizador)│    │   (Climatizador)│
└─────────────────┘    └─────────────────┘
```

## Componentes Principais

### 1. Frontend (Next.js + React)

#### Tecnologias
- **Next.js 15**: Framework React com App Router
- **React 18**: Biblioteca de interface de usuário
- **Material-UI**: Sistema de design e componentes
- **Tailwind CSS**: Estilização utilitária
- **Zustand**: Gerenciamento de estado
- **NextAuth.js**: Autenticação

#### Responsabilidades
- Interface de usuário responsiva
- Autenticação e autorização
- Comunicação com APIs REST
- Cliente MQTT para tempo real
- Gerenciamento de estado local

#### Estrutura de Diretórios
```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── gerenciamento/     # Páginas de gestão
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── [feature]/        # Componentes específicos
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
├── services/             # Serviços externos
└── types/                # Definições TypeScript
```

### 2. Backend (Next.js API Routes)

#### Tecnologias
- **Next.js API Routes**: Endpoints REST
- **Prisma**: ORM para banco de dados
- **NextAuth.js**: Sistema de autenticação
- **bcryptjs**: Hash de senhas
- **MQTT Client**: Comunicação com broker

#### Responsabilidades
- APIs RESTful
- Autenticação JWT
- Autorização baseada em roles
- Validação de dados
- Comunicação MQTT
- Logging e auditoria

#### Estrutura de APIs
```
/api/
├── auth/                  # Autenticação
│   ├── [...nextauth]/    # NextAuth endpoints
│   └── register/         # Registro de usuários
├── blocos/               # CRUD de blocos
├── salas/                # CRUD de salas
├── climatizadores/       # CRUD e controle
│   └── [id]/comando/     # Comandos específicos
├── dispositivos-controle/ # Gerenciamento ESP32
├── dashboard/            # Dados agregados
└── settings/             # Configurações
```

### 3. Banco de Dados (SQLite/PostgreSQL)

#### Modelo de Dados
```sql
-- Hierarquia organizacional
Bloco (1:N) → Sala (1:N) → Climatizador (1:1) → DispositivoControle

-- Autenticação
User → Account, Session
```

#### Características
- **Prisma ORM**: Type-safe database access
- **Migrations**: Controle de versão do schema
- **Indexes**: Otimização de consultas
- **Constraints**: Integridade referencial
- **Audit Trail**: Timestamps automáticos

### 4. MQTT Broker (Mosquitto)

#### Configuração
- **Porta**: 1883 (não-SSL) / 8883 (SSL)
- **Autenticação**: Usuário/senha obrigatória
- **Persistência**: Mensagens retidas
- **QoS**: Quality of Service configurável
- **ACL**: Controle de acesso por tópico

#### Estrutura de Tópicos
```
ac-control/
├── dispositivos/
│   └── {idEsp32}/
│       ├── status        # Status do dispositivo
│       └── comando       # Comandos para dispositivo
├── climatizadores/
│   └── {id}/
│       ├── status        # Status do climatizador
│       └── comando       # Comandos para climatizador
└── sistema/
    └── status            # Status geral do sistema
```

### 5. Dispositivos ESP32

#### Hardware
- **Microcontrolador**: ESP32-WROOM-32
- **Conectividade**: WiFi 802.11 b/g/n
- **Emissor IR**: LED infravermelho
- **Sensores**: Temperatura/umidade (opcional)
- **Alimentação**: 5V via USB ou fonte externa

#### Software
- **Arduino Framework**: Desenvolvimento em C++
- **Bibliotecas**:
  - `WiFi.h`: Conectividade wireless
  - `PubSubClient.h`: Cliente MQTT
  - `ArduinoJson.h`: Parsing JSON
  - `IRremoteESP8266.h`: Controle IR

#### Funcionalidades
- Conexão WiFi automática
- Cliente MQTT com reconexão
- Controle IR para múltiplos protocolos
- Heartbeat periódico
- OTA updates (futuro)

## Fluxos de Dados

### 1. Fluxo de Comando

```
User Interface → API → MQTT Broker → ESP32 → AC Unit
     ↓              ↓         ↓         ↓        ↓
  [Click]      [Validate]  [Publish] [Receive] [IR Signal]
     ↓              ↓         ↓         ↓        ↓
  [Update]     [Database]  [Persist] [Execute] [Response]
     ↑              ↑         ↑         ↑        ↑
User Interface ← API ← MQTT Broker ← ESP32 ← AC Unit
```

### 2. Fluxo de Status

```
AC Unit → ESP32 → MQTT Broker → API → Database
   ↓        ↓         ↓         ↓        ↓
[Status] [Read]   [Publish] [Subscribe] [Update]
   ↓        ↓         ↓         ↓        ↓
   └────────────────────────────────────┘
                     ↓
              User Interface
                 [Display]
```

### 3. Fluxo de Autenticação

```
User → Frontend → NextAuth → Database → JWT Token
  ↓       ↓          ↓          ↓          ↓
[Login] [Form]   [Validate] [Verify]   [Generate]
  ↓       ↓          ↓          ↓          ↓
  └───────────────────────────────────────┘
                     ↓
              Protected Routes
                 [Access]
```

## Padrões de Comunicação

### 1. REST APIs

- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Autenticação**: JWT Bearer Token
- **Versionamento**: Header-based
- **Rate Limiting**: Por IP e usuário

### 2. MQTT

- **Protocolo**: MQTT v3.1.1
- **QoS Levels**:
  - QoS 0: Fire and forget (heartbeat)
  - QoS 1: At least once (comandos)
  - QoS 2: Exactly once (configurações críticas)
- **Retain**: Status messages
- **Keep Alive**: 30 segundos

### 3. WebSocket (Futuro)

- **Protocolo**: WebSocket over HTTP
- **Uso**: Notificações em tempo real
- **Fallback**: Server-Sent Events

## Segurança

### 1. Autenticação

- **NextAuth.js**: Provedor de credenciais
- **JWT**: Tokens stateless
- **Bcrypt**: Hash de senhas (salt rounds: 12)
- **Session Management**: Expiração automática

### 2. Autorização

- **RBAC**: Role-Based Access Control
- **Middleware**: Proteção de rotas
- **API Guards**: Validação de permissões
- **Principle of Least Privilege**: Acesso mínimo necessário

### 3. Comunicação

- **HTTPS**: Criptografia em trânsito (produção)
- **MQTT SSL/TLS**: Broker seguro
- **CORS**: Cross-Origin Resource Sharing
- **CSP**: Content Security Policy

### 4. Dados

- **Input Validation**: Sanitização de entrada
- **SQL Injection**: Prevenção via ORM
- **XSS**: Escape de output
- **Rate Limiting**: Prevenção de abuso

## Escalabilidade

### 1. Horizontal Scaling

- **Load Balancer**: Nginx/HAProxy
- **Multiple Instances**: PM2/Docker
- **Database Clustering**: PostgreSQL
- **MQTT Clustering**: Mosquitto cluster

### 2. Vertical Scaling

- **Resource Optimization**: CPU/Memory tuning
- **Database Indexing**: Query optimization
- **Caching**: Redis/Memcached
- **CDN**: Static assets

### 3. Microservices (Futuro)

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Auth      │  │   Device    │  │   Command   │
│   Service   │  │   Service   │  │   Service   │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────────┐
              │   API       │
              │   Gateway   │
              └─────────────┘
```

## Monitoramento

### 1. Métricas

- **Application**: Response time, error rate
- **Infrastructure**: CPU, memory, disk
- **Business**: Active devices, commands/hour
- **MQTT**: Message throughput, connection count

### 2. Logging

- **Structured Logging**: JSON format
- **Log Levels**: Error, warn, info, debug
- **Centralized**: ELK Stack/Fluentd
- **Retention**: 30 days default

### 3. Alerting

- **Thresholds**: Configurable limits
- **Channels**: Email, Slack, PagerDuty
- **Escalation**: Multi-level alerts
- **Dashboards**: Grafana/Kibana

## Deployment

### 1. Development

```bash
# Local development
npm run dev          # Next.js dev server
mosquitto           # Local MQTT broker
sqlite              # Local database
```

### 2. Staging

```bash
# Docker Compose
docker-compose up   # All services
nginx              # Reverse proxy
postgresql         # Managed database
```

### 3. Production

```bash
# Kubernetes
kubectl apply -f k8s/  # Orchestration
helm install          # Package management
prometheus            # Monitoring
grafana               # Dashboards
```

## Backup e Recuperação

### 1. Database Backup

- **Automated**: Daily snapshots
- **Retention**: 30 days
- **Encryption**: AES-256
- **Testing**: Monthly restore tests

### 2. Configuration Backup

- **Git Repository**: Version control
- **Secrets Management**: Vault/K8s secrets
- **Infrastructure as Code**: Terraform

### 3. Disaster Recovery

- **RTO**: Recovery Time Objective < 4 hours
- **RPO**: Recovery Point Objective < 1 hour
- **Multi-Region**: Geographic redundancy
- **Runbooks**: Documented procedures

## Roadmap Técnico

### Versão 2.0
- [ ] WebSocket real-time updates
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Machine learning insights

### Versão 3.0
- [ ] Microservices architecture
- [ ] Multi-tenant support
- [ ] Edge computing
- [ ] Blockchain audit trail

## Considerações de Performance

### 1. Frontend

- **Code Splitting**: Lazy loading
- **Image Optimization**: Next.js Image
- **Caching**: Service Worker
- **Bundle Size**: Tree shaking

### 2. Backend

- **Database Optimization**: Query optimization
- **Connection Pooling**: Prisma connection pool
- **Caching**: Redis for frequent queries
- **Async Processing**: Background jobs

### 3. MQTT

- **Message Size**: Minimize payload
- **Topic Structure**: Efficient routing
- **Connection Management**: Persistent connections
- **Broker Tuning**: Memory/CPU optimization

## Troubleshooting

### 1. Common Issues

- **Device Offline**: Network connectivity
- **Command Timeout**: MQTT broker issues
- **Authentication Failure**: Token expiration
- **Database Lock**: Concurrent access

### 2. Debugging Tools

- **Logs**: Structured logging
- **Metrics**: Prometheus/Grafana
- **Tracing**: Jaeger (futuro)
- **Profiling**: Node.js profiler

### 3. Health Checks

- **Application**: `/api/health`
- **Database**: Connection test
- **MQTT**: Broker ping
- **External Services**: Dependency check

