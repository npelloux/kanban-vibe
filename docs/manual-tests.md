# Manual Smoke Tests

Run `npm run dev` and test each flow.

## Flow 1: Add a new card to Options

- [ ] Click "+ New" in Options column
- [ ] Card appears with random title
- [ ] Card has random work items (1-8 each color)
- [ ] Card has ID in sequence (A, B, C... Z, AA, AB...)

## Flow 2: Move card from Options to Red Active

- [ ] Click card in Options
- [ ] Card moves to Red Active
- [ ] Card's startDay updates to current day

## Flow 3: Assign worker to card

- [ ] Drag worker from pool to card in active column
- [ ] Worker appears on card
- [ ] Worker removed from previous card if reassigned

## Flow 4: Advance day with worker output

- [ ] Assign red worker to red-active card
- [ ] Click "Next Day"
- [ ] Red work progress increases by 3-6
- [ ] Card ages by 1 day
- [ ] Worker assignment resets

## Flow 5: Card transitions automatically

- [ ] Card with completed red work in red-active
- [ ] Click "Next Day"
- [ ] Card moves to red-finished

## Flow 6: Block prevents transition

- [ ] Toggle block on card
- [ ] Even if work complete, card does not move on Next Day

## Flow 7: WIP limit prevents movement

- [ ] Set max WIP of 1 on red-active
- [ ] Have 1 card in red-active
- [ ] Try to move another card from options
- [ ] Movement prevented with alert

## Flow 8: Policy execution

- [ ] Click "Run Policy" with "siloted-expert" for 10 days
- [ ] Simulation runs automatically
- [ ] Progress indicator shows current day
- [ ] Can cancel mid-run

## Flow 9: Save and load context

- [ ] Add cards, assign workers, advance days
- [ ] Click Save Context
- [ ] JSON file downloads
- [ ] Refresh page
- [ ] Click Import Context
- [ ] Select saved file
- [ ] State restores exactly
