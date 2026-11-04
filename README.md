# Daylight To-do List

A responsive React to-do list frontend backed by a Java Spring Boot REST API and MySQL. Tasks can be added, completed, deleted, filtered, and cleared after completion. Tasks are stored in MySQL.

## Requirements

- [Node.js](https://nodejs.org/) (LTS)
- Java 25 LTS
- [Maven](https://maven.apache.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) for the local MySQL database

## Project structure

- `frontEnd/` contains the React/Vite application.
- `BackEnd/` contains the Spring Boot API.
- `compose.yaml` at the project root starts the shared MySQL database.

## Run locally

1. Start MySQL from the project root:

```sh
docker compose up -d
```

2. In a terminal, start the Spring Boot API:

```sh
cd BackEnd
mvn spring-boot:run
```

The API runs at `http://localhost:8080`. It creates the `daylight` database tables automatically.

3. In another terminal, start the React frontend:

```sh
cd frontEnd
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Vite proxies `/api` requests to Spring Boot.

The local MySQL credentials are configured for development in `compose.yaml` and `BackEnd/src/main/resources/application.properties`. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables to use different credentials.

To create a production build:

```sh
cd frontEnd
npm run build
```

Stop MySQL with `docker compose down`. The named `mysql_data` volume preserves tasks between restarts; remove that volume only if you intend to delete the local database data.
