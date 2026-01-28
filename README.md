# Kanban Vibe

An interactive Kanban simulation for learning and experimenting with Lean software development principles.

## Vision

Kanban Vibe makes Lean software development principles tangible and actionable by providing an interactive simulation environment where anyone can safely experiment with workflow configurations and instantly see the impact on delivery performance.

**Core Problem:** Teams and educators struggle to understand abstract Lean/Agile workflow principles because they can't safely test WIP limit changes without disrupting real projects, real workflows take weeks to demonstrate patterns, and concepts like Little's Law need concrete demonstration.

**Solution:** A risk-free simulation environment with specialized workers, configurable WIP limits, automatic stage progression, and comprehensive flow analytics.

## Live Demo

The application is deployed at: [kanban-vibe.vercel.app](https://kanban-vibe.vercel.app)

## Features

### Core Simulation (Phase 1 - Complete)
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

## Clean Architecture Refactoring Status

The project is currently undergoing a comprehensive Clean Architecture refactoring to improve maintainability, testability, and extensibility. The original monolithic structure is being replaced with a domain-driven design approach.

### Completed Milestones

| Milestone | Description | Status | PRs |
|-----------|-------------|--------|-----|
| **M0** | **Golden Master Test Suite** | ✅ **Complete** | |
| M0-D0.1 | Golden master for stage transitions | ✅ Complete | |
| M0-D0.2 | Golden master for worker output | ✅ Complete | |
| M0-D0.3 | Golden master for WIP limit enforcement | ✅ Complete | |
| M0-D0.4 | Golden master for day advancement | ✅ Complete | [#49](https://github.com/npelloux/kanban-vibe/pull/49) |
| M0-D0.5 | Golden master for card movement | ✅ Complete | [#50](https://github.com/npelloux/kanban-vibe/pull/50) |
| M0-D0.6 | Golden master for policy execution | ✅ Complete | [#51](https://github.com/npelloux/kanban-vibe/pull/51) |
| M0-D0.7 | Golden master for state serialization | ✅ Complete | [#52](https://github.com/npelloux/kanban-vibe/pull/52), [#54](https://github.com/npelloux/kanban-vibe/pull/54), [#56](https://github.com/npelloux/kanban-vibe/pull/56) |
| **M1** | **Domain Types** | ✅ **Complete** | |
| M1-D1.1 | Stage discriminated union | ✅ Complete | |
| M1-D1.2 | WorkerType and Worker value objects | ✅ Complete | |
| M1-D1.3 | WorkItems value object | ✅ Complete | |
| M1-D1.4 | Card value object and CardId | ✅ Complete | |
| M1-D1.5 | WipLimits with Zod validation | ✅ Complete | |
| M1-D1.6 | Board aggregate | ✅ Complete | |
| M1-D1.7 | Domain glossary | ✅ Complete | |
| **M2** | **Stage Transitions** | ✅ **Complete** | |
| M2-D2.1 | StageTransitionService.canTransition() | ✅ Complete | [#53](https://github.com/npelloux/kanban-vibe/pull/53) |
| M2-D2.2 | StageTransitionService.nextStage() | ✅ Complete | [#55](https://github.com/npelloux/kanban-vibe/pull/55) |
| M2-D2.3 | CardAgingService | ✅ Complete | |

### In Progress

| Milestone | Description | Status | Next Steps |
|-----------|-------------|--------|------------|
| **M3** | **WIP Limit Enforcement** | 📋 Planned | Extract WIP limit logic to domain services |
| **M4** | **Worker Output Calculation** | 📋 Planned | Extract worker output logic with injectable randomness |
| **M5** | **Application Use Cases** | 📋 Planned | Create use cases to orchestrate domain logic |

### Future Milestones

| Milestone | Description | Priority |
|-----------|-------------|----------|
| **M6** | **Infrastructure Adapters** | High - Required before UI refactoring |
| **M7** | **React Hooks Integration** | High - Bridge domain to React |
| **M8** | **Component Refactoring** | High - Remove business logic from components |
| **M9** | **Integration Verification** | High - Full smoke testing |

## Future Development Phases

### Immediate Focus: Clean Architecture Foundation

The primary focus is completing the Clean Architecture refactoring (M0-M9) to establish a solid foundation. This refactoring is **not adding new features** but extracting the existing business logic into a maintainable, testable structure.

**Key Architectural Principles:**
- **Domain-First Design**: Pure TypeScript domain layer with no framework dependencies
- **Type Safety**: Maximum use of TypeScript's type system (discriminated unions, branded types)
- **Immutability**: All domain operations return new instances
- **Fail-Fast Validation**: Invalid states are caught at compile-time or immediately at runtime
- **Test-Driven Development**: All domain logic developed with tests first

### Long-Term Vision & Design

| Phase | Description | Timeline | Design Goals |
|-------|-------------|----------|--------------|
| **Phase 2** | **Enhanced UX** | Post-refactoring | |
| | Undo/Redo System | Q1 2025 | Event-sourced state management enables temporal navigation |
| | Real-time Notifications | Q2 2025 | Toast system for policy completion, violations, achievements |
| | Responsive Design | Q2 2025 | Mobile-first responsive layout for tablet/phone usage |
| | Accessibility (WCAG 2.1) | Q2 2025 | Keyboard navigation, screen reader support, color contrast |
| **Phase 3** | **Advanced Policies & Analytics** | 2025 | |
| | Policy Comparison Mode | Q3 2025 | Run multiple policies side-by-side with diff visualization |
| | Custom Policy Builder | Q4 2025 | Visual workflow editor for creating custom flow policies |
| | Advanced Metrics | Q3 2025 | Cycle time distribution, flow efficiency, queuing theory validation |
| | Scenario Templates | Q4 2025 | Pre-built scenarios (crisis mode, seasonal variations, tech debt) |
| **Phase 4** | **Collaboration & Sharing** | 2025-2026 | |
| | Shareable Simulation Links | Q1 2026 | URL-based state sharing with read-only viewers |
| | Live Session Mode | Q2 2026 | Real-time collaborative simulation for workshops |
| | Session Recording | Q3 2026 | Record and replay simulation sessions for training |
| **Phase 5** | **Educational Platform** | 2026+ | |
| | Interactive Tutorials | Q4 2026 | Guided learning paths for Lean/Agile concepts |
| | Challenge Mode | Q1 2027 | Gamified scenarios with scoring and achievements |
| | Instructor Dashboard | Q2 2027 | Student progress tracking, assignment management |
| | Certification Integration | Q3 2027 | Integration with Lean/Agile certification programs |

### Technical Architecture Future

**Post-Refactoring Architecture Goals:**
- **Domain Events**: Full event sourcing for undo/redo and audit trails
- **Plugin Architecture**: Extensible policy system for custom workflows
- **Web Workers**: Background simulation processing for complex scenarios
- **Progressive Web App**: Offline capability with service workers
- **Real-time Sync**: WebSocket-based collaboration with operational transforms

### Design Philosophy

**What We Optimize For:**
1. **Educational Value**: Every feature should deepen understanding of flow dynamics
2. **Experimentation Safety**: Risk-free environment for testing workflow changes
3. **Evidence-Based Learning**: Quantitative feedback for all workflow decisions
4. **Accessibility**: Usable by diverse audiences (engineers, managers, educators)
5. **Scientific Rigor**: Faithful implementation of queuing theory and Lean principles

**What We Don't Build:**
- Project management tools (Jira replacement)
- Team communication features (Slack replacement)
- Document management (Confluence replacement)
- Performance monitoring (observability tools)
- Real production workflow automation

## Current Architecture

The project is transitioning from a monolithic React application to Clean Architecture with domain-driven design:

### Domain Layer (✅ Implemented)

```text
src/simulation/domain/
├── card/
│   ├── card.ts              # Card value object
│   ├── card-id.ts          # CardId branded type
│   └── work-items.ts       # WorkItems value object
├── worker/
│   ├── worker.ts           # Worker value object
│   └── worker-type.ts      # WorkerType literal union
├── stage/
│   ├── stage.ts            # Stage discriminated union
│   └── stage-transition.ts # Stage transition services
├── wip/
│   └── wip-limits.ts       # WIP limits with Zod validation
└── board/
    └── board.ts            # Board aggregate root
```

### Test Coverage

```text
src/__golden-master__/      # Behavior characterization tests (✅ Complete)
├── stage-transitions.golden.spec.ts
├── worker-output.golden.spec.ts
├── wip-limits.golden.spec.ts
├── advance-day.golden.spec.ts
├── card-movement.golden.spec.ts
├── policy-execution.golden.spec.ts
└── serialization.golden.spec.ts
```

### Current Structure

```text
src/
├── simulation/domain/    # ✅ Pure TypeScript domain logic
├── components/           # 🔄 React components (being refactored)
├── __golden-master__/    # ✅ Safety net tests
└── App.tsx              # 🔄 Monolithic (being decomposed)
```

### Future Architecture (Post-Refactoring)

```text
src/simulation/
├── domain/              # ✅ Pure business logic
├── application/         # 📋 Use cases & orchestration
├── infra/              # 📋 External adapters
└── api/                # 📋 React hooks
```

**Design Principles:**
- Maximum type-safety (no `any`, no `as` assertions except `as const`)
- Make illegal states unrepresentable (discriminated unions over optionals)
- Fail-fast over silent fallbacks
- Prefer immutability
- Test-Driven Development (TDD)

**Key Refactoring Benefits:**
- **Testable Business Logic**: Domain layer runs without React/JSDOM
- **Type-Safe State Transitions**: Compile-time validation of workflow rules
- **Extensible Architecture**: Easy to add new policies and features
- **Maintainable Codebase**: Clear separation of concerns

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

## Understanding the Design & Contributing

### 📋 Active PRD: Clean Architecture Refactoring

The current development work is guided by **[PRD: Clean Architecture Refactoring](docs/project/PRD/active/PRD-refactoring-clean-architecture.md)**, which contains:

- **Complete milestone breakdown** (M0-M9) with specific deliverables
- **Domain rules extracted from existing code** (stage transitions, worker output, WIP limits)
- **Acceptance criteria for each milestone**
- **Architecture target state** with folder structure
- **Success criteria and verification methods**

### 🗺️ How to Contribute Your Way

1. **Start with the PRD**: Read the [Clean Architecture PRD](docs/project/PRD/active/PRD-refactoring-clean-architecture.md) to understand the current milestone progress and upcoming tasks.

2. **Understand Domain Rules**: The PRD Appendix A documents all current business rules extracted from App.tsx. These are the "golden rules" that must be preserved during refactoring.

3. **Check Current Status**: See the milestone table above for what's complete vs. in-progress. Most work is currently in M3-M5 (services and use cases).

4. **Follow TDD**: All domain work uses Test-Driven Development. Write failing tests first, then implement to make them pass.

5. **Use Golden Master Tests**: The `src/__golden-master__/` tests are your safety net. If they break, you've introduced a regression.

### 🎯 Current Priority Areas

| Area | Status | Next Actions |
|------|--------|--------------|
| **Domain Services** | M2 Complete, M3-M4 Needed | Extract WIP enforcement, worker output calculation |
| **Use Cases** | M5 Planned | Create AdvanceDayUseCase, MoveCardUseCase, AssignWorkerUseCase |
| **Infrastructure** | M6 Planned | LocalStorage, JSON import/export with backward compatibility |
| **React Integration** | M7-M8 Planned | Custom hooks, component refactoring |

### 📚 Essential Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[Clean Architecture PRD](docs/project/PRD/active/PRD-refactoring-clean-architecture.md)** | **Primary reference** | **Always start here** |
| [Software Design Conventions](docs/conventions/software-design.md) | Design principles & patterns | Before writing domain code |
| [Testing Conventions](docs/conventions/testing.md) | How to write tests | Before writing any tests |
| [Product Vision](docs/product-vision-jtbd.md) | Jobs-to-be-Done analysis | Understanding user needs |
| [Domain Glossary](docs/architecture/domain-terminology/contextive/definitions.glossary.yml) | Ubiquitous language | When working with domain terms |

### 🔧 Development Workflow

1. **Pick a milestone deliverable** from the PRD (e.g., M3-D3.1: WipLimitEnforcer.canMoveIn())
2. **Write failing tests first** following TDD red-green-refactor cycle
3. **Run golden master tests** to ensure no regressions
4. **Create PR** with clear link to PRD deliverable
5. **Verify acceptance criteria** from the PRD are met

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
