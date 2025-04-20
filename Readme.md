# Microservices Architecture Demo

A demonstration project showcasing a simple microservices architecture built with Node.js, Express, TypeScript, Prisma, and PostgreSQL, containerized with Docker.

![Microservices Architecture Diagram](https://miro.medium.com/v2/resize:fit:937/1*Jn_OZgq9dAG854kLEvG_-Q.png)

## Project Structure

```
├── auth-micro/              # Authentication Microservice
│   ├── node_modules/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── generated/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── index.ts
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── yarn.lock
│
├── post-micro/              # Post Management Microservice
│   ├── node_modules/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── generated/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── index.ts
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── yarn.lock
│
└── docker-compose.yml       # Main Docker Compose file
```

## Technology Stack

- **Backend Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker & Docker Compose
- **Architecture**: Microservices

## Microservices Overview

### Auth Microservice (`auth-micro`)

Responsible for user authentication and authorization:

- User registration
- Login functionality with ```jwt``` token
- fetch user details using ```jwt``` token

### Post Microservice (`post-micro`)

Handles all post-related operations:

- Creating posts
- Fetch posts of logged in user
- you can add more endpoints on your own... 

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js and npm/yarn (for local development)

### Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/SajjanKarn/Microservice-Architecture
cd Microservice-Architecture
```

2. Configure environment variables:
   Create `.env` files in both microservice directories with appropriate database connection strings and service-specific configurations.

```
DATABASE_URL="postgresql://admin:admin@localhost:5432/mydb?schema=public"
PORT=3000
JWT_SECRET="pDm8cPx1axXmExBwhF/PRwnBtAwEJTqjzZwDXf9RSJE="
```

3. Start the entire application stack:

```bash
docker-compose up -d
```

4. Access the services:
   - Auth Service: http://localhost:3000
   - Post Service: http://localhost:3001

## Docker Configuration

The project uses Docker to containerize each microservice and its database. The `docker-compose.yml` file orchestrates all services to run together.

```yaml
version: '3.8'

services:
  auth_db:
    image: postgres:15
    container_name: auth_postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: mydb
    volumes:
      - auth_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d mydb"]
      interval: 5s
      timeout: 5s
      retries: 5

  post_db:
    image: postgres:15
    container_name: post_postgres
    restart: always
    ports:
      - "5433:5432"  # Maps host port 5433 to the container's port 5432
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: post
    volumes:
      - post_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d post"]
      interval: 5s
      timeout: 5s
      retries: 5

  auth_app:
    build:
      context: ./auth-micro
    container_name: auth_app
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:admin@auth_db:5432/mydb?schema=public
      NODE_ENV: development
    depends_on:
      - auth_db
    command: >
      sh -c "
        npx prisma generate --schema=./prisma/schema.prisma &&
        npx prisma migrate deploy &&
        npm run start
      "

  post_app:
    build:
      context: ./post-micro
    container_name: post_app
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://admin:admin@post_db:5432/post?schema=public
      NODE_ENV: development
    depends_on:
      - post_db
    command: >
      sh -c "
        npx prisma generate --schema=./prisma/schema.prisma &&
        npx prisma migrate deploy &&
        npm run start
      "

volumes:
  auth_pgdata:
  post_pgdata:
```

## API Endpoints

### Auth Service (port 3000)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/auth/me` - Get current user information

### Post Service (port 3001)

- `GET /api/posts` - Get all posts of loggedin user
- `POST /api/posts` - Create a new post

## Development

### Local Development Setup

To work on a specific microservice locally:

1. Navigate to the microservice directory:

```bash
cd auth-micro  # or post-micro
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database and generate Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

4. Start the development server:

```bash
npm run dev
```

### Database Migrations

Each microservice manages its own database schema. To create new migrations:

```bash
cd auth-micro  # or post-micro
npx prisma migrate dev --name your_migration_name
```

## Architecture Benefits

- **Scalability**: Each service can be scaled independently
- **Flexibility**: Different services can use different technologies if needed
- **Resilience**: Failure in one service doesn't bring down the entire system
- **Development Efficiency**: Teams can work on different services independently

## Future Enhancements

- API Gateway for centralized request handling
- Service discovery mechanism
- Monitoring and logging infrastructure
- Message queue for asynchronous communication between services

## License

MIT
