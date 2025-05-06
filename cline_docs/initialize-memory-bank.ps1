# Memory Bank Initialization Script
# This script initializes the Memory Bank structure and ensures all required files are present

Write-Host "Initializing Memory Bank..." -ForegroundColor Green

# Define the Memory Bank directory
$memoryBankDir = "memory-bank"

# Create the Memory Bank directory if it doesn't exist
if (-not (Test-Path $memoryBankDir)) {
    Write-Host "Creating Memory Bank directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $memoryBankDir | Out-Null
}

# Define the core Memory Bank files
$coreFiles = @(
    "projectbrief.md",
    "productContext.md",
    "systemPatterns.md",
    "techContext.md",
    "activeContext.md",
    "progress.md",
    "README.md"
)

# Check if each core file exists, create template if it doesn't
foreach ($file in $coreFiles) {
    $filePath = Join-Path -Path $memoryBankDir -ChildPath $file
    if (-not (Test-Path $filePath)) {
        Write-Host "Creating template for $file..." -ForegroundColor Cyan
        
        # Create template content based on file type
        $templateContent = switch ($file) {
            "projectbrief.md" {
@"
# Project Brief

## Project Goal
[Define the core goal of the project]

## Core Requirements
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

## Target Outcome
[Describe the expected outcome of the project]

## Scope
- [In scope item 1]
- [In scope item 2]
- [In scope item 3]

## Out of Scope
- [Out of scope item 1]
- [Out of scope item 2]

## Success Criteria
- [Success criterion 1]
- [Success criterion 2]
- [Success criterion 3]
"@
            }
            "productContext.md" {
@"
# Product Context

## Problem Statement
[Describe the problem this project aims to solve]

## Solution
[Describe the solution approach]

## User Experience Goals
- [UX goal 1]
- [UX goal 2]
- [UX goal 3]

## Target Users
- [User type 1]
- [User type 2]
- [User type 3]

## Key Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Success Metrics
- [Metric 1]
- [Metric 2]
- [Metric 3]
"@
            }
            "systemPatterns.md" {
@"
# System Patterns

## Architecture Overview
[Describe the system architecture]

## Key Technical Decisions
[List and explain key technical decisions]

## Component Relationships
[Describe how components relate to each other]

## Critical Implementation Paths
[Describe critical implementation paths]

## Design Patterns
[List and explain design patterns used]

## Best Practices
- [Best practice 1]
- [Best practice 2]
- [Best practice 3]
"@
            }
            "techContext.md" {
@"
# Technical Context

## Technologies Used
[List and describe technologies used]

## Development Setup
[Describe the development environment setup]

## Technical Constraints
[List and explain technical constraints]

## Dependencies
[List and describe dependencies]

## Tool Usage Patterns
[Describe patterns for using tools]
"@
            }
            "activeContext.md" {
@"
# Active Context

## Current Work Focus
[Describe the current focus of work]

## Recent Changes
- [Change 1]
- [Change 2]
- [Change 3]

## Next Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Active Decisions and Considerations
[Describe active decisions and considerations]

## Important Patterns and Preferences
[Describe important patterns and preferences]

## Learnings and Project Insights
[Describe learnings and insights]
"@
            }
            "progress.md" {
@"
# Progress

## What Works
- [Working item 1]
- [Working item 2]
- [Working item 3]

## What's Left to Build
- [Remaining item 1]
- [Remaining item 2]
- [Remaining item 3]

## Current Status
- **Phase**: [Current phase]
- **Progress**: [Progress percentage]
- **Next Action**: [Next action]

## Known Issues
- [Issue 1]
- [Issue 2]
- [Issue 3]

## Evolution of Project Decisions
[Describe how project decisions have evolved]

## Milestones
- [ ] [Milestone 1]
- [ ] [Milestone 2]
- [ ] [Milestone 3]

## Lessons Learned
- [Lesson 1]
- [Lesson 2]
- [Lesson 3]
"@
            }
            "README.md" {
@"
# Memory Bank

This Memory Bank contains documentation for [project name].

## Memory Bank Structure

The Memory Bank consists of the following core files:

1. **projectbrief.md** - Foundation document that defines core requirements and goals
2. **productContext.md** - Why this project exists and the problems it solves
3. **systemPatterns.md** - System architecture and key technical decisions
4. **techContext.md** - Technologies used and technical constraints
5. **activeContext.md** - Current work focus and next steps
6. **progress.md** - What works and what's left to build

## Current Status

[Describe the current status of the project]

## How to Use This Memory Bank

- Read **projectbrief.md** to understand the project goals
- Check **activeContext.md** for current status and next steps
- Refer to **progress.md** for detailed progress tracking
"@
            }
            default {
                "# $($file -replace '\.md$', '')`n`nAdd content here."
            }
        }
        
        # Write template content to file
        Set-Content -Path $filePath -Value $templateContent
    }
}

# Create additional directories if needed
$additionalDirs = @(
    "memory-bank/resources",
    "memory-bank/scripts"
)

foreach ($dir in $additionalDirs) {
    if (-not (Test-Path $dir)) {
        Write-Host "Creating directory: $dir..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

# Copy existing scripts to scripts directory
$scriptFiles = Get-ChildItem -Path $memoryBankDir -Filter "*.ps1" | Where-Object { $_.Name -ne "initialize-memory-bank.ps1" }
foreach ($script in $scriptFiles) {
    $destPath = Join-Path -Path "memory-bank/scripts" -ChildPath $script.Name
    if (-not (Test-Path $destPath)) {
        Write-Host "Moving script $($script.Name) to scripts directory..." -ForegroundColor Cyan
        Copy-Item -Path $script.FullName -Destination $destPath
    }
}

Write-Host "`nMemory Bank initialization complete!" -ForegroundColor Green
Write-Host "The Memory Bank structure has been created with template files." -ForegroundColor Green
Write-Host "You can now start documenting your project by editing the files in the $memoryBankDir directory." -ForegroundColor Green

# Display Memory Bank structure
Write-Host "`nMemory Bank Structure:" -ForegroundColor Yellow
Get-ChildItem -Path $memoryBankDir -Recurse | ForEach-Object {
    $indent = "  " * ($_.FullName.Split("\") | Where-Object { $_ -ne "" }).Count
    if ($_.PSIsContainer) {
        Write-Host "$indent[DIR] $($_.Name)" -ForegroundColor Cyan
    } else {
        Write-Host "$indent[FILE] $($_.Name)" -ForegroundColor White
    }
}
