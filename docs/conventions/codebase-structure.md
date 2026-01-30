# Codebase Structure

## Project Layout

```text
kanban-vibe/
├── src/
│   ├── simulation/           # Feature module
│   │   ├── domain/           # Pure TypeScript domain logic
│   │   │   ├── card/         # Card aggregate
│   │   │   ├── worker/       # Worker value object
│   │   │   ├── board/        # Board aggregate root
│   │   │   ├── stage/        # Stage value object
│   │   │   └── wip/          # WIP limits
│   │   ├── application/      # Use cases
│   │   ├── infra/            # Infrastructure adapters
│   │   └── api/              # React hooks
│   ├── components/           # Presentational React components
│   ├── App.tsx               # Composition root
│   └── main.tsx              # Application entry point
├── docs/                     # Documentation
└── package.json              # Project definition
```

## Principles

**Apps vs Packages.** Apps are deployable units (APIs, CLIs, workers). Packages are shared code published as dependencies and consumed by apps or other packages.

**Feature-first, layer-second.** Within each app, group by business capability, then by architectural layer.

**Dependencies point inward.** Domain depends on nothing. Application depends on domain. Infra depends on application and domain.

**No generic folders.** Every folder has domain meaning. Forbidden: `utils/`, `helpers/`, `common/`, `shared/`, `core/`, `lib/`.

**Organize by usage, not by type.** Files that are used together should live together. Avoid grouping by category (types/, models/, assertions/, validators/). Instead, co-locate related code within features or individual units.

❌ **Avoid:**
```text
feature/
├── types/
│   ├── user.ts
│   └── order.ts
├── validators/
│   ├── user-validator.ts
│   └── order-validator.ts
└── services/
    ├── user-service.ts
    └── order-service.ts
```

✅ **Prefer:**
```text
feature/
├── user/
│   ├── user.ts           # type + validator + service together
│   └── user.spec.ts
└── order/
    ├── order.ts
    └── order.spec.ts
```

**Priority:** Feature boundaries → Individual units → Type grouping (last resort)

**Exception:** Shared test fixtures used across multiple test files may be grouped (e.g., `test-fixtures.ts`).

**Use absolute imports from src/.** Configure path aliases in tsconfig.json for cleaner imports (e.g., `import { Card } from '@/simulation/domain/card'`).

## Layer Responsibilities

| Layer | Contains | Depends On |
|-------|----------|------------|
| domain | Entities, value objects, domain services, domain events | Nothing |
| application | Use cases, application services, DTOs | domain |
| infra | Repositories, external clients, framework adapters | domain, application |
| api | Controllers, routes, request/response mapping | application |
