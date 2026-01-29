#!/bin/bash
# list-tasks.sh - List open GitHub issues (tasks)
# Usage: ./scripts/list-tasks.sh

gh issue list --state open --limit 30 --json number,title,labels \
  --jq '.[] | "\(.number)\t\(.title)"'
