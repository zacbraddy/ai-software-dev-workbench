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
   - Extract title from spec.md (# Feature Specification: ...)
   - SYNTHESIZE epic description per `contracts/beads-synthesis-templates.md` Epic template:
     - Overview (2-3 sentence summary from spec.md)
     - Implementation Strategy (MVP First, Incremental Delivery, Parallel Team)
     - Overall Dependency Flow (high-level story dependencies)
     - Story Dependency Rules (which stories must complete before others)
     - Scope (total FRs, tasks, phases)
   - Write epic description to temp file: `/tmp/epic-description-${TIMESTAMP}.md`
   - Execute: `bd create "EPIC_TITLE" -t epic -p 1 --body-file /tmp/epic-description-${TIMESTAMP}.md --json`
   - Parse JSON output to extract epic ID (e.g., "bd-a3f8")
   - Clean up temp file

   **Step 5.3: Create Stories**
   For each user story in spec.md (in priority order P1, P2, P3):
   - Extract user story title from spec.md (### User Story N - Title)
   - SYNTHESIZE story description per `contracts/beads-synthesis-templates.md` Story template:
     - Goal (1-2 sentence description from "Why this priority")
     - Independent Test Criteria (from "Independent Test" paragraph)
     - Acceptance Scenarios (all Given/When/Then scenarios)
     - Checkpoints (if multi-phase story - from tasks.md phase checkpoints)
     - Technical Notes (from plan.md)
     - Dependencies (analyse story ordering from plan.md)
   - Write story description to temp file: `/tmp/story-${US_NUMBER}-description-${TIMESTAMP}.md`
   - Execute: `bd create "STORY_TITLE" -t story -p PRIORITY --parent EPIC_ID --body-file /tmp/story-${US_NUMBER}-description-${TIMESTAMP}.md --json`
   - Parse JSON output to extract story ID (e.g., "bd-a3f8.1")
   - Store mapping: US1 → story ID, US2 → story ID, etc.
   - Clean up temp file

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
