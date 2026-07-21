<p align="center">
  <img src="assets/images/nutrigo-logo.png" alt="Nutrigo Logo" width="200" />
</p>

# 🍎 Nutrigo

Aplicativo mobile de educação nutricional com conteúdo gerado por Inteligência Artificial. O usuário define seus objetivos e temas de interesse durante o onboarding, e o sistema cria automaticamente um plano de estudos personalizado com unidades, lições interativas e desafios — tudo gerado sob demanda via IA (Claude/Anthropic).

> **Projeto de TCC** — Trabalho de Conclusão de Curso

---

## 📋 Índice

- [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Pipeline de Geração com IA](#-pipeline-de-geração-com-ia)
- [Banco de Dados](#-banco-de-dados)
- [API REST](#-api-rest)
- [Funcionalidades](#-funcionalidades)

---

## 🏗 Visão Geral da Arquitetura

```
┌─────────────────────────────┐
│    Mobile App (Expo/RN)     │
│  React Native + TypeScript  │
└─────────────┬───────────────┘
              │ HTTP / REST
              ▼
┌─────────────────────────────┐
│     Backend (Express.js)    │
│  Auth · Rotas · Validação   │
│  Zod · JWT · Swagger/OpenAPI│
└──────┬──────────────┬───────┘
       │              │
       ▼              ▼
┌────────────┐  ┌───────────────────────┐
│ PostgreSQL │  │   Redis + BullMQ      │
│  (Prisma)  │  │  Filas de geração:    │
│            │  │  • generate-unit      │
│            │  │  • generate-lesson    │
│            │  │  • generate-summary   │
└────────────┘  └──────────┬────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   Anthropic (Claude)│
                │  Sonnet 4 / Haiku   │
                │  Geração de conteúdo│
                └─────────────────────┘
```

---

## 🛠 Stack Tecnológica

### Frontend (Mobile)
| Tecnologia | Versão | Uso |
|---|---|---|
| **React Native** | 0.81 | Framework mobile |
| **Expo** | SDK 54 | Toolchain e build |
| **TypeScript** | 5.9 | Tipagem estática |
| **React Navigation** | 7.x | Navegação entre telas |
| **Lucide React Native** | 1.7 | Ícones |
| **AsyncStorage** | 2.2 | Persistência local (token) |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| **Express.js** | 4.18 | Servidor HTTP / API REST |
| **TypeScript** | 5.x | Tipagem estática |
| **Prisma** | 6.x | ORM e migrations |
| **PostgreSQL** | 16 | Banco de dados relacional |
| **Redis** | 7 | Broker de filas |
| **BullMQ** | 5.x | Gerenciamento de filas/workers |
| **Anthropic SDK** | 0.54 | Integração com Claude (IA) |
| **Zod** | 3.22 | Validação de schemas (API + IA) |
| **JWT** | 9.x | Autenticação stateless |
| **Swagger UI** | 5.x | Documentação interativa da API |
| **Pino** | 9.x | Logging estruturado |
| **Docker Compose** | — | Infraestrutura local |

---

## 📁 Estrutura do Projeto

```
nutrigo/
├── App.tsx                    # Entry point + navegação
├── app.json                   # Configuração Expo
├── package.json               # Dependências frontend
├── src/
│   ├── components/            # Componentes reutilizáveis
│   │   ├── AIChat/            #   Chat com IA por unidade
│   │   ├── BottomNav/         #   Barra de navegação inferior
│   │   ├── ChallengeCard/     #   Card de desafio
│   │   ├── FormField/         #   Campo de formulário
│   │   ├── PasswordField/     #   Campo de senha
│   │   ├── PasswordRequirements/
│   │   ├── PasswordStrengthMeter/
│   │   ├── PrimaryButton/     #   Botão primário
│   │   ├── ScreenHeader/      #   Header padrão de tela
│   │   └── Toast/             #   Notificação toast
│   ├── constants/             # Constantes da aplicação
│   ├── contexts/
│   │   └── AuthContext.tsx     # Context de autenticação
│   ├── hooks/
│   │   └── usePasswordValidation.ts
│   ├── mocks/                 # Dados mock para desenvolvimento
│   ├── screens/               # Telas da aplicação
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── ResetPasswordScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LessonScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ChallengesScreen.tsx
│   │   └── StudyGuideScreen.tsx
│   ├── services/api/          # Camada de comunicação com backend
│   │   ├── client.ts          #   Instância Axios/Fetch
│   │   ├── auth.ts
│   │   ├── me.ts
│   │   ├── units.ts
│   │   ├── lessons.ts
│   │   ├── chat.ts
│   │   ├── challenges.ts
│   │   └── studyGuide.ts
│   ├── styles/                # Estilos globais
│   ├── theme.ts               # Tokens de design
│   └── types/                 # Tipos TypeScript compartilhados
│
└── backend/
    ├── package.json           # Dependências backend
    ├── docker-compose.yml     # PostgreSQL + Redis + Migrate
    ├── Dockerfile.migrate     # Container de migração
    ├── tsconfig.json
    ├── prisma/
    │   ├── schema.prisma      # Schema do banco de dados
    │   ├── migrations/        # Migrations versionadas
    │   ├── seed.ts            # Seed de dados (challenges, etc.)
    │   └── seed-test.ts       # Seed para testes
    └── src/
        ├── index.ts           # Bootstrap (DB + Workers + Server)
        ├── server.ts          # Express app + rotas
        ├── openapi.ts         # Spec OpenAPI/Swagger
        ├── config/
        │   ├── db.ts          #   Instância Prisma
        │   └── env.ts         #   Variáveis de ambiente
        ├── middleware/
        │   ├── auth.ts        #   Middleware JWT
        │   ├── validate.ts    #   Validação Zod dos requests
        │   ├── errorHandler.ts#   Error handler global
        │   └── asyncHandler.ts#   Wrapper async para rotas
        ├── modules/
        │   ├── auth/          #   Registro, login, reset de senha
        │   ├── profile/       #   CRUD de perfil
        │   ├── units/         #   Unidades de estudo
        │   ├── lessons/       #   Lições e questões
        │   ├── studyGuide/    #   Material de estudo
        │   ├── chat/          #   Chat com IA contextual
        │   └── challenges/    #   Desafios diários/semanais
        ├── ai/
        │   ├── client.ts      #   Instância Anthropic
        │   ├── aiService.ts   #   Serviço de geração via IA
        │   ├── prompts/       #   System/User prompts
        │   │   ├── lessonGenerator.ts
        │   │   ├── unitSummary.ts
        │   │   └── chat.ts
        │   └── schemas/       #   Schemas Zod para validar output da IA
        └── queue/
            ├── connection.ts  #   Conexão Redis
            ├── queues.ts      #   Definição das filas
            ├── jobs.ts        #   Enfileiramento de jobs
            └── workers.ts     #   Workers BullMQ
```

---

## ⚙ Pré-requisitos

- **Node.js** ≥ 18
- **npm** (incluso com Node.js)
- **Docker** e **Docker Compose** (para PostgreSQL e Redis)
- **Expo CLI** (`npx expo`)
- **Chave de API Anthropic** (para geração de conteúdo via Claude)

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/nutrigo.git
cd nutrigo
```

### 2. Instale as dependências

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Suba a infraestrutura (PostgreSQL + Redis)

```bash
cd backend
docker compose up -d
```

Isso sobe:
- **PostgreSQL 16** na porta `5432`
- **Redis 7** na porta `6379`
- Container de **migração** automática do Prisma

### 4. Configure as variáveis de ambiente

```bash
cd backend
cp .env.example .env
# Edite o .env com sua ANTHROPIC_API_KEY
```

### 5. Execute as migrations e seed

```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run seed
```

### 6. Inicie o backend

```bash
cd backend
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.  
Documentação Swagger: `http://localhost:3000/api/docs`

### 7. Inicie o app mobile

```bash
# Na raiz do projeto
npx expo start
```

Escaneie o QR code com o Expo Go ou pressione `a` para abrir no emulador Android.

> **Nota:** Para acessar o backend a partir de um dispositivo físico, altere o `BASE_URL` em `src/services/api/client.ts` para o IP da máquina na rede local (ex: `http://192.168.x.x:3000`).

---

## 🔐 Variáveis de Ambiente

O backend utiliza as seguintes variáveis (definidas em `backend/.env`):

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://nutrigo:nutrigo@localhost:5432/nutrigo` |
| `REDIS_URL` | Connection string Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Segredo para assinatura de tokens JWT | `change-me-in-production` |
| `ANTHROPIC_API_KEY` | Chave de API da Anthropic (Claude) | `sk-ant-...` |
| `PORT` | Porta do servidor Express | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |

---

## 🤖 Pipeline de Geração com IA

O conteúdo educacional é gerado assincronamente via **BullMQ workers** que se comunicam com a API da **Anthropic (Claude)**:

### Fluxo de geração

```
Onboarding do usuário
       │
       ▼
1. aiService.generateUnitSkeletons()     ← Claude Sonnet 4
   └─ Gera estrutura inicial (seções + unidades)
       │
       ▼
2. Worker: generate-unit                 ← Claude Sonnet 4
   └─ Gera material de estudo completo + 1ª lição com questões
       │
       ▼
3. Worker: generate-lesson               ← Claude Sonnet 4
   └─ Gera lições subsequentes sob demanda (lazy generation)
       │
       ▼
4. Worker: generate-summary              ← Claude Haiku 4.5
   └─ Gera resumo ao completar unidade + enfileira próxima unidade
```

### Mecanismos de qualidade

- **Validação com Zod**: todo output da IA é validado contra schemas tipados
- **Retry com feedback**: se a IA retorna JSON inválido, o sistema reenvia o erro como contexto para autocorreção
- **Shuffle de questões**: algoritmo Fisher-Yates para randomizar a ordem das alternativas, com bias contra a resposta correta ficar na primeira posição
- **Prompt caching**: uso de `cache_control: ephemeral` para otimizar custo em system prompts

### Tipos de questões

| Tipo | Descrição |
|---|---|
| `multiple-choice` | Múltipla escolha com 4 alternativas |
| `image-choice` | Escolha por descrição visual |
| `fill-blank` | Preencher lacuna com chips arrastáveis |

---

## 🗃 Banco de Dados

O schema Prisma define os seguintes modelos principais:

| Modelo | Descrição |
|---|---|
| `User` | Usuário com email e senha (bcrypt) |
| `Profile` | Perfil com objetivos, tópicos, nível, XP e streak |
| `Unit` | Unidade de estudo (seção + número + material didático) |
| `Lesson` | Lição dentro de uma unidade |
| `Question` | Questão com payload JSON tipado |
| `Attempt` | Tentativa de resposta do usuário |
| `ChatThread` / `ChatMessage` | Threads de chat com IA por unidade |
| `ChallengeTemplate` | Template de desafio (diário/semanal) |
| `UserChallengeProgress` | Progresso do usuário em cada desafio |

### Status das unidades e lições

```
skeleton → generating → generated → completed
```

---

## 📡 API REST

Base URL: `/api`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Registro de usuário |
| `POST` | `/auth/login` | Login (retorna JWT) |
| `POST` | `/auth/forgot-password` | Solicitar reset de senha |
| `POST` | `/auth/reset-password` | Resetar senha com token |
| `GET` | `/me` | Dados do perfil autenticado |
| `PUT` | `/me` | Atualizar perfil |
| `POST` | `/me/onboarding` | Onboarding (gera plano de estudos) |
| `GET` | `/units` | Listar unidades do usuário |
| `GET` | `/units/:id` | Detalhes de uma unidade |
| `GET` | `/units/:id/lessons` | Lições de uma unidade |
| `POST` | `/lessons/:id/answer` | Responder questão |
| `POST` | `/lessons/:id/complete` | Completar lição |
| `GET` | `/study-guide` | Material de estudo |
| `POST` | `/chat/:unitId` | Enviar mensagem no chat |
| `GET` | `/chat/:unitId` | Histórico do chat |
| `GET` | `/challenges` | Listar desafios ativos |
| `POST` | `/challenges/:id/claim` | Resgatar recompensa |

Documentação interativa completa: `http://localhost:3000/api/docs`

---

## ✨ Funcionalidades

### 📱 App Mobile
- **Onboarding personalizado** — Definição de objetivos, tópicos de interesse e intensidade de estudo
- **Home com trilha de aprendizado** — Visualização de seções e unidades com progresso
- **Lições interativas** — Questões de múltipla escolha, preenchimento de lacuna e escolha visual
- **Chat com IA contextual** — Assistente por unidade que conhece o material de estudo
- **Guia de estudo** — Material didático gerado por IA para cada unidade
- **Desafios diários e semanais** — Sistema de gamificação com XP e streaks
- **Perfil com progresso** — Nível, XP acumulado, dias de streak
- **Recuperação de senha** — Fluxo completo de forgot/reset password

### ⚡ Backend
- **Geração assíncrona de conteúdo** — BullMQ workers processam geração sem bloquear a API
- **Lazy generation** — Lições são geradas sob demanda conforme o progresso do aluno
- **Pipeline de auto-correção da IA** — Retry com feedback do erro de validação
- **Autenticação JWT** — Stateless, sem dependência de sessão
- **Validação em camadas** — Zod nos requests HTTP e nos outputs da IA
- **Documentação automática** — OpenAPI/Swagger gerada a partir do código

---

## 📄 Licença

Este projeto é parte de um Trabalho de Conclusão de Curso (TCC) e é disponibilizado para fins acadêmicos.
