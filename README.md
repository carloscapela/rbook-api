# rbooks API

## 1. Visão geral

Aplicativo para registrar livros lidos, marcando cada dia (ou sessão) de leitura em um formato visual de calendário — similar ao "contribution graph" do GitHub, mas aplicado a hábitos de leitura.

**Objetivo principal:** ajudar o usuário a criar consistência na leitura, visualizando seu progresso ao longo do tempo.

## 2. Público-alvo

Leitores que quiram acompanhar hábitos de leitura, comparar meses/anos, e manter motivação através de visualização de sequências (streaks).

## 3. Stack técnica

- [Next.js 16](https://nextjs.org/) (App Router, Route Handlers) — TypeScript
- [Supabase](https://supabase.com/) (Postgres via PostgREST) como banco de dados
- Autenticação própria via **JWT** ([`jose`](https://github.com/panva/jose)) + cookie `httpOnly`, com senhas hasheadas via [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js) — não usa o Supabase Auth, pois o schema de usuários é uma tabela `public.users` própria

## 4. Pré-requisitos

- Node.js 20+ e npm
- Um projeto Supabase já criado, com as tabelas `users`, `books`, `metas` e `sessions_book`

## 5. Instalação

```bash
git clone <url-do-repositorio>
cd api
npm install
```

### 5.1 Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (esse arquivo nunca deve ser commitado — já está no `.gitignore`):

```bash
# Público — pode ser exposto ao client
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx

# Server-only — NUNCA prefixar com NEXT_PUBLIC_, NUNCA expor ao client
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxx

# Segredo usado para assinar/verificar os JWTs de sessão
JWT_SECRET=<uma-string-aleatoria-forte>
```

Onde encontrar cada valor:

| Variável | Onde obter |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API Keys → Publishable key |
| `SUPABASE_SECRET_KEY` | Supabase Dashboard → Project Settings → API Keys → Secret key (equivalente ao antigo `service_role`, ignora RLS — mantenha em segredo) |
| `JWT_SECRET` | Gere localmente, por exemplo: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |

> Recomendação de segurança: habilite Row Level Security (RLS) nas tabelas sem policies públicas de leitura/escrita. Toda a API acessa o banco pelo servidor usando `SUPABASE_SECRET_KEY`, que ignora RLS — a chave publicável não deve conseguir ler/escrever nada diretamente.

### 5.2 Rodando o projeto

```bash
npm run dev      # ambiente de desenvolvimento (http://localhost:3000)
npm run build    # build de produção
npm run start    # roda o build de produção
npm run lint     # lint com ESLint
```

## 6. Estrutura do projeto

```
src/
  app/
    api/
      auth/            # registro, login, logout, sessão atual (me)
      books/            # CRUD de livros do usuário autenticado
        [id]/
          sessions/     # CRUD de sessões de leitura de um livro
      metas/            # CRUD de metas de leitura do usuário
      health/           # healthcheck simples
  lib/
    auth/               # jwt, cookies, hash de senha, leitura de sessão
    books/               # validação de campos e checagem de posse do livro
    metas/               # validação de campos
    sessions/            # validação de campos
    supabase/
      admin.ts           # client Supabase server-only (Secret Key)
```

## 7. Endpoints da API

Toda rota (exceto `/api/health` e `/api/auth/*`) exige uma sessão válida: o cookie `rbooks_session`, definido automaticamente pelo login/registro.

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/register` | Cria usuário (`name`, `email`, `password`) e já autentica |
| POST | `/api/auth/login` | Autentica com `email` + `password` |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET | `/api/auth/me` | Retorna o usuário da sessão atual |

### Livros (`books`)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/books` | Lista os livros do usuário (`?limit=&offset=`) |
| POST | `/api/books` | Cria um livro (`title` obrigatório) |
| GET | `/api/books/:id` | Detalhe de um livro |
| PATCH | `/api/books/:id` | Atualização parcial |
| DELETE | `/api/books/:id` | Remove o livro |

### Sessões de leitura (`sessions_book`)

Aninhadas em um livro — a posse é verificada via `books.user_id`.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/books/:id/sessions` | Lista as sessões de leitura do livro |
| POST | `/api/books/:id/sessions` | Registra uma sessão de leitura |
| GET | `/api/books/:id/sessions/:sessionId` | Detalhe de uma sessão |
| PATCH | `/api/books/:id/sessions/:sessionId` | Atualização parcial |
| DELETE | `/api/books/:id/sessions/:sessionId` | Remove a sessão |

### Metas (`metas`)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/metas` | Lista as metas do usuário |
| POST | `/api/metas` | Cria uma meta |
| GET | `/api/metas/:id` | Detalhe de uma meta |
| PATCH | `/api/metas/:id` | Atualização parcial |
| DELETE | `/api/metas/:id` | Remove a meta |
