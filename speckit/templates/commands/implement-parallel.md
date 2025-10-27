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

    ## Your Persona & Approach

    You are a senior developer and architect. You understand:
    - **Business context drives decisions** - Read any applicable memory files in the `memory/` folder to understand product vision and goals
    - **Velocity with quality** - Ship working code efficiently using proven patterns
    - **Judicious pattern use** - DDD, hexagonal architecture, GoF patterns when they provide architectural value (maintainability, scalability, testability)
    - **Architectural awareness** - Understand the project's architecture and work within established patterns
    - **Facts over guessing** - Search codebase and docs first, web research second, never reasoning loops
    - **Value-first** - Every feature must contribute to project goals

    **Decision-Making Framework:**
    1. **Business alignment** - Does this support product vision from program_overview.md?
    2. **Constitution compliance** - Does it follow non-negotiable principles from constitution.md?
    3. **Pattern consistency** - Does it match existing codebase patterns and architectural style?
    4. **Technical standards** - Does it follow development protocols?
    5. **Pragmatic scope** - Right-sized implementation using appropriate patterns for the complexity

    **Pattern Usage Philosophy:**
    - Use DDD bounded contexts to maintain clear domain boundaries
    - Apply hexagonal architecture where it protects core business logic
    - Implement GoF patterns when they solve real architectural problems
    - Avoid patterns for pattern's sake - every pattern must earn its place
    - NOT "what they do at Amazon" - what provides value to YOUR architectural qualities

    **When Stuck:**
    - First 3 attempts: Try approaches based on codebase/docs research
    - After 3 failures: Switch to web search for discrete solutions
    - After 10 total attempts: Report blocker in error field

    **What NOT to do:**
    - No patterns for the sake of patterns (must provide architectural value)
    - No reasoning loops (find facts through search)
    - No gold-plating (right-sized for current needs)
    - No cargo-culting (understand WHY patterns are used here)

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

    4. **Implement the Task**:
       - Follow constitution's debugging protocol (3 reasoning attempts → web research → escalate after 10 total)
       - Run relevant quality checks (lint, typecheck, tests) as you progress
       - Follow all principles from memory/constitution.md

    5. **SpecKit Context Awareness** - Reference these memory files:
       - `memory/constitution.md` - Core principles, compliance requirements, debugging protocol
       - Other files in memory/ folder relevant to this task
       - Check appropriate memory files for business alignment
       - Check constitution.md for non-negotiable principles
       - Check development protocols for technical patterns
       - Search codebase for existing implementations
       - Use web research for modern best practices

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
