# Living Documentation with Allure Reports

This project uses [Allure Report](https://allurereport.org/) to generate navigable test documentation from the Vitest test suite.

## Prerequisites

- **Java Runtime** (JRE 8+) - Required for Allure CLI
- **Node.js 18+** - Already required by the project

## Quick Start

```bash
# Run tests and generate HTML report
npm run test:report

# Or run tests first, then serve the report interactively
npm run test:run
npm run test:serve
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run test:run` | Run all tests once (generates allure-results) |
| `npm run test:report` | Run tests and generate static HTML report |
| `npm run test:serve` | Open interactive report in browser |
| `npm run report:open` | Open previously generated HTML report |

## Report Structure

The Allure report organizes tests into a navigable hierarchy:

```
Suites (by file)
├── src/__golden-master__/stage-transitions.golden.spec.ts
│   ├── Blocked cards
│   ├── red-active stage transitions
│   └── ...
├── src/__golden-master__/worker-output.golden.spec.ts
└── src/components/__tests__/...
```

## Adding Labels for Better Organization

To enhance the report hierarchy, add Allure labels to your tests:

```typescript
import { describe, it, beforeAll } from 'vitest';
import * as allure from 'allure-vitest';

describe('My Feature', () => {
  beforeAll(async () => {
    await allure.epic('Epic Name');      // Top-level grouping
    await allure.feature('Feature Name'); // Feature within epic
    await allure.story('Story Name');     // User story
    await allure.tag('regression');       // Tags for filtering
  });

  it('should do something', async () => {
    await allure.severity('critical');    // Test severity
    // test code
  });
});
```

### Label Hierarchy

- **Epic**: High-level business capability (e.g., "Golden Master Tests")
- **Feature**: Functional area (e.g., "Stage Transitions")
- **Story**: Specific user story or scenario (e.g., "Blocked Card Behavior")
- **Tag**: Cross-cutting concerns (e.g., "regression", "smoke")

## Report Features

- **Test History**: Track test stability over time
- **Categories**: Group failures by type
- **Graphs**: Visual test results and trends
- **Attachments**: Screenshots, logs, etc.
- **Timeline**: Test execution timeline

## CI Integration

To generate reports in CI:

```yaml
# Example GitHub Actions step
- name: Run tests with Allure
  run: npm run test:run

- name: Generate Allure Report
  run: npx allure generate allure-results -o allure-report --clean

- name: Upload Allure Report
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure-report/
```

## Troubleshooting

### "allure: command not found"

Install Allure CLI globally:
```bash
npm install -g allure-commandline
```

Or use npx:
```bash
npx allure serve allure-results
```

### Java not found

Allure requires Java. Install from:
- https://adoptium.net/ (recommended)
- Or use your system package manager

### Empty report

Ensure tests ran successfully and `allure-results/` contains JSON files before generating the report.
