# Codebase Structure

## Monorepo Layout

```text
<$project-title>/
├── apps/                   # Deployable applications
│   └── <app-name>/
│       ├── src/			# Java source folder
│       │   ├── <feature>/
│       │   │   ├── domain/       # Domain model only
│       │   │   ├── application/  # Use cases
│       │   │   ├── infra/        # Database, external services
│       │   │   └── api/          # Controllers, endpoints
│       │   └── main.java         # Application entry point
│       ├── test/			# Tests source folder
│       │   ├── <feature>/
│       │   │   ├── domain/       # Domain model only
│       │   │   ├── application/  # Use cases
│       │   │   ├── infra/        # Database, external services
│       │   │   └── api/          # Controllers, endpoints
│       │   └── main-test.java    # Tests entry point
├── docs/                    	# Documentation
└── ___      					# Workspace definition
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
│   ├── user.java
│   └── order.java
├── validators/
│   ├── user-validator.java
│   └── order-validator.java
└── services/
    ├── user-service.java
    └── order-service.java
```

✅ **Prefer:**
```text
feature/
├── user/
│   ├── user.java           # type + validator + service together
│   └── user.test.java
└── order/
    ├── order.java
    └── order.test.java
```

**Priority:** Feature boundaries → Individual units → Type grouping (last resort)

**Exception:** Shared test fixtures used across multiple test files may be grouped (e.g., `test-fixtures.java`).

**Cross-project imports use package names.** Import from `@living-architecture/[pkg-name]`, not relative paths like `../../packages/[pkg-name]`.

**Add workspace dependencies explicitly.** When importing from another project, add `"@living-architecture/[pkg-name]": "workspace:*"` to package.json.

## Layer Responsibilities

| Layer | Contains | Depends On |
|-------|----------|------------|
| domain | Entities, value objects, domain services, domain events | Nothing |
| application | Use cases, application services, DTOs | domain |
| infra | Repositories, external clients, framework adapters | domain, application |
| api | Controllers, routes, request/response mapping | application |
