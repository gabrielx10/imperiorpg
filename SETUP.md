# Império RPG Auto - Setup

## Requisitos
- Node.js 18+
- npm ou yarn

## Instalação

```bash
npm install
```

## Desenvolvimento Local

### Opção 1: Usando Netlify Dev (Recomendado)
```bash
npm install -g netlify-cli
netlify dev
```

Isso vai:
- Servir o frontend em `http://localhost:8888`
- Executar as funções Netlify em `http://localhost:8888/.netlify/functions/`

### Opção 2: Apenas o Frontend (sem API)
```bash
npx http-server
```

Então acesse `http://localhost:8080`

## Estrutura do Projeto

```
/
├── index.html          - UI principal
├── game.js             - Lógica do frontend
├── style.css           - Estilos
├── db/                 - Schema do banco de dados
├── netlify/
│   ├── functions/      - Endpoints da API
│   └── database/       - Migrações do banco
└── package.json
```

## Endpoints Disponíveis

### Auth
- `POST /api/register` - Criar conta
- `POST /api/login` - Fazer login
- `POST /api/logout` - Fazer logout

### Game
- `POST /api/battle-tick` - Executar batalha automática
- `POST /api/manual-attack` - Atacar manualmente (VIP)
- `GET /api/get-player` - Obter dados do personagem
- `POST /api/create-character` - Criar personagem

### Admin
- `GET /api/admin-panel` - Listar personagens (admin)
- `POST /api/admin-panel` - Ações admin (conceder VIP, etc)

### Utilitários
- `GET /api/health` - Status do servidor

## Troubleshooting

### "Erro ao conectar"
Isso significa que o endpoint não está respondendo. Verifique:
1. Se você está usando `netlify dev` (não apenas `http-server`)
2. Se há erros no console do navegador (F12)
3. Se há erros no terminal onde `netlify dev` está rodando

### Banco de dados não sincronizado
Se adicionar novos campos ao schema, criar uma nova migração:
```bash
# As migrações estão em netlify/database/migrations/
# Adicione um novo arquivo migration.sql lá
```

## Build para Produção

```bash
npm run build
```

Depois faça deploy no Netlify (ou outro provedor que suporte Netlify Functions).
