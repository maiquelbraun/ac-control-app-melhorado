# Protocolo MQTT - AC Control

Este documento descreve a estrutura de tópicos MQTT e o formato das mensagens utilizadas no sistema.

## Estrutura de Tópicos

### Dispositivos de Controle

```
ac-control/dispositivos/{idEsp32}/status
ac-control/dispositivos/{idEsp32}/comando
```

### Climatizadores

```
ac-control/climatizadores/{id}/status
ac-control/climatizadores/{id}/comando
```

### Sistema

```
ac-control/sistema/status
```

## Formato das Mensagens

### Status do Dispositivo

```json
{
  "online": true,
  "temperaturaAtual": 23.5,
  "error": null,
  "ultimaAtualizacao": 1623456789,
  "sensorStatus": {
    "temperatura": "OK",
    "umidade": "OK"
  }
}
```

### Comando para Dispositivo

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

### Status do Climatizador

```json
{
  "ligado": true,
  "temperaturaDesejada": 23,
  "temperaturaAtual": 24.5,
  "modoOperacao": "REFRIGERAR",
  "velocidadeVentilador": "AUTO",
  "error": null,
  "ultimaAtualizacao": 1623456789
}
```

### Status do Sistema

```json
{
  "dispositivosOnline": 5,
  "dispositivosTotal": 8,
  "ultimaAtualizacao": 1623456789,
  "systemStatus": "OK"
}
```

## Códigos de Comando

### Modos de Operação
- `REFRIGERAR`
- `VENTILAR`
- `AUTOMATICO`
- `DESUMIDIFICAR`

### Velocidades do Ventilador
- `BAIXA`
- `MEDIA`
- `ALTA`
- `AUTOMATICO`

### Comandos Básicos
- `LIGAR`
- `DESLIGAR`
- `STATUS`
- `UPDATE`

## Exemplos de Uso

1. Ligar um climatizador:
```json
{
  "comando": "LIGAR",
  "parametros": {
    "temperatura": 23
  }
}
```

2. Alterar modo de operação:
```json
{
  "comando": "MODO_OPERACAO",
  "parametros": {
    "modo": "REFRIGERAR"
  }
}
```

3. Ajustar velocidade:
```json
{
  "comando": "VELOCIDADE",
  "parametros": {
    "velocidade": "AUTO"
  }
}
```

## QoS e Retenção

- Status: QoS 1, Retain = true
- Comandos: QoS 1, Retain = false
- Sistema: QoS 1, Retain = true

## Segurança

1. Autenticação:
   - Usuário e senha configuráveis
   - SSL/TLS opcional

2. Tópicos:
   - Publicação restrita por dispositivo
   - Subscrição controlada por ACL

3. Recomendações:
   - Usar SSL em produção
   - Alterar credenciais padrão
   - Implementar ACLs
   - Monitorar tentativas de acesso

## Tratamento de Erros

1. Dispositivo Offline:
   - Último status mantido com retain
   - Timeout após 5 minutos sem atualização

2. Erros de Comando:
   - Resposta no tópico de status
   - Código de erro específico
   - Mensagem descritiva

3. Reconexão:
   - Tentativas automáticas
   - Backoff exponencial
   - Máximo de 5 tentativas

## Debug

1. Monitor MQTT:
```bash
mosquitto_sub -v -t "ac-control/#"
```

2. Publicar teste:
```bash
mosquitto_pub -t "ac-control/test" -m "test"
```

3. Verificar retenção:
```bash
mosquitto_sub -t "ac-control/+/+/status" -v -R