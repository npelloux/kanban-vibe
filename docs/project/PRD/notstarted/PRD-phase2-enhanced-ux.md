# PRD: Phase 2 — Enhanced User Experience

**Status:** Proposed

**Depends on:** Phase 1 (Core Simulation) — Implemented

---

## 1. Problem

Current Kanban-Vibe users face friction points that reduce learning effectiveness and simulation usability:

- **No card blocking UI** — Users cannot mark cards as blocked without editing code
- **No undo capability** — Mistakes require reloading saved state or starting over
- **Silent limit violations** — WIP limit enforcement happens without explanation
- **No auto-save** — Users lose work if they forget to manually save
- **Limited mobile experience** — Touch works but layout isn't optimized for small screens

These gaps reduce the "safe experimentation" promise of the tool.

---

## 2. Solution

Enhance the user experience with:

1. **Card blocking toggle** — Visual control to block/unblock cards
2. **Undo/Redo system** — Transaction history with keyboard shortcuts
3. **Notification system** — Toast messages explaining blocked actions
4. **Auto-save with localStorage** — Automatic state persistence
5. **Responsive mobile layout** — Optimized views for tablets and phones

---

## 3. Design Principles

1. **Non-destructive actions** — Every action should be reversible
2. **Explain, don't just prevent** — When blocking an action, tell the user why
3. **Invisible persistence** — Auto-save without user intervention
4. **Mobile-first responsive** — Design for smallest screen, enhance for larger

---

## 4. What We're Building

### M1: Card Blocking UI

**Deliverables:**

- **D1.1:** Add block toggle to card component
  - Visual toggle button (🔒/🔓 icon) on each card
  - Click toggles isBlocked state
  - Blocked cards show red border and "BLOCKED" badge
  - Acceptance: Users can block/unblock any card via UI
  - Verification: Click toggle, verify state change and visual feedback

- **D1.2:** Block reason input (optional)
  - Text field to capture why card is blocked
  - Displayed on card when blocked
  - Stored in card state: `blockReason?: string`
  - Acceptance: Users can add context to blocked cards
  - Verification: Add reason, verify it displays on card

---

### M2: Undo/Redo System

**Deliverables:**

- **D2.1:** State history manager
  - Capture state snapshots on significant actions:
    - Card creation
    - Card movement
    - Worker assignment
    - Day advancement
    - WIP limit changes
  - Max history depth: 50 states
  - Acceptance: State changes create history entries
  - Verification: Perform actions, verify history stack grows

- **D2.2:** Undo action
  - Keyboard shortcut: Ctrl+Z / Cmd+Z
  - Toolbar button in navigation
  - Restores previous state from history
  - Acceptance: Undo reverts last significant action
  - Verification: Make change, undo, verify state restored

- **D2.3:** Redo action
  - Keyboard shortcut: Ctrl+Shift+Z / Cmd+Shift+Z
  - Toolbar button in navigation
  - Re-applies undone state
  - Acceptance: Redo re-applies undone action
  - Verification: Undo, redo, verify state restored

- **D2.4:** History visualization (stretch)
  - Side panel showing action history
  - Click to jump to any point
  - Acceptance: Users can see and navigate history
  - Verification: Open panel, click entry, verify state jump

---

### M3: Notification System

**Deliverables:**

- **D3.1:** Toast notification component
  - Slide-in notifications (bottom-right)
  - Types: info, warning, error, success
  - Auto-dismiss after 4 seconds
  - Manual dismiss button
  - Acceptance: Notifications display and dismiss correctly
  - Verification: Trigger notification, verify display and timing

- **D3.2:** WIP limit violation notifications
  - Trigger when move blocked by max WIP
  - Trigger when move blocked by min WIP
  - Message format: "Cannot move card: {Column} would exceed max WIP limit of {N}"
  - Acceptance: Users understand why moves are blocked
  - Verification: Attempt blocked move, verify notification

- **D3.3:** Simulation event notifications
  - Card completed (reached Done)
  - Policy started/completed
  - Day advanced
  - Acceptance: Key events provide feedback
  - Verification: Trigger events, verify notifications

---

### M4: Auto-Save with localStorage

**Deliverables:**

- **D4.1:** Automatic state persistence
  - Save to localStorage on every state change
  - Debounced: 500ms after last change
  - Key: `kanban-vibe-autosave`
  - Acceptance: State persists across page reloads
  - Verification: Make changes, reload page, verify state restored

- **D4.2:** Auto-save indicator
  - Status indicator in navigation bar
  - States: "Saved", "Saving...", "Unsaved changes"
  - Last saved timestamp
  - Acceptance: Users know when data is saved
  - Verification: Make changes, verify indicator updates

- **D4.3:** Clear saved data option
  - Button to reset to fresh state
  - Confirmation dialog before clearing
  - Acceptance: Users can start fresh
  - Verification: Click reset, confirm, verify empty state

- **D4.4:** Multiple save slots
  - 3 save slots for different scenarios
  - Slot selector in save/load UI
  - Names: "Slot 1", "Slot 2", "Slot 3" (editable)
  - Acceptance: Users can maintain multiple simulations
  - Verification: Save to slot 1, switch to slot 2, verify different states

---

### M5: Responsive Mobile Layout

**Deliverables:**

- **D5.1:** Mobile-optimized board view
  - Horizontal scroll for columns on small screens
  - Larger touch targets (min 44px)
  - Collapsible column headers
  - Acceptance: Board usable on phone screens
  - Verification: Test on 375px width viewport

- **D5.2:** Mobile worker pool
  - Collapsible worker pool panel
  - Bottom sheet pattern for worker selection
  - Larger worker avatars for touch
  - Acceptance: Worker assignment works on mobile
  - Verification: Assign worker on mobile device

- **D5.3:** Mobile navigation
  - Hamburger menu for tabs on small screens
  - Bottom navigation option for key actions
  - Acceptance: All features accessible on mobile
  - Verification: Navigate all tabs on mobile

- **D5.4:** Responsive charts
  - Charts resize appropriately
  - Touch-friendly tooltips
  - Landscape mode optimization
  - Acceptance: Charts readable on mobile
  - Verification: View CFD on mobile, verify readability

---

## 5. Success Criteria

1. Users can block/unblock cards via UI click
2. Ctrl+Z undoes last action, Ctrl+Shift+Z redoes
3. WIP limit violations show explanatory notification
4. State auto-saves and restores on page reload
5. Board is fully functional on 375px viewport width
6. All new features have unit test coverage

---

## 6. Dependencies

**Depends on:**
- Phase 1 (Core Simulation) — All features implemented

**Blocks:**
- Phase 3 (Advanced Policies) — Undo system needed for policy comparison
- Phase 4 (Collaboration) — Auto-save architecture informs sync design

---

## 7. Technical Considerations

### State History Implementation
```typescript
interface HistoryEntry {
  timestamp: number;
  action: string;      // Human-readable action name
  state: KanbanState;  // Full state snapshot
}

interface HistoryManager {
  entries: HistoryEntry[];
  currentIndex: number;
  maxDepth: number;
  push(action: string, state: KanbanState): void;
  undo(): KanbanState | null;
  redo(): KanbanState | null;
  canUndo(): boolean;
  canRedo(): boolean;
}
```

### localStorage Schema
```typescript
interface LocalStorageSchema {
  'kanban-vibe-autosave': KanbanState;
  'kanban-vibe-slot-1': { name: string; state: KanbanState };
  'kanban-vibe-slot-2': { name: string; state: KanbanState };
  'kanban-vibe-slot-3': { name: string; state: KanbanState };
  'kanban-vibe-settings': UserSettings;
}
```

### Notification System
- Consider react-hot-toast or custom implementation
- Queue system for multiple simultaneous notifications
- Accessibility: ARIA live regions for screen readers
