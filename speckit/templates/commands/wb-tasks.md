---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

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

4. **Generate tasks.md**: Use `speckit/templates/tasks-template.md` as structure, fill with:
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

6. **Generate Beads structure**:
   After user approval, create Beads Epic/Story/Task hierarchy using `bd create` commands:

   **Step 6.1: Check Beads Availability**
   - Run `bd --version` to verify Beads CLI is installed
   - If not available: Skip Beads generation, report warning to user
   - If available: Proceed with Beads structure creation

   **Step 6.2: Create Epic**

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

   **Step 6.3: Create Stories**

   For each user story in spec.md (in priority order P1, P2, P3):

   **Extract User Story Metadata**:
   - Parse spec.md for user story headers matching pattern `### User Story N - [Title] (Priority: P[1-3])`
   - Extract story number (e.g., "1" from "User Story 1")
   - Extract story title (e.g., "Beads Task Management Integration")
   - Extract priority (P1, P2, or P3) - maps to Beads priority: P1→1, P2→2, P3→3
   - Store user story label (e.g., "US1", "US2", "US3")

   **Synthesize Story Description** per `contracts/beads-synthesis-templates.md` Story template:

   1. **Title**:
      - Use format: `# [User Story Title from spec.md]`
      - Example: `# US1 - Beads Task Management Integration`

   2. **Goal** (1-2 sentence description):
      - Read spec.md paragraph starting with "**Why this priority**:"
      - Extract the explanation sentence(s) after this marker
      - Include what the story delivers and why it's valuable
      - Example: "Replace markdown task files with Beads task management whilst preserving spec.md and plan.md as markdown, providing structured task tracking with proper hierarchies and relationships between epics, user stories, and tasks."

   3. **Independent Test Criteria**:
      - Read spec.md paragraph starting with "**Independent Test**:"
      - Extract the test description explaining how to verify this story independently
      - Include commands to run, expected behaviour, verification steps
      - Example: "Run `/wb-tasks`, `/wb-implement T001`, and `/wb-audit T001` commands. Verify that `.beads/` directory is created/updated with Epic, Stories, and Tasks whilst spec.md and plan.md remain unchanged in markdown format."

   4. **Acceptance Scenarios**:
      - Read spec.md section "**Acceptance Scenarios**:"
      - Extract ALL Given/When/Then scenarios (typically 4-6 scenarios per story)
      - Preserve exact wording from spec.md
      - Include scenario numbering (1., 2., 3., etc.)
      - Example:
        ```
        1. **Given** a feature specification exists, **When** developer runs the tasks generation command, **Then** Beads files are created mapping spec to epic, user stories to phases, and individual tasks to Beads tasks
        2. **Given** Beads task files exist, **When** developer runs any implement command variant...
        ```

   5. **Checkpoints** (if multi-phase story):
      - Look in tasks.md for this story's phase
      - Search for "**Checkpoint**:" markers or "Checkpoint A/B/C" in task descriptions
      - If found: Extract checkpoint descriptions showing incremental progress milestones
      - If NOT found: Omit this section (not all stories have checkpoints)
      - Example:
        ```
        - **Checkpoint A**: /wb-tasks command functional, can generate Beads structure from spec+plan
        - **Checkpoint B1**: Dual-write partial - test /wb-implement on sample task
        - **Checkpoint C**: Beads-only mode - markdown tasks.md no longer used
        ```

   6. **Technical Notes**:
      - Read plan.md section corresponding to this user story (search for story title or number)
      - Extract architecture decisions, patterns to follow, constraints
      - Include technology stack choices, storage locations, implementation approaches
      - Example:
        ```
        - Beads storage location: `.beads/` directory at repo root (version controlled)
        - Beads CLI wrapper: ai-software-dev-workbench/speckit/utils/beads.ts
        - Migration strategy: Three-phase approach (Phase A: implement /wb-tasks, Phase B: dual-write period, Phase C: cutover)
        ```

   7. **Dependencies**:
      - Analyse story ordering from tasks.md Dependencies section
      - Identify which stories this story DEPENDS ON (must complete before this story starts)
      - Identify which stories this story BLOCKS (cannot start until this story completes)
      - Identify which stories can proceed IN PARALLEL with this story (no conflicts)
      - Example:
        ```
        - Depends on: Foundational phase (T005-T009) completing to provide Beads wrapper utilities
        - Blocks: US3 (Serena), US5 (Installation), US6 (Cleanup), US7 (Documentation) from starting
        - Can proceed in parallel with: US2 (Command Namespacing) - different files, no conflicts
        ```

   **Write Story Description to Temp File**:
   - Generate timestamp: `TIMESTAMP=$(date +%s)` (reuse from Epic creation if same session)
   - Create temp file path: `/tmp/story-${US_NUMBER}-description-${TIMESTAMP}.md`
   - Write description using template format:
     ```markdown
     # [Story Title]

     ## Goal
     [1-2 sentence description from "Why this priority"]

     ## Independent Test Criteria
     **How to verify this story works independently**:
     [Description from "Independent Test" paragraph in spec.md]

     ## Acceptance Scenarios
     [Numbered list of Given/When/Then scenarios from spec.md]

     ## Checkpoints (if multi-phase story)
     - **Checkpoint A**: [Description]
     - **Checkpoint B**: [Description]
     [Omit this section if no checkpoints found]

     ## Technical Notes
     [Architecture decisions, patterns, constraints from plan.md]

     ## Dependencies
     - Depends on: [Story IDs or phase names]
     - Blocks: [Story IDs that cannot start until this completes]
     - Can proceed in parallel with: [Story IDs with no conflicts]
     ```

   **Execute Beads Command**:
   - Map priority to Beads priority: P1→1, P2→2, P3→3
   - Run: `bd create "STORY_TITLE" -t feature -p BEADS_PRIORITY --parent EPIC_ID --body-file /tmp/story-${US_NUMBER}-description-${TIMESTAMP}.md --json`
   - Capture JSON output
   - Parse JSON to extract story ID from `.id` field (e.g., "bd-a3f8.1")
   - Store mapping: US1 → story ID (e.g., {"label": "US1", "id": "bd-a3f8.1", "title": "Beads Task Management Integration"})

   **Clean Up**:
   - Remove temp file: `rm /tmp/story-${US_NUMBER}-description-${TIMESTAMP}.md`

   **Repeat for All User Stories**:
   - Process stories in priority order: all P1 stories first, then P2, then P3
   - Maintain story ID mappings for use in Step 6.4 (Task creation)
   - Build stories array: `[{"label": "US1", "id": "bd-xxx", "title": "..."}, ...]`

   **Step 6.4: Create Tasks**

   For each task in tasks.md (in execution order T001, T002, T003...):

   **Extract Task Metadata**:
   - Parse tasks.md for task entries matching pattern: `- [ ] T\d{3} [P?] [Story?] Description`
   - Extract task ID (e.g., "T001", "T002", "T003")
   - Extract task title/description (text after markers, before file paths)
   - Extract [P] marker: Present = parallelizable (true), Absent = sequential (false)
   - Extract [Story] label (e.g., "[US1]", "[US2]") if present
   - Extract checkbox status: `[ ]` = pending, `[x]` or `[X]` = complete

   **Map Task to Parent Story**:
   - IF task has [Story] label (e.g., [US1]):
     - Look up story ID from stories array built in Step 6.3
     - Example: [US1] → find story with label "US1" → use its Beads ID as parent
   - ELSE IF task is in Setup phase (before first user story phase):
     - Assign to first story in array (typically US1 or setup story)
   - ELSE IF task is in Foundational phase:
     - Assign to first story in array (typically US1 or foundational story)
   - ELSE IF task is in Polish/Final phase:
     - Assign to last story in array
   - ELSE:
     - Analyse task location in tasks.md, determine which phase header it's under
     - Map phase to story based on section headers

   **Synthesize Task Description** per `contracts/beads-synthesis-templates.md` Task template:

   1. **Title**:
      - Use format: `# [Task ID] [Task Description from tasks.md]`
      - Example: `# T020 - Create TEMPORARY markdown-to-Beads migration utility`

   2. **File Paths**:
      - Parse task description and additional task details for file paths
      - Look for patterns: `src/...`, `packages/...`, absolute paths, `in FILE_PATH`, `to FILE_PATH`
      - List all files this task creates, modifies, or deletes
      - Include CREATE/MODIFY/DELETE annotations
      - If no explicit paths found in tasks.md, infer from plan.md structure section
      - Example:
        ```
        ## File Paths
        - techsift/migrate-tasks-to-beads.ts (CREATE - temporary, will be deleted in T023)
        - .beads/issues.jsonl (MODIFY - add Epic/Story/Task entries)
        ```

   3. **Acceptance Criteria**:
      - Extract explicit criteria from tasks.md task description
      - Look for bullet points after task title, "must", "should", "verify" keywords
      - If no explicit criteria in tasks.md: Infer from plan.md task details
      - Generate specific, testable criteria based on task action verbs:
        - "Create" → File exists, contains expected structure
        - "Implement" → Functionality works, tests pass
        - "Update" → Changes applied correctly, no regressions
        - "Migrate" → Source → destination mapping complete, validation passes
      - Each criterion should be verifiable via command, test, or observation
      - Example:
        ```
        ## Acceptance Criteria
        - Migration utility reads markdown tasks.md and extracts Epic/Story/Task data
        - Epic description synthesized per Epic template (overview, implementation strategy, dependency flow, story rules, scope)
        - Story description synthesized per Story template (goal, independent test criteria, acceptance scenarios, checkpoints, technical notes, dependencies)
        - Task description synthesized per Task template (file paths, acceptance criteria, task-specific notes, dependencies, testing instructions)
        - Utility validates markdown structure before migration (no parsing errors)
        - Utility outputs validation report showing completeness percentage
        ```

   4. **Task-Specific Notes**:
      - Scan task description for special markers:
        - **IMPORTANT**: Critical information for implementation
        - **CRITICAL**: Blocking issues or requirements
        - **WARNING**: Potential pitfalls or gotchas
        - **TEMPORARY**: Scaffolding code that will be deleted later
        - **NOTE**: Additional context or explanations
      - Preserve exact wording from tasks.md
      - Include marker type and description
      - Example:
        ```
        ## Task-Specific Notes
        **IMPORTANT**: This is TEMPORARY SCAFFOLDING created in techsift root (not ai-software-dev-workbench) to avoid polluting workbench git history. Will be deleted in T023 after migration verified.

        **CRITICAL**: Ensure FULL CONTEXT PARITY - Epic/Story/Task descriptions must contain ALL project management context from markdown so developers don't need to reference source documents during implementation.
        ```

   5. **Dependencies**:
      - Analyse task relationships from tasks.md:

      **Depends On** (tasks that MUST complete before this task):
      - Look for explicit "Depends on: T001" or "(depends on T002)" in task description
      - If task is NOT marked [P] and is NOT first in phase: Depends on previous task in same phase
      - If task mentions "after T001" or "requires T002": Add dependency
      - Example: T002 depends on T001 if T001 must complete first

      **Blocks** (tasks that CANNOT start until this task completes):
      - Reverse lookup: Which tasks list this task as dependency?
      - If this task creates infrastructure needed by later tasks: List those tasks
      - Example: T001 blocks T002 if T002 depends on T001

      **Parallel With** (tasks that CAN run simultaneously):
      - IF task is marked [P]: Analyse file path conflicts with other [P] tasks
      - File conflict detection algorithm:
        1. Extract all file paths from current task description (from tasks.md "File Paths" section if present, or inline file references)
        2. For each other [P] task in same phase:
           - Extract file paths from that task's description
           - Compare file paths between current task and candidate parallel task
           - IF any file path overlaps: CONFLICT - cannot run in parallel
           - IF no file path overlaps: CAN run in parallel
        3. Generate "Parallel with" list including only non-conflicting [P] tasks
      - File path parsing strategy:
        - Look for patterns: `src/...`, `packages/...`, absolute paths
        - Look for keywords: "in FILE", "to FILE", "at FILE", "FILE_PATH"
        - Include both CREATE and MODIFY file operations (DELETE typically safe for parallel)
        - Normalize paths for comparison (remove leading ./, resolve relative paths)
      - Tasks in different phases typically cannot run in parallel (different dependency chains)
      - Example: T005 [P] creates `src/utils/beads.ts`, T006 [P] creates `src/utils/mapper.ts` → Can run in parallel (different files)
      - Example: T007 [P] modifies `package.json`, T008 [P] modifies `package.json` → CANNOT run in parallel (same file conflict)

      - Format dependencies as:
        ```
        ## Dependencies
        - Depends on: T007, T008, T009 (Beads wrapper utilities must exist)
        - Blocks: T021 (migration execution), T022 (verification), T023 (deletion)
        - Parallel with: None (sequential migration workflow)
        ```

   6. **Testing Instructions** (post-completion verification):
      - Generate verification steps based on task type:

      **For "Create" tasks** (new files):
      - Verify file exists at expected path
      - Verify file contains expected structure/exports
      - Run linter/type checker to verify no errors
      - Example: `ls -l FILE_PATH`, `npx tsc --noEmit FILE_PATH`

      **For "Implement" tasks** (functionality):
      - Run relevant tests (unit, integration)
      - Verify functionality works via manual test or example usage
      - Check for error handling edge cases
      - Example: `npm test -- FILE_PATH.test.ts`, manual workflow test

      **For "Update" tasks** (modifications):
      - Verify changes applied correctly (grep, diff)
      - Run regression tests to ensure no breakage
      - Verify backward compatibility if needed
      - Example: `git diff FILE_PATH`, `npm test`

      **For "Migrate" tasks** (data transformations):
      - Run migration with --dry-run flag first
      - Verify source → destination mapping completeness
      - Generate validation report
      - Verify rollback procedure works
      - Example: `node script.ts --dry-run`, compare counts

      - Format testing instructions with numbered steps and expected output:
        ```
        ## Testing Instructions (post-completion)
        Run migration utility with `node techsift/migrate-tasks-to-beads.ts --dry-run` and verify:
        1. Console output shows Epic/Story/Task synthesis in progress
        2. Validation report displays 100% completeness for all sections
        3. Sample Epic description matches template structure
        4. Sample Story description includes checkpoints and dependencies
        5. Sample Task description includes file paths and testing instructions
        ```

   **Write Task Description to Temp File**:
   - Generate timestamp: `TIMESTAMP=$(date +%s)` (reuse from Epic/Story creation if same session)
   - Create temp file path: `/tmp/task-${TASK_ID}-description-${TIMESTAMP}.md`
   - Write description using template format:
     ```markdown
     # [Task ID] [Task Title]

     ## File Paths
     - [File path 1] (CREATE/MODIFY/DELETE annotation)
     - [File path 2] (CREATE/MODIFY/DELETE annotation)

     ## Acceptance Criteria
     - [Specific testable criterion 1]
     - [Specific testable criterion 2]

     ## Task-Specific Notes
     **IMPORTANT**: [Critical information]
     **TEMPORARY**: [Scaffolding notes]
     [Other markers as found]

     ## Dependencies
     - Depends on: [Task IDs that must complete before this task]
     - Blocks: [Task IDs that cannot start until this task completes]
     - Parallel with: [Task IDs that can run simultaneously]

     ## Testing Instructions (post-completion)
     [Numbered verification steps with expected output]
     1. [First verification step]
     2. [Second verification step]
     ```

   **Execute Beads Command**:
   - Run: `bd create "TASK_TITLE" -t task -p 2 --parent STORY_ID --body-file /tmp/task-${TASK_ID}-description-${TIMESTAMP}.md --label ${TASK_ID} --json`
   - Note: The --label ${TASK_ID} flag (e.g., --label T001) provides a human-readable signpost during planning; labels are searchable via 'bd list --label T001'
   - Capture JSON output
   - Parse JSON to extract Beads task ID from `.id` field (e.g., "bd-abc")
   - Store for dependency tracking: {"task_id": "${TASK_ID}", "beads_id": "bd-abc", "label": "${TASK_ID}"}

   **Clean Up**:
   - Remove temp file: `rm /tmp/task-${TASK_ID}-description-${TIMESTAMP}.md`

   **Repeat for All Tasks**:
   - Process tasks in execution order: T001, T002, T003... (as they appear in tasks.md)
   - Maintain task tracking for dependency generation: `[{"task_id": "T001", "beads_id": "bd-abc", "label": "T001", "story": "US1", "parallel": true/false}, ...]`
   - Track parallel markers for dependency generation in Step 6.5

   **Step 6.5: Add Dependencies**

   For each task in task tracking array (built in Step 6.4):

   **Dependency Analysis Strategy**:

   1. **Explicit Dependencies** (highest priority):
      - Scan task description (from tasks.md) for explicit dependency markers:
        - "Depends on: T001" or "Depends on: T001, T002"
        - "(depends on T003)" or "requires T004"
        - "after T005 completes" or "blocked by T006"
      - Extract task IDs from these markers (e.g., "T001" → lookup Beads ID "bd-abc")
      - Add dependency: `bd dep add CURRENT_TASK_BEADS_ID DEPENDENCY_BEADS_ID`

   2. **Sequential Dependencies** (within same phase):
      - IF task is NOT marked [P] (parallel):
        - AND task is NOT first in its phase:
        - AND previous task is in same phase (same parent story):
        - THEN: Task depends on previous task in execution order
        - Example: T015 (no [P]) depends on T014 (previous task in same phase)
      - IF task IS marked [P]:
        - NO automatic sequential dependency (can run in parallel with other [P] tasks)
      - Exception: IF explicit dependency exists, it OVERRIDES automatic sequential rule

   3. **Cross-Phase Dependencies** (blocking prerequisites):
      - IF task mentions "Phase X must complete" or "after Foundational":
        - Find all tasks in that phase
        - Add dependencies on ALL tasks in prerequisite phase
      - IF task mentions specific user story completion:
        - Example: "US1 must complete before US3" → ALL US3 tasks depend on ALL US1 tasks
        - Find all tasks with that story label, add dependencies

   **Dependency Execution**:

   1. Build dependency list:
      ```
      dependencies = []

      For each task in task_mapping_array:
        child_task_id = task.task_id  (e.g., "T015")
        child_beads_id = task.beads_id  (e.g., "bd-def")
        child_story = task.story  (e.g., "US1")
        child_parallel = task.parallel  (true/false)

        # Check for explicit dependencies
        task_description = [read from tasks.md for this task_id]
        explicit_deps = extract_explicit_dependencies(task_description)

        For each dep_task_id in explicit_deps:
          parent_beads_id = lookup_beads_id(dep_task_id)
          dependencies.append({
            "child": child_beads_id,
            "parent": parent_beads_id,
            "type": "explicit"
          })

        # Check for sequential dependencies (if not parallel and not first in phase)
        If NOT child_parallel:
          previous_task = find_previous_task_in_same_phase(child_task_id, child_story)
          If previous_task exists:
            parent_beads_id = previous_task.beads_id
            dependencies.append({
              "child": child_beads_id,
              "parent": parent_beads_id,
              "type": "sequential"
            })
      ```

   2. Execute dependency commands:
      ```bash
      # Iterate through dependencies list
      for dep in dependencies:
        bd dep add ${dep.child} ${dep.parent}
      ```

   **Example Dependency Scenarios**:

   **Scenario 1: Explicit Dependency**
   ```markdown
   - [ ] T022 [US1] Create migration utility (depends on T007-T009)
   ```
   Result:
   - `bd dep add bd-xxx bd-abc` (T022 depends on T007)
   - `bd dep add bd-xxx bd-def` (T022 depends on T008)
   - `bd dep add bd-xxx bd-ghi` (T022 depends on T009)

   **Scenario 2: Sequential Dependencies (no [P] marker)**
   ```markdown
   - [ ] T014 [US1] Create setup script
   - [ ] T015 [US1] Update wb-tasks.md to generate Beads structure
   - [ ] T016 [US1] Implement Epic creation logic
   ```
   Result:
   - T015 depends on T014 (sequential in same phase)
   - T016 depends on T015 (sequential in same phase)
   - Commands: `bd dep add bd-T015 bd-T014`, `bd dep add bd-T016 bd-T015`

   **Scenario 3: Parallel Tasks (with [P] marker)**
   ```markdown
   - [ ] T007 [P] [US1] Create Beads wrapper utility
   - [ ] T008 [P] [US1] Create SpecKit-to-Beads mapper
   - [ ] T009 [P] [US1] Implement error handling wrapper
   ```
   Result:
   - NO dependencies between T007, T008, T009 (all marked [P])
   - These tasks can run simultaneously

   **Scenario 4: Mixed Sequential and Parallel**
   ```markdown
   - [ ] T012 [P] [US1] Rename command file (can run in parallel)
   - [ ] T013 [US1] Create symlink (depends on T012 completing)
   ```
   Result:
   - T012 has NO sequential dependency (marked [P])
   - T013 depends on T012 (sequential, not marked [P], follows T012)
   - Command: `bd dep add bd-T013 bd-T012`

   **Dependency Validation**:
   - Verify no circular dependencies (task A → task B → task A)
   - Verify all referenced task IDs exist in task tracking array
   - Warn if [P] task has sequential dependency (likely incorrect [P] marker)
   - Report total dependencies added: "Added X dependencies (Y explicit, Z sequential)"

   **Step 6.6: Sync to Remote**
   - Execute: `bd sync` to commit Beads changes to git
   - Verify: Run `git status` to ensure clean working directory
   - This ensures all Beads structure changes (Epic, Stories, Tasks with T001 labels, Dependencies) are synchronized to the remote repository

7. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)
   - **NEW**: Beads structure summary:
     - Epic ID and title
     - Story count and IDs
     - Task count with T001 labels (use 'bd list' to view tasks with labels)
     - Note: Tasks are labeled with T001, T002, etc. for planning reference; use Beads IDs (bd-abc) for implementation commands
     - Confirmation: `bd sync` completed successfully

Context for task generation: {ARGS}

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

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
