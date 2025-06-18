# Documentação do Back-end - CRUD Users

Este é o back-end do projeto de criação de um CRUD de usuários, construído com **NestJS**, **Prisma** como ORM, **PostgreSQL** hospedado no **Supabase** e **Redis** como serviço de Cache. O sistema suporta autenticação com JWT e gerencia usuários com a possibilidade de adição e edição dos mesmos. Esta documentação guia você na configuração, execução e manutenção do back-end.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js** (versão 18.x ou superior)
- **npm** (versão 8.x ou superior) ou **yarn** (versão 1.x ou superior)
- **Git** (para clonar o repositório)
- Uma conta no **Supabase** com um projeto configurado (para o banco de dados PostgreSQL)
- Conta no **Upstash** (para o serviço de cache Redis)


1. Clone o repositório para sua máquina local:
  ```bash
   git clone https://github.com/felipeoliveira25/project-crud-users-backend.git


2. Acesse o diretório do projeto clonado:
  ```bash
   cd project-crud-users-backend


3. Instale todas as dependências usando npm ou yarn:
- Com npm:
  ```bash
   npm install
- Com yarn
  ```bash
   yarn install


4. Configuração das variáveis de ambiente
- O Back-end usa variáveis de ambiente para configurar a conexão com o banco de dados, a autenticação JWT e o cacheamento com Redis
- Crie um arquivo .env na raiz do projeto com base no exemplo abaixo
  # .env
    DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB]"
    JWT_SECRET=supersecretkey123
    REDIS_URL=rediss://default:[YOUR-REDIS-PASSWORD]@[YOUR-REDIS-ENDPOINT].upstash.io:6379
    CACHE_TTL=60

- Explicação das variáveis
  - DATABASE_URL: URL de conexão com o PostgreSQL no Supabase. Obtenha-a clicando no botão "Connect" que fica ao lado do nome do projeto e selecionando a "Session pooler".
  - REDIS_URL: URL de conexão com o Redis no Upstash. Obtenha toda a URL criando uma instância Redis e copiar a URL de conexão do Redis (TCP)
  - JWT_SECRET: Chave secreta para assinar tokens JWT.


5. Script de criação do banco de dados
- O banco de dados é gerenciado pelo Prisma, com o esquema definido em prisma/schema.prisma. As tabelas são criadas via migrações do Prisma.

- Execute a migração inicial para criar as tabelas no Supabase:
  ```bash
  npx prisma migrate dev --name init

- Isso cria as tabelas Admin e users e gera o cliente Prisma em node_modules/@prisma/client.

- Popule o banco com dados iniciais usando o script de seed:
  ```bash
  npx prisma db seed
  ```


6. Visualizando o banco
- Para inspecionar as tabelas e dados:
  ```bash
  npx prisma studio


7. Rodando o projeto
- Iniciei o servidor em modo de desenvolvimento:
  ```bash
  npm run start:dev
