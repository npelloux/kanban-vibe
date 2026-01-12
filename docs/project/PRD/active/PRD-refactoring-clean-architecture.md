# PRD: Clean Architecture Refactoring

**Status:** Approved

## 1. Problem

### What

The Kanban-Vibe codebase was created through "vibe coding" with Cline, resulting in a functional but poorly structured application. The main pain points are:

- **Monolithic App.tsx** (1300+ lines): Contains domain logic, UI state management, business rules, and presentation all mixed together
- **No separation of concerns**: Domain concepts (Card, Worker, WIP limits, stage transitions) are embedded in React components
- **Duplicated logic**: The `stagedone()` function, worker assignment logic, and WIP limit checking are duplicated between manual mode and policy execution
- **Primitive obsession**: Stages are strings (`'red-active'`, `'options'`), work items use loose object shapes
- **Hidden domain concepts**: Business rules like "workers specialized in a color produce 3-6 units, others produce 0-3" are buried in `handleNextDay()`
- **No test coverage for domain logic**: Only UI component tests exist
- **Impossible to extend**: Adding new policies or simulation behaviors requires modifying the monolithic App component

### Who

- **Development team**: Cannot safely add features without risk of regression
- **Future contributors**: Face a steep learning curve understanding implicit business rules
- **Product owner**: Feature requests take longer than expected due to code coupling

### Why It Matters

The project has reached a "complexity wall" - the current architecture makes it:
1. **Risky** to modify (no domain tests, coupled code)
2. **Slow** to extend (must understand 1300 lines before making changes)
3. **Impossible** to enforce conventions (no clear boundaries to apply patterns to)

Without this refactoring, future development will continue to accumulate tech debt, and the codebase will become increasingly unmaintainable.

## 2. Design Principles

### What We're Optimizing For

1. **Domain-first design**: Extract domain concepts (Card, Worker, Board, WIP Policy) into pure TypeScript with no framework dependencies. The domain should be testable without React.

2. **Test-driven development (TDD)**: All domain logic must be developed with failing tests first. Red-Green-Refactor cycle enforced.

3. **Acceptance test-driven development (ATDD)**: Each user-facing behavior documented as acceptance criteria before implementation.

4. **Convention compliance**: Apply existing documented conventions (Object Calisthenics, fail-fast, type-safety, Zod for validation, no `any`/`as`).

5. **Incremental refactoring**: The application must remain functional throughout. No "big bang" rewrites.

### Trade-offs We're Making

| Choosing | Over | Why |
|----------|------|-----|
| Domain purity | Convenience | Pure domain enables testing without UI framework |
| Explicit types | Flexibility | Discriminated unions prevent invalid states |
| Small focused modules | Fewer files | 150-line max per file keeps code comprehensible |
| Immutable operations | Mutation | Easier to reason about, enables undo/redo |
| Fail-fast validation | Silent fallbacks | Bugs surface immediately during development |

### Trade-offs We're NOT Making

- **Not sacrificing UX for architecture**: The user experience must remain unchanged
- **Not gold-plating**: We refactor what's needed for current features, not hypothetical future needs

## 3. What We're Building

### Target Folder Structure

```
src/
├── simulation/                    # Feature: Kanban Simulation
│   ├── domain/                    # Pure TypeScript, no dependencies
│   │   ├── card/
│   │   │   ├── card.ts            # Card value object
│   │   │   ├── card.spec.ts
│   │   │   ├── card-id.ts         # CardId branded type
│   │   │   └── work-items.ts      # WorkItems value object
│   │   ├── worker/
│   │   │   ├── worker.ts          # Worker value object
│   │   │   ├── worker.spec.ts
│   │   │   ├── worker-type.ts     # WorkerType (red | blue | green)
│   │   │   └── worker-output.ts   # WorkerOutputCalculator
│   │   ├── stage/
│   │   │   ├── stage.ts           # Stage discriminated union
│   │   │   ├── stage-transition.ts # StageTransitionService
│   │   │   └── stage-transition.spec.ts
│   │   ├── wip/
│   │   │   ├── wip-limits.ts      # WipLimits value object
│   │   │   ├── wip-enforcer.ts    # WipLimitEnforcer service
│   │   │   └── wip-enforcer.spec.ts
│   │   └── board/
│   │       ├── board.ts           # Board aggregate (cards + workers)
│   │       └── board.spec.ts
│   ├── application/               # Use cases, orchestration
│   │   ├── advance-day.ts         # AdvanceDayUseCase
│   │   ├── advance-day.spec.ts
│   │   ├── move-card.ts
│   │   ├── assign-worker.ts
│   │   └── run-policy.ts          # Policy execution
│   ├── infra/                     # External concerns
│   │   ├── state-repository.ts    # LocalStorage persistence
│   │   └── json-export.ts
│   └── api/                       # React integration
│       ├── use-kanban-board.ts    # Main hook
│       ├── use-simulation.ts
│       └── use-workers.ts
├── components/                    # Pure presentational components
│   └── (existing components, refactored)
├── App.tsx                        # Composition root only (<100 lines)
└── main.tsx
```

### Domain Layer

**Domain Entities (Value Objects):**

| Entity | Properties | Behavior |
|--------|------------|----------|
| `Card` | id, content, stage, age, workItems, isBlocked, startDay, completionDay, assignedWorkers (max 3) | Immutable, created via factory |
| `CardId` | Branded string (A, B, C... AA, AB...) | Validated on creation |
| `Worker` | id, type (WorkerType) | Immutable |
| `WorkerType` | `'red' \| 'blue' \| 'green'` | Literal union |
| `WorkItems` | `{ red: WorkProgress, blue: WorkProgress, green: WorkProgress }` | Tracks total/completed per color |
| `Stage` | Discriminated union: `Options \| RedActive \| RedFinished \| BlueActive \| BlueFinished \| Green \| Done` | Type-safe transitions |
| `WipLimits` | Per-column min/max constraints | Validated via Zod |

**Domain Services:**

| Service | Responsibility | Key Rules |
|---------|---------------|-----------|
| `StageTransitionService.canTransition(card)` | Determines if card can move to next stage | Red-active requires red work complete; Blue-active requires blue AND red complete; Green requires all colors complete; Blocked cards cannot transition |
| `StageTransitionService.nextStage(stage)` | Returns the next stage in sequence | options → red-active → red-finished → blue-active → blue-finished → green → done |
| `WorkerOutputCalculator.calculate(worker, columnColor, randomSeed?)` | Calculates work units produced | Specialized worker: 3-6 units; Non-specialized: 0-3 units |
| `WipLimitEnforcer.canMoveIn(column, currentCount, limits)` | Validates max WIP | Returns false if currentCount >= max (when max > 0) |
| `WipLimitEnforcer.canMoveOut(column, currentCount, limits)` | Validates min WIP | Returns false if currentCount <= min (when min > 0) |
| `CardAgingService.ageCards(cards, day)` | Increment age for non-options, non-done cards | Options and Done cards don't age |
| `CardFactory.create(content, currentDay, randomSeed?)` | Creates card with random work items | Red: 1-8, Blue: 1-8, Green: 1-8 |

**Domain Events (for logging/debugging initially, NOT event sourcing):**
- `CardCreated`
- `CardMovedToStage`
- `WorkCompleted`
- `DayAdvanced`
- `WorkerAssignedToCard`
- `WorkerRemovedFromCard`
- `WipLimitViolationPrevented`

### Application Layer

**Use Cases:**

| Use Case | Input | Output | Steps |
|----------|-------|--------|-------|
| `AdvanceDayUseCase` | board, wipLimits | updatedBoard, events | 1. Age all cards 2. Apply worker output 3. Transition ready cards 4. Reset worker assignments |
| `MoveCardUseCase` | board, cardId, targetStage, wipLimits | updatedBoard OR error | 1. Validate WIP limits 2. Move card 3. Update startDay if entering red-active |
| `AssignWorkerUseCase` | board, workerId, cardId | updatedBoard OR error | 1. Validate card is in active stage 2. Validate worker limit (max 3) 3. Assign worker |
| `RunPolicyUseCase` | board, policyType, days, wipLimits | generator yielding (board, day) | Yields after each day for UI updates |

### Infrastructure Layer

**Adapters:**
- `LocalStorageStateRepository` - Persist/load state (backward-compatible JSON format)
- `JsonFileExporter` - Download state as JSON file
- `JsonFileImporter` - Load state from uploaded JSON file

**JSON Format Compatibility:**
The refactored domain must serialize to the same JSON structure as current implementation to preserve existing saved states.

### Presentation Layer (React)

**Hooks:**
- `useKanbanBoard()` - Returns board state and mutation functions
- `useSimulationControls()` - Day advancement, policy execution with progress
- `useWorkerManagement()` - Add/delete workers

**Component Changes:**
- Components become pure presentational (receive domain objects as props)
- Remove business logic from `Card`, `Column`, `WorkerPool`
- Event handlers call hook functions, not inline logic

### Documentation Updates

- **Domain glossary**: Populate `definitions.glossary.yml` with all domain terms (Card, Worker, Stage, WIP Limit, WorkItems, Board, Policy)
- **Architecture overview**: Update `docs/architecture/overview.md` with the new folder structure
- **Documentation cleanup**: Review all docs for coherence; remove references to "riviere" or "living-architecture" projects

## 4. What We're NOT Building

- **New features**: This is refactoring only (bug fixes discovered during refactoring ARE in scope).
- **Backend/API**: Remains a client-side SPA.
- **Multi-user collaboration**: Out of scope.
- **Database persistence**: LocalStorage only.
- **Performance optimizations**: Unless directly related to architecture.
- **UI redesign**: Visual appearance unchanged.
- **New policies**: Only refactor existing "siloted-expert" policy.
- **Event sourcing**: Domain events are for logging only, not state reconstruction.
- **Undo/redo functionality**: Out of scope (architecture enables it for future).
- **Error handling improvements**: No new error boundaries or user-facing error messages.
- **Developer tooling**: No debug modes, state inspectors, or documentation generation.
- **Accessibility improvements**: Out of scope unless broken during refactor.
- **Build/bundling changes**: Keep existing Vite setup.

## 5. Success Criteria

### Quantitative

| Criterion | Measurement | Threshold |
|-----------|-------------|-----------|
| Domain test coverage | Every domain service has at least one test file with passing tests | 100% of services listed in Section 3 |
| Domain line coverage | Istanbul/nyc coverage report | >= 80% line coverage for `src/simulation/domain/` |
| File size | Line count per file | No file exceeds 150 lines (exception: test files with many cases) |
| App.tsx size | Line count | < 100 lines |
| Type safety | TypeScript strict mode + ESLint `@typescript-eslint/no-explicit-any` | Zero violations |
| No `as` assertions | ESLint rule or manual review | Zero `as` (except `as const`) |

### Qualitative

- **Domain logic testable without React**: `npm test -- --testPathPattern=domain` runs without JSDOM
- **Adding a new policy**: Verified by documentation showing how to add a policy without touching components
- **Behavior preservation**: All existing component tests pass; manual smoke test checklist passes

### Verification

- All tests pass in CI (GitHub Actions)
- Manual smoke test of documented user flows (see Acceptance Criteria appendix)
- Code review against convention checklist

## 6. Open Questions

1. ~~**State management approach**~~: **DECIDED** - Custom hooks + Context. No external state library. Migrate to Zustand only if performance issues arise.

2. ~~**Existing test migration**~~: **DECIDED** - Keep existing component tests as integration tests. Add new domain unit tests. Together they provide global functional coverage. Do not delete working tests.

3. ~~**Glossary update**~~: **DECIDED** - Yes, initiate and complete the glossary (`definitions.glossary.yml`) as part of this PRD. Define domain terms: Card, Worker, Stage, WIP Limit, WorkItems, etc.

4. ~~**Incremental delivery**~~: **DECIDED** - Merge milestone by milestone. Each milestone leaves the app functional. Smaller PRs are easier to review.

5. ~~**Bug discovery during refactoring**~~: **DECIDED** - Document AND fix bugs discovered during refactoring. This is a deviation from pure "behavior preservation" but ensures we don't carry forward known defects.

6. ~~**Documentation coherence**~~: **DECIDED** - Review all documentation for coherence with current stack and project. Remove any references to "riviere" or "living-architecture" projects (remnants from templates/other projects).

---

## 7. Milestones

### M0: Golden master test suite captures current behavior

Before any refactoring, create a characterization test suite that captures the exact current behavior of the application. This serves as a safety net - if any golden master test fails after refactoring, we've introduced a regression.

#### Deliverables

- **D0.1: Golden master for stage transitions**
  - Create `src/__golden-master__/stage-transitions.golden.spec.ts`
  - Test current `stagedone()` behavior with all stage/work-item combinations
  - Capture: which cards transition, which don't, for every stage
  - Key scenarios from Appendix A stage transition table
  - Verification: Tests pass against current App.tsx implementation

- **D0.2: Golden master for worker output**
  - Create `src/__golden-master__/worker-output.golden.spec.ts`
  - Test worker output calculation with seeded random (mock Math.random)
  - Capture: specialized worker output range (3-6), non-specialized range (0-3)
  - Verification: Tests pass against current implementation

- **D0.3: Golden master for WIP limit enforcement**
  - Create `src/__golden-master__/wip-limits.golden.spec.ts`
  - Test `wouldExceedWipLimit()` and `wouldViolateMinWipLimit()` behavior
  - Capture: boundary conditions (at limit, below limit, above limit, zero = no constraint)
  - Verification: Tests pass against current implementation

- **D0.4: Golden master for day advancement**
  - Create `src/__golden-master__/advance-day.golden.spec.ts`
  - Test full `handleNextDay()` behavior with various board states
  - Capture: card aging, worker output application, automatic transitions, worker reset
  - Use snapshot testing for complex state transformations
  - Verification: Tests pass against current implementation

- **D0.5: Golden master for card movement**
  - Create `src/__golden-master__/card-movement.golden.spec.ts`
  - Test `handleCardClick()` behavior for all clickable stages
  - Capture: options→red-active, red-finished→blue-active, blue-finished→green
  - Include WIP limit blocking scenarios
  - Verification: Tests pass against current implementation

- **D0.6: Golden master for policy execution**
  - Create `src/__golden-master__/policy-execution.golden.spec.ts`
  - Test `executePolicyDay()` for siloted-expert policy
  - Capture: card movement from options, finished→next stage, worker assignment logic
  - Use seeded random for deterministic output
  - Verification: Tests pass against current implementation

- **D0.7: Golden master for state serialization**
  - Create `src/__golden-master__/serialization.golden.spec.ts`
  - Test `handleSaveContext()` and `handleImportContext()` round-trip
  - Capture: JSON structure, all fields preserved
  - Include sample saved state files as fixtures
  - Verification: Tests pass, round-trip preserves all data

#### Golden Master Usage

After M0 is complete:
1. Run golden master suite before each refactoring PR
2. If a test fails, either:
   - The refactoring introduced a regression (fix it)
   - The test captured a bug we're intentionally fixing (update the test with new expected behavior and document the bug fix)
3. Golden master tests remain in codebase until M9 completion, then can be archived or converted to regular tests

---

### M1: Domain types are testable independently

The foundational domain value objects and types exist as pure TypeScript, with tests that run without React/JSDOM. The glossary defines all domain terms.

#### Deliverables

- **D1.1: Stage discriminated union**
  - Create `src/simulation/domain/stage/stage.ts`
  - Type-safe stage representation replacing string literals
  - Key scenarios: all 7 stages represented, type narrowing works in switch statements
  - Acceptance criteria: `Stage` type exists with `Options | RedActive | RedFinished | BlueActive | BlueFinished | Green | Done`
  - Verification: TypeScript compiles, unit tests pass

- **D1.2: WorkerType and Worker value object**
  - Create `src/simulation/domain/worker/worker-type.ts` and `worker.ts`
  - Key scenarios: create worker with valid type, immutable
  - Acceptance criteria: `WorkerType = 'red' | 'blue' | 'green'`, Worker has id + type
  - Verification: Unit tests pass

- **D1.3: WorkItems value object**
  - Create `src/simulation/domain/card/work-items.ts`
  - Key scenarios: create work items, track progress per color, check completion
  - Acceptance criteria: typed structure for red/blue/green with total/completed
  - Verification: Unit tests pass

- **D1.4: Card value object**
  - Create `src/simulation/domain/card/card.ts` and `card-id.ts`
  - Key scenarios: create card with all properties, immutable updates, CardId validation (A-Z, AA-ZZ sequence)
  - Acceptance criteria: Card has id, content, stage, age, workItems, isBlocked, startDay, completionDay, assignedWorkers
  - Verification: Unit tests pass

- **D1.5: WipLimits value object with Zod validation**
  - Create `src/simulation/domain/wip/wip-limits.ts`
  - Key scenarios: valid limits, min <= max validation, zero means no constraint
  - Acceptance criteria: Zod schema validates limits, type inferred from schema
  - Verification: Unit tests including invalid input rejection

- **D1.6: Board aggregate**
  - Create `src/simulation/domain/board/board.ts`
  - Combines: cards collection, workers collection, currentDay, wipLimits
  - Key scenarios: create board, add/remove cards, add/remove workers
  - Acceptance criteria: Immutable aggregate with helper methods for querying cards by stage
  - Verification: Unit tests pass

- **D1.7: Domain glossary populated**
  - Update `docs/architecture/domain-terminology/contextive/definitions.glossary.yml`
  - Terms: Card, Worker, WorkerType, Stage, WorkItems, WipLimits, Board
  - Verification: File contains all terms with definitions

---

### M2: Stage transitions work via domain service

The core `stagedone()` logic is extracted to a domain service with comprehensive tests. The duplicated logic in `handleNextDay()` and `executePolicyDay()` can be replaced with a single service.

#### Deliverables

- **D2.1: StageTransitionService.canTransition()**
  - Create `src/simulation/domain/stage/stage-transition.ts`
  - Key scenarios:
    - Red-active card with completed red work → can transition
    - Red-active card with incomplete red work → cannot transition
    - Blue-active card requires BOTH red and blue complete
    - Green card requires ALL colors complete
    - Blocked card → never transitions regardless of work completion
  - Edge cases: zero total work items, exactly at threshold
  - Acceptance criteria: Service returns boolean matching current `stagedone()` behavior
  - Verification: Unit tests cover all stage/completion combinations from Appendix A

- **D2.2: StageTransitionService.nextStage()**
  - Returns the next stage in the pipeline
  - Key scenarios: each stage maps to correct next stage, done has no next stage
  - Acceptance criteria: options→red-active→red-finished→blue-active→blue-finished→green→done
  - Verification: Unit tests for all transitions

- **D2.3: CardAgingService**
  - Create `src/simulation/domain/card/card-aging.ts`
  - Key scenarios:
    - Cards in options don't age
    - Cards in done don't age
    - Cards in active/finished stages age +1
  - Acceptance criteria: Returns new card instances with updated age
  - Verification: Unit tests cover all stage aging rules

---

### M3: WIP limits enforced via domain service

WIP limit checking extracted from App.tsx closures to a testable domain service.

#### Deliverables

- **D3.1: WipLimitEnforcer.canMoveIn()**
  - Create `src/simulation/domain/wip/wip-enforcer.ts`
  - Key scenarios:
    - Column at max capacity → cannot move in
    - Column below max → can move in
    - Max of 0 → no constraint (always allowed)
  - Acceptance criteria: Matches current `wouldExceedWipLimit()` behavior
  - Verification: Unit tests for boundary conditions

- **D3.2: WipLimitEnforcer.canMoveOut()**
  - Key scenarios:
    - Column at min capacity → cannot move out
    - Column above min → can move out
    - Min of 0 → no constraint (always allowed)
  - Acceptance criteria: Matches current `wouldViolateMinWipLimit()` behavior
  - Verification: Unit tests for boundary conditions

---

### M4: Worker output calculated via domain service

Worker output logic extracted with injectable randomness for testability.

#### Deliverables

- **D4.1: WorkerOutputCalculator**
  - Create `src/simulation/domain/worker/worker-output.ts`
  - Key scenarios:
    - Red worker on red column → 3-6 units
    - Red worker on blue column → 0-3 units
    - Same rules for blue and green workers
  - Acceptance criteria: Accepts optional random seed for deterministic testing
  - Verification: Unit tests with seeded random verify output ranges

- **D4.2: CardFactory with random work items**
  - Create `src/simulation/domain/card/card-factory.ts`
  - Key scenarios: Create card with random work items (1-8 per color), sequential ID generation
  - Acceptance criteria: Accepts optional seed, generates valid cards
  - Verification: Unit tests verify work item ranges

---

### M5: Application use cases orchestrate domain logic

Use cases replace the tangled logic in `handleNextDay()` and `executePolicyDay()`.

#### Deliverables

- **D5.1: AdvanceDayUseCase**
  - Create `src/simulation/application/advance-day.ts`
  - Steps: 1) Age cards 2) Apply worker output 3) Transition ready cards 4) Reset assignments
  - Key scenarios:
    - Day advances, cards age appropriately
    - Workers produce output, work items update
    - Cards meeting transition criteria move (respecting WIP)
    - Worker assignments cleared at end
  - Acceptance criteria: Pure function, no React dependencies, returns new board state
  - Verification: Integration tests with domain services

- **D5.2: MoveCardUseCase**
  - Create `src/simulation/application/move-card.ts`
  - Key scenarios:
    - Move from options to red-active (updates startDay)
    - Move blocked by WIP max → returns error
    - Move blocked by WIP min → returns error
  - Acceptance criteria: Returns Result type (success or error)
  - Verification: Unit tests for success and failure paths

- **D5.3: AssignWorkerUseCase**
  - Create `src/simulation/application/assign-worker.ts`
  - Key scenarios:
    - Assign to active column card → success
    - Assign to non-active column → error
    - Assign when card has 3 workers → error
    - Reassign removes from previous card
  - Acceptance criteria: Returns Result type
  - Verification: Unit tests

- **D5.4: RunPolicyUseCase (siloted-expert)**
  - Create `src/simulation/application/run-policy.ts`
  - Key scenarios:
    - Executes N days of simulation
    - Yields after each day for UI progress updates
    - Can be cancelled mid-run
  - Acceptance criteria: Generator function yielding (board, day) tuples
  - Verification: Integration tests verify multi-day execution

---

### M6: Infrastructure adapters preserve compatibility

State persistence refactored to use domain types while maintaining JSON compatibility. **Must complete before UI refactoring to ensure serialization works.**

#### Deliverables

- **D6.1: LocalStorageStateRepository**
  - Create `src/simulation/infra/state-repository.ts`
  - Key scenarios: save board state, load board state, handle missing/corrupt data (return default board)
  - Acceptance criteria: Existing saved JSON files load correctly after refactor; uses Zod schemas for validation
  - Verification: Integration test with real localStorage

- **D6.2: JsonFileExporter and JsonFileImporter**
  - Create `src/simulation/infra/json-export.ts`
  - Key scenarios: export to file, import from file, validate on import with Zod
  - Acceptance criteria: Round-trip export/import preserves all data
  - Verification: Integration tests

---

### M7: React hooks connect UI to domain

Custom hooks provide React components access to domain operations via Context. Uses infrastructure adapters from M6.

#### Deliverables

- **D7.1: Board context and provider**
  - Create `src/simulation/api/board-context.ts`
  - React Context + Provider component that wraps app
  - Acceptance criteria: Context provides board state and is updatable
  - Verification: Unit tests

- **D7.2: useKanbanBoard hook**
  - Create `src/simulation/api/use-kanban-board.ts`
  - Provides: board state, moveCard, assignWorker, addCard, toggleBlock
  - Acceptance criteria: Components can read board state and call mutations
  - Verification: Hook tests with React Testing Library

- **D7.3: useSimulationControls hook**
  - Create `src/simulation/api/use-simulation.ts`
  - Provides: currentDay, advanceDay, runPolicy, cancelPolicy, policyProgress
  - Note: Cancellation uses AbortController pattern (existing behavior)
  - Acceptance criteria: Day advancement and policy execution work through hook
  - Verification: Hook tests

- **D7.4: useWorkerManagement hook**
  - Create `src/simulation/api/use-workers.ts`
  - Provides: workers, addWorker, deleteWorker, selectedWorkerId, selectWorker
  - Acceptance criteria: Worker CRUD operations work through hook
  - Verification: Hook tests

---

### M8: Components are pure presentational

Business logic removed from React components. App.tsx becomes a thin composition root. **Refactor one component at a time to minimize breakage risk.**

#### Deliverables

- **D8.1: Refactor Card component**
  - Remove business logic, receive domain Card object as prop
  - Event handlers delegate to hook functions
  - Acceptance criteria: No domain calculations in component
  - Verification: Existing component tests pass, code review

- **D8.2: Refactor Column component**
  - Pure presentational, maps cards to Card components
  - Acceptance criteria: No filtering or business logic
  - Verification: Existing tests pass

- **D8.3: Refactor WorkerPool component**
  - Uses useWorkerManagement hook
  - Acceptance criteria: No worker state management in component
  - Verification: Existing tests pass

- **D8.4: Refactor App.tsx to composition root**
  - Provide contexts, compose layout, delegate to hooks
  - Acceptance criteria: < 100 lines, no business logic
  - Verification: Line count, code review

- **D8.5: Remove duplicated logic from App.tsx**
  - Delete `stagedone()`, `handleNextDay()` inline logic, `executePolicyDay()` duplication
  - All logic now flows through use cases
  - Acceptance criteria: App.tsx contains only React composition
  - Verification: Code review, all smoke tests pass

---

### M9: Full integration verified

All pieces connected, smoke tests pass, ready for production.

#### Deliverables

- **D9.1: All smoke tests pass**
  - Run through Appendix B acceptance criteria manually
  - Document any bugs found and fixed
  - Acceptance criteria: All 9 user flows work correctly
  - Verification: Manual testing checklist signed off

- **D9.2: CI passes with coverage thresholds**
  - Domain coverage >= 80%
  - All existing component tests pass
  - No TypeScript errors, no ESLint violations
  - Verification: GitHub Actions green

- **D9.3: Documentation cleanup**
  - Review all docs in `docs/` folder
  - Remove references to "riviere" or "living-architecture"
  - Update `docs/architecture/overview.md` with final folder structure
  - Update codebase-structure.md to reflect React/TypeScript (currently shows Java examples)
  - Verification: No stale references remain, architecture docs reflect reality

- **D9.4: Architecture documentation complete**
  - Glossary complete with all domain terms
  - Architecture overview accurate
  - Verification: Documentation review

---

## Appendix A: Current Domain Rules (Extracted from App.tsx)

### Stage Transition Rules (`stagedone()`)

| Current Stage | Condition to Transition | Next Stage |
|---------------|------------------------|------------|
| options | (manual click only, no `stagedone` check) | red-active |
| red-active | red.completed >= red.total AND not blocked | red-finished |
| red-finished | red.completed >= red.total AND not blocked | blue-active |
| blue-active | blue.completed >= blue.total AND red.completed >= red.total AND not blocked | blue-finished |
| blue-finished | blue.completed >= blue.total AND red.completed >= red.total AND not blocked | green |
| green | green.completed >= green.total AND red.completed >= red.total AND blue.completed >= blue.total AND not blocked | done |

### Worker Output Rules

| Worker Type | Working in Matching Color | Working in Non-Matching Color |
|-------------|--------------------------|------------------------------|
| red | 3-6 work units | 0-3 work units |
| blue | 3-6 work units | 0-3 work units |
| green | 3-6 work units | 0-3 work units |

### Card Aging Rules

| Card Location | Aging Behavior |
|---------------|----------------|
| options | Does not age |
| red-active, red-finished, blue-active, blue-finished, green | Ages +1 per day |
| done | Does not age (frozen at completion) |

### Worker Assignment Rules

- Maximum 3 workers per card
- Workers can only be assigned to cards in active columns (red-active, blue-active, green)
- All worker assignments reset at end of day

### WIP Limit Rules

- Max WIP of 0 means no constraint
- Min WIP of 0 means no constraint
- Cannot move card INTO column if count >= max
- Cannot move card OUT OF column if count <= min

---

## Appendix B: Acceptance Criteria for Smoke Testing

### Core User Flows

1. **Add a new card to Options**
   - Click "+ New" in Options column
   - Card appears with random title, random work items (1-8 each color)
   - Card has ID in sequence (A, B, C...)

2. **Move card from Options to Red Active**
   - Click card in Options
   - Card moves to Red Active
   - Card's startDay updates to current day

3. **Assign worker to card**
   - Drag worker from pool to card in active column
   - Worker appears on card
   - Worker removed from previous card if reassigned

4. **Advance day with worker output**
   - Assign red worker to red-active card
   - Click "Next Day"
   - Red work progress increases by 3-6
   - Card ages by 1 day
   - Worker assignment resets

5. **Card transitions automatically when work complete**
   - Card with completed red work in red-active
   - Click "Next Day"
   - Card moves to red-finished

6. **Block prevents transition**
   - Toggle block on card
   - Even if work complete, card does not move on Next Day

7. **WIP limit prevents movement**
   - Set max WIP of 1 on red-active
   - Have 1 card in red-active
   - Try to move another card from options
   - Movement prevented with alert

8. **Policy execution**
   - Click "Run Policy" with "siloted-expert" for 10 days
   - Simulation runs automatically
   - Progress indicator shows current day
   - Can cancel mid-run

9. **Save and load context**
   - Add cards, assign workers, advance days
   - Click Save Context
   - JSON file downloads
   - Refresh page
   - Click Import Context
   - Select saved file
   - State restores exactly

