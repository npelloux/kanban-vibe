# PRD: Phase 3 — Advanced Policies & Scenarios

**Status:** Proposed

**Depends on:** Phase 2 (Enhanced UX) — Undo system required for comparison mode

---

## 1. Problem

The current single policy (Siloted-Expert) limits the educational value of Kanban-Vibe:

- **No comparison** — Can't demonstrate why one approach beats another
- **Single strategy** — Real teams use different worker assignment strategies
- **No templates** — Users must manually configure every simulation
- **No scenarios** — Can't replay specific situations for teaching
- **Limited customization** — Policy behavior is hardcoded

Teams and educators need to compare strategies side-by-side to understand tradeoffs.

---

## 2. Solution

Expand the policy system with:

1. **Multiple policy types** — Different worker assignment and flow strategies
2. **Policy comparison mode** — Run same scenario with different policies
3. **Scenario templates** — Pre-configured starting states
4. **Custom policy builder** — Configure policy parameters
5. **Batch simulation** — Run multiple iterations for statistical analysis

---

## 3. Design Principles

1. **Compare, don't prescribe** — Show outcomes, let users draw conclusions
2. **Repeatable experiments** — Same inputs produce same outputs (seeded RNG)
3. **Progressive complexity** — Simple policies first, customization optional
4. **Visual comparison** — Side-by-side charts for policy outcomes

---

## 4. What We're Building

### M1: Additional Policy Types

**Deliverables:**

- **D1.1:** Generalist Policy
  - Workers assigned to ANY card needing work (not just matching color)
  - Prioritize: oldest cards first, then cards closest to completion
  - Output: Always 0-3 (no specialization bonus)
  - Acceptance: Policy completes simulation with generalist approach
  - Verification: Run policy, verify workers assigned across all colors

- **D1.2:** Bottleneck-First Policy
  - Identify bottleneck: column with most cards OR longest average age
  - Assign ALL available workers to bottleneck stage
  - Pull work to keep bottleneck fed
  - Acceptance: Policy focuses resources on constraints
  - Verification: Create bottleneck, verify workers concentrate there

- **D1.3:** Throughput-Maximizer Policy
  - Prioritize cards closest to Done (green > blue > red)
  - Focus workers on nearly-complete work items
  - Pull new work only when pipeline is clear
  - Acceptance: Policy maximizes completion rate
  - Verification: Compare throughput to siloted-expert

- **D1.4:** WIP-Minimizer Policy
  - Strict WIP limits enforcement (auto-set to 2-3 per column)
  - Stop starting new work until pipeline clears
  - Focus on flow efficiency over resource utilization
  - Acceptance: Policy maintains low WIP
  - Verification: Run policy, verify WIP stays below threshold

- **D1.5:** Policy selection UI
  - Dropdown in PolicyRunner showing all available policies
  - Policy description tooltip
  - Acceptance: Users can select any policy
  - Verification: Select each policy, verify correct execution

---

### M2: Policy Comparison Mode

**Deliverables:**

- **D2.1:** Comparison mode toggle
  - Button to enter comparison mode
  - Select 2-4 policies to compare
  - Configure: number of days, starting state
  - Acceptance: Users can set up comparison
  - Verification: Enter mode, configure comparison

- **D2.2:** Parallel simulation execution
  - Run selected policies on identical starting states
  - Use seeded random number generator for reproducibility
  - Capture results: final metrics, historical data per policy
  - Acceptance: Same seed produces same results
  - Verification: Run twice with same seed, verify identical outcomes

- **D2.3:** Comparison results view
  - Side-by-side CFD charts
  - Metrics comparison table:
    - Lead Time (avg, min, max)
    - Throughput (total, daily avg)
    - Final WIP
    - Cards completed
  - Winner highlighting per metric
  - Acceptance: Clear visual comparison of policy outcomes
  - Verification: Run comparison, verify charts and metrics display

- **D2.4:** Comparison export
  - Export results as JSON
  - Export as CSV for spreadsheet analysis
  - Export charts as PNG
  - Acceptance: Users can share/analyze results externally
  - Verification: Export, verify file contents

---

### M3: Scenario Templates

**Deliverables:**

- **D3.1:** Template system architecture
  - Template format: JSON with cards, workers, wipLimits, metadata
  - Built-in templates stored in application
  - User templates saved to localStorage
  - Acceptance: Templates can be loaded and saved
  - Verification: Load template, verify state matches

- **D3.2:** Built-in templates
  - **Balanced Team** — Equal specialists per color, moderate WIP limits
  - **Bottleneck Demo** — Many red workers, few blue, shows constraint
  - **High WIP Chaos** — No limits, many cards, demonstrates thrashing
  - **Lean Flow** — Strict WIP limits, demonstrates smooth flow
  - **Specialist Shortage** — Missing one color, shows impact
  - Acceptance: 5+ templates available out of box
  - Verification: Load each template, verify setup matches description

- **D3.3:** Template selection UI
  - Template gallery with previews
  - Search/filter by learning objective
  - Template metadata: name, description, learning goals, difficulty
  - Acceptance: Users can browse and select templates
  - Verification: Open gallery, select template, verify load

- **D3.4:** Save current state as template
  - Button to save current state as new template
  - Name and description input
  - Save to localStorage or export as file
  - Acceptance: Users can create custom templates
  - Verification: Configure state, save as template, reload, verify

---

### M4: Custom Policy Builder

**Deliverables:**

- **D4.1:** Policy parameter configuration
  - Worker assignment priority: (oldest | nearest-completion | random)
  - Worker-to-stage matching: (strict | prefer-match | any)
  - Pull trigger: (empty-downstream | wip-headroom | always)
  - Output calculation: (standard | boosted-specialist | flat)
  - Acceptance: Users can customize policy behavior
  - Verification: Configure parameters, run, verify behavior matches

- **D4.2:** Custom policy UI
  - Form-based policy configuration
  - Real-time preview of policy rules
  - Save custom policy with name
  - Acceptance: Users can create named custom policies
  - Verification: Build policy, save, select from dropdown

- **D4.3:** Policy presets
  - Save/load custom policy configurations
  - Share policies as JSON export
  - Acceptance: Custom policies are portable
  - Verification: Export policy, import on fresh state, verify

---

### M5: Batch Simulation & Statistics

**Deliverables:**

- **D5.1:** Batch run configuration
  - Number of iterations (10, 50, 100)
  - RNG seed options: fixed seed, random per run
  - Days per iteration
  - Acceptance: Users can configure batch parameters
  - Verification: Configure batch, verify settings applied

- **D5.2:** Batch execution engine
  - Run N iterations of selected policy
  - Collect metrics from each run
  - Progress indicator
  - Acceptance: Batch completes all iterations
  - Verification: Run 10 iterations, verify 10 result sets

- **D5.3:** Statistical analysis
  - Calculate: mean, median, std dev, min, max for each metric
  - Distribution charts (histogram of lead times, throughputs)
  - Confidence intervals
  - Acceptance: Statistical summary available after batch
  - Verification: Run batch, view statistics

- **D5.4:** Batch comparison
  - Run batch for multiple policies
  - Statistical comparison of outcomes
  - Significance testing (is policy A better than B?)
  - Acceptance: Data-driven policy comparison
  - Verification: Compare two policies over 50 runs each

---

## 5. Success Criteria

1. 5+ distinct policies available for simulation
2. Comparison mode runs 2-4 policies on identical starting state
3. 5+ built-in scenario templates with learning objectives
4. Custom policies can be configured without code changes
5. Batch simulation runs 100 iterations in < 30 seconds
6. Statistical analysis shows confidence intervals for metrics

---

## 6. Dependencies

**Depends on:**
- Phase 1 (Core Simulation) — All features implemented
- Phase 2 (Enhanced UX) — Undo system for comparison branching

**Blocks:**
- Phase 5 (Educational Features) — Templates power guided learning

---

## 7. Technical Considerations

### Seeded Random Number Generator
```typescript
// Use seedrandom or similar for reproducible simulations
import seedrandom from 'seedrandom';

interface SimulationConfig {
  seed: string | number;
  rng: () => number;  // Returns 0-1
}

function createSimulation(seed: string): SimulationConfig {
  const rng = seedrandom(seed);
  return { seed, rng };
}

// Worker output with seeded RNG
function calculateOutput(worker: Worker, stage: string, rng: () => number): number {
  const isSpecialist = worker.type === stage;
  const min = isSpecialist ? 3 : 0;
  const max = isSpecialist ? 6 : 3;
  return min + Math.floor(rng() * (max - min + 1));
}
```

### Policy Interface
```typescript
interface Policy {
  id: string;
  name: string;
  description: string;
  parameters: PolicyParameters;

  // Core policy actions
  assignWorkers(state: KanbanState, rng: () => number): WorkerAssignment[];
  pullCards(state: KanbanState): CardMovement[];
  calculatePriority(card: Card): number;
}

interface PolicyParameters {
  assignmentPriority: 'oldest' | 'nearest-completion' | 'random';
  workerMatching: 'strict' | 'prefer-match' | 'any';
  pullTrigger: 'empty-downstream' | 'wip-headroom' | 'always';
  outputMode: 'standard' | 'boosted-specialist' | 'flat';
}
```

### Template Format
```typescript
interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: string;
  version: string;

  // Initial state
  cards: Card[];
  workers: Worker[];
  wipLimits: WipLimits;
  currentDay: number;

  // Optional guidance
  suggestedPolicies?: string[];
  expectedOutcomes?: string;
}
```
