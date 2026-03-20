# Retro Pokemon Pokedex App (Dexter)
A Pokemon encyclopedia web app that lets you browse, search, and filter all 1,025 Pokemon. Includes a "Who's That Pokemon?" quiz game with score tracking.

Built with vanilla TypeScript and Vite — no frameworks.

## Features
- Browse all 1,025 Pokemon in a responsive card grid
- Search by name or Pokedex number
- Filter by type (fire, water, grass, etc.) and region (Kanto through Paldea)
- View detailed stats, types, and abilities in a modal
- Favorite Pokemon with localStorage persistence
- Gender icons for Pokemon with gender variants (Nidoran, etc.)
- "Who's That Pokemon?" silhouette quiz with score/streak tracking and region filtering
- Pokemon-styled UI with custom fonts and Pokedex-inspired design

## Getting Started
### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
git clone https://github.com/TehGoodLivin/pokedex-app.git
cd pokedex-app
npm install
```

### Development
```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure
```
pokedex-app/
├── index.html
├── public/
│   ├── audio/
│   │   └── Audio Files
│   ├── icons/
│   │   └── Icon Files
│   ├── favicon.ico 
│   └── site.webmanifest
├── src/
│   ├── main.ts
│   ├── quiz.ts
│   ├── render.ts
│   ├── types.ts
│   ├── utilities.ts
│   └── style.css
├── package.json
└── tsconfig.json
```

## API
All data is fetched from [PokeAPI](https://pokeapi.co/):

- `GET /pokemon?limit=1025` — full Pokemon list
- `GET /pokemon/{id}` — individual Pokemon details (stats, types, abilities, sprites)
- `GET /type/{type}` — Pokemon filtered by type

## Kanban

### Problem Statement
A web app for Pokémon fans to browse, search, and learn about Pokémon using data from the PokéAPI.

#### Feature List

| #  | Feature                   | User Story                                                                                                   | Status     |
|----|---------------------------|---------------------------------------------------------------------------------------------------------------|------------|
| 1  | Browse Pokémon grid       | As a user, I want to browse a grid of all Pokémon, so that I can explore the full Pokédex.                   | Completed  |
| 2  | Search by name or number  | As a user, I want to search Pokémon by name or number, so that I can quickly find a specific one.            | Completed  |
| 3  | Filter by type            | As a user, I want to filter Pokémon by type, so that I can see only matching Pokémon.                        | Completed  |
| 4  | Filter by region          | As a user, I want to filter by region, so that I can focus on a specific generation.                         | Completed  |
| 5  | View Pokémon details      | As a user, I want to click a Pokémon and see its stats, abilities, and sprite, so that I can learn more.     | Completed  |
| 6  | Favorite Pokémon          | As a user, I want to favorite Pokémon, so that I can save the ones I like and view them later.               | Completed  |
| 7  | Random Pokémon            | As a user, I want to click a random button, so that I can discover new Pokémon.                              | Completed  |
| 8  | Hear Pokémon cry          | As a user, I want to hear a Pokémon's cry, so that I can recognize its sound.                                | Completed  |
| 9  | Pokédex voice entry       | As a user, I want to listen to a voice entry, so that I get the classic Pokédex experience.                  | Completed  |
| 10 | Who's That Pokémon quiz   | As a user, I want to take a quiz, so that I can test my knowledge.                                           | Completed  |
| 11 | Dark mode                 | As a user, I want to toggle dark mode, so that I can use the app comfortably at night.                       | Icebox     |
| 12 | Evolution chain           | As a user, I want to see a Pokémon's evolution chain, so that I know how it evolves.                         | Icebox     |
