# AGENTS.md — Guia de Arquitetura para Agentes de IA

## Visão Geral

Império RPG Auto é um idle RPG completo rodando em Netlify. O frontend é uma SPA (Single Page Application) em HTML/CSS/JS puro. O backend são Netlify Functions em TypeScript. O banco de dados é PostgreSQL gerenciado via Netlify Database com Drizzle ORM.

## Estrutura de Diretórios

```
/
├── index.html          # SPA — todo o HTML do jogo, sem build step
├── style.css           # CSS com variáveis CSS, tema dark fantasy
├── game.js             # Toda a lógica frontend (sem bundler)
├── db/
│   ├── schema.ts       # Fonte de verdade do schema DB (Drizzle)
│   └── index.ts        # Exporta `db` (cliente Drizzle netlify-db)
├── netlify/
│   ├── functions/
│   │   ├── lib/
│   │   │   ├── gameData.ts  # Constantes do jogo (mapas, monstros, itens)
│   │   │   ├── auth.ts      # Utilitários de auth (hash, token, validação)
│   │   │   └── battle.ts    # Lógica de cálculo de combate
│   │   ├── register.mts     # POST /api/register
│   │   ├── login.mts        # POST /api/login
│   │   ├── logout.mts       # POST /api/logout
│   │   ├── create-character.mts  # POST /api/create-character
│   │   ├── get-player.mts   # GET /api/get-player (também aplica offline progress)
│   │   ├── battle-tick.mts  # POST /api/battle-tick (chamado a cada 3s)
│   │   ├── equip-item.mts   # POST /api/equip-item
│   │   ├── sell-item.mts    # POST /api/sell-item
│   │   ├── inventory.mts    # GET /api/inventory
│   │   ├── shop.mts         # GET/POST /api/shop
│   │   ├── ranking.mts      # GET /api/ranking
│   │   ├── chat.mts         # GET/POST /api/chat
│   │   ├── guild.mts        # GET/POST /api/guild
│   │   ├── events.mts       # GET /api/events
│   │   ├── change-map.mts   # POST /api/change-map
│   │   ├── reset-character.mts  # POST /api/reset-character
│   │   ├── allocate-stats.mts   # POST /api/allocate-stats
│   │   └── seed-events.mts  # POST /api/seed-events (admin)
│   └── database/
│       └── migrations/      # Gerado por `npx drizzle-kit generate`
└── netlify.toml
```

## Convenções de Código

### Backend (Functions)
- Extensão `.mts` (TypeScript ES modules)
- Toda função exporta `default async (req: Request) => Response` e `config: Config`
- Autenticação via `validateAuth(req)` de `./lib/auth.js`
- Respostas via `jsonOk(data)` e `jsonError(message, status)`
- Imports com extensão `.js` (ES modules TypeScript)

### Frontend
- Estado global em `state` object
- API calls via `api(path, method, body)` — inclui Bearer token automaticamente
- Notificações via `toast(msg, type)`
- Modals via `openModal(html)` / `closeModal()`
- Dados do jogo (mapas, etc.) duplicados no frontend para performance

### Database
- Schema definido em `db/schema.ts`
- Ao alterar schema: executar `npx drizzle-kit generate`
- NUNCA executar DDL diretamente — sempre via migrations
- Itens de inventário armazenados como JSON text na coluna `itemData`

## Modelo de Dados Chave

### Personagem (`characters`)
- Stats base: `statDamage`, `statDefense`, `statHp`, `statSpeed`, `statCrit`, `statLuck`
- Pontos para distribuir: `bonusPoints` (ganhos ao subir nível)
- Progresso offline calculado via `lastOnline` timestamp

### Itens (`inventory_items`)
- `itemData`: JSON string com interface `GameItem` (de `lib/gameData.ts`)
- `equipped`: boolean
- `slot`: nome do slot ('weapon', 'helmet', etc.)

### Autenticação
- Token gerado aleatoriamente, armazenado em `users.session_token`
- Cliente envia `Authorization: Bearer <token>`
- Validado em cada request via `validateAuth(req)`

## Loop de Jogo

1. Cliente chama `GET /api/get-player` ao iniciar → aplica progresso offline
2. Timer de 3s chama `POST /api/battle-tick` continuamente
3. Servidor calcula combate, salva no DB, retorna resultado
4. Frontend atualiza UI com resultado

## Decisões de Design

- **Sem frameworks**: O usuário especificou "JavaScript puro"
- **Itens como JSON**: Evita schema complexo, itens têm stats variáveis
- **Offline progress no get-player**: Simplifica o fluxo (não precisa de job separado)
- **Anti-spam em memória**: Map simples `userId → timestamp`, suficiente para anti-spam básico
- **Rarity como string**: Mais legível que enum numérico, comparações diretas no frontend

## Comandos Úteis

```bash
# Desenvolvimento local
netlify dev

# Regenerar migrations após alterar db/schema.ts
npx drizzle-kit generate

# Verificar status do banco (preview branch)
netlify db status

# Conectar ao banco para debug
netlify db connect --query "SELECT * FROM characters LIMIT 5"
```
