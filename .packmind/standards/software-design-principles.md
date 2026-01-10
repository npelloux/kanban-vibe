# Software Design Principles

This standard defines core software design principles including fail-fast error handling, type safety, dependency injection, immutability, and intention-revealing naming. These principles apply when writing new code, refactoring, and during code reviews. The philosophy emphasizes clarity over cleverness, explicit over implicit, and loose coupling over tight integration.

## Rules

* Use fail-fast over silent fallbacks. Never use fallback chains that hide missing data. Validate and throw clear errors instead.
* Strive for maximum type-safety. No any type, no as type assertions (except as const). There is always a type-safe solution.
* Make illegal states unrepresentable. Use discriminated unions, not optional fields. If a state combination should not exist, make the type system forbid it.
* Inject dependencies, do not instantiate. No new SomeService() inside methods. Pass dependencies through constructors.
* Use intention-revealing names only. Never use data, utils, helpers, handler, processor. Name things for what they do in the domain.
* Write no code comments. Comments are a failure to express intent in code. If you need a comment to explain what code does, refactor the code to be clearer.
* Use Zod for runtime validation of external data, API responses, and user input. Type inference from schemas keeps types and validation in sync.
* Prefer immutability. Default to returning new values instead of mutating inputs. Use const, spread operators, and map/filter/reduce.
* Apply YAGNI - do not build features until they are actually needed. Speculative code is waste. Build the simplest thing that works.
* Avoid feature envy. When a method uses another class's data more than its own, move the logic to that class.
* Keep entities small. Classes should be under 150 lines, methods under 10 lines. Limit indentation to maximum 3 levels. Use early returns instead of else.
* Avoid getters and setters on entities. Tell, do not ask. Objects should do work, not expose data.
