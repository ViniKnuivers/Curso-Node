# 💰 API de Controle de Transações Financeiras

API REST construída em **Node.js** para registro e consulta de transações financeiras (créditos e débitos), com sessão de usuário controlada por cookies — sem necessidade de login ou cadastro.

> 🚀 Projeto desenvolvido durante o curso de **Back-end com Node.js** da [Rocketseat](https://www.rocketseat.com.br/), como parte da trilha Ignite. Toda a base conceitual, arquitetura e boas práticas aplicadas aqui têm origem no conteúdo ensinado na plataforma.

---

## ✨ Sobre o projeto

A aplicação permite que qualquer pessoa crie transações sem precisar se autenticar com usuário e senha. No lugar disso, ao criar a primeira transação, a API gera um **cookie de sessão único**, que passa a identificar aquele usuário em todas as requisições seguintes — garantindo que cada pessoa veja apenas as próprias transações.

### Regras de negócio

- ✅ A pessoa deve poder criar uma nova transação;
- ✅ A pessoa deve poder obter um resumo (saldo) das suas transações;
- ✅ A pessoa deve poder listar todas as transações já registradas;
- ✅ A pessoa deve poder visualizar uma transação específica;
- ✅ Transações do tipo **crédito** somam ao saldo, e do tipo **débito** subtraem;
- ✅ Deve ser possível identificar a pessoa entre as requisições, através de um cookie de sessão;
- ✅ A pessoa só pode visualizar transações que ela mesma criou.

---

## 🛠️ Tecnologias e bibliotecas

| Categoria | Ferramenta |
|---|---|
| Runtime | [Node.js](https://nodejs.org/) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Framework HTTP | [Fastify](https://fastify.dev/) |
| Cookies | [@fastify/cookie](https://github.com/fastify/fastify-cookie) |
| Query Builder / Migrations | [Knex.js](https://knexjs.org/) |
| Banco de dados | [SQLite3](https://www.sqlite.org/) |
| Validação de schemas | [Zod](https://zod.dev/) |
| Variáveis de ambiente | [dotenv](https://github.com/motdotla/dotenv) + [dotenv-cli](https://github.com/entropitor/dotenv-cli) |
| Execução em dev | [tsx](https://github.com/privatenumber/tsx) |
| Build | [tsup](https://tsup.egoist.dev/) |
| Testes | [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest) |
| Lint | [ESLint](https://eslint.org/) com [@rocketseat/eslint-config](https://github.com/Rocketseat/eslint-config) |

---

## 📁 Estrutura do projeto

```
├── db/
│   ├── migrations/              # Migrations do Knex (criação e alteração de tabelas)
│   ├── app.db                    # Banco de dados de desenvolvimento (SQLite)
│   └── test.db                   # Banco de dados isolado para os testes automatizados
│
├── src/
│   ├── @types/
│   │   └── knex.d.ts             # Tipagem das tabelas do Knex (autocomplete + segurança de tipos)
│   ├── env/
│   │   └── index.ts              # Validação e tipagem das variáveis de ambiente com Zod
│   ├── middleware/
│   │   └── check-sessions-id-exists.ts   # Garante que a requisição possui uma sessão válida
│   ├── routes/
│   │   └── transactions.ts       # Rotas da API de transações
│   ├── app.ts                    # Configuração da instância do Fastify e registro dos plugins/rotas
│   ├── database.ts               # Conexão do Knex com o banco de dados
│   └── server.ts                 # Ponto de entrada — inicializa o servidor HTTP
│
├── test/
│   └── transaction.spec.ts       # Suíte de testes end-to-end (E2E) das rotas
│
├── knexfile.ts                   # Configuração do Knex usada pela CLI (migrations)
├── .env.example                  # Modelo das variáveis de ambiente necessárias
└── tsconfig.json
```

---

## 🔀 Rotas da API

Todas as rotas têm o prefixo `/transactions`.

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/transactions` | Cria uma nova transação. Se a pessoa ainda não tiver um cookie de sessão, um novo é gerado automaticamente. | Não exige sessão prévia |
| `GET` | `/transactions` | Lista todas as transações da sessão atual. | Exige cookie de sessão |
| `GET` | `/transactions/:id` | Retorna os detalhes de uma transação específica da sessão atual. | Exige cookie de sessão |
| `GET` | `/transactions/summary` | Retorna o somatório (saldo) de todas as transações da sessão atual. | Exige cookie de sessão |

### Exemplo — criar uma transação

```http
POST /transactions
Content-Type: application/json

{
  "title": "Salário",
  "amount": 5000,
  "type": "credit"
}
```

O corpo da requisição é validado com **Zod**: `title` precisa ser uma string, `amount` um número, e `type` apenas `"credit"` ou `"debit"`. Transações de débito têm o valor convertido automaticamente para negativo antes de serem persistidas, simplificando o cálculo do saldo total.

---

## 🔐 Autenticação por sessão

Não há sistema de login. Em vez disso:

1. Na primeira chamada ao `POST /transactions`, a API gera um identificador único (`session_id`) com `crypto.randomUUID()`;
2. Esse identificador é enviado de volta como um **cookie httpOnly** (`sessionId`), válido por 7 dias;
3. Nas próximas requisições, o middleware `checkSessionIdExists` verifica se o cookie foi enviado — caso não tenha sido, a API responde com `401 Unauthorized`;
4. Todas as consultas (`GET`) filtram os resultados pelo `session_id`, garantindo que cada pessoa só visualize suas próprias transações.

> A rota de criação (`POST`) é a única que não exige sessão prévia — afinal, é justamente nela que a sessão é criada.

---

## 🗄️ Banco de dados

O projeto usa **SQLite** com **Knex.js** como query builder e gerenciador de migrations.

### Migrations

| Arquivo | Responsabilidade |
|---|---|
| `create-documents` | Cria a tabela `transactions`, com `id`, `title`, `amount` e `created_at` |
| `sessions-id-to-session-id` | Adiciona a coluna `session_id`, usada para vincular cada transação à sessão que a criou |

### Ambientes separados

O projeto mantém **dois bancos de dados independentes**:

- `db/app.db` → usado em desenvolvimento (`npm run dev`);
- `db/test.db` → usado exclusivamente pela suíte de testes, garantindo que os testes nunca interfiram nos dados reais.

Essa separação é controlada pela variável `DATABASE_URL`, lida a partir do `.env` (em desenvolvimento) ou do `.env.test` (em ambiente de teste), conforme o valor de `NODE_ENV`.

---

## ✅ Testes automatizados

Os testes são **end-to-end (E2E)**: em vez de testar funções isoladas, eles simulam requisições HTTP reais contra a aplicação, usando **Supertest**, e validam o comportamento completo de cada rota.

### O que é testado

- ✅ Criação de uma nova transação (`201 Created`);
- ✅ Listagem de todas as transações de uma sessão (`200 OK`);
- ✅ Busca de uma transação específica pelo `id`;
- ✅ Cálculo correto do resumo (saldo) somando créditos e subtraindo débitos.

### Estratégia de isolamento

Antes de **cada teste**, o banco de dados de teste é completamente resetado:

```ts
beforeEach(() => {
  execSync('npm run knex migrate:rollback --all')
  execSync('npm run knex migrate:latest')
})
```

Isso garante que nenhum teste seja afetado por dados deixados por execuções anteriores — cada teste começa do zero, com o schema recriado.

### Rodando os testes

```bash
npm test
```

---

## ⚙️ Como executar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado

### Passo a passo

```bash
# 1. Instale as dependências
npm install

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Rode as migrations no banco de desenvolvimento
npm run knex migrate:latest

# 4. Inicie o servidor em modo de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3333` (porta configurável via variável `PORT`).

### Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NODE_ENV` | Ambiente de execução (`development`, `test` ou `production`) | `production` |
| `DATABASE_URL` | Caminho do arquivo SQLite | — (obrigatório) |
| `PORT` | Porta em que o servidor HTTP roda | `3333` |

As variáveis são validadas em tempo de execução com **Zod** (`src/env/index.ts`) — se alguma variável obrigatória estiver ausente ou em formato inválido, a aplicação não inicia e exibe o erro de validação no console.

---

## 📜 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento, com hot reload |
| `npm test` | Executa a suíte de testes automatizados |
| `npm run knex` | Atalho para a CLI do Knex (ex: `npm run knex migrate:latest`) |
| `npm run lint` | Analisa e corrige automaticamente problemas de estilo de código |
| `npm run build` | Gera a versão de produção da aplicação |

---

## 🎓 Créditos

Este projeto foi desenvolvido como exercício prático do curso de **Node.js** oferecido pela [Rocketseat](https://www.rocketseat.com.br/), aplicando conceitos como:

- Criação de APIs REST com Fastify;
- Validação de dados com Zod;
- Persistência de dados com Knex e SQLite;
- Gerenciamento de sessões via cookies;
- Testes automatizados end-to-end com Vitest e Supertest;
- Boas práticas de organização de código e variáveis de ambiente.

Desenvolvido por **Vinicius** 🚀
