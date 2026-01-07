---
description: Complete the implementation of one or more tasks from the current spec. Pass single task (T001), range (T001-T005), or list (T001, T003, T007-T010).
---

User input: $ARGUMENTS

## Pre-Implementation Validation

1. **Load context** (required):
   - Run `bash speckit/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks`
   - Parse JSON output to extract:
     - `FEATURE_DIR` - Path to feature specification directory
     - `AVAILABLE_DOCS` - List of available documentation files

2. **Load and analyze the implementation context**:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

3. **Project Setup Verification**:
   - **REQUIRED**: Create/verify ignore files based on actual project setup:

   **Detection & Creation Logic**:
   - Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```

   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc* exists → create/verify .eslintignore
   - Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
   - Check if .prettierrc* exists → create/verify .prettierignore
   - Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
   - Check if terraform files (*.tf) exist → create/verify .terraformignore
   - Check if .helmignore needed (helm charts present) → create/verify .helmignore

   **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `Makefile`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Tool-Specific Patterns**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

## Task Detection and Mode Selection

4. **Parse task specification(s)** from `$ARGUMENTS`:
   - Single task: `T001` (regex: `/^T\d{3}$/`)
   - Range: `T001-T005` (regex: `/^T\d{3}-T\d{3}$/`)
   - List with ranges: `T001, T003-T005, T009` (comma-separated, can include ranges)

5. **Validate format**:
   - If no valid task format detected, STOP and tell user: "Please provide task ID(s) in format: T001 (single), T001-T005 (range), or T001, T003-T005 (list)"
   - Extract all task IDs from ranges and lists into array

6. **Parse tasks.md structure** (before executing tasks):
   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements

7. **Determine execution mode and load appropriate script**:
   ```
   task_count = length of extracted task IDs array

   if (task_count == 1) {
     MODE = "SINGLE"
     Read and execute: speckit/templates/commands/implement-single.md
   } else {
     MODE = "PARALLEL"
     Read and execute: speckit/templates/commands/implement-parallel.md
   }
   ```

8. **Execute the loaded script**:
   - Pass variables: $TASK_ID (single) or $TASK_IDS (parallel), $FEATURE_DIR, $AVAILABLE_DOCS, and all context loaded above
   - The loaded script will handle actual implementation following the rules below
   - Do NOT continue reading this file beyond this point

## Implementation Execution Rules (For Single/Parallel Scripts)

**Phase-by-phase execution**:
- Complete each phase before moving to the next
- Respect dependencies: Run sequential tasks in order, parallel tasks [P] can run together
- Follow TDD approach: Execute test tasks before their corresponding implementation tasks
- File-based coordination: Tasks affecting the same files must run sequentially
- Validation checkpoints: Verify each phase completion before proceeding

**Implementation order**:
- **Setup first**: Initialize project structure, dependencies, configuration
- **Tests before code**: Write tests for contracts, entities, and integration scenarios
- **Core development**: Implement models, services, CLI commands, endpoints
- **Integration work**: Database connections, middleware, logging, external services
- **Polish and validation**: Unit tests, performance optimization, documentation

**Progress tracking and error handling**:
- Report progress after each completed task
- Halt execution if any non-parallel task fails
- For parallel tasks [P], continue with successful tasks, report failed ones
- Provide clear error messages with context for debugging
- Suggest next steps if implementation cannot proceed
- **IMPORTANT**: For completed tasks, mark the task as [X] in tasks.md

**Completion validation**:
- Verify all required tasks are completed
- Check that implemented features match the original specification
- Validate that tests pass and coverage meets requirements
- Confirm the implementation follows the technical plan
- Report final status with summary of completed work

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

**Note**: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/tasks` first to regenerate the task list.
