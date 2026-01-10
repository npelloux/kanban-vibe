# Codebase Structure

This standard defines the monorepo layout and organizational principles for the codebase. It enforces feature-first organization, proper layering, and domain-meaningful folder structures. Apps are deployable units while packages are shared dependencies.

## Rules

* Organize code feature-first, then by architectural layer. Group by business capability before grouping by technical layer.
* Never use generic folder names. Every folder must have domain meaning. Forbidden names include: utils/, helpers/, common/, shared/, core/, lib/.
* Ensure dependencies point inward. Domain depends on nothing, application depends on domain, infra depends on application and domain.
* Organize files by usage, not by type. Files that are used together should live together. Co-locate related code within features.
* Use package names for cross-project imports. Import from @living-architecture/[pkg-name], not relative paths like ../../packages/[pkg-name].
* Add workspace dependencies explicitly. When importing from another project, add the dependency to package.json with workspace:* version.
