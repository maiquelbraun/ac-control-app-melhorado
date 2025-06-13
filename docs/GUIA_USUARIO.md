# Guia do Usuário - AC Control App

## Introdução

O AC Control App é um sistema completo para controle e monitoramento de climatizadores (ar condicionado) via interface web. O sistema permite gerenciar múltiplos equipamentos organizados por blocos e salas, com controle remoto via dispositivos ESP32.

## Primeiros Passos

### Acesso ao Sistema

1. Abra seu navegador e acesse: `http://localhost:3000`
2. Faça login com suas credenciais
3. Você será direcionado para a página inicial

### Tipos de Usuário

O sistema possui três tipos de usuário com diferentes permissões:

- **Visualizador**: Pode apenas visualizar dados e status dos equipamentos
- **Operador**: Pode controlar climatizadores e gerenciar salas/blocos
- **Administrador**: Acesso completo, incluindo gerenciamento de usuários e dispositivos

## Navegação Principal

### Menu Principal

O menu lateral contém as seguintes opções:

- **Dashboard**: Visão geral do sistema
- **Gerenciamento**: Acesso às funcionalidades de gestão
  - Blocos
  - Salas
  - Climatizadores
  - Dispositivos (apenas Admin)
- **Configurações**: Configurações do sistema (apenas Admin)

### Dashboard

O dashboard apresenta:

- **Resumo Geral**: Total de climatizadores, quantos estão ligados, status dos dispositivos
- **Gráficos**: Distribuição por status, temperatura média
- **Alertas**: Dispositivos offline ou que requerem atenção
- **Última Atualização**: Timestamp da última sincronização

## Gerenciamento de Blocos

### Visualizar Blocos

1. Acesse **Gerenciamento → Blocos**
2. Visualize a lista de todos os blocos cadastrados
3. Cada bloco mostra:
   - Nome do bloco
   - Número de salas
   - Número de climatizadores
   - Ações disponíveis

### Criar Novo Bloco

1. Clique em **"Adicionar Bloco"**
2. Preencha o nome do bloco
3. Clique em **"Salvar"**

### Editar Bloco

1. Clique no ícone de edição (lápis) ao lado do bloco
2. Modifique o nome
3. Clique em **"Salvar"**

### Excluir Bloco

1. Clique no ícone de exclusão (lixeira)
2. Confirme a exclusão
3. **Atenção**: Só é possível excluir blocos vazios (sem salas)

## Gerenciamento de Salas

### Visualizar Salas

1. Acesse **Gerenciamento → Salas**
2. Use o filtro por bloco se necessário
3. Visualize informações de cada sala:
   - Nome da sala
   - Bloco ao qual pertence
   - Número de climatizadores
   - Status dos equipamentos

### Criar Nova Sala

1. Clique em **"Adicionar Sala"**
2. Preencha:
   - Nome da sala
   - Selecione o bloco
3. Clique em **"Salvar"**

### Editar Sala

1. Clique no ícone de edição
2. Modifique os dados necessários
3. Clique em **"Salvar"**

### Excluir Sala

1. Clique no ícone de exclusão
2. Confirme a exclusão
3. **Atenção**: Só é possível excluir salas vazias (sem climatizadores)

## Gerenciamento de Climatizadores

### Visualizar Climatizadores

1. Acesse **Gerenciamento → Climatizadores**
2. Use filtros disponíveis:
   - Por sala
   - Por status (ligado/desligado)
   - Por bloco
3. Cada climatizador mostra:
   - Nome e localização
   - Status atual (ligado/desligado)
   - Temperatura desejada e atual
   - Modo de operação
   - Status do dispositivo de controle

### Adicionar Climatizador

1. Clique em **"Adicionar Climatizador"**
2. Preencha os dados:
   - Nome do climatizador
   - Marca e modelo (opcional)
   - Sala onde está localizado
   - Dispositivo de controle (ESP32)
3. Clique em **"Salvar"**

### Controlar Climatizador

#### Ligar/Desligar

1. Clique no botão de **Power** (⚡) do climatizador
2. O status será atualizado automaticamente
3. Aguarde a confirmação do dispositivo

#### Ajustar Temperatura

1. Clique no ícone de **temperatura** (🌡️)
2. Use os controles + e - ou digite a temperatura
3. Faixa permitida: 16°C a 30°C
4. Clique em **"Aplicar"**

#### Alterar Modo de Operação

1. Clique no ícone de **modo** (❄️)
2. Selecione o modo desejado:
   - **Refrigerar**: Modo de refrigeração
   - **Ventilar**: Apenas ventilação
   - **Automático**: Controle automático
   - **Desumidificar**: Redução de umidade
3. Clique em **"Aplicar"**

#### Ajustar Velocidade do Ventilador

1. Clique no ícone de **ventilador** (🌀)
2. Selecione a velocidade:
   - **Baixa**: Velocidade mínima
   - **Média**: Velocidade intermediária
   - **Alta**: Velocidade máxima
   - **Automático**: Controle automático
3. Clique em **"Aplicar"**

### Editar Climatizador

1. Clique no ícone de edição
2. Modifique os dados necessários
3. **Nota**: Não é possível alterar o dispositivo de controle após criação
4. Clique em **"Salvar"**

### Excluir Climatizador

1. Clique no ícone de exclusão
2. Confirme a exclusão
3. O dispositivo de controle ficará disponível para outros climatizadores

## Controle Individual

### Página de Controle

1. Clique em **"Controlar"** em qualquer climatizador
2. Você será direcionado para a página de controle individual
3. Esta página oferece:
   - Controles grandes e intuitivos
   - Status em tempo real
   - Histórico de comandos
   - Informações detalhadas do dispositivo

### Controles Disponíveis

- **Power**: Liga/desliga o equipamento
- **Temperatura**: Ajuste fino com controles precisos
- **Modo**: Seleção visual dos modos de operação
- **Velocidade**: Controle da velocidade do ventilador
- **Timer**: Programação de horários (se suportado)

### Informações Exibidas

- **Status Atual**: Ligado/desligado, modo, temperatura
- **Temperatura Ambiente**: Leitura do sensor (se disponível)
- **Umidade**: Percentual de umidade (se disponível)
- **Última Atualização**: Timestamp da última comunicação
- **Status do Dispositivo**: Online/offline, versão do firmware

## Gerenciamento de Dispositivos (Admin)

### Visualizar Dispositivos

1. Acesse **Gerenciamento → Dispositivos**
2. Visualize todos os dispositivos ESP32:
   - ID do dispositivo
   - Modelo
   - Status (online/offline)
   - Última conexão
   - Versão do firmware
   - Climatizador associado

### Adicionar Dispositivo

1. Clique em **"Adicionar Dispositivo"**
2. Preencha:
   - ID do ESP32 (MAC address)
   - Modelo do ESP32
   - Versão do firmware
3. Clique em **"Salvar"**

### Monitorar Status

- **Indicador Verde**: Dispositivo online
- **Indicador Vermelho**: Dispositivo offline
- **Último Ping**: Timestamp da última comunicação
- **Alertas**: Dispositivos que não respondem há mais de 5 minutos

### Diagnóstico

1. Acesse **Diagnose → Dispositivos**
2. Execute testes de conectividade
3. Visualize logs de comunicação
4. Identifique problemas de rede ou firmware

## Configurações do Sistema (Admin)

### Configurações Gerais

1. Acesse **Configurações**
2. Ajuste parâmetros:
   - **Notificações**: Ativar/desativar alertas
   - **Faixa de Temperatura**: Limites mínimo e máximo
   - **Intervalo de Manutenção**: Dias entre manutenções
   - **Configurações MQTT**: Broker, porta, credenciais

### Configurações MQTT

- **Broker**: Endereço do servidor MQTT
- **Porta**: Porta de conexão (1883 padrão, 8883 para SSL)
- **Usuário/Senha**: Credenciais de autenticação
- **SSL**: Ativar conexão segura

### Backup e Restauração

- **Exportar Dados**: Download de backup do banco de dados
- **Importar Dados**: Restauração a partir de backup
- **Logs do Sistema**: Visualização de logs de atividade

## Notificações e Alertas

### Tipos de Alertas

- **Dispositivo Offline**: ESP32 não responde
- **Falha de Comando**: Comando não executado
- **Manutenção Pendente**: Equipamento requer manutenção
- **Temperatura Anormal**: Leituras fora do padrão

### Configurar Notificações

1. Acesse **Configurações → Notificações**
2. Ative/desative tipos de alerta
3. Configure métodos de notificação:
   - Notificações no navegador
   - Email (se configurado)
   - Dashboard

## Relatórios e Histórico

### Relatório de Uso

- Tempo de funcionamento por equipamento
- Consumo estimado de energia
- Padrões de uso por período
- Eficiência energética

### Histórico de Comandos

- Log de todos os comandos enviados
- Timestamp e usuário responsável
- Status de execução
- Tempo de resposta

### Relatório de Manutenção

- Histórico de manutenções realizadas
- Próximas manutenções programadas
- Alertas de manutenção preventiva

## Dicas e Boas Práticas

### Organização

1. **Nomeação Consistente**: Use padrões claros para nomes de blocos, salas e equipamentos
2. **Agrupamento Lógico**: Organize por localização física real
3. **Documentação**: Mantenha informações de marca/modelo atualizadas

### Operação

1. **Verificação Regular**: Monitore o dashboard diariamente
2. **Manutenção Preventiva**: Siga os intervalos recomendados
3. **Backup**: Realize backups regulares (Admin)

### Troubleshooting

1. **Dispositivo Offline**: 
   - Verifique conexão WiFi
   - Reinicie o ESP32
   - Verifique configurações MQTT

2. **Comando Não Executa**:
   - Confirme se o dispositivo está online
   - Verifique se o climatizador está respondendo
   - Teste comunicação IR

3. **Interface Lenta**:
   - Atualize a página
   - Verifique conexão de internet
   - Limpe cache do navegador

## Suporte Técnico

### Informações para Suporte

Ao entrar em contato com o suporte, tenha em mãos:
- Versão do sistema
- Tipo de usuário
- Descrição detalhada do problema
- Logs de erro (se disponíveis)
- Modelo dos dispositivos ESP32

### Contatos

- **Email**: suporte@exemplo.com
- **Documentação**: Pasta `/docs` do projeto
- **Issues**: GitHub do projeto

## Atualizações

O sistema é atualizado regularmente com:
- Correções de bugs
- Novos recursos
- Melhorias de segurança
- Otimizações de performance

Atualizações são aplicadas automaticamente pelo administrador do sistema.

