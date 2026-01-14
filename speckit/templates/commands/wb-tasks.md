---
description: Generate tasks.md for user review, then create Beads task structure and optionally delete tasks.md. After this command, Beads becomes the single source of truth for task management.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

**Workflow Summary**: This command generates tasks.md as a temporary collaboration artifact → user reviews and approves → Beads structure is created from tasks.md → user verifies Beads → tasks.md is optionally deleted → Beads becomes the single source of truth for all future task management.

1. **Setup**: Run `bash speckit/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (API endpoints), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map endpoints to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md** (temporary collaboration artifact): Use `speckit/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

5. **User Review and Approval Gate - Beads Generation**:
   After tasks.md is generated, inform the user and wait for their feedback:

   ```
   I've generated a tasks file. You can find it at: $FEATURE_DIR/tasks.md

   Please review the proposed tasks and either:
   - Come back to me with suggested amendments if you'd like changes, or
   - Let me know if the tasks are OK and I'll start generating the Beads structure based on the tasks we've agreed on.
   ```

   **Iterative Review Process**:
   - **If user provides amendments or feedback**: Make the requested changes to tasks.md, then present the updated version and ask for review again (repeat until user is satisfied)
   - **If user confirms tasks are OK** (e.g., "looks good", "proceed", "tasks are fine", "generate beads"): Proceed to Step 6 (Generate Beads structure)
   - **If user wants to exit** (e.g., "stop", "cancel", "I'll do this later"): Exit gracefully with message "No problem. You can re-run this command when you're ready to continue."

   IMPORTANT:
   - Do NOT proceed with Beads generation until user explicitly confirms the tasks are acceptable
   - Be prepared to iterate on tasks.md multiple times based on user feedback
   - Only move to Step 6 after user gives clear approval

6. **Generate Beads structure via Agent Orchestration**:
   After user approval, orchestrate parallel agent-based migration using bead-creator and tasks-audit agents.

   **Step 6.1: Check Beads Availability**
   - Run `bd --version` to verify Beads CLI is installed
   - If not available: Skip Beads generation, report warning to user
   - If available: Proceed with orchestrated Beads structure creation

   **Step 6.2: Create Epic (Orchestrator Creates Directly)**

   **Extract Epic Title**:
   - Read spec.md first line matching pattern `# Feature Specification: ...`
   - Extract title after the colon (e.g., "AI Software Dev Workbench Integration Improvements")

   **Synthesize Epic Description** per `contracts/beads-synthesis-templates.md` Epic template:

   1. **Overview** (2-3 sentence summary):
      - Read spec.md Overview section or first paragraph after title
      - Extract 2-3 sentences that describe feature purpose and value
      - Example: "This feature transforms the AI Software Dev Workbench's task management from plain markdown to a structured Beads-based system, resolves command naming conflicts with Claude Code built-ins, and significantly improves integration with Serena and Context7 MCP servers."

   2. **Implementation Strategy**:
      - **MVP First**: Identify P1 user stories from spec.md
        - Look for "Priority: P1" in user story headers
        - Describe P1 stories as minimum viable implementation
        - Example: "US1 (Beads Integration) and US2 (Command Namespacing) form the minimum viable implementation"
      - **Incremental Delivery**: Identify P2/P3 user stories
        - Look for "Priority: P2" and "Priority: P3"
        - Describe how they add value incrementally
        - Example: "US3 (Serena MCP) and US4 (Context7 MCP) add enhanced tool integration"
      - **Parallel Team**: Analyse tasks.md for parallel opportunities
        - Identify which stories can proceed in parallel after dependencies met
        - Note story groupings from tasks.md Dependencies section
        - Example: "After US1+US2 complete, US3/US4/US5 can proceed in parallel"

   3. **Overall Dependency Flow**:
      - Read tasks.md Dependencies section
      - Extract high-level phase dependencies (Setup → Foundational → User Stories)
      - Identify story blocking relationships
      - Example: "Setup (Phase 1) → Foundational (Phase 2) → P1 Stories (US1, US2) sequentially → P2 Stories (US3, US4, US5) in parallel"

   4. **Story Dependency Rules**:
      - From tasks.md Dependencies section, extract user story dependencies
      - List which stories MUST complete before others
      - List which stories CAN proceed in parallel
      - Include reasons for dependencies (e.g., "other stories depend on Beads being functional")
      - Example:
        - "US1 (Beads Integration) MUST complete before US3, US5, US6, US7"
        - "US3 (Serena MCP) can start after US1+US2, independent of US4-US5"

   5. **Scope**:
      - Count functional requirements: Search spec.md for FR-001, FR-002 patterns or count user stories
      - Count tasks: Parse tasks.md for T001, T002 patterns
      - Count phases: Count "Phase N:" headers in tasks.md
      - Example: "50 functional requirements (FR-001 to FR-050), 121 tasks (T001-T121), 9 phases (Setup, Foundational, US1-US7)"

   **Write Epic Description to Temp File**:
   - Generate timestamp: `TIMESTAMP=$(date +%s)`
   - Create temp file path: `/tmp/epic-description-${TIMESTAMP}.md`
   - Write description using template format:
     ```markdown
     # [Epic Title]

     ## Overview
     [2-3 sentence summary]

     ## Implementation Strategy
     - **MVP First**: [P1 stories description]
     - **Incremental Delivery**: [P2/P3 stories description]
     - **Parallel Team**: [Parallel opportunities description]

     ## Overall Dependency Flow
     [High-level phase and story dependencies]

     ## Story Dependency Rules
     - [Story X MUST complete before Story Y]
     - [Stories A, B, C can proceed in parallel]

     ## Scope
     [FR count, task count, phase count]
     ```

   **Execute Beads Command**:
   - Run: `bd create "EPIC_TITLE" -t epic -p 1 --body-file /tmp/epic-description-${TIMESTAMP}.md --json`
   - Capture JSON output
   - Parse JSON to extract epic ID from `.id` field (e.g., "bd-a3f8")
   - Store epic ID for use in Step 6.3 (story creation)

   **Clean Up**:
   - Remove temp file: `rm /tmp/epic-description-${TIMESTAMP}.md`

   **Step 6.3: Plan Agent Orchestration**

   Parse tasks.md to identify user stories, phases, and task groupings:

   1. **Identify User Stories and Phases**:
      - Parse tasks.md for phase headers: "## Phase N: [Phase Name]"
      - Extract user story labels from task markers: [US1], [US2], [US3], etc.
      - Group tasks by:
        - **Phase-based**: Setup (T001-T011), Foundational (T012-T021c)
        - **Story-based**: US1 (all tasks with [US1] marker), US2 (all tasks with [US2] marker)
        - **Range-based**: Consecutive task ranges within same grouping

   2. **Determine Agent Assignment Strategy**:
      - Analyse task density per user story:
        - If story has <15 tasks: Single agent handles entire story
        - If story has ≥15 tasks: Split into sub-ranges (Phase A, Phase B, etc.)
      - Maximum concurrent agents: 3-5 (configured for system capacity)
      - Create agent workload assignments:
        ```
        assignments = [
          {"agent": "bead-creator-phase0", "story_id": "Phase 0", "task_range": "T001-T011", "task_count": 11},
          {"agent": "bead-creator-us1a", "story_id": "US1", "task_range": "T012-T021c", "task_count": 10},
          {"agent": "bead-creator-us1b", "story_id": "US1", "task_range": "T022-T031", "task_count": 10},
          {"agent": "bead-creator-us2", "story_id": "US2", "task_range": "T042-T061", "task_count": 20},
          ...
        ]
        ```

   3. **Create Migration Tracking File**:
      - Create `$FEATURE_DIR/migration-tracking.md` with initial state:
        ```markdown
        # Bead Migration Tracking

        **Feature**: [feature-name]
        **Date**: [date]
        **Epic ID**: [epic-id]

        ## Overall Status

        - **Total Tasks**: [count]
        - **Agent Assignments**: [count]
        - **Status**: In Progress

        ## Agent Assignments

        ### Agent 1: Phase 0 (T001-T011)
        - **Status**: Pending
        - **Tasks**: 11 tasks assigned
        - **Feature ID**: (to be created by agent)

        [... continue for all agents ...]
        ```

   **Step 6.4: Spawn Bead-Creator Agents in Parallel**

   For each agent assignment (enforcing max 3-5 concurrent):

   1. **Spawn bead-creator agent** using Task tool:
      ```
      Call Task tool with:
        subagent_type: "bead-creator"
        description: "Create beads for [story_id] [task_range]"
        prompt: "
          You are creating Beads (Epic/Story/Tasks) for a feature specification migration.

          **Assignment**:
          - Story/Phase: [story_id]
          - Task Range: [task_range]
          - Epic ID (parent): [epic-id]

          **Context Files** (read ALL before proceeding):
          - $FEATURE_DIR/tasks.md (source of all task data)
          - $FEATURE_DIR/spec.md (user stories, acceptance scenarios)
          - $FEATURE_DIR/plan.md (technical notes, architecture)
          - $FEATURE_DIR/contracts/beads-synthesis-templates.md (description templates)
          - $FEATURE_DIR/contracts/beads-cli.md (command reference - prevent reasoning overhead)

          **Your Task**:
          1. Identify if this is a phase (Setup, Foundational) or user story (US1, US2, etc.)
          2. Create Feature (Story) for this grouping:
             - Synthesize description per Story template in beads-synthesis-templates.md
             - Use Epic ID as parent
             - Map priority: P1→1, P2→2, P3→3
          3. Create Tasks for assigned range:
             - Extract task metadata from tasks.md (ID, title, [P] marker, checkbox status)
             - Synthesize description per Task template in beads-synthesis-templates.md
             - Set correct status: [x]→closed, [ ]→open
             - Add label with task number: --label T001
             - Use Feature ID as parent
          4. Create dependencies:
             - Parse explicit dependencies from task descriptions
             - Create sequential dependencies for non-[P] tasks
          5. Report results as JSON:
             {
               \"agent_id\": \"bead-creator-us1a\",
               \"assignment\": \"US1 Phase A (T012-T021c)\",
               \"feature_id\": \"techsift-5bb.2\",
               \"tasks_created\": [
                 {\"task_number\": \"T012\", \"bead_id\": \"techsift-5bb.2.1\", \"status\": \"created\"},
                 ...
               ],
               \"failures\": [
                 {\"task_number\": \"T015\", \"error\": \"...\", \"suggested_action\": \"...\"},
                 ...
               ]
             }

          **CRITICAL**:
          - Create ALL dependencies documented in task descriptions (no filtering)
          - Ensure FULL CONTEXT synthesis (descriptions must be self-contained)
          - Use beads-cli.md for exact command syntax (do not reason about commands)
          - Run 'bd sync' at session end before returning
        "
      ```

   2. **Batching Strategy**:
      - Spawn first batch of 3-5 agents
      - Wait for batch completion
      - Spawn next batch
      - Repeat until all assignments processed

   3. **Collect agent outputs** as they complete

   **Step 6.5: Collect Agent Results**

   After all agents complete:

   1. **Parse agent outputs**:
      - Extract JSON result from each agent's final response
      - Parse feature_id, tasks_created, failures

   2. **Update migration-tracking.md**:
      ```markdown
      ## Agent Results

      ### Agent 1: Phase 0 (T001-T011)
      - **Status**: ✅ COMPLETE
      - **Feature ID**: techsift-5bb.1
      - **Tasks**: 11/11 created
      - **Failures**: None

      ### Agent 2: US1 Phase A (T012-T021c)
      - **Status**: ⚠️  PARTIAL
      - **Feature ID**: techsift-5bb.2
      - **Tasks**: 7/10 created
      - **Failures**:
        - T015: Failed to parse file paths from description
        - T018: Dependency resolution error (T017 not found)
        - T020: Description synthesis timeout

      ## Failures Requiring Action

      1. **T015** - Failed to parse file paths
         - Agent: bead-creator-us1a
         - Error: Failed to parse file paths from description
         - Action: Review task description format in tasks.md

      [... continue for all failures ...]
      ```

   3. **Calculate overall status**:
      - Total tasks assigned: [count]
      - Successfully created: [count]
      - Failed: [count]
      - Completion rate: [percentage]%

   **Step 6.6: Attempt Failure Remediation**

   For each failure in migration-tracking.md:

   1. **Analyse failure type**:
      - Dependency resolution errors → Create missing dependencies first
      - Parsing errors → Fix task description format
      - Timeout/synthesis errors → Retry with adjusted prompt

   2. **Attempt fixes with retry limit**:
      ```
      max_attempts = 3
      for failure in failures:
        attempt_count = 0
        while attempt_count < max_attempts:
          try:
            # Re-spawn bead-creator agent for this specific task
            # Or manually create/fix using bd commands
            fix_result = attempt_fix(failure)
            if fix_result.success:
              mark_as_success(failure)
              update_tracking_file(failure, "FIXED")
              break
          except error:
            attempt_count++
            log_attempt(failure, error)

        if attempt_count >= max_attempts:
          escalate_to_user(failure)
      ```

   3. **Update tracking file** after each fix attempt

   4. **If all fixes successful**: Proceed to Step 6.7
   5. **If failures persist**: Report to user and ask for guidance

   **Step 6.7: Call Tasks-Audit Agent**

   Spawn tasks-audit agent to verify migration accuracy:

   1. **Spawn tasks-audit agent** using Task tool:
      ```
      Call Task tool with:
        subagent_type: "tasks-audit"
        description: "Audit Beads migration completeness"
        prompt: "
          You are auditing a Beads migration for completeness and accuracy.

          **Context**:
          - Epic ID: [epic-id]
          - Source: $FEATURE_DIR/tasks.md (source of truth)
          - Verification checklist: $FEATURE_DIR/contracts/beads-synthesis-templates.md

          **Your Task**:
          1. Load all beads for this Epic: 'bd list --json'
          2. Verify Epic against checklist (see beads-synthesis-templates.md Epic section)
          3. Verify each Feature (Story) against checklist
          4. Verify each Task against checklist
          5. Generate audit report as JSON:
             {
               \"epic\": {
                 \"id\": \"techsift-5bb\",
                 \"completeness_score\": \"85%\",
                 \"issues\": [
                   {\"type\": \"missing_content\", \"field\": \"overview\", \"severity\": \"high\", \"fix\": \"...\"},
                   ...
                 ]
               },
               \"features\": [...],
               \"tasks\": [...],
               \"overall_completeness\": \"88%\",
               \"total_issues\": 47
             }

          **Save audit report** to: $FEATURE_DIR/migration-audit-report.json

          **CRITICAL**:
          - Check EVERY field in synthesis templates
          - Report ALL issues (not just critical ones)
          - Provide specific fix instructions for each issue
        "
      ```

   2. **Wait for audit completion**

   3. **Parse audit report**:
      - Read `$FEATURE_DIR/migration-audit-report.json`
      - Extract all issues

   **Step 6.8: Apply Audit Fixes in Batches**

   Process audit issues in batches of 10:

   1. **Create fix checklist** in `$FEATURE_DIR/migration-audit-fixes.md`:
      ```markdown
      # Migration Audit Fixes

      **Total Issues**: 47
      **Completed**: 0
      **Remaining**: 47

      ## Batch 1 (Issues 1-10)

      - [ ] Fix 1: Epic - Add complete overview from spec.md
      - [ ] Fix 2: Epic - Add missing scope metrics
      - [ ] Fix 3: US1 - Add acceptance scenarios 4-6
      [... continue for batch 1 ...]

      ## Batch 2 (Issues 11-20)

      - [ ] Fix 11: ...
      [... continue ...]
      ```

   2. **Process each batch**:
      ```
      batches = split_into_batches(issues, batch_size=10)

      for batch in batches:
        for fix in batch:
          # Apply fix using bd update commands
          apply_fix(fix)
          
          # Mark complete in checklist
          mark_complete_in_checklist(fix)

        # Save checklist after each batch
        save_checklist()

        # Check context usage
        if context_usage > 150k_tokens:
          prompt_user("Context approaching limit. Continue or pause?")
      ```

   3. **Fix types and commands**:
      - **Missing/incorrect description**: 
        - Write fixed description to temp file
        - `bd update {id} --body-file /tmp/fixed-desc.md`
      - **Missing labels**: 
        - `bd update {id} --add-label T001`
      - **Missing dependencies**: 
        - `bd dep add {child-id} {parent-id}`
      - **Wrong status**: 
        - `bd update {id} --status {correct-status}`

   4. **After all fixes applied**:
      - Run `bd sync` to commit changes
      - Verify checklist is 100% complete

   **Step 6.9: Clean Up and Finalize**

   1. **Archive tracking files** (optional):
      - Move to `$FEATURE_DIR/.migration-archive/`
      - Or delete if user prefers clean state

   2. **Run final verification**:
      ```bash
      # Verify expected count
      bd list --json | jq 'length'
      
      # Check for any issues
      bd doctor
      
      # Ensure synced to git
      bd sync
      ```

   3. **Generate completion report**:
      ```markdown
      # Migration Complete

      **Feature**: [feature-name]
      **Date**: [date]
      **Duration**: [duration]

      ## Results

      - **Epic**: ✅ Created with full context synthesis
      - **Features**: ✅ [count] created
      - **Tasks**: ✅ [count] created with labels and dependencies
      - **Completeness**: 100% (all audit issues resolved)

      ## Beads Database

      - **Total Issues**: [count] (1 epic + N features + M tasks)
      - **Status**: Synced to git
      - **Ready**: True

      ## Next Steps

      - Begin implementation with /wb-implement {bead-id}
      - Use labels for reference: bd list --label-any T001
      - View ready tasks: bd ready
      ```

   4. **Present verification commands to user**:
      ```
      Beads structure has been created successfully via agent orchestration!

      **Migration Summary**:
      - Epic: [epic-id]
      - Features: [count] created
      - Tasks: [count] created with labels (T001, T002, etc.)
      - Dependencies: All relationships created
      - Audit: 100% completeness verified

      **Verification Commands**:
      - View all: bd list
      - View Epic: bd show [epic-id]
      - View ready tasks: bd ready
      - View by label: bd list --label-any T001

      Would you like me to delete tasks.md? (Y/n)
      ```

   5. **Handle tasks.md deletion** (same as current Step 6.7 logic)

   6. **Run final bd sync** and proceed to Step 7 (Report)

7. **Report**: Output workflow summary:
   - **tasks.md Status**:
     - If deleted: "tasks.md has been deleted. Beads is now the single source of truth."
     - If kept: "tasks.md kept for reference at $FEATURE_DIR/tasks.md. Beads is the primary source of truth."
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)
   - **Beads structure summary**:
     - Epic ID and title
     - Story count and IDs
     - Task count with T001 labels (use 'bd list' to view tasks with labels)
     - Note: Tasks are labeled with T001, T002, etc. for planning reference; use Beads IDs (bd-abc) for implementation commands
     - Confirmation: `bd sync` completed successfully
   - **Next Steps**:
     - Use `bd ready` to see tasks available to work
     - Use `bd show <beads-id>` to view task details
     - Use `/wb-implement <beads-id>` to start working on a task
     - Task management is now done entirely through Beads commands

Context for task generation: {ARGS}

**Important**: tasks.md is a temporary collaboration artifact used for user review and Beads generation. Once Beads structure is created and verified, tasks.md is typically deleted and Beads becomes the single source of truth. Each task must be specific enough that an LLM can complete it from the Beads description without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label  
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Endpoints/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each contract/endpoint → to the user story it serves
   - If tests requested: Each contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns
