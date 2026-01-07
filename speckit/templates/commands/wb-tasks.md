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

5. **Generate Beads structure**:
   After generating tasks.md, create Beads Epic/Story/Task hierarchy using `bd create` commands:

   **Step 5.1: Check Beads Availability**
   - Run `bd --version` to verify Beads CLI is installed
   - If not available: Skip Beads generation, report warning to user
   - If available: Proceed with Beads structure creation

   **Step 5.2: Create Epic**

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
   - Store epic ID for use in Step 5.3 (story creation)

   **Clean Up**:
   - Remove temp file: `rm /tmp/epic-description-${TIMESTAMP}.md`

   **Step 5.3: Create Stories**

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
   - Run: `bd create "STORY_TITLE" -t story -p BEADS_PRIORITY --parent EPIC_ID --body-file /tmp/story-${US_NUMBER}-description-${TIMESTAMP}.md --json`
   - Capture JSON output
   - Parse JSON to extract story ID from `.id` field (e.g., "bd-a3f8.1")
   - Store mapping: US1 → story ID (e.g., {"label": "US1", "id": "bd-a3f8.1", "title": "Beads Task Management Integration"})

   **Clean Up**:
   - Remove temp file: `rm /tmp/story-${US_NUMBER}-description-${TIMESTAMP}.md`

   **Repeat for All User Stories**:
   - Process stories in priority order: all P1 stories first, then P2, then P3
   - Maintain story ID mappings for use in Step 5.4 (Task creation)
   - Build stories array: `[{"label": "US1", "id": "bd-xxx", "title": "..."}, ...]`

   **Step 5.4: Create Tasks**
   For each task in tasks.md (in execution order T001, T002, T003...):
   - Extract task ID, description, [P] marker, [Story] label
   - Map task to parent story using [Story] label (e.g., [US1] → story ID for US1)
   - If no [Story] label: Map to appropriate story based on phase (Setup → first story, Foundational → first story)
   - SYNTHESIZE task description per `contracts/beads-synthesis-templates.md` Task template:
     - File Paths (all files this task creates/modifies/deletes)
     - Acceptance Criteria (specific testable criteria)
     - Task-Specific Notes (IMPORTANT/CRITICAL/WARNING/TEMPORARY markers)
     - Dependencies (depends on, blocks, parallel with)
     - Testing Instructions (post-completion verification)
   - Write task description to temp file: `/tmp/task-${TASK_ID}-description-${TIMESTAMP}.md`
   - Execute: `bd create "TASK_TITLE" -t task -p 2 --parent STORY_ID --body-file /tmp/task-${TASK_ID}-description-${TIMESTAMP}.md --json`
   - Parse JSON output to extract Beads task ID (e.g., "bd-abc")
   - Store mapping: T001 → Beads ID, T002 → Beads ID, etc.
   - Clean up temp file

   **Step 5.5: Add Dependencies**
   For each task with dependencies in tasks.md:
   - Parse task description for "Depends on: T001" or sequential ordering
   - Tasks without [P] marker depend on previous task in same phase
   - Execute: `bd dep add CHILD_BEADS_ID PARENT_BEADS_ID` for each dependency
   - Note: [P] tasks have NO dependencies (can run in parallel)

   **Step 5.6: Sync to Remote**
   - Execute: `bd sync` to commit Beads changes to git
   - Verify: Run `git status` to ensure clean working directory

   **Step 5.7: Create Task Mapping File**
   - Write mapping file to `FEATURE_DIR/beads-task-mapping.json`:
     ```json
     {
       "epic_id": "bd-a3f8",
       "stories": [
         {"label": "US1", "id": "bd-a3f8.1", "title": "..."},
         {"label": "US2", "id": "bd-a3f8.2", "title": "..."}
       ],
       "tasks": [
         {"task_id": "T001", "beads_id": "bd-abc", "title": "...", "story": "US1"},
         {"task_id": "T002", "beads_id": "bd-def", "title": "...", "story": "US1"}
       ]
     }
     ```

6. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)
   - **NEW**: Beads structure summary:
     - Epic ID and title
     - Story count and IDs
     - Task count and sample Beads IDs
     - Path to beads-task-mapping.json
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
