# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: Heading + Checkbox at End
- **Heading**: `### T001 [P?]: Task name` for navigation
- **[P]**: Can run in parallel (different files, no dependencies)
- **Task structure**: Include **File**, **Description**, **Dependencies**, **Expected Outcome**
- **Completion checkbox**: End each task with `- [ ] **Complete**` for tracking
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

### T001: Create project structure per implementation plan
**File**: Various
**Description**: Create directory structure as defined in implementation plan
**Dependencies**: None
**Expected Outcome**: Project structure ready for development

- [ ] **Complete**

---

### T002: Initialize [language] project with [framework] dependencies
**File**: `package.json` / `pyproject.toml` / equivalent
**Description**: Install and configure framework dependencies
**Dependencies**: T001
**Expected Outcome**: Dependencies installed, project runs

- [ ] **Complete**

---

### T003 [P]: Configure linting and formatting tools
**File**: `.eslintrc`, `.prettierrc`, or equivalent
**Description**: Set up linting and formatting with project standards
**Dependencies**: T002
**Expected Outcome**: Lint and format commands work

- [ ] **Complete**

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### T004 [P]: Contract test POST /api/users
**File**: `tests/contract/test_users_post.py`
**Description**: Write failing contract test for user creation endpoint
**Dependencies**: T003
**Expected Outcome**: Test FAILS - RED phase ✅

- [ ] **Complete**

---

### T005 [P]: Contract test GET /api/users/{id}
**File**: `tests/contract/test_users_get.py`
**Description**: Write failing contract test for user retrieval endpoint
**Dependencies**: T003
**Expected Outcome**: Test FAILS - RED phase ✅

- [ ] **Complete**

---

### T006 [P]: Integration test user registration
**File**: `tests/integration/test_registration.py`
**Description**: Write failing integration test for registration workflow
**Dependencies**: T003
**Expected Outcome**: Test FAILS - RED phase ✅

- [ ] **Complete**

---

### T007 [P]: Integration test auth flow
**File**: `tests/integration/test_auth.py`
**Description**: Write failing integration test for authentication
**Dependencies**: T003
**Expected Outcome**: Test FAILS - RED phase ✅

- [ ] **Complete**

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### T008 [P]: User model
**File**: `src/models/user.py`
**Description**: Create User model with validation
**Dependencies**: T004-T007 (tests must fail first)
**Expected Outcome**: User model defined, tests still failing

- [ ] **Complete**

---

### T009 [P]: UserService CRUD
**File**: `src/services/user_service.py`
**Description**: Implement user service with CRUD operations
**Dependencies**: T008
**Expected Outcome**: Service methods implemented

- [ ] **Complete**

---

### T010 [P]: CLI --create-user command
**File**: `src/cli/user_commands.py`
**Description**: Implement CLI command for user creation
**Dependencies**: T009
**Expected Outcome**: CLI command works

- [ ] **Complete**

---

### T011: POST /api/users endpoint
**File**: `src/routes/users.py`
**Description**: Implement user creation endpoint
**Test**: Contract test from T004 now PASSES - GREEN phase ✅
**Dependencies**: T009
**Expected Outcome**: POST /api/users works, T004 passes

- [ ] **Complete**

---

### T012: GET /api/users/{id} endpoint
**File**: `src/routes/users.py`
**Description**: Implement user retrieval endpoint
**Test**: Contract test from T005 now PASSES - GREEN phase ✅
**Dependencies**: T009
**Expected Outcome**: GET /api/users/{id} works, T005 passes

- [ ] **Complete**

---

### T013: Input validation
**File**: `src/middleware/validation.py`
**Description**: Add input validation middleware
**Dependencies**: T011, T012
**Expected Outcome**: Invalid inputs rejected with errors

- [ ] **Complete**

---

### T014: Error handling and logging
**File**: `src/middleware/errors.py`
**Description**: Centralized error handling and logging
**Dependencies**: T013
**Expected Outcome**: All errors handled consistently

- [ ] **Complete**

---

## Phase 3.4: Integration

### T015: Connect UserService to DB
**File**: `src/services/user_service.py` (update)
**Description**: Connect service to database
**Dependencies**: T014
**Expected Outcome**: Users persisted to database

- [ ] **Complete**

---

### T016: Auth middleware
**File**: `src/middleware/auth.py`
**Description**: Implement authentication middleware
**Dependencies**: T015
**Expected Outcome**: Protected routes require authentication

- [ ] **Complete**

---

### T017: Request/response logging
**File**: `src/middleware/logging.py`
**Description**: Add request/response logging
**Dependencies**: T016
**Expected Outcome**: All requests logged

- [ ] **Complete**

---

### T018: CORS and security headers
**File**: `src/middleware/security.py`
**Description**: Configure CORS and security headers
**Dependencies**: T017
**Expected Outcome**: Security headers applied

- [ ] **Complete**

---

## Phase 3.5: Polish

### T019 [P]: Unit tests for validation
**File**: `tests/unit/test_validation.py`
**Description**: Add unit tests for validation logic
**Dependencies**: T018
**Expected Outcome**: >80% test coverage for validation

- [ ] **Complete**

---

### T020: Performance tests (<200ms)
**File**: `tests/performance/test_response_time.py`
**Description**: Validate API response times
**Dependencies**: T019
**Expected Outcome**: All endpoints respond within 200ms

- [ ] **Complete**

---

### T021 [P]: Update docs/api.md
**File**: `docs/api.md`
**Description**: Document all API endpoints
**Dependencies**: T020
**Expected Outcome**: API documentation complete

- [ ] **Complete**

---

### T022: Remove duplication
**File**: Various
**Description**: Refactor to remove code duplication
**Dependencies**: T021
**Expected Outcome**: DRY principle applied

- [ ] **Complete**

---

### T023: Run manual-testing.md
**File**: Manual testing
**Description**: Execute manual test scenarios
**Dependencies**: T022
**Expected Outcome**: All scenarios pass

- [ ] **Complete**

---

## Dependencies
- Tests (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task