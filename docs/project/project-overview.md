# Kanban-Vibe - Project Overview

## Vision

Make Lean software development principles tangible and actionable by providing an interactive simulation environment where anyone can safely experiment with workflow configurations and instantly see the impact on delivery performance.

## Problem Statement

Teams and educators struggle to understand and teach abstract Lean/Agile workflow principles:

- **Safe Experimentation** — Can't test WIP limit changes without disrupting real projects
- **Time Compression** — Real workflows take weeks/months to demonstrate patterns
- **Visual Learning** — Concepts like Little's Law need concrete, hands-on demonstration
- **Engagement** — Passive education (slides, lectures) doesn't create lasting understanding

## Solution

An interactive web-based Kanban simulation that models software development workflow with specialized workers, configurable WIP limits, automatic stage progression, and comprehensive flow analytics.

## Core Components

### 1. Kanban Board
**Multi-stage workflow visualization with card and worker management**

- 7-stage workflow: Options → Red Active → Red Finished → Blue Active → Blue Finished → Green → Done
- Card creation with random work items
- Drag-drop worker assignment
- Manual and automatic card progression
- WIP limit configuration and enforcement

### 2. Worker System
**Specialized worker pool with output calculation**

- Three worker types: Red, Blue, Green specialists
- Specialization bonus: 3-6 output vs 0-3 for non-matching tasks
- Max 3 workers per card
- Worker management: add, delete, assign

### 3. Simulation Engine
**Day-by-day progression with business logic**

- Card aging (days in system)
- Worker output calculation
- Stage completion detection (stagedone)
- Automatic card advancement
- Policy-based automation (Siloted-Expert)

### 4. Analytics Dashboard
**Flow metrics visualization and analysis**

- Cumulative Flow Diagram (CFD)
- WIP & Aging scatter plot
- Lead Time, Throughput, WIP metrics
- Little's Law prediction
- 5-day rolling average throughput

## Technical Stack

- **Framework**: React 19 + TypeScript
- **Charting**: Chart.js + react-chartjs-2
- **Build**: Vite
- **Testing**: Vitest + React Testing Library

## PRD Roadmap

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 1 | Core Simulation | Implemented | Kanban board, workers, simulation engine, analytics |
| 2 | Enhanced UX | Proposed | Undo/redo, notifications, auto-save, mobile layout |
| 3 | Advanced Policies | Proposed | Multiple policies, comparison mode, templates |
| 4 | Collaboration | Proposed | Shareable links, live collaboration, recordings |
| 5 | Educational Features | Proposed | Tutorials, learning paths, challenges, instructor tools |

## Target Users

1. **Agile Coaches & Consultants** — Workshop facilitation, client training
2. **Team Leads & Project Managers** — Process optimization, team education
3. **Educators & Instructors** — University courses, professional training
4. **Process Improvement Practitioners** — Workflow analysis, evidence-based recommendations

## Key Documents

- **Product Vision**: `docs/product-vision-jtbd.md`
- **Phase 1 PRD**: `docs/project/PRD/active/PRD-phase1-core-simulation.md`
- **Phase 2 PRD**: `docs/project/PRD/active/PRD-phase2-enhanced-ux.md`
- **Phase 3 PRD**: `docs/project/PRD/active/PRD-phase3-advanced-policies.md`
- **Phase 4 PRD**: `docs/project/PRD/active/PRD-phase4-collaboration.md`
- **Phase 5 PRD**: `docs/project/PRD/active/PRD-phase5-educational-features.md`
