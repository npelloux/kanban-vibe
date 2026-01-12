# PRD: Phase 4 — Collaboration & Sharing

**Status:** Proposed

**Depends on:** Phase 2 (Enhanced UX) — Auto-save architecture required

---

## 1. Problem

Kanban-Vibe is currently single-user only, limiting its value for:

- **Team workshops** — Facilitators can't run collaborative exercises
- **Remote training** — No way to share live simulations
- **Peer learning** — Students can't work together on scenarios
- **Result sharing** — Simulation outcomes can't be easily shared

The Jobs to be Done research identified Agile Coaches and Educators as primary users who need collaboration for workshops.

---

## 2. Solution

Enable collaboration and sharing through:

1. **Shareable simulation links** — URL-based state sharing (no account required)
2. **Live collaboration** — Real-time multi-user simulation (WebSocket-based)
3. **Export & embed** — Share charts and results externally
4. **Session recordings** — Replay simulations for asynchronous learning

---

## 3. Design Principles

1. **Zero-friction sharing** — No accounts required for basic sharing
2. **Real-time by default** — Collaborators see changes instantly
3. **Facilitator control** — Workshop leader can manage participant actions
4. **Works offline** — Core simulation works without connection

---

## 4. What We're Building

### M1: Shareable Simulation Links

**Deliverables:**

- **D1.1:** State encoding in URL
  - Compress state to URL-safe format (base64 + compression)
  - URL format: `kanban-vibe.app/?state={encoded}`
  - Max URL length consideration: use hash fragment for large states
  - Acceptance: URL contains full simulation state
  - Verification: Share URL, open in new browser, verify identical state

- **D1.2:** Share button UI
  - "Share" button in navigation bar
  - Click copies URL to clipboard
  - Toast notification: "Link copied!"
  - QR code generation for mobile sharing
  - Acceptance: One-click sharing works
  - Verification: Click share, paste URL, verify state

- **D1.3:** Short URL service (optional)
  - Generate short URLs for complex states
  - Format: `kvibe.link/abc123`
  - Store state in backend (if available) or use external service
  - Acceptance: Short URLs redirect to full state
  - Verification: Generate short URL, access, verify redirect

- **D1.4:** Share with specific view
  - Include current tab in shared link
  - Include zoom/scroll position
  - Acceptance: Recipients see exact view sharer intended
  - Verification: Share from CFD tab, verify recipient lands on CFD

---

### M2: Live Collaboration

**Deliverables:**

- **D2.1:** Collaboration session creation
  - "Start Session" button for facilitators
  - Generates session ID and join link
  - Session options: view-only or interactive
  - Max participants: configurable (default 20)
  - Acceptance: Facilitator can create joinable session
  - Verification: Create session, verify join link works

- **D2.2:** Real-time state synchronization
  - WebSocket connection for all participants
  - Operational transformation for conflict resolution
  - Latency indicator for connection quality
  - Offline queue for reconnection
  - Acceptance: Changes propagate to all participants < 500ms
  - Verification: Make change, verify others see it immediately

- **D2.3:** Participant management
  - Participant list sidebar
  - Facilitator can: kick, mute (prevent actions), promote
  - Cursor presence: show where others are looking
  - Acceptance: Facilitator has control over session
  - Verification: Kick participant, verify disconnection

- **D2.4:** Role-based permissions
  - **Facilitator**: Full control, can end session
  - **Participant**: Can interact with board (if allowed)
  - **Viewer**: Can only watch
  - Acceptance: Roles enforce appropriate permissions
  - Verification: Set viewer role, verify interaction disabled

- **D2.5:** Session chat
  - Text chat sidebar for participants
  - Facilitator announcements (highlighted)
  - Reactions/emoji for quick feedback
  - Acceptance: Participants can communicate
  - Verification: Send message, verify receipt

---

### M3: Export & Embed

**Deliverables:**

- **D3.1:** Chart export
  - Export individual charts as PNG
  - Export all charts as ZIP
  - High-resolution option for presentations
  - Acceptance: Charts exportable at print quality
  - Verification: Export CFD, verify image quality

- **D3.2:** Metrics report export
  - PDF report with:
    - Simulation summary
    - Final metrics
    - Charts
    - Historical data table
  - Acceptance: Comprehensive report generation
  - Verification: Generate PDF, verify all sections present

- **D3.3:** Embed widgets
  - Embeddable iframe for CFD chart
  - Embeddable iframe for metrics dashboard
  - Static snapshot or live-updating options
  - Embed code generator
  - Acceptance: Widgets work in external sites
  - Verification: Embed in test page, verify display

- **D3.4:** Data export
  - CSV export of historical data
  - JSON export of full state
  - Excel-compatible format option
  - Acceptance: Data usable in external tools
  - Verification: Export CSV, open in spreadsheet

---

### M4: Session Recordings

**Deliverables:**

- **D4.1:** Recording capture
  - Record all state changes with timestamps
  - Start/stop recording controls
  - Recording indicator in UI
  - Acceptance: Full session captured
  - Verification: Record session, verify all actions captured

- **D4.2:** Playback interface
  - Play/pause/seek controls
  - Playback speed: 0.5x, 1x, 2x, 4x
  - Day-by-day step mode
  - Timeline scrubber showing events
  - Acceptance: Sessions can be replayed
  - Verification: Record, playback, verify fidelity

- **D4.3:** Recording storage
  - Save recordings to localStorage
  - Export recordings as file
  - Import recordings from file
  - Acceptance: Recordings persist and are portable
  - Verification: Export recording, import on another device

- **D4.4:** Recording annotations
  - Add text annotations at specific points
  - Facilitator commentary for teaching
  - Annotations display during playback
  - Acceptance: Educators can add teaching points
  - Verification: Add annotation, verify shows during playback

- **D4.5:** Recording sharing
  - Share recordings via link (requires backend storage)
  - Embed recording player
  - Acceptance: Recordings shareable asynchronously
  - Verification: Share link, verify playback works

---

## 5. Success Criteria

1. Simulation state shareable via URL (no account required)
2. Live collaboration supports 20 concurrent participants
3. State changes propagate to collaborators in < 500ms
4. Charts and reports exportable as PNG/PDF
5. Session recordings capture and replay full simulations
6. Recording playback supports variable speed and seeking

---

## 6. Dependencies

**Depends on:**
- Phase 1 (Core Simulation) — All features implemented
- Phase 2 (Enhanced UX) — Auto-save architecture

**Infrastructure Requirements:**
- WebSocket server for live collaboration
- Object storage for recordings (optional)
- URL shortener service (optional)

**Blocks:**
- Phase 5 (Educational Features) — Recordings enable guided tutorials

---

## 7. Technical Considerations

### State Compression for URL Sharing
```typescript
import pako from 'pako';

function encodeStateToURL(state: KanbanState): string {
  const json = JSON.stringify(state);
  const compressed = pako.deflate(json);
  const base64 = btoa(String.fromCharCode(...compressed));
  return encodeURIComponent(base64);
}

function decodeStateFromURL(encoded: string): KanbanState {
  const base64 = decodeURIComponent(encoded);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const json = pako.inflate(bytes, { to: 'string' });
  return JSON.parse(json);
}
```

### WebSocket Protocol
```typescript
interface CollaborationMessage {
  type: 'state_update' | 'cursor_move' | 'chat' | 'participant_join' | 'participant_leave';
  sessionId: string;
  participantId: string;
  timestamp: number;
  payload: unknown;
}

interface StateUpdatePayload {
  operation: 'card_move' | 'worker_assign' | 'day_advance' | 'wip_change';
  data: unknown;
  version: number;  // For conflict resolution
}
```

### Recording Format
```typescript
interface Recording {
  id: string;
  name: string;
  createdAt: number;
  duration: number;  // Total days simulated
  initialState: KanbanState;
  events: RecordingEvent[];
  annotations: Annotation[];
}

interface RecordingEvent {
  timestamp: number;  // Wall clock time
  day: number;        // Simulation day
  type: string;
  data: unknown;
  resultingState: KanbanState;
}

interface Annotation {
  timestamp: number;
  text: string;
  author: string;
}
```

### Offline Support
- Service worker for offline capability
- IndexedDB for local state storage
- Sync queue for reconnection
- Conflict resolution strategy: last-write-wins with user notification
