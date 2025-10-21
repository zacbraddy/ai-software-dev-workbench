---
disable-model-invocation: true
---

# Parallel Task Audit Mode

**Context**: This file is loaded by `audit.md` when auditing multiple tasks in parallel.

## Execution Steps

**Variables available:**
- `$TASK_IDS` - Array of task identifiers to audit
- `$FEATURE_DIR` - Path to feature specs
- `$AVAILABLE_DOCS` - List of available documentation

### 1. Load Context

Already completed by `audit.md` - you have:
- Feature directory path
- Available documentation list
- Array of task IDs to audit

### 2. Read Tasks File

Load `$FEATURE_DIR/tasks.md` and extract all requested task IDs

### 3. Validate Tasks

Ensure all requested task IDs exist
- If any missing, report which ones and abort

### 4. Spawn Subagents

For each task ID, invoke the `audit-task` subagent in parallel:

```
For each $TASK_ID in $TASK_IDS:
  Task: Audit $TASK_ID
  Subagent: audit-task
  Prompt: |
    Audit task $TASK_ID from the SpecKit feature specification.

    **Context provided:**
    - Task ID: $TASK_ID
    - Feature directory: $FEATURE_DIR
    - Available docs: $AVAILABLE_DOCS
    - Constitution path: memory/constitution.md

    **Your workflow:**
    1. Load all context files (tasks.md, plan.md, spec.md, memory files)
    2. Find and understand task $TASK_ID requirements
    3. Review implementation against requirements
    4. Run quality checks (lint/typecheck/tests)
    5. Identify gaps or issues
    6. Return structured findings

    **Return format:**
    {
      "task_id": "$TASK_ID",
      "status": "pass" | "issues" | "incomplete",
      "description": "Brief task description",
      "discrepancies": [
        "Specific issue 1",
        "Specific issue 2"
      ],
      "files_reviewed": ["path/to/file.ts"],
      "quality_checks": {
        "lint": "pass" | "fail",
        "typecheck": "pass" | "fail",
        "tests": "pass" | "fail" | "n/a"
      }
    }

    Work autonomously - no user interaction. Apply pragmatic quality standards from constitution.
```

**IMPORTANT**: Spawn ALL subagents in a single message using multiple Task tool invocations for true parallel execution.

### 5. Monitor Progress

- Track each subagent's progress
- Detect stuck/looping agents
- Wait for all agents to complete

### 6. Aggregate Results

Collect audit findings from all subagents

### 7. Generate Audit Summary Table

```markdown
| Task | Description | Status | Discrepancies |
|------|-------------|--------|---------------|
| T001 | Create user model | ✓ Pass | None |
| T002 | Add auth middleware | ⚠ Issues | Missing error handling for invalid tokens |
| T003 | Set up database | ✗ Incomplete | Connection pooling not implemented |
```

### 8. List All Discrepancies

If any tasks have issues, create numbered list of ALL fixes needed:

```markdown
## Required Fixes

1. T002: Add error handling for invalid tokens in auth middleware
2. T002: Add test coverage for token expiry scenario
3. T003: Implement connection pooling in database setup
4. T003: Add database reconnection logic
5. T003: Update config to include pool size settings
```

### 9. Wait for User Decision

Ask user to specify which fixes to apply using one of these formats:
- `Fix: 1, 3, 5-7, 9` (specific fixes)
- `Fix: all except 2, 4, 8` (all except specified)
- `Fix: all` (apply all fixes)
- `Fix: none` (skip all fixes)

### 10. Apply Selected Fixes

- Parse user's fix selection
- Apply only the specified fixes
- Run quality checks on fixed code
- Report completion

### 11. Mark Completed Tasks

- Only mark tasks as `[x]` that passed without issues
- Tasks with applied fixes remain unmarked (user can re-audit)
- Report final status

## Behaviour Rules

- **Parallel Execution**: All audits run simultaneously
- **No User Interaction**: Subagents work autonomously during audit
- **Structured Output**: Subagents return standardised findings
- **Aggregated Reporting**: Single consolidated list of all issues
- **Selective Fixes**: User controls which fixes to apply
- **Clear Numbering**: Each fix gets unique number across all tasks

## Fix Selection Parsing

```javascript
function parseFixSelection(input, totalFixes) {
  const fixes = new Set();

  if (input.startsWith('Fix: ')) {
    const selection = input.substring(5).trim().toLowerCase();

    if (selection === 'all') {
      // All fixes
      for (let i = 1; i <= totalFixes; i++) {
        fixes.add(i);
      }
    } else if (selection === 'none') {
      // No fixes
      return fixes;
    } else if (selection.startsWith('all except')) {
      // All except specified
      const except = parseNumberList(selection.substring(10));
      for (let i = 1; i <= totalFixes; i++) {
        if (!except.has(i)) {
          fixes.add(i);
        }
      }
    } else {
      // Specific fixes
      return parseNumberList(selection);
    }
  }

  return fixes;
}

function parseNumberList(input) {
  const numbers = new Set();
  const parts = input.split(',').map(s => s.trim());

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      numbers.add(parseInt(part));
    } else if (/^\d+-\d+$/.test(part)) {
      const [start, end] = part.split('-').map(n => parseInt(n));
      for (let i = start; i <= end; i++) {
        numbers.add(i);
      }
    }
  }

  return numbers;
}
```

## Why Agents Can't Spawn Sub-agents

The `audit-task` agent is defined with:
```yaml
tools: [Read, Edit, Glob, Grep, Bash]
```

Notice the `Task` tool is NOT in the list. This prevents infinite spawning - agents simply cannot invoke other agents.

## Error Handling

- Missing tasks → Report which ones and list available tasks
- Subagent timeout → Report which tasks timed out
- Invalid fix selection → Show examples and ask again

## Success Criteria

- All tasks audited
- Summary table generated with clear status
- All discrepancies listed and numbered
- User has selected which fixes to apply
- Selected fixes applied successfully
- Passing tasks marked as `[x]` in tasks.md
