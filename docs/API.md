# Documentação da API - AC Control App

## Visão Geral

A API do AC Control App fornece endpoints RESTful para gerenciar climatizadores, dispositivos de controle, salas e blocos. Todas as rotas requerem autenticação via NextAuth.js e implementam controle de acesso baseado em roles.

## Autenticação

### Base URL
```
http://localhost:3000/api
```

### Autenticação
A API utiliza NextAuth.js com estratégia de JWT. Todas as requisições devem incluir um token de sessão válido.

### Roles de Usuário
- **ADMIN**: Acesso completo a todas as funcionalidades
- **OPERADOR**: Pode gerenciar climatizadores, salas e blocos
- **VISUALIZADOR**: Apenas leitura dos dados

## Endpoints

### Autenticação

#### POST /api/auth/register
Registra um novo usuário no sistema.

**Permissões**: Público (para primeiro usuário) ou ADMIN

**Request Body**:
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "OPERADOR"
}
```

**Response (201)**:
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "OPERADOR",
    "active": true,
    "createdAt": "2023-06-13T10:00:00.000Z"
  }
}
```

**Errors**:
- `400`: Email e senha são obrigatórios
- `409`: Usuário já existe
- `500`: Erro interno do servidor

### Blocos

#### GET /api/blocos
Lista todos os blocos.

**Permissões**: OPERADOR, ADMIN

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "nome": "Bloco A",
    "salas": [
      {
        "id": "uuid",
        "nome": "Sala 101",
        "climatizadores": []
      }
    ]
  }
]
```

#### POST /api/blocos
Cria um novo bloco.

**Permissões**: OPERADOR, ADMIN

**Request Body**:
```json
{
  "nome": "Bloco B"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "nome": "Bloco B",
  "salas": []
}
```

#### GET /api/blocos/[id]
Obtém um bloco específico.

**Permissões**: OPERADOR, ADMIN

**Response (200)**:
```json
{
  "id": "uuid",
  "nome": "Bloco A",
  "salas": [
    {
      "id": "uuid",
      "nome": "Sala 101",
      "climatizadores": [
        {
          "id": "uuid",
          "nome": "AC Sala 101",
          "ligado": false,
          "temperaturaDesejada": 23
        }
      ]
    }
  ]
}
```

#### PUT /api/blocos/[id]
Atualiza um bloco.

**Permissões**: OPERADOR, ADMIN

**Request Body**:
```json
{
  "nome": "Bloco A - Atualizado"
}
```

#### DELETE /api/blocos/[id]
Remove um bloco.

**Permissões**: ADMIN

**Response (204)**: Sem conteúdo

### Salas

#### GET /api/salas
Lista todas as salas.

**Permissões**: OPERADOR, ADMIN

**Query Parameters**:
- `blocoId` (opcional): Filtrar por bloco

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "nome": "Sala 101",
    "blocoId": "uuid",
    "bloco": {
      "id": "uuid",
      "nome": "Bloco A"
    },
    "climatizadores": []
  }
]
```

#### POST /api/salas
Cria uma nova sala.

**Permissões**: OPERADOR, ADMIN

**Request Body**:
```json
{
  "nome": "Sala 102",
  "blocoId": "uuid"
}
```

#### GET /api/salas/[id]
Obtém uma sala específica.

**Permissões**: OPERADOR, ADMIN

#### PUT /api/salas/[id]
Atualiza uma sala.

**Permissões**: OPERADOR, ADMIN

#### DELETE /api/salas/[id]
Remove uma sala.

**Permissões**: ADMIN

### Climatizadores

#### GET /api/climatizadores
Lista todos os climatizadores.

**Permissões**: VISUALIZADOR, OPERADOR, ADMIN

**Query Parameters**:
- `salaId` (opcional): Filtrar por sala
- `ligado` (opcional): Filtrar por status (true/false)

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "nome": "AC Sala 101",
    "marca": "LG",
    "modelo": "Dual Inverter",
    "ligado": false,
    "temperaturaDesejada": 23,
    "temperaturaAtual": 25.5,
    "umidadeAtual": 60,
    "modoOperacao": "REFRIGERAR",
    "velocidadeVentilador": "AUTO",
    "statusOperacional": "OK",
    "ultimaAtualizacao": "2023-06-13T10:00:00.000Z",
    "sala": {
      "id": "uuid",
      "nome": "Sala 101",
      "bloco": {
        "id": "uuid",
        "nome": "Bloco A"
      }
    },
    "dispositivoControleId": "esp32-001"
  }
]
```

#### POST /api/climatizadores
Cria um novo climatizador.

**Permissões**: OPERADOR, ADMIN

**Request Body**:
```json
{
  "nome": "AC Sala 102",
  "marca": "Samsung",
  "modelo": "Wind Free",
  "salaId": "uuid",
  "dispositivoControleId": "esp32-002"
}
```

#### GET /api/climatizadores/[id]
Obtém um climatizador específico.

**Permissões**: VISUALIZADOR, OPERADOR, ADMIN

#### PUT /api/climatizadores/[id]
Atualiza um climatizador.

**Permissões**: OPERADOR, ADMIN

#### DELETE /api/climatizadores/[id]
Remove um climatizador.

**Permissões**: ADMIN

#### POST /api/climatizadores/[id]/comando
Envia comando para um climatizador.

**Permissões**: OPERADOR, ADMIN

**Request Body**:
```json
{
  "comando": "LIGAR"
}
```

**Comandos Disponíveis**:
- `LIGAR`: Liga o climatizador
- `DESLIGAR`: Desliga o climatizador
- `TEMPERATURA`: Ajusta temperatura (requer `valor`)
- `MODO_OPERACAO`: Altera modo (requer `valor`: REFRIGERAR, VENTILAR, AUTOMATICO, DESUMIDIFICAR)
- `VELOCIDADE`: Altera velocidade (requer `valor`: BAIXA, MEDIA, ALTA, AUTOMATICO)

**Exemplo com valor**:
```json
{
  "comando": "TEMPERATURA",
  "valor": 22
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome": "AC Sala 101",
    "ligado": true,
    "temperaturaDesejada": 22,
    "ultimaAtualizacao": "2023-06-13T10:05:00.000Z"
  },
  "executionTime": 150
}
```

### Dispositivos de Controle

#### GET /api/dispositivos-controle
Lista todos os dispositivos de controle.

**Permissões**: ADMIN

**Response (200)**:
```json
[
  {
    "idEsp32": "esp32-001",
    "modeloEsp32": "ESP32-WROOM-32",
    "online": true,
    "ultimaConexao": "2023-06-13T10:00:00.000Z",
    "ultimoPing": "2023-06-13T10:05:00.000Z",
    "versaoFirmware": "1.2.3",
    "climatizador": {
      "id": "uuid",
      "nome": "AC Sala 101"
    }
  }
]
```

#### POST /api/dispositivos-controle
Registra um novo dispositivo de controle.

**Permissões**: ADMIN

**Request Body**:
```json
{
  "idEsp32": "esp32-003",
  "modeloEsp32": "ESP32-WROOM-32",
  "versaoFirmware": "1.2.3"
}
```

#### GET /api/dispositivos-controle/[id]
Obtém um dispositivo específico.

**Permissões**: ADMIN

#### PUT /api/dispositivos-controle/[id]
Atualiza um dispositivo.

**Permissões**: ADMIN

#### DELETE /api/dispositivos-controle/[id]
Remove um dispositivo.

**Permissões**: ADMIN

#### GET /api/dispositivos-controle/status
Obtém status de todos os dispositivos.

**Permissões**: ADMIN

**Response (200)**:
```json
{
  "total": 5,
  "online": 3,
  "offline": 2,
  "dispositivos": [
    {
      "idEsp32": "esp32-001",
      "online": true,
      "ultimoPing": "2023-06-13T10:05:00.000Z"
    }
  ]
}
```

### Dashboard

#### GET /api/dashboard
Obtém dados do dashboard.

**Permissões**: VISUALIZADOR, OPERADOR, ADMIN

**Response (200)**:
```json
{
  "resumo": {
    "totalClimatizadores": 10,
    "climatizadoresLigados": 6,
    "dispositivosOnline": 8,
    "totalDispositivos": 10
  },
  "climatizadoresPorStatus": {
    "ligados": 6,
    "desligados": 4
  },
  "dispositivosPorStatus": {
    "online": 8,
    "offline": 2
  },
  "temperaturaMedia": 23.5,
  "ultimaAtualizacao": "2023-06-13T10:05:00.000Z"
}
```

### Configurações

#### GET /api/settings
Obtém configurações do sistema.

**Permissões**: ADMIN

**Response (200)**:
```json
{
  "id": 1,
  "notificationsEnabled": true,
  "temperatureRangeMin": 16,
  "temperatureRangeMax": 30,
  "maintenanceInterval": 30,
  "mqttBroker": "mqtt://localhost",
  "mqttPort": "1883",
  "mqttUsername": "admin",
  "mqttPassword": "***",
  "updatedAt": "2023-06-13T10:00:00.000Z"
}
```

#### PUT /api/settings
Atualiza configurações do sistema.

**Permissões**: ADMIN

**Request Body**:
```json
{
  "notificationsEnabled": true,
  "temperatureRangeMin": 18,
  "temperatureRangeMax": 28,
  "maintenanceInterval": 45
}
```

## Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `204`: Sem conteúdo (para DELETE)
- `400`: Requisição inválida
- `401`: Não autorizado (não autenticado)
- `403`: Acesso negado (sem permissão)
- `404`: Recurso não encontrado
- `409`: Conflito (recurso já existe)
- `500`: Erro interno do servidor
- `503`: Serviço indisponível (dispositivo offline)

## Tratamento de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "error": "Mensagem de erro",
  "details": "Detalhes adicionais (opcional)"
}
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:
- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

## Versionamento

A API atual é a versão 1.0. Futuras versões serão versionadas via header:
```
Accept: application/vnd.ac-control.v1+json
```

## Websockets (Futuro)

Planejado para v2.0:
- Notificações em tempo real de mudanças de status
- Atualizações automáticas do dashboard
- Alertas de dispositivos offline

