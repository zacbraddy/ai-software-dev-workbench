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
- `$TASK_IDS` - Array of task identifiers to audit
- `$FEATURE_DIR` - Path to feature specs directory
- `$AVAILABLE_DOCS` - List of available documentation files
- Project setup information (tech stack from plan.md)
- Audit execution rules from audit.md (passed to subagents)
- Verification report handling (agents audit reports for verification tasks)

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
    - Project setup: tech stack from plan.md
    - Audit rules: Follow audit.md execution rules
      - Quality Validation Philosophy (value first, pattern appropriateness, constitution compliance)
      - What to Check (missing functionality, poor implementation, quality issues, edge cases)
      - What NOT to Check (patterns for patterns' sake, perfectionism, additional features)
      - Pattern Validation (DDD encapsulation, hexagonal dependencies, GoF problem solving)

    ## Your Approach

    Follow the same quality validation philosophy defined in audit-single.md:
    - **Value first** - Does implementation deliver value as defined in applicable memory files?
    - **Pattern appropriateness** - Are patterns used correctly for architectural value?
    - **Architecture alignment** - Does it fit the project's patterns?
    - **Constitution compliance** - Follow all principles from memory/constitution.md
    - **Right-sized quality** - Appropriate for current stage, not premature optimisation

    ## Your Workflow

    1. **Read Required Files** (in parallel):
       - $FEATURE_DIR/tasks.md (find task $TASK_ID)
       - $FEATURE_DIR/plan.md (architecture and technical decisions)
       - $FEATURE_DIR/spec.md (feature requirements)
       - All $AVAILABLE_DOCS (research.md, data-model.md, contracts/, quickstart.md)

    2. **Locate Task**: Find task with ID $TASK_ID in tasks.md

    3. **Review Task Description**: Re-read the original task requirements from tasks.md

    4. **Detect Verification Tasks**:
       - Analyze ENTIRE task description holistically (not just keywords)
       - Verification tasks focus on checking existing functionality, not building new code
       - Multiple indicators: references completed features, no new file paths, appears in Polish/Validation phases
       - NOT verification: "Create test for X", "Add validation to X", "Ensure X returns Y"
       - If verified as verification task: check for verification report at $FEATURE_DIR/checklists/$TASK_ID-verification-report.md
       - If no report: Return status "incomplete" with error message
       - If report exists: Audit the verification report quality, not code
       - Skip code quality checks and tests for verification tasks
       - See audit-task agent definition for full verification audit workflow

    5. **Compare Implementation**: Check what has been implemented against the task description
       - Review all files mentioned in the task
       - Check for completeness
       - Verify functionality matches requirements

    6. **Verify Code Quality**: Run appropriate quality gates based on task type
       - For code changes: lint, typecheck, test scripts
       - For documentation: proof read for logic fallacies or undocumented sections
       - Make judgement call on what is appropriate for this specific task
       - Report results

    7. **Run Tests**: Execute relevant tests (if applicable)
       - Report test results
       - Expected TDD failures are acceptable
       - Unexpected failures need investigation

    8. **Identify Gaps**: Look for missing functionality or poor implementations
       - Compare against original task description
       - Check for edge cases not handled
       - Verify error handling

    9. **SpecKit Context Awareness** - Reference memory files:
       - `memory/program_overview.md` - Product vision, value definition
       - `memory/constitution.md` - Core principles, compliance requirements
       - Other files in memory/ folder relevant to validation
       - Verify against constitution principles
       - Validate appropriate quality gates
       - Ensure value delivery

    ## Return Format

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
        "lint": "pass" | "fail" | "n/a",
        "typecheck": "pass" | "fail" | "n/a",
        "tests": "pass" | "fail" | "n/a"
      }
    }

    Work autonomously - no user interaction. Apply the SAME quality standards and validation framework as single-task audit mode.
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
