# Daylight To-do List

A responsive React to-do list frontend backed by a Java Spring Boot REST API and SQLite. Tasks can be added, completed, deleted, filtered, and cleared after completion. Tasks are stored in a local SQLite database file.

## Requirements

- [Node.js](https://nodejs.org/) (LTS)
- Java 25 LTS
- [Maven](https://maven.apache.org/)

## Project structure

- `frontEnd/` contains the React/Vite application.
- `BackEnd/` contains the Spring Boot API.
- `BackEnd/daylight.db` is created automatically when the API starts and stores local task data.

## Run locally

1. In a terminal, start the Spring Boot API:

```sh
cd BackEnd
mvn spring-boot:run
```

The API runs at `http://localhost:8080`. It creates the `daylight` database tables automatically.

2. In another terminal, start the React frontend:

```sh
cd frontEnd
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Vite proxies `/api` requests to Spring Boot.

By default, the API creates `BackEnd/daylight.db` automatically. Set `DB_URL` to use a different SQLite file, for example `jdbc:sqlite:/absolute/path/to/daylight.db`.

To create a production build:

```sh
cd frontEnd
npm run build
```

The SQLite file is excluded from Git and preserves tasks between restarts. Back it up separately if you need to preserve local task data. Existing tasks in MySQL are not migrated automatically.
