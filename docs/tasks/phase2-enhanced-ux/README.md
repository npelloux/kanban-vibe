# Phase 2: Enhanced User Experience - Tasks

**PRD:** `docs/project/PRD/active/PRD-phase2-enhanced-ux.md`

## Overview

Phase 2 enhances the user experience with card blocking UI, undo/redo system, notifications, and auto-save functionality. These features support the core principle of "safe experimentation."

## Task Dependency Graph

```
M1: Card Blocking UI
├── M1-D1.1 Add block toggle to card ──┐
└── M1-D1.2 Block reason input ────────┘ (depends on M1-D1.1)

M2: Undo/Redo System
├── M2-D2.1 State history manager ─────┐
├── M2-D2.2 Undo action ───────────────┤ (depends on M2-D2.1)
└── M2-D2.3 Redo action ───────────────┘ (depends on M2-D2.1, M2-D2.2)

M3: Notification System
├── M3-D3.1 Toast notification component ──┐
├── M3-D3.2 WIP violation notifications ───┤ (depends on M3-D3.1)
└── M3-D3.3 Simulation event notifications ┘ (depends on M3-D3.1)

M4: Auto-Save with localStorage
├── M4-D4.1 Automatic state persistence ───┐
├── M4-D4.2 Auto-save indicator ───────────┤ (depends on M4-D4.1)
└── M4-D4.3 Clear saved data option ───────┘ (depends on M4-D4.1)
```

## Implementation Order

### Wave 1 (No dependencies)
1. **M1-D1.1** - Add block toggle to card component
2. **M2-D2.1** - State history manager
3. **M3-D3.1** - Toast notification component
4. **M4-D4.1** - Automatic state persistence

### Wave 2 (Depends on Wave 1)
5. **M1-D1.2** - Block reason input (← M1-D1.1)
6. **M2-D2.2** - Undo action (← M2-D2.1)
7. **M3-D3.2** - WIP violation notifications (← M3-D3.1)
8. **M4-D4.2** - Auto-save indicator (← M4-D4.1)
9. **M4-D4.3** - Clear saved data option (← M4-D4.1)

### Wave 3 (Depends on Wave 2)
10. **M2-D2.3** - Redo action (← M2-D2.2)
11. **M3-D3.3** - Simulation event notifications (← M3-D3.1)

## Task Files

| Task ID | Title | Status | File |
|---------|-------|--------|------|
| M1-D1.1 | Add block toggle to card component | Ready | [M1-D1.1](./M1-D1.1-add-block-toggle-to-card.md) |
| M1-D1.2 | Block reason input | Ready | [M1-D1.2](./M1-D1.2-block-reason-input.md) |
| M2-D2.1 | State history manager | Ready | [M2-D2.1](./M2-D2.1-state-history-manager.md) |
| M2-D2.2 | Undo action | Ready | [M2-D2.2](./M2-D2.2-undo-action.md) |
| M2-D2.3 | Redo action | Ready | [M2-D2.3](./M2-D2.3-redo-action.md) |
| M3-D3.1 | Toast notification component | Ready | [M3-D3.1](./M3-D3.1-toast-notification-component.md) |
| M3-D3.2 | WIP violation notifications | Ready | [M3-D3.2](./M3-D3.2-wip-violation-notifications.md) |
| M3-D3.3 | Simulation event notifications | Ready | [M3-D3.3](./M3-D3.3-simulation-event-notifications.md) |
| M4-D4.1 | Automatic state persistence | Ready | [M4-D4.1](./M4-D4.1-automatic-state-persistence.md) |
| M4-D4.2 | Auto-save indicator | Ready | [M4-D4.2](./M4-D4.2-auto-save-indicator.md) |
| M4-D4.3 | Clear saved data option | Ready | [M4-D4.3](./M4-D4.3-clear-saved-data-option.md) |

## Not Yet Created

The following PRD deliverables were deferred (stretch goals or lower priority):

- **M2-D2.4** - History visualization (stretch goal)
- **M4-D4.4** - Multiple save slots
- **M5** - Responsive Mobile Layout (all deliverables)

## Success Criteria

From PRD Section 5:

1. [ ] Users can block/unblock cards via UI click
2. [ ] Ctrl+Z undoes last action, Ctrl+Shift+Z redoes
3. [ ] WIP limit violations show explanatory notification
4. [ ] State auto-saves and restores on page reload
5. [ ] Board is fully functional on 375px viewport width (M5 - deferred)
6. [ ] All new features have unit test coverage
