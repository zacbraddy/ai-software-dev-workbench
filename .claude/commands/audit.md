---
description: Audit one or more tasks after implementation. Pass single task (T001), range (T001-T005), or list (T001, T003, T007-T010).
---

User input: $ARGUMENTS

## Task Detection and Mode Selection

1. **Parse task specification(s)** from `$ARGUMENTS`:
   - Single task: `T001` (regex: `/^T\d{3}$/`)
   - Range: `T001-T005` (regex: `/^T\d{3}-T\d{3}$/`)
   - List with ranges: `T001, T003-T005, T009` (comma-separated, can include ranges)

2. **Validate format**:
   - If no valid task format detected, STOP and tell user: "Please provide task ID(s) in format: T001 (single), T001-T005 (range), or T001, T003-T005 (list)"
   - Extract all task IDs from ranges and lists into array

3. **Load context** (required for both modes):
   - Run `ai-software-dev-workbench/speckit/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks`
   - Parse JSON output to extract:
     - `FEATURE_DIR` - Path to feature specification directory
     - `AVAILABLE_DOCS` - List of available documentation files

4. **Determine execution mode and load appropriate script**:
   ```
   task_count = length of extracted task IDs array

   if (task_count == 1) {
     MODE = "SINGLE"
     Read and execute: .claude/commands/audit-single.md
   } else {
     MODE = "PARALLEL"
     Read and execute: .claude/commands/audit-parallel.md
   }
   ```

5. **Execute the loaded script**:
   - Pass variables: $TASK_ID (single) or $TASK_IDS (parallel), $FEATURE_DIR, $AVAILABLE_DOCS
   - Follow all instructions in the loaded script
   - Do NOT continue reading this file beyond this point

## Task ID Parsing Logic (Reference)

```javascript
function parseTaskIds(input) {
  const tasks = [];
  const parts = input.split(',').map(s => s.trim());

  for (const part of parts) {
    if (/^T\d{3}$/.test(part)) {
      // Single task
      tasks.push(part);
    } else if (/^T\d{3}-T\d{3}$/.test(part)) {
      // Range
      const [start, end] = part.split('-');
      const startNum = parseInt(start.substring(1));
      const endNum = parseInt(end.substring(1));
      for (let i = startNum; i <= endNum; i++) {
        tasks.push(`T${String(i).padStart(3, '0')}`);
      }
    }
  }

  return [...new Set(tasks)]; // Remove duplicates
}
```

## LEGACY CONTENT BELOW - DO NOT READ

## Mode: DIRECT (Single Task Audit)

When auditing a single task, the main agent handles it directly for maximum user control and interaction.

### Your Persona & Approach

You are a technical QA engineer validating implementations against requirements with precision whilst maintaining pragmatic velocity.

**Quality Validation Philosophy:**
- **Requirements first** - Does implementation deliver what was specified?
- **Pattern appropriateness** - Are architectural patterns used correctly for value?
- **Architecture alignment** - Does it fit the project's established patterns?
- **Right-sized quality** - Appropriate for current stage, not premature optimisation

**What You're Looking For:**
- Missing functionality described in the task
- Poor implementation that doesn't meet requirements
- Code quality issues (lint, typecheck failures)
- Test failures (unexpected ones, not TDD failures)
- Edge cases not handled
- Patterns misapplied or missing where they'd add architectural value

**What You're NOT Looking For:**
- Suggesting patterns just to use patterns
- Perfectionism that blocks shipping
- Additional features beyond task scope
- Premature optimisation
- Over-engineering for hypothetical future needs

### Execution Steps:

1. **Load Context**: Run `ai-software-dev-workbench/speckit/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` and parse JSON to get `FEATURE_DIR` and `AVAILABLE_DOCS`

2. **Read Required Files**:
   - `FEATURE_DIR/tasks.md` - Find the specific task
   - `FEATURE_DIR/plan.md` - Architecture and technical decisions
   - `FEATURE_DIR/spec.md` - Feature requirements
   - Read any `AVAILABLE_DOCS` (research.md, data-model.md, contracts/, quickstart.md)

3. **Locate Task**: Find task with ID matching `$ARGUMENTS` in tasks.md
   - If not found, report error and list available tasks

4. **Review Task Description**: Re-read the original task requirements from tasks.md

5. **Compare Implementation**: Check what has been implemented against the task description
   - Review all files mentioned in the task
   - Check for completeness
   - Verify functionality matches requirements

6. **Verify Code Quality**: Run lint, format, and typecheck scripts for affected projects
   - Fix any errors found
   - Report results to user

7. **Run Tests**: Execute relevant tests
   - Report test results
   - Expected TDD failures are acceptable
   - Unexpected failures need investigation

8. **Identify Gaps**: Look for missing functionality or poor implementations
   - Compare against original task description
   - Check for edge cases not handled
   - Verify error handling

9. **Present Findings**: Share any changes needed with rationale
   - Be specific about what's missing or wrong
   - Explain why each change is needed
   - Reference task requirements

10. **Await Verification**: Give user opportunity to discuss findings
    - User may suggest changes
    - Discuss and possibly implement suggested changes
    - **If changes made**: This audit ends - user will request new `/audit` later
    - **If no changes or user approves**: Wait for user to say "I verify the task is complete"

11. **Mark Complete** (ONLY after user says "I verify the task is complete"):
    - Mark task as `[x]` in tasks.md
    - Confirm completion to user

### Behaviour Rules:
- **Visibility**: User sees all findings in real-time
- **Interactive**: User can discuss, modify, or redirect
- **Quality Focus**: Only look for missing pieces or poor implementation
- **NOT looking for**: Over-engineering, premature optimisation, or additional features
- **Do NOT ask** if user wants task marked complete
- **Do NOT mark** complete without user saying "I verify the task is complete"
- **Do NOT add** features not requested in original task

## Mode: PARALLEL (Multiple Task Audit)

When auditing multiple tasks, spawn ONE subagent per task for efficient parallel auditing.

### Execution Steps:

1. **Load Context**: Run `ai-software-dev-workbench/speckit/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` and parse JSON to get `FEATURE_DIR` and `AVAILABLE_DOCS`

2. **Read Tasks File**: Load `FEATURE_DIR/tasks.md` and extract all requested task IDs

3. **Validate Tasks**: Ensure all requested task IDs exist
   - If any missing, report which ones and abort

4. **Spawn Subagents**: For each task ID, invoke the `audit-task` subagent:
   ```
   Task: $TASK_ID
   Subagent: audit-task
   Input: {
     task_id: "T001",
     feature_dir: "/path/to/feature",
     available_docs: ["research.md", "data-model.md", ...],
     constitution_path: "memory/constitution.md"
   }
   ```

5. **Monitor Progress**:
   - Track each subagent's progress
   - Detect stuck/looping agents
   - Wait for all agents to complete

6. **Aggregate Results**: Collect audit findings from all subagents

7. **Generate Audit Summary Table**:
   ```markdown
   | Task | Description | Status | Discrepancies |
   |------|-------------|--------|---------------|
   | T001 | Create user model | ✓ Pass | None |
   | T002 | Add auth middleware | ⚠ Issues | Missing error handling for invalid tokens |
   | T003 | Set up database | ✗ Incomplete | Connection pooling not implemented |
   ```

8. **List All Discrepancies**:
   If any tasks have issues, create numbered list of ALL fixes needed:
   ```markdown
   ## Required Fixes

   1. T002: Add error handling for invalid tokens in auth middleware
   2. T002: Add test coverage for token expiry scenario
   3. T003: Implement connection pooling in database setup
   4. T003: Add database reconnection logic
   5. T003: Update config to include pool size settings
   ```

9. **Wait for User Decision**:
   Ask user to specify which fixes to apply using one of these formats:
   - `Fix: 1, 3, 5-7, 9` (specific fixes)
   - `Fix: all except 2, 4, 8` (all except specified)
   - `Fix: all` (apply all fixes)
   - `Fix: none` (skip all fixes)

10. **Apply Selected Fixes**:
    - Parse user's fix selection
    - Apply only the specified fixes
    - Run quality checks on fixed code
    - Report completion

11. **Mark Completed Tasks**:
    - Only mark tasks as `[x]` that passed without issues
    - Tasks with applied fixes remain unmarked (user can re-audit)
    - Report final status

### Behaviour Rules:
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

## Context Awareness

The audit workflow references feature specifications and project documentation:

**Required Files:**
- `specs/[BRANCH_NAME]/spec.md` - Feature requirements and acceptance criteria
- `specs/[BRANCH_NAME]/plan.md` - Architecture and technical decisions
- `specs/[BRANCH_NAME]/tasks.md` - Task breakdown and dependencies
- `memory/constitution.md` - Project principles and standards (always verify compliance)

**Optional Files (use when needed to fill knowledge gaps):**
- `specs/[BRANCH_NAME]/research.md` - Technical research
- `specs/[BRANCH_NAME]/data-model.md` - Entity relationships
- `specs/[BRANCH_NAME]/contracts/` - API specifications
- `specs/[BRANCH_NAME]/quickstart.md` - Getting started guide
- `memory/*` - Additional project-specific knowledge files (review if you need context about project patterns, conventions, or historical decisions)

When validating implementations:
1. Check task requirements from tasks.md
2. Verify alignment with plan.md technical decisions
3. Validate against spec.md acceptance criteria
4. Verify compliance with constitution.md principles
5. If you encounter gaps in understanding, explore additional memory files for context

## Error Handling

- Invalid task format → Clear error message with examples
- Missing tasks.md → Instruct to run `/tasks` first
- Task not found → List available tasks
- Subagent timeout → Report which tasks timed out
- Invalid fix selection → Show examples and ask again

## Success Criteria

Single task mode:
- All gaps identified and presented to user
- User has reviewed findings
- User has said "I verify the task is complete"
- Task marked as `[x]` in tasks.md

Multiple task mode:
- All tasks audited
- Summary table generated with clear status
- All discrepancies listed and numbered
- User has selected which fixes to apply
- Selected fixes applied successfully
- Passing tasks marked as `[x]` in tasks.md
