<div align="center">
  <h1>ERP/CRM para Salões e Clínicas</h1>
  <p>Sistema completo de gestão empresarial desenvolvido pela <strong>NodoPrime</strong></p>
</div>

---

## Sobre o Sistema

Este é um sistema **ERP/CRM completo** desenvolvido especificamente para **salões de beleza e clínicas**. Ele oferece todas as ferramentas necessárias para gerenciar agendamentos, clientes, funcionários, serviços e finances em uma única plataforma moderna e intuitiva.

### Principais Funcionalidades

#### Dashboard Gerencial
- Métricas em tempo real do negócio
- Acompanhamento de agendamentos diários
- Monitoramento de faturamento
- Visualização de novos leads
- Taxa de cancelamentos
- Gráfico de fluxo de receita semanal

#### Agenda Inteligente
- Visualização diária de agendamentos
- Status dos atendimentos (Pendente, Confirmado, Cancelado)
- Controle de status de pagamento
- Suporte a múltiplas formas de pagamento (Dinheiro, Cartão, PIX)
- Atribuição de funcionários
- Filtros e busca avançada

#### CRM com Kanban
- Board interativo Drag & Drop
- Gerenciamento de leads em 4 estágios:
  - Novos Leads
  - Em Atendimento
  - Concluídos
  - Perdidos
- Sistema de follow-up automático
- Gestão completa de informações do cliente

#### Financeiro
- Acompanhamento de receitas
- Gráficos de desempenho mensal
- Cálculo de ticket médio
- Visualização de valores pendentes x recebidos
- Indicadores de crescimento
- Exportação de relatórios

#### Painel Administrativo
- Gestão de usuários e permissões
- Catálogo de serviços
- Gerenciamento de funcionários
- Configuração de jornada de trabalho
- Bloqueio de agenda (feriados, folgas)

---

## Stack Tecnológica

| Tecnologia | Descrição |
|------------|-----------|
| **React 19** | Framework frontend com TypeScript |
| **Vite** | Build tool para desenvolvimento rápido |
| **Tailwind CSS** | Framework de estilização |
| **Supabase** | Banco de dados PostgreSQL + Real-time |
| **React Router** | Sistema de rotas |
| **Recharts** | Gráficos e visualizações |
| **DnD Kit** | Drag & Drop para Kanban |
| **Lucide Icons** | Ícones da interface |

---

## Instalação e Configuração

### Pré-requisitos

- Node.js instalado
- Uma conta no [Supabase](https://supabase.com)

### Passo 1: Instalar Dependências

```bash
npm install
```

### Passo 2: Configurar o Supabase (IMPORTANTE)

Este sistema utiliza o Supabase como backend. Você precisa configurar suas próprias credenciais:

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. No painel do seu projeto, acesse:
   - **Settings** > **API** para obter suas credenciais
   - Copie o **Project URL** e o **anon public key**

4. No arquivo `.env`, configure as variáveis de ambiente:

```env
VITE_SUPABASE_URL=sua-url-do-projeto-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

5. Execute o script SQL de criação das tabelas no SQL Editor do Supabase (consulte o arquivo `database.sql` se disponível)

### Passo 3: Executar o Projeto Localmente

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## Deploy na Vercel

### Passo 1: Preparar o Projeto

Certifique-se de que o arquivo `.env` contém as variáveis do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Passo 2: Fazer Deploy via Vercel CLI

1. Instale a Vercel CLI (se ainda não tiver):
```bash
npm install -g vercel
```

2. Faça login na Vercel:
```bash
vercel login
```

3. Execute o deploy:
```bash
vercel
```

Siga as instruções no terminal. O Vercel detectará automaticamente que é um projeto Vite + React.

### Passo 3: Configurar Variáveis de Ambiente na Vercel

Após o deploy, você precisa configurar as variáveis de ambiente:

1. Acesse o dashboard da Vercel: [vercel.com](https://vercel.com)
2. Vá para o seu projeto
3. Clique em **Settings** > **Environment Variables**
4. Adicione as variáveis:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | Sua URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sua chave anônima do Supabase |

5. Clique em **Save** e depois em **Redeploy** para aplicar as mudanças

### Passo 4: Deploy via GitHub (Alternativa Recomendada)

Para deploys automáticos a cada commit:

1. Faça push do seu projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente na seção **Environment Variables**
5. Clique em **Deploy**

A partir de agora, cada push para a branch principal fará um novo deploy automaticamente.

### Passo 5: Configurar o Supabase para Produção

Importante: Configure as **CORS settings** no Supabase para permitir acesso dom seu domínio Vercel:

1. No painel do Supabase, vá em **Settings** > **API**
2. Em **CORS allowed origins**, adicione seu domínio da Vercel
3. Clique em **Save**

---

## Estrutura do Banco de Dados

O sistema utiliza as seguintes entidades principais:

| Tabela | Descrição |
|--------|-----------|
| **profiles** | Usuários do sistema e controle de acesso |
| **clientes** | Dados dos clientes e leads |
| **funcionarios** | Profissionais e suas especialidades |
| **servicos** | Catálogo de serviços e preços |
| **agendamentos** | Todos os agendamentos e seus status |
| **jornada_trabalho** | Horários de trabalho dos funcionários |
| **bloqueio_agenda** | Bloqueios de agenda (feriados, folgas) |

---

## Controle de Acesso

O sistema possui dois níveis de permissão:

- **Admin**: Acesso completo ao sistema, incluindo configurações
- **Atendente**: Acesso limitado às funcionalidades operacionais

---

## Desenvolvido pela NodoPrime

Este sistema foi desenvolvido pela **NodoPrime**, empresa especializada em soluções digitais de alta qualidade.

### Conheça a NodoPrime

- **Site**: [https://nodoprime.com.br](https://nodoprime.com.br)
- **YouTube**: [https://www.youtube.com/@Nodo-Prime](https://www.youtube.com/@Nodo-Prime)
- **Portfolio**: [https://portfolio-six-flax-45.vercel.app](https://portfolio-six-flax-45.vercel.app)

### Sobre o Desenvolvedor

Lucas - Desenvolvedor Full Stack especializado em React, TypeScript e soluções web modernas.

---

## Licença

Este projeto é propriedade da NodoPrime. Todos os direitos reservados.

---

## Suporte

Para dúvidas e suporte, entre em contato através dos canais da NodoPrime.

<div align="center">
  <p>Desenvolvido com ❤️ pela NodoPrime</p>
</div>
