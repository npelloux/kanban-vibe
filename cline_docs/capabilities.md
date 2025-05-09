# Kanban Vibe Capabilities

This document outlines all the capabilities of the Kanban Vibe application, along with their business rules and examples in a Behavior-Driven Development (BDD) approach.

## 1. Kanban Board Visualization

### Business Rules
- The board displays 7 columns: Options, Red Active, Red Finished, Blue Active, Blue Finished, Green Activities, and Done
- Each column has a distinct visual style and color coding
- All columns are visible without requiring horizontal scrolling

### Examples
**Passing:**
- When the application loads, all 7 columns are visible
- Each column has the correct header and color coding
- Columns are arranged in the correct order from left to right

**Not Passing:**
- Some columns are not visible without scrolling
- Columns are displayed in the wrong order
- Column headers or colors do not match their intended purpose

## 2. Card Management

### Business Rules
- Cards can be added to the Options column
- Cards have a unique ID assigned sequentially (A, B, C, etc.)
- Cards display their content, age, and work items
- Cards can be moved between columns by clicking on them
- Cards can only move forward in the workflow (not backward)
- Cards in the Done column display their completion day

### Examples
**Passing:**
- When the "Add Card" button is clicked, a new card appears in the Options column
- New cards have a unique ID that follows the sequence of existing cards
- When a card in the Options column is clicked, it moves to the Red Active column
- When a card in the Red Finished column is clicked, it moves to the Blue Active column
- When a card in the Blue Finished column is clicked, it moves to the Green Activities column
- Cards in the Done column show the day they were completed

**Not Passing:**
- Multiple cards have the same ID
- Clicking a card does not move it to the next appropriate column
- A card moves backward in the workflow
- A card in the Done column does not display its completion day

## 3. Work Items and Completion Rules

### Business Rules
- Cards have three types of work items: red, blue, and green
- Each work item type has a total amount and a completed amount
- A card can move from Red Active to Red Finished when all red work is completed
- A card can move from Blue Active to Blue Finished when all blue work is completed
- Cards in Blue Activities must have all red work completed
- Cards in Green Activities must have all red and blue work completed
- Cards in Done must have all work items completed

### Examples
**Passing:**
- A card with completed red work items can move from Red Active to Red Finished
- A card with completed blue work items can move from Blue Active to Blue Finished
- A card with incomplete red work items cannot move to Blue Activities
- A card with incomplete blue work items cannot move to Green Activities
- A card with incomplete work items cannot move to Done

**Not Passing:**
- A card with incomplete red work moves to Red Finished
- A card with incomplete blue work moves to Blue Finished
- A card with incomplete red work is in Blue Activities
- A card with incomplete blue work is in Green Activities
- A card with incomplete work items is in Done

## 4. Worker Management

### Business Rules
- There are three types of workers: red, blue, and green
- Workers can be added using the "Add Worker" button
- Workers can be deleted by hovering over them and clicking the delete button
- Workers are assigned to cards by selecting a worker and then clicking on a card
- Up to 3 workers can be assigned to a single card
- Workers can only be assigned to cards in active columns (Red Active, Blue Active, Green)
- When a worker is deleted, they are removed from any cards they were assigned to

### Examples
**Passing:**
- Clicking "Add Worker" and selecting a type adds a new worker of that type
- Hovering over a worker shows the delete button, and clicking it removes the worker
- Selecting a worker and clicking on a card assigns the worker to that card
- Attempting to assign a 4th worker to a card does not add the worker
- Deleting a worker removes them from any cards they were assigned to

**Not Passing:**
- A new worker is not created when "Add Worker" is clicked
- A worker is not deleted when the delete button is clicked
- More than 3 workers are assigned to a single card
- A deleted worker remains assigned to cards

## 5. Worker Output Rules

### Business Rules
- Workers produce output when the "Next Day" button is clicked
- Workers specialized in a column's color produce 3-6 work items (randomly determined)
- Workers not specialized in a column's color produce 0-3 work items (randomly determined)
- Worker output is applied to the work items of the card they are assigned to
- Workers are unassigned from cards after the "Next Day" button is clicked

### Examples
**Passing:**
- A red worker assigned to a card in Red Active produces 3-6 red work items
- A blue worker assigned to a card in Red Active produces 0-3 red work items
- After clicking "Next Day", workers are no longer assigned to any cards

**Not Passing:**
- A specialized worker produces less than 3 or more than 6 work items
- A non-specialized worker produces more than 3 work items
- Workers remain assigned to cards after clicking "Next Day"

## 6. Day Progression and Card Aging

### Business Rules
- The day counter increments when the "Next Day" button is clicked
- Cards in active columns (not Options or Done) age by 1 day when "Next Day" is clicked
- Cards in Options do not age
- Cards in Done do not age
- Cards start aging only when they move from Options to Red Active

### Examples
**Passing:**
- The day counter increases by 1 when "Next Day" is clicked
- A card in Red Active with age 2 has age 3 after clicking "Next Day"
- A card in Options has age 0 before and after clicking "Next Day"
- A card in Done with age 5 still has age 5 after clicking "Next Day"

**Not Passing:**
- The day counter increases by more than 1 when "Next Day" is clicked
- A card in Options ages when "Next Day" is clicked
- A card in Done ages when "Next Day" is clicked

## 7. WIP Limits

### Business Rules
- Each column can have a minimum and maximum WIP (Work In Progress) limit
- If a column's max WIP limit is 0, there is no upper constraint
- If a column's min WIP limit is 0, there is no lower constraint
- Cards cannot move to a column if it would exceed that column's max WIP limit
- Cards cannot move out of a column if it would violate that column's min WIP limit

### Examples
**Passing:**
- With a max WIP limit of 3 for Red Active, a 4th card cannot be moved to Red Active
- With a min WIP limit of 2 for Red Active, a card cannot be moved out if only 2 cards are present
- With a max WIP limit of 0 for Red Active, any number of cards can be moved to Red Active
- With a min WIP limit of 0 for Red Active, cards can be moved out regardless of how many remain

**Not Passing:**
- A card moves to a column that already has its max WIP limit reached
- A card moves out of a column that would violate its min WIP limit

## 8. Context Saving and Loading

### Business Rules
- The current state of the Kanban board can be saved to a JSON file
- A previously saved state can be loaded from a JSON file
- The saved state includes the day counter, cards, workers, WIP limits, and historical data

### Examples
**Passing:**
- Clicking "Save Context" creates a JSON file with the current state
- Loading a valid JSON file restores the board to the saved state
- After loading a saved state, the day counter, cards, workers, and WIP limits match the saved values

**Not Passing:**
- Saving context does not create a JSON file
- Loading an invalid JSON file breaks the application
- The restored state does not match the saved state

## 9. Visualization and Metrics

### Business Rules
- The application has 4 tabs: Kanban Board, Cumulative Flow, WIP & Aging, and Flow Metrics
- The Cumulative Flow diagram shows the number of cards in each column over time
- The WIP & Aging diagram shows cards as data points with their age and position
- The Flow Metrics tab shows lead time, throughput, and other flow metrics

### Examples
**Passing:**
- Clicking on each tab shows the corresponding view
- The Cumulative Flow diagram updates when the day changes
- The WIP & Aging diagram shows all cards with their correct ages
- The Flow Metrics tab displays accurate metrics based on the current state

**Not Passing:**
- Clicking on a tab does not change the view
- The diagrams do not reflect the current state of the board
- The metrics are calculated incorrectly

## 10. Automatic Card Movement

### Business Rules
- When "Next Day" is clicked, cards that meet completion criteria automatically move to the next column
- Cards only move if they would not violate WIP limits
- The stagedone function determines if a card should move based on its work item completion

### Examples
**Passing:**
- A card in Red Active with all red work completed moves to Red Finished when "Next Day" is clicked
- A card in Blue Active with all blue work completed moves to Blue Finished when "Next Day" is clicked
- A card in Green with all work completed moves to Done when "Next Day" is clicked
- A card does not move if it would violate a WIP limit

**Not Passing:**
- A card with incomplete work moves to the next column
- A card with complete work does not move to the next column
- A card moves despite violating a WIP limit
