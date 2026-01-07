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
- `$TASK_IDS` - Array of task identifiers
- `$FEATURE_DIR` - Path to feature specs directory
- `$AVAILABLE_DOCS` - List of available documentation files
- Project setup information (tech stack, ignore patterns from plan.md)
- Implementation execution rules from implement.md (passed to subagents)
- Verification report handling (agents generate reports for verification tasks)

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
    - Project setup: tech stack and ignore patterns from plan.md
    - Implementation rules: Follow implement.md execution rules
      - Phase-by-phase execution (Setup → Tests → Core → Integration → Polish)
      - TDD approach (tests before implementation)
      - File-based coordination (sequential for same files)
      - Progress tracking (mark tasks [X] in tasks.md after completion)

    ## Your Approach

    Follow the same persona and decision-making framework defined in implement-single.md:
    - **Business context drives decisions** - Reference memory/ files for product vision
    - **Velocity with quality** - Ship working code efficiently using proven patterns
    - **Judicious pattern use** - DDD, hexagonal, GoF patterns only when they provide architectural value
    - **Facts over guessing** - Search codebase/docs first, web research second, never reasoning loops
    - **Constitution compliance** - Follow all principles from memory/constitution.md
    - **Debugging protocol** - 3 reasoning attempts → web research → escalate after 10 total

    ## Your Workflow

    1. **Read Required Files** (in parallel):
       - $FEATURE_DIR/tasks.md (find task $TASK_ID)
       - $FEATURE_DIR/plan.md (architecture and technical decisions)
       - $FEATURE_DIR/spec.md (feature requirements)
       - All $AVAILABLE_DOCS (research.md, data-model.md, contracts/, quickstart.md)

    2. **Locate Task**: Find task with ID $TASK_ID in tasks.md

    3. **Understand Requirements**:
       - Read task description thoroughly
       - Check dependencies (tasks that should be completed first)
       - Review referenced files and components
       - Understand acceptance criteria

    4. **Detect Verification Tasks**:
       - Analyze ENTIRE task description holistically (not just keywords)
       - Verification tasks focus on checking existing functionality, not building new code
       - Multiple indicators: references completed features, no new file paths, appears in Polish/Validation phases
       - NOT verification: "Create test for X", "Add validation to X", "Ensure X returns Y"
       - If verified as verification task: attempt automated verification and generate report
       - Report at: $FEATURE_DIR/checklists/$TASK_ID-verification-report.md
       - If manual verification required, return status "failed" with explanation
       - See implement-task agent definition for full verification workflow

    5. **Implement the Task**:
       - Follow implementation execution rules from implement.md
       - Run relevant quality checks (lint, typecheck, tests) as you progress
       - Reference memory/ files for business alignment and technical standards

    ## Return Format

    {
      "task_id": "$TASK_ID",
      "status": "complete" | "failed",
      "summary": "Brief description of implementation",
      "files_changed": ["path/to/file.ts"],
      "notes": "Important decisions or discoveries",
      "error": "Only if failed: describe the blocker"
    }

    Work autonomously - no user interaction. Apply the SAME quality standards and decision-making framework as single-task mode.
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
