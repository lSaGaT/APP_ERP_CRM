# ERP/CRM - Sistema de Gestão para Salões

## 📋 Visão Geral

Sistema ERP/CRM completo desenvolvido para gerenciamento de salões de beleza e negócios similares, integrando agenda, CRM, financeiro e automação com inteligência artificial.

---

## 🎯 Funcionalidades Principais

### 1. **Dashboard**
- Visão geral das métricas do negócio
- Estatísticas em tempo real
- Indicadores-chave de desempenho (KPIs)
- Acessível para: Admin e Atendente

### 2. **Agenda Inteligente**
- **Calendário mensal visual** com grade interativa
- Navegação entre meses (janeiro, fevereiro, etc.)
- Indicadores visuais nos dias com agendamentos
- Destaque para dia atual e dia selecionado
- Lista de agendamentos do dia com:
  - Horário de início e fim
  - Nome e telefone do cliente
  - Serviço realizado
  - Profissional responsável
  - Status do agendamento (pendente/confirmado/cancelado)
  - Status de pagamento (pendente/pago)
  - Valor do serviço
- **Fluxo completo de agendamento manual:**
  - Busca de cliente por telefone
  - Cadastro rápido de novo cliente
  - Seleção de serviço e profissional
  - Escolha de data e horário
- Acessível para: Admin e Atendente

### 3. **CRM Kanban - Gestão de Leads**
- **Filtragem automática:** Mostra apenas leads do dia (baseado em `ultima_msg`)
- **4 colunas de status (geridas pelo agente IA):**
  - 📌 **Novos Leads** (`status_novo`)
  - 📞 **Em Atendimento** (`status_atendimento`)
  - ✅ **Agendamento Marcado** (`status_marcado`)
  - ❓ **Em Dúvida** (`status_duvida`)
- **Cards de clientes com:**
  - Nome e contato
  - Telefone (link direto para WhatsApp)
  - E-mail
  - Data de cadastro
  - Status de FollowUp
  - **Controle de trava da conversa IA** 🔒
- **Drag & Drop:** Mova leads entre colunas manualmente
- **Sistema de Trava:**
  - Bloqueia respostas automáticas do agente IA
  - Clique no cadeado para travar (`true`) / destravar (`false`)
  - Visual diferenciado quando travado (coral/rosa)
  - Quando travado, apenas humanos podem responder
  - Fluxo n8n verifica essa flag antes de responder
- Acessível para: Admin e Atendente

### 4. **Financeiro**
- Controle de receitas e despesas
- Integração com Asaas para pagamentos
- View com dados financeiros dos agendamentos
- Acessível para: **Admin apenas**

### 5. **Configurações (Admin)**
- **Gestão de Serviços:**
  - Cadastro de serviços
  - Preços e durações
  - Tempos de aplicação, espera e finalização
- **Gestão de Funcionários:**
  - Cadastro de profissionais
  - Definição de especialidades
  - Cores para identificação na agenda
  - Controle de disponibilidade para encaixes
- **Jornada de Trabalho:**
  - Configuração de horários por dia da semana
  - Controle de disponibilidade de cada funcionário
- **Bloqueios de Agenda:**
  - Bloqueio de períodos específicos
  - Bloqueios recorrentes
  - Bloqueios por funcionário ou geral
- Acessível para: **Admin apenas**

---

## 🔐 Sistema de Autenticação e Permissões

### Roles de Usuário

#### **Admin**
- Acesso total ao sistema
- Pode visualizar: Dashboard, Agenda, CRM Kanban, Financeiro, Configurações
- Pode gerenciar: Serviços, Funcionários, Jornadas, Bloqueios

#### **Atendente**
- Acesso restrito às operações diárias
- Pode visualizar: Dashboard, Agenda, CRM Kanban
- **NÃO** tem acesso a: Financeiro, Configurações

### Segurança
- Autenticação via Supabase Auth
- Proteção de rotas baseada em roles
- Row Level Security (RLS) no Supabase
- Políticas de acesso granulares

---

## 🤖 Integração com Inteligência Artificial

### Agente IA de WhatsApp
- **Status automáticos:** O agente IA classifica leads automaticamente
- **Coluna `status`:** Controla o estágio do lead no funil
- **Coluna `ultima_msg`:** Timestamp da última mensagem (usado para filtrar leads do dia)
- **Coluna `trava`:**
  - `false`: Agente IA responde normalmente
  - `true`: Apenas humanos respondem (IA bloqueada)
- **Integração n8n:** Fluxos automatizados verificam a trava antes de responder

### Status de FollowUp
- `followUp_0`: Sem follow-up necessário
- `followUp_1`: Follow-up em andamento
- `followUp_2`: Follow-up concluído

---

## 📱 Integrações

### WhatsApp
- Links diretos nos cards do Kanban
- Formato: `https://wa.me/NUMERO`
- Abre conversa diretamente com o cliente

### Asaas
- Integração para pagamentos
- Columna `Id_asaas` para vincular clientes
- Controle de status de pagamento

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### **Clientes**
- Dados completos do cliente
- Status de lead (automático via IA)
- Trava de conversa IA
- Histórico de interações

#### **Agendamentos**
- Vinculação com cliente, serviço e funcionário
- Controle de horários e status
- Valores e pagamentos

#### **Serviços**
- Catálogo de serviços oferecidos
- Preços e tempos de execução

#### **Funcionários**
- Equipe disponível
- Cores para agenda
- Jornadas de trabalho

#### **Jornadas de Trabalho**
- Horários disponíveis por dia
- Vinculada a funcionários

#### **Bloqueios de Agenda**
- Períodos indisponíveis
- Recorrência configurável

---

## 🎨 Interface e Usabilidade

### Design Moderno
- Interface limpa e intuitiva
- Cores por status para fácil identificação
- Animações suaves
- Totalmente responsivo (mobile, tablet, desktop)

### Acessibilidade
- Fontes legíveis
- Contraste adequado
- Ícones descritivos
- Navegação por teclado

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React + TypeScript
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion
- **Drag & Drop:** DnD Kit
- **Banco de Dados:** PostgreSQL (via Supabase)
- **Autenticação:** Supabase Auth
- **Automação:** n8n + IA

---

## 📊 Funcionalidades em Destaque

✅ **Agenda Visual** - Calendário mensal interativo
✅ **CRM Kanban** - Gestão visual de leads
✅ **Controle de IA** - Trava/destrava conversa automaticamente
✅ **WhatsApp Integrado** - Links diretos nos contatos
✅ **Gestão de Equipe** - Jornadas e disponibilidade
✅ **Financeiro Completo** - Controle de receitas
✅ **Permissões por Role** - Admin vs Atendente
✅ **Filtro Inteligente** - Leads do dia apenas
✅ **Drag & Drop** - Move cards facilmente
✅ **Indicadores Visuais** - Dias com agendamentos

---

## 🎯 Benefícios

- **Organização:** Tudo centralizado em um único sistema
- **Eficiência:** Automação via IA reduz trabalho manual
- **Controle:** Acompanhe cada lead e agendamento
- **Flexibilidade:** Trave conversas quando necessário
- **Integração:** WhatsApp, Asaas e n8n conectados
- **Segurança:** Permissões granulares por usuário
- **Escalabilidade:** Sistema preparado para crescer

---

**Desenvolvido para transformar a gestão do seu salão!** 💈✨
