# PRD: Phase 1 — Core Kanban Simulation Engine (Reverse-Engineered)

**Status:** Implemented

**Type:** Reverse-Engineered Documentation

---

## 1. Problem

Teams and educators need a way to understand and demonstrate Lean/Agile workflow principles without disrupting real projects. Traditional approaches (physical boards, theoretical lectures) fail to provide:

- **Safe experimentation** — Can't test WIP limit changes on real work
- **Time compression** — Real workflows take weeks/months to show patterns
- **Visual feedback** — Abstract concepts like Little's Law need concrete demonstration
- **Hands-on learning** — Passive education doesn't create lasting understanding

---

## 2. Solution

An interactive web-based Kanban simulation that models software development workflow with:

- Multi-stage board representing development phases
- Specialized workers with varying output based on task type
- Work items with progress tracking
- Day-by-day simulation with automatic progression
- WIP limits with enforcement
- Flow analytics and visualizations

---

## 3. Design Principles

1. **Interactive over passive** — Users manipulate the board directly, learning by doing
2. **Visual feedback** — Every action has immediate visual consequence
3. **Realistic modeling** — Worker specialization, WIP limits, and stage dependencies mirror real workflows
4. **Progressive disclosure** — Start with simple board, add complexity via analytics tabs
5. **Zero configuration** — Works out of the box with sensible defaults

---

## 4. What's Built

### 4.1 Kanban Board

**7-Stage Workflow:**
| Stage | Purpose | Work Type |
|-------|---------|-----------|
| Options | Backlog of potential work | None (waiting) |
| Red Active | First activity phase | Red work items |
| Red Finished | Completed red work, awaiting blue | Buffer |
| Blue Active | Second activity phase | Blue work items |
| Blue Finished | Completed blue work, awaiting green | Buffer |
| Green | Final activity phase | Green work items |
| Done | Completed work | None (finished) |

**Card Data Model:**
```typescript
interface Card {
  id: string;              // A, B, ..., Z, AA, AB...
  content: string;         // Job title
  stage: string;           // Current workflow stage
  age: number;             // Days in system (excludes options/done)
  startDay: number;        // Day entered red-active
  isBlocked: boolean;      // Prevents progression
  workItems: {
    red: { total: number; completed: number };
    blue: { total: number; completed: number };
    green: { total: number; completed: number };
  };
  assignedWorkers: Worker[];
  completionDay?: number;  // Day reached done
}
```

### 4.2 Worker System

**Worker Types:**
- Red specialists (3-6 output on red tasks, 0-3 elsewhere)
- Blue specialists (3-6 output on blue tasks, 0-3 elsewhere)
- Green specialists (3-6 output on green tasks, 0-3 elsewhere)

**Initial Pool:** Bob (red), Zoe (blue), Lea (blue), Taz (green)

**Worker Management:**
- Add workers with type selection
- Delete workers from pool
- Drag-drop assignment to cards (max 3 per card)
- Desktop and mobile touch support

### 4.3 Simulation Engine

**Day Advancement Logic:**
1. Increment day counter
2. Age all in-progress cards (+1 day)
3. Calculate and apply worker output
4. Check stage completion (stagedone)
5. Auto-move completed cards (respecting WIP limits)
6. Record completion day for done cards
7. Reset worker assignments
8. Capture historical data

**Stage Completion Rules (stagedone):**
- Blocked cards: never complete
- Red-active: red.completed >= red.total
- Blue-active: blue.completed >= blue.total AND red complete
- Green: green.completed >= green.total AND red AND blue complete

### 4.4 WIP Limits

**Per-Column Configuration:**
- Min limit: Prevents moving cards FROM a column if it would go below minimum
- Max limit: Prevents moving cards TO a column if it would exceed maximum
- Default: 0 (no limit)

**Enforcement Points:**
- Manual card clicks
- Automatic stage progression
- Policy execution

### 4.5 Policy System

**Siloted-Expert Policy:**
1. Move cards from Options → Red Active (respecting limits)
2. Move cards from Finished → Next Activity (oldest first)
3. Assign workers to matching-color cards (prioritize oldest)
4. Apply worker output
5. Advance day and progress cards

**Execution:** 500ms interval per day, with progress bar and cancel option

### 4.6 Analytics & Visualization

**Cumulative Flow Diagram (CFD):**
- Stacked area chart
- Shows card count per stage over time
- Color-coded by stage

**WIP & Aging Diagram:**
- Scatter plot of card age by column
- Metrics: Total WIP, WIP recommendation, oldest card, average age

**Flow Metrics Dashboard:**
- Lead Time (days from start to completion)
- Throughput (cards/day)
- 5-day rolling average throughput
- Current WIP
- Little's Law prediction

### 4.7 State Persistence

**Save Context:**
- Exports JSON file with full state
- Filename: `kanban-vibe-state-day-{N}.json`

**Load Context:**
- Imports JSON file
- Restores: currentDay, cards, wipLimits, historicalData

---

## 5. Success Criteria (Achieved)

| Criterion | Status |
|-----------|--------|
| Interactive Kanban board with 7 stages | ✅ |
| Worker assignment via drag-drop | ✅ |
| Worker specialization output calculation | ✅ |
| Day advancement with aging | ✅ |
| Automatic stage progression | ✅ |
| WIP limit configuration and enforcement | ✅ |
| Cumulative Flow Diagram | ✅ |
| WIP/Aging scatter plot | ✅ |
| Flow metrics dashboard | ✅ |
| State save/load | ✅ |
| Policy automation | ✅ |
| Mobile touch support | ✅ |

---

## 6. Technical Implementation

**Stack:**
- React 19.1.0 + TypeScript 5.8.3
- Chart.js 4.4.9 + react-chartjs-2
- Vite 6.3.5
- Vitest + React Testing Library

**Architecture:**
- Centralized state in App component
- Props drilling for data flow
- CSS-based styling with conditional classes
- Custom drag-drop implementation (desktop + mobile)

---

## 7. Known Limitations

1. No persistent storage (localStorage/database)
2. Single policy type (siloted-expert)
3. Hardcoded job titles and worker names
4. No UI for blocking/unblocking cards
5. No undo/redo capability
6. Single-user only (no collaboration)
7. No card dependencies
8. Workers reset every day (no persistent assignment)

---

## 8. Reference

**Key Files:**
- `src/App.tsx` — Main state and business logic
- `src/components/Card.tsx` — Card component
- `src/components/Worker.tsx` — Worker drag-drop
- `src/components/PolicyRunner.tsx` — Policy execution
- `src/components/CumulativeFlowDiagram.tsx` — CFD chart
- `src/components/FlowMetrics.tsx` — Metrics dashboard

**Test Coverage:**
- `src/__tests__/stagedone.test.ts` — Stage completion logic
- `src/__tests__/WipLimits.test.tsx` — WIP enforcement
- Component tests in `src/components/__tests__/`
