# Império RPG Auto

Um RPG de batalha automática (idle RPG) completo construído com HTML/CSS/JavaScript puro, Netlify Functions e Netlify Database. Inspirado em Mu Online, o jogo permite que jogadores criem personagens, evoluam automaticamente, coletem itens, participem de guildas e compitam no ranking.

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript puro (sem frameworks)
- **Backend**: Netlify Functions (TypeScript/ESM)
- **Banco de Dados**: Netlify Database (PostgreSQL) com Drizzle ORM
- **Deploy**: Netlify

## Funcionalidades

- Sistema de contas (registro, login, logout)
- 3 classes: Guerreiro, Mago, Arqueiro
- Batalha automática a cada 3 segundos
- 6 mapas com dificuldade crescente
- Sistema de itens com 7 raridades (Comum a Divino)
- Inventário completo com equipar/vender
- Sistema de reset após nível 100
- Loja com poções e baús
- Guildas (criar, entrar, sair)
- Ranking global (nível, poder, resets, ouro)
- Eventos temporários (XP duplo, ouro duplo, etc.)
- Chat global
- Progresso offline (até 2 horas)

## Instalação e Desenvolvimento Local

### Pré-requisitos

- Node.js v18+
- Netlify CLI (`npm install -g netlify-cli`)
- Conta na Netlify com site configurado

### Setup

```bash
# Instalar dependências
npm install

# Configurar banco de dados (via Netlify CLI)
netlify link  # linkar ao seu site

# Rodar localmente
netlify dev
```

O servidor local estará disponível em `http://localhost:8888`.

## Configuração do Banco de Dados

O banco de dados é gerenciado automaticamente pela Netlify. Ao fazer deploy:

1. O banco PostgreSQL é provisionado automaticamente
2. As migrations em `netlify/database/migrations/` são aplicadas
3. Nenhuma configuração manual é necessária

### Gerando Migrations (após alterar schema)

```bash
npx drizzle-kit generate
```

Nunca execute as migrations manualmente — a Netlify as aplica automaticamente no deploy.

## Deploy na Netlify

```bash
# Via Netlify CLI
netlify deploy --prod

# Ou conecte o repositório no dashboard netlify.com
```

## Variáveis de Ambiente

Nenhuma variável de ambiente é obrigatória para o jogo funcionar. Opcionalmente:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `ADMIN_SECRET` | Segredo para semear eventos via API | (não definido) |

Para semear eventos iniciais, faça uma requisição POST para `/api/seed-events` com o header `X-Admin-Secret: SEU_SEGREDO`.

## Estrutura do Projeto

```
/
├── index.html          # SPA principal
├── style.css           # Estilos (tema dark fantasy)
├── game.js             # Lógica do frontend
├── netlify.toml        # Configuração Netlify
├── drizzle.config.ts   # Configuração Drizzle ORM
├── db/
│   ├── schema.ts       # Schema do banco de dados
│   └── index.ts        # Cliente Drizzle
└── netlify/
    ├── functions/      # Netlify Functions (API)
    │   ├── lib/        # Utilitários compartilhados
    │   └── *.mts       # Endpoints da API
    └── database/
        └── migrations/ # Migrations SQL
```

## Segurança

- Senhas hasheadas com `scrypt` (Node.js nativo)
- Autenticação via Bearer Token validado server-side
- Todas as modificações de dados passam pelo backend
- Mensagens de chat sanitizadas
- Anti-spam básico no chat
