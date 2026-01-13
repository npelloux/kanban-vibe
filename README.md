# Kanban Vibe

An interactive Kanban simulation for learning and experimenting with Lean software development principles.

## Vision

Kanban Vibe makes Lean software development principles tangible and actionable by providing an interactive simulation environment where anyone can safely experiment with workflow configurations and instantly see the impact on delivery performance.

**Core Problem:** Teams and educators struggle to understand abstract Lean/Agile workflow principles because they can't safely test WIP limit changes without disrupting real projects, real workflows take weeks to demonstrate patterns, and concepts like Little's Law need concrete demonstration.

**Solution:** A risk-free simulation environment with specialized workers, configurable WIP limits, automatic stage progression, and comprehensive flow analytics.

## Live Demo

The application is deployed at: [kanban-vibe.vercel.app](https://kanban-vibe.vercel.app)

## Features (Phase 1 - Complete)

- **7-Stage Kanban Board**: Options → Red Active → Red Finished → Blue Active → Blue Finished → Green → Done
- **Specialized Workers**: Red, Blue, and Green specialists with configurable counts
- **Day-by-Day Simulation**: Step through the workflow one day at a time
- **WIP Limits**: Configure minimum and maximum limits per column
- **Analytics Dashboards**:
  - Cumulative Flow Diagram (CFD)
  - WIP & Aging scatter plot
  - Flow metrics (Lead Time, Throughput, Little's Law validation)
- **Card Blocking**: Simulate blockers affecting card progress
- **State Management**: Save/load simulation state as JSON
- **Policy Automation**: Run automated policies (e.g., Siloed-Expert)

## Development Status

### Completed

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Core Simulation | Complete |
| M0 | Golden master test suite | Complete |
| M1.1-M1.4 | Domain value objects (Stage, Worker, WorkItems, Card) | Complete |

### In Progress

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1.5 | WipLimits with Zod validation | Pending |
| M1.6 | Board aggregate | Pending |
| M1.7 | Domain glossary | Pending |

### Planned

| Phase | Description |
|-------|-------------|
| Phase 2 | Enhanced UX (undo/redo, notifications, responsive design) |
| Phase 3 | Advanced Policies (comparison mode, templates) |
| Phase 4 | Collaboration (shareable links, live sessions) |
| Phase 5 | Educational Features (tutorials, challenges, instructor tools) |

## Architecture

The project follows Clean Architecture principles with domain-driven design:

```
src/
├── simulation/
│   └── domain/           # Pure TypeScript, no dependencies
│       ├── card/         # Card, CardId, WorkItems value objects
│       ├── worker/       # Worker, WorkerType value objects
│       ├── stage/        # Stage discriminated union
│       ├── wip/          # WIP limits (planned)
│       └── board/        # Board aggregate (planned)
├── components/           # React presentational components
├── __golden-master__/    # Behavior characterization tests
└── App.tsx               # Main application
```

**Design Principles:**
- Maximum type-safety (no `any`, no `as` assertions except `as const`)
- Make illegal states unrepresentable (discriminated unions over optionals)
- Fail-fast over silent fallbacks
- Prefer immutability
- Test-Driven Development (TDD)

## Tech Stack

- **React** 19.1 with **TypeScript** 5.8
- **Vite** 6.3 (build & dev server)
- **Chart.js** 4.4 (visualizations)
- **Vitest** 3.1 with **React Testing Library** (testing)
- **Allure** (living documentation from tests)
- **ESLint** 9.25 (code quality)
- **Vercel** (deployment)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run lint         # Check code style
npm run build        # Production build
```

### Test Reports

```bash
npm run test:report  # Generate Allure report
npm run test:serve   # Serve Allure report
```

## Documentation

| Document | Description |
|----------|-------------|
| [Product Vision](docs/product-vision-jtbd.md) | Jobs-to-be-Done analysis and user segments |
| [Project Overview](docs/project-overview.md) | High-level roadmap |
| [Phase 1 PRD](docs/project/PRD/active/PRD-phase1-core-simulation.md) | Core simulation specification |
| [Refactoring PRD](docs/project/PRD/active/PRD-refactoring-clean-architecture.md) | Clean architecture migration plan |
| [Testing Conventions](docs/conventions/testing.md) | How to write tests |
| [Software Design](docs/conventions/software-design.md) | Design principles |
| [AGENTS.md](AGENTS.md) | Coding standards reference |

## Target Users

- **Agile Coaches & Consultants**: Workshop facilitation and client training
- **Team Leads & Project Managers**: Process optimization and team education
- **Educators & Instructors**: University courses and professional training
- **Process Improvement Practitioners**: Workflow analysis and evidence-based recommendations

## Contributing

1. Read the relevant PRD for your task
2. Review coding standards in `docs/conventions/`
3. Write tests first (TDD approach)
4. Follow the code review process in `docs/workflow/code-review.md`

## License

This project is proprietary software.
