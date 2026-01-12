# PRD: Phase 5 — Educational Features

**Status:** Proposed

**Depends on:** Phase 3 (Advanced Policies), Phase 4 (Collaboration)

---

## 1. Problem

While Kanban-Vibe provides simulation tools, it doesn't actively guide learning:

- **No onboarding** — New users don't know where to start
- **No learning path** — Users explore randomly without structured progression
- **No concept explanations** — Metrics shown without teaching the underlying theory
- **No challenges** — No way to test understanding or achieve goals
- **No instructor tools** — Educators must create their own curricula externally

The core Job to be Done is teaching Lean/Agile principles—the tool should actively support that job.

---

## 2. Solution

Transform Kanban-Vibe from a simulation tool into a learning platform:

1. **Interactive tutorials** — Guided introduction to concepts
2. **Learning paths** — Structured curriculum from basics to advanced
3. **Concept library** — In-app explanations of Lean principles
4. **Challenge mode** — Goal-based scenarios with success criteria
5. **Instructor dashboard** — Tools for educators running courses

---

## 3. Design Principles

1. **Learn by doing** — Tutorials are interactive, not passive reading
2. **Just-in-time learning** — Explain concepts when they become relevant
3. **Achievable challenges** — Clear goals with measurable success
4. **Self-paced progression** — Users control their learning speed
5. **Instructor flexibility** — Educators can customize for their needs

---

## 4. What We're Building

### M1: Interactive Tutorials

**Deliverables:**

- **D1.1:** Tutorial framework
  - Step-by-step instruction overlay
  - Highlight specific UI elements
  - Wait for user action before proceeding
  - Progress indicator
  - Skip/restart options
  - Acceptance: Framework supports multi-step guided tutorials
  - Verification: Create test tutorial, walk through steps

- **D1.2:** "Getting Started" tutorial
  - Introduce: board layout, cards, workers
  - Guide: create first card, assign worker, advance day
  - Explain: work items, card aging, stage completion
  - Duration: ~5 minutes
  - Acceptance: New users understand basic interactions
  - Verification: User completes tutorial, can use board independently

- **D1.3:** "Understanding WIP Limits" tutorial
  - Setup: pre-configured bottleneck scenario
  - Guide: observe high WIP problems
  - Interactive: set WIP limits, see improvement
  - Explain: Little's Law, flow efficiency
  - Duration: ~10 minutes
  - Acceptance: Users understand WIP limit purpose
  - Verification: User can explain why WIP limits help

- **D1.4:** "Worker Specialization" tutorial
  - Setup: mixed specialist/generalist team
  - Guide: compare specialist vs generalist output
  - Interactive: experiment with team compositions
  - Explain: T-shaped skills, bottleneck theory
  - Duration: ~10 minutes
  - Acceptance: Users understand specialization tradeoffs
  - Verification: User can predict outcome of team changes

- **D1.5:** "Reading Flow Metrics" tutorial
  - Guide: interpret CFD patterns
  - Explain: lead time, throughput, WIP relationship
  - Interactive: identify problems in sample charts
  - Explain: Little's Law calculation
  - Duration: ~15 minutes
  - Acceptance: Users can interpret analytics
  - Verification: User identifies bottleneck from CFD

---

### M2: Learning Paths

**Deliverables:**

- **D2.1:** Learning path framework
  - Ordered sequence of tutorials and challenges
  - Progress tracking (completed/in-progress/locked)
  - Prerequisites system (unlock next after completing previous)
  - Certificate of completion (shareable badge)
  - Acceptance: Framework supports structured progression
  - Verification: Complete path, verify progression tracking

- **D2.2:** "Kanban Fundamentals" path (Beginner)
  - Modules:
    1. Board basics (tutorial)
    2. Card lifecycle (tutorial)
    3. Worker assignment (tutorial)
    4. Your first simulation (challenge)
    5. Introduction to metrics (tutorial)
  - Duration: ~45 minutes total
  - Acceptance: Complete beginners can finish path
  - Verification: New user completes path successfully

- **D2.3:** "Flow Optimization" path (Intermediate)
  - Modules:
    1. WIP limits deep dive (tutorial)
    2. Bottleneck identification (challenge)
    3. Little's Law in practice (tutorial)
    4. Throughput optimization (challenge)
    5. Policy comparison (tutorial)
  - Prerequisite: Kanban Fundamentals
  - Duration: ~90 minutes total
  - Acceptance: Users can optimize flow after completion
  - Verification: User improves throughput in challenge

- **D2.4:** "Advanced Simulation" path (Advanced)
  - Modules:
    1. Custom policies (tutorial)
    2. Statistical analysis (tutorial)
    3. Scenario design (tutorial)
    4. Team dynamics simulation (challenge)
    5. Real-world application (case study)
  - Prerequisite: Flow Optimization
  - Duration: ~120 minutes total
  - Acceptance: Users can design custom simulations
  - Verification: User creates valid custom scenario

- **D2.5:** Progress dashboard
  - Overview of all paths and progress
  - Time spent learning
  - Achievements earned
  - Next recommended activity
  - Acceptance: Users can track their learning journey
  - Verification: Dashboard shows accurate progress

---

### M3: Concept Library

**Deliverables:**

- **D3.1:** Concept library framework
  - Searchable database of Lean/Agile concepts
  - Cross-linked concepts (e.g., WIP links to Little's Law)
  - Contextual access from simulation (click term to learn more)
  - Acceptance: Concepts accessible from anywhere in app
  - Verification: Click term, see explanation

- **D3.2:** Core concept entries
  - **Kanban Board**: Visual workflow management
  - **Work in Progress (WIP)**: Items currently being worked on
  - **WIP Limits**: Constraints on concurrent work
  - **Lead Time**: Time from start to completion
  - **Throughput**: Rate of work completion
  - **Little's Law**: Lead Time = WIP / Throughput
  - **Bottleneck**: Constraint limiting system throughput
  - **Flow Efficiency**: Value-add time vs total time
  - **Pull System**: Work pulled when capacity available
  - **Cumulative Flow Diagram**: Visualization of work over time
  - Acceptance: 10+ concepts documented
  - Verification: All terms have clear explanations

- **D3.3:** Interactive examples
  - Each concept includes mini-simulation demonstrating principle
  - "Try it yourself" sandbox for experimentation
  - Before/after comparisons
  - Acceptance: Concepts have hands-on examples
  - Verification: Concept example works interactively

- **D3.4:** External resources
  - Links to books, articles, videos for deeper learning
  - Curated resource list per concept
  - Acceptance: Users can explore beyond the app
  - Verification: External links work and are relevant

---

### M4: Challenge Mode

**Deliverables:**

- **D4.1:** Challenge framework
  - Goal definition (e.g., "Complete 10 cards in 20 days")
  - Success criteria checking
  - Constraints (e.g., "With only 3 workers")
  - Scoring system (time, efficiency, bonus objectives)
  - Acceptance: Framework supports goal-based challenges
  - Verification: Complete challenge, verify success detection

- **D4.2:** Built-in challenges
  - **Speed Run**: Complete 5 cards as fast as possible
  - **Efficiency Expert**: Achieve lead time < 5 days average
  - **Bottleneck Buster**: Clear a backed-up pipeline
  - **Lean Machine**: Maintain WIP < 6 while completing 10 cards
  - **Generalist Challenge**: Complete scenario with all same-color workers
  - **Policy Picker**: Choose best policy for given scenario
  - Acceptance: 6+ challenges with varying difficulty
  - Verification: Each challenge completable

- **D4.3:** Challenge leaderboard (optional)
  - Track best scores per challenge
  - Local leaderboard (no account required)
  - Global leaderboard (with account)
  - Acceptance: Users can compare performance
  - Verification: Score appears on leaderboard

- **D4.4:** Custom challenge creator
  - Define: starting state, goals, constraints, time limit
  - Share challenges via URL
  - Rate and review challenges
  - Acceptance: Users can create and share challenges
  - Verification: Create challenge, share, complete by another user

---

### M5: Instructor Dashboard

**Deliverables:**

- **D5.1:** Class management
  - Create class with join code
  - Add/remove students
  - View roster and progress
  - Acceptance: Instructors can manage student groups
  - Verification: Create class, students join successfully

- **D5.2:** Assignment system
  - Assign tutorials, challenges, or scenarios to class
  - Due dates (optional)
  - Completion tracking per student
  - Acceptance: Instructors can assign and track work
  - Verification: Assign challenge, verify student sees it

- **D5.3:** Progress analytics
  - Class-wide progress overview
  - Individual student detail view
  - Time spent per activity
  - Common struggle points identification
  - Acceptance: Instructors understand class progress
  - Verification: View dashboard with student activity

- **D5.4:** Custom curriculum builder
  - Create custom learning paths from existing content
  - Add custom instructions/context
  - Reorder and customize tutorials
  - Acceptance: Instructors can build custom curricula
  - Verification: Create path, assign to class

- **D5.5:** Live workshop mode
  - Facilitator controls simulation for all participants
  - Synchronized view across class
  - Q&A integration
  - Acceptance: Live workshops supported
  - Verification: Run workshop with multiple participants

---

## 5. Success Criteria

1. New users complete "Getting Started" tutorial in < 5 minutes
2. "Kanban Fundamentals" path has > 80% completion rate
3. Concept library covers all terms used in the application
4. 6+ challenges available with measurable success criteria
5. Instructors can create classes and track 20+ students
6. Workshop mode supports 30+ synchronized participants

---

## 6. Dependencies

**Depends on:**
- Phase 1 (Core Simulation) — All features implemented
- Phase 3 (Advanced Policies) — Templates for tutorials
- Phase 4 (Collaboration) — Live workshop mode

**Infrastructure Requirements:**
- User accounts (optional, for progress persistence)
- Backend for class management
- Analytics for learning progress

---

## 7. Technical Considerations

### Tutorial Framework
```typescript
interface Tutorial {
  id: string;
  name: string;
  description: string;
  duration: number;  // minutes
  steps: TutorialStep[];
}

interface TutorialStep {
  id: string;
  instruction: string;  // Markdown supported
  highlight?: string;   // CSS selector to highlight
  waitFor?: WaitCondition;
  action?: TutorialAction;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface WaitCondition {
  type: 'click' | 'state_change' | 'timer';
  target?: string;      // Selector or state path
  value?: unknown;      // Expected value
  timeout?: number;     // Max wait time
}

interface TutorialAction {
  type: 'set_state' | 'highlight' | 'animate';
  payload: unknown;
}
```

### Challenge System
```typescript
interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialState: KanbanState;
  goals: ChallengeGoal[];
  constraints: ChallengeConstraint[];
  timeLimit?: number;  // Days
  scoring: ScoringRules;
}

interface ChallengeGoal {
  type: 'cards_completed' | 'lead_time' | 'throughput' | 'wip';
  target: number;
  comparison: '<' | '>' | '=' | '<=' | '>=';
}

interface ChallengeConstraint {
  type: 'max_workers' | 'worker_types' | 'no_policy' | 'fixed_wip';
  value: unknown;
}

interface ScoringRules {
  basePoints: number;
  bonuses: {
    condition: ChallengeGoal;
    points: number;
  }[];
  penalties: {
    condition: ChallengeGoal;
    points: number;
  }[];
}
```

### Learning Progress Storage
```typescript
interface LearningProgress {
  userId?: string;
  completedTutorials: string[];
  completedChallenges: {
    challengeId: string;
    score: number;
    completedAt: number;
  }[];
  pathProgress: {
    pathId: string;
    currentModule: number;
    startedAt: number;
  }[];
  totalTimeSpent: number;
  achievements: string[];
}
```

### Instructor Dashboard Data
```typescript
interface ClassData {
  id: string;
  name: string;
  joinCode: string;
  instructorId: string;
  students: StudentProgress[];
  assignments: Assignment[];
  createdAt: number;
}

interface StudentProgress {
  userId: string;
  displayName: string;
  joinedAt: number;
  completedAssignments: string[];
  learningProgress: LearningProgress;
}

interface Assignment {
  id: string;
  type: 'tutorial' | 'challenge' | 'path';
  contentId: string;
  dueDate?: number;
  assignedAt: number;
}
```
