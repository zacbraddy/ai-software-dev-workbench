---
disable-model-invocation: true
---

# Parallel Task Implementation Mode

**Context**: This file is loaded by `implement.md` when executing multiple tasks in parallel.

## Execution Steps

**Variables available:**
- `$TASK_IDS` - Array of task identifiers (e.g., ["T021", "T022", "T023"])
- `$FEATURE_DIR` - Path to feature specs
- `$AVAILABLE_DOCS` - List of available documentation

### 1. Load Context

Already completed by `implement.md` - you have:
- Feature directory path
- Available documentation list
- Array of task IDs to implement

### 2. Read Tasks File

Load `$FEATURE_DIR/tasks.md` and extract all requested task IDs

### 3. Validate Tasks

Ensure all requested task IDs exist
- If any missing, report which ones and abort

### 4. Spawn Subagents

For each task ID, invoke the `implement-task` subagent in parallel:

```
For each $TASK_ID in $TASK_IDS:
  Task: Implement $TASK_ID
  Subagent: implement-task
  Prompt: |
    Implement task $TASK_ID from the SpecKit feature specification.

    **Context provided:**
    - Task ID: $TASK_ID
    - Feature directory: $FEATURE_DIR
    - Available docs: $AVAILABLE_DOCS
    - Constitution path: memory/constitution.md

    **Your workflow:**
    1. Load all context files (tasks.md, plan.md, spec.md, memory files)
    2. Find and understand task $TASK_ID requirements
    3. Research implementation approach (codebase → memory → web)
    4. Implement the task following existing patterns
    5. Verify quality (lint/typecheck)
    6. Return structured result

    **Return format:**
    {
      "task_id": "$TASK_ID",
      "status": "complete" | "failed",
      "summary": "Brief description of implementation",
      "files_changed": ["path/to/file.ts"],
      "notes": "Important decisions or discoveries",
      "error": "Only if failed: describe the blocker"
    }

    Work autonomously - no user interaction. Make pragmatic decisions based on established patterns and business context.
```

**IMPORTANT**: Spawn ALL subagents in a single message using multiple Task tool invocations for true parallel execution.

### 5. Monitor Progress

- Track each subagent's progress
- Detect stuck/looping agents (same action repeated 3+ times)
- Terminate problematic agents and note the issue
- Wait for all agents to complete or timeout

### 6. Aggregate Results

Collect completion status from all subagents

### 7. Generate Summary Table

```markdown
| Task | Description | Status | Notes |
|------|-------------|--------|-------|
| T001 | Create user model | ✓ Implemented | Added validation and tests |
| T002 | Add auth middleware | ✓ Implemented | Integrated with existing auth |
| T003 | Set up database | ✗ Failed | Connection timeout - needs investigation |
```

### 8. Report Results

- Show summary table
- List any failed tasks with error details
- Suggest running `/audit T001-T003` to verify all implementations

## Behaviour Rules

- **Parallel Execution**: All tasks run simultaneously unless dependencies prevent it
- **No User Interaction**: Subagents work autonomously
- **Structured Output**: Subagents return standardised results
- **Failure Handling**: Failed tasks don't block successful ones
- **Summary Reporting**: Clear table showing all task outcomes
- **NO TASK MARKING**: Subagents do NOT mark tasks complete - that happens in `/audit`

## Why Agents Can't Spawn Sub-agents

The `implement-task` agent is defined with:
```yaml
tools: [Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch]
```

Notice the `Task` tool is NOT in the list. This prevents infinite spawning - agents simply cannot invoke other agents.

## Error Handling

- Missing tasks → Report which ones and list available tasks
- Subagent timeout → Report which tasks timed out with details
- Subagent loop detected → Terminate and report issue
- Subagent failure → Include in summary table with error details

## Success Criteria

- All requested tasks attempted
- Summary table generated with clear status indicators
- Success/failure clearly reported for each task
- Failed tasks include actionable error information
- User knows next steps (run `/audit` on completed tasks)
