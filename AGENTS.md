<!-- start: Packmind standards -->
# Packmind Standards

Before starting your work, make sure to review the coding standards relevant to your current task.

Always consult the sections that apply to the technology, framework, or type of contribution you are working on.

All rules and guidelines defined in these standards are mandatory and must be followed consistently.

Failure to follow these standards may lead to inconsistencies, errors, or rework. Treat them as the source of truth for how code should be written, structured, and maintained.

## Standard: Testing doctrine

Adopt a global ATDD and TDD double-loop testing approach to align features with business requirements while continuously driving design through executable tests. :
* No rules defined yet.

Full standard is available here for further request: [Testing doctrine](.packmind/standards/testing-doctrine.md)

## Standard: Design & dev workflow

Define a design and development workflow in **/*.specs.md using ATDD and TDD double-loop practices, job-to-be-done for product vision, and the kite Sea Fish metaphor for task granularity to ensure focused, testable, and incrementally releasable slices. :
* Use ATDD & TDD docks double loop
* Use job to be done to initiate the product vision
* Use the kite Sea Fish métaphor to adjust the tasks description to the right level of action verb duration before coding

Full standard is available here for further request: [Design & dev workflow](.packmind/standards/design-dev-workflow.md)

## Standard: Software Design Principles

Professional software design patterns for writing maintainable, well-structured code. :
* Apply YAGNI - do not build features until they are actually needed. Speculative code is waste. Build the simplest thing that works.
* Avoid feature envy. When a method uses another class's data more than its own, move the logic to that class.
* Avoid getters and setters on entities. Tell, do not ask. Objects should do work, not expose data.
* Inject dependencies, do not instantiate. No new SomeService() inside methods. Pass dependencies through constructors.
* Keep entities small. Classes should be under 150 lines, methods under 10 lines. Limit indentation to maximum 3 levels. Use early returns instead of else.
* Make illegal states unrepresentable. Use discriminated unions, not optional fields. If a state combination should not exist, make the type system forbid it.
* Prefer immutability. Default to returning new values instead of mutating inputs. Use const, spread operators, and map/filter/reduce.
* Strive for maximum type-safety. No any type, no as type assertions (except as const). There is always a type-safe solution.
* Use fail-fast over silent fallbacks. Never use fallback chains that hide missing data. Validate and throw clear errors instead.
* Use intention-revealing names only. Never use data, utils, helpers, handler, processor. Name things for what they do in the domain.
* Use Zod for runtime validation of external data, API responses, and user input. Type inference from schemas keeps types and validation in sync.
* Write no code comments. Comments are a failure to express intent in code. If you need a comment to explain what code does, refactor the code to be clearer.

Full standard is available here for further request: [Software Design Principles](.packmind/standards/software-design-principles.md)

## Standard: Codebase Structure

Monorepo layout and organization principles for maintainable, domain-driven code structure. :
* Add workspace dependencies explicitly. When importing from another project, add the dependency to package.json with workspace:* version.
* Ensure dependencies point inward. Domain depends on nothing, application depends on domain, infra depends on application and domain.
* Never use generic folder names. Every folder must have domain meaning. Forbidden names include: utils/, helpers/, common/, shared/, core/, lib/.
* Organize code feature-first, then by architectural layer. Group by business capability before grouping by technical layer.
* Organize files by usage, not by type. Files that are used together should live together. Co-locate related code within features.
* Use package names for cross-project imports. Import from @living-architecture/[pkg-name], not relative paths like ../../packages/[pkg-name].

Full standard is available here for further request: [Codebase Structure](.packmind/standards/codebase-structure.md)
<!-- end: Packmind standards -->