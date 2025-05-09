# Kanban-Vibe Domain Events

This document lists the domain events in the kanban-vibe application using the language of the business domain. Each event is described as a simple statement using past tense verbs.

## Card Lifecycle Events

- Card was created in Options column
- Card was moved from Options to Red Active
- Card was moved from Red Active to Red Finished
- Card was moved from Red Finished to Blue Active
- Card was moved from Blue Active to Blue Finished
- Card was moved from Blue Finished to Green Activities
- Card was moved from Green Activities to Done
- Card was blocked
- Card was unblocked
- Card age was incremented

## Work Item Events

- Red work was completed on card
- Blue work was completed on card
- Green work was completed on card
- All work was completed on card

## Worker Events

- Worker was added to the pool
- Worker was removed from the pool
- Worker was assigned to a card
- Worker was unassigned from a card
- Worker completed work items on a card
- Worker specialized in red activities produced output
- Worker specialized in blue activities produced output
- Worker specialized in green activities produced output
- Worker non-specialized in column color produced output

## Day Progression Events

- Day was advanced
- Cards in active columns aged
- Workers were unassigned after day completion

## WIP Limit Events

- WIP limit was set for column
- Card movement was prevented due to max WIP limit
- Card movement was prevented due to min WIP limit

## Context Management Events

- Kanban board state was saved
- Kanban board state was loaded
- Historical data was recorded for the day

## Policy Events

- Policy was started
- Policy was executed for a day
- Policy was completed
- Policy was cancelled

## Visualization Events

- Kanban board view was displayed
- Cumulative Flow diagram was displayed
- WIP & Aging diagram was displayed
- Flow Metrics were displayed
