# Architecture Overview

## Project Structure

```text
kanban-vibe/
├── src/
│   ├── simulation/               # Business logic feature module
│   │   ├── domain/               # Pure TypeScript domain logic
│   │   │   ├── card/             # Card aggregate (Card, CardId, WorkItems)
│   │   │   ├── worker/           # Worker value object and output logic
│   │   │   ├── board/            # Board aggregate root
│   │   │   ├── stage/            # Stage value object and transitions
│   │   │   └── wip/              # WIP limits and enforcement
│   │   ├── application/          # Use cases (move-card, assign-worker, advance-day, run-policy)
│   │   ├── infra/                # Infrastructure adapters (state-repository, json-export)
│   │   └── api/                  # React hooks (useKanbanBoard, useSimulation, useWorkers)
│   ├── components/               # Presentational React components
│   │   ├── Card.tsx              # Card display component
│   │   ├── Column.tsx            # Column with cards
│   │   ├── WorkerPool.tsx        # Worker display (pure)
│   │   ├── ConnectedWorkerPool.tsx # Worker pool with context
│   │   └── ...                   # Other UI components
│   ├── App.tsx                   # Composition root
│   └── main.tsx                  # Application entry point
├── docs/                         # Documentation
└── package.json                  # Project definition
```

## Layer Responsibilities

| Layer       | Contains                                   | Depends On                     |
| ----------- | ------------------------------------------ | ------------------------------ |
| domain      | Entities, value objects, domain services   | Nothing (pure TypeScript)      |
| application | Use cases, orchestration                   | domain                         |
| infra       | Storage adapters, serialization            | domain, application            |
| api         | React hooks, context providers             | domain, application, infra     |
| components  | Presentational React components            | api (via hooks and context)    |

## Key Design Decisions

### 1. Pure Domain Layer

The `simulation/domain/` folder contains pure TypeScript with no React dependencies. All types are immutable, functions are pure, and there are no side effects.

### 2. Branded Types for Type Safety

`CardId` is a branded type (`string & { readonly __brand: 'CardId' }`) to prevent accidentally passing arbitrary strings where card IDs are expected.

### 3. Composition Root Pattern

`App.tsx` serves as the composition root, composing all hooks and passing data to presentational components. Components receive data and callbacks as props.

### 4. Context for State Management

`BoardProvider` provides board state via React context. Hooks like `useKanbanBoard`, `useSimulation`, and `useWorkers` encapsulate state management logic.

### 5. Infrastructure Isolation

Persistence logic is isolated in `infra/state-repository.ts` with a schema-validated load/save cycle. JSON export/import is separated from internal state management.

## Domain Glossary

| Term         | Description                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Card         | A work item that flows through the Kanban board stages from Options to Done                     |
| CardId       | A branded string identifier for cards (A, B, C... Z, AA, AB...) ensuring type safety            |
| Worker       | A resource that can be assigned to cards to complete work items                                 |
| WorkerType   | The specialization of a worker: 'red', 'blue', or 'green'                                       |
| Stage        | A column on the Kanban board (options, red-active, red-finished, blue-active, blue-finished, green, done) |
| WorkItems    | A composite value object tracking required and completed work for each color (red, blue, green) |
| WorkProgress | Tracks total and completed work units for a single color                                        |
| WipLimits    | Work-in-progress constraints (min/max) per column that restrict card movement                   |
| Board        | The aggregate root containing all simulation state: cards, workers, current day, and WIP limits |
| Day          | A discrete time unit in the simulation; workers produce output and cards age each day           |
| Policy       | An automated strategy for running the simulation (card moves, worker assignments)               |
| Blocked      | A state flag on a card preventing it from transitioning to the next stage                       |

For detailed definitions and examples, see the [contextive glossary](domain-terminology/contextive/definitions.glossary.yml).

## Technology Stack

- **Runtime:** React 19 with TypeScript
- **Build:** Vite
- **Testing:** Vitest with Testing Library
- **Styling:** CSS with component-scoped classes
- **State:** React Context + custom hooks
- **CI/CD:** GitHub Actions, Vercel deployment, SonarCloud analysis
