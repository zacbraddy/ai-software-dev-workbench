# AI Software Development Workbench

A portable, drop-in spec-driven development framework for AI-assisted software projects. This workbench combines the latest [GitHub Spec-Kit](https://github.com/github/spec-kit) with custom enhancements for parallel task execution, project memory, and flexible workflows.

## Features

### Core Spec-Kit Features
- **Spec-Driven Development**: Feature specs → Implementation plans → Task breakdown → Execution
- **Quality Validation**: Built-in audit workflows with code quality gates
- **Multi-Agent Support**: Works with Claude, Copilot, Gemini, Cursor, and others
- **Checklist System**: Quality validation with customizable checklists

### Custom Enhancements
- **Parallel Task Execution**: Execute multiple tasks concurrently
  - Single task: `/implement T001`
  - Range: `/implement T001-T005`
  - List: `/implement T001, T003, T007-T010`
- **Router Pattern**: Automatic mode detection (single vs parallel execution)
- **Project Memory**: Business context, technical patterns, and principles
- **Non-Git Fallback**: Works in non-git repositories
- **Stakeholder Workflow**: Suggestion document generation with interview process

## Installation

### Quick Start

1. Place `ai-software-dev-workbench` next to your project:
   ```bash
   parent-directory/
   ├── your-project/
   └── ai-software-dev-workbench/
   ```

2. Run the installer:
   ```bash
   cd ai-software-dev-workbench
   ./install.sh
   ```

3. Return to your project:
   ```bash
   cd ../your-project
   ```

### What Gets Created

The installer creates this structure in your project:

```
your-project/
├── specs/                    # Feature specifications (git-tracked)
│   └── 001-feature-name/
│       ├── spec.md          # Feature requirements
│       ├── plan.md          # Implementation plan
│       ├── tasks.md         # Task breakdown
│       └── contracts/       # API contracts (optional)
├── memory/                   # Project context (git-tracked)
│   ├── constitution.md      # Core principles
│   ├── development-protocols.md
│   └── program_overview.md
└── .claude/                  # AI configuration (symlinked)
    ├── commands/            # Command files (symlinks to workbench)
    └── agents/              # Subagent files (symlinks to workbench)
```

## Available Commands

### Feature Workflow

| Command | Description | Example |
|---------|-------------|---------|
| `/specify` | Create new feature specification | `/specify` |
| `/plan` | Generate implementation plan | `/plan` |
| `/tasks` | Break down plan into tasks | `/tasks` |
| `/implement` | Implement tasks | `/implement T001` or `/implement T001-T005` |
| `/audit` | Audit completed tasks | `/audit T001` or `/audit T001-T005` |

### Analysis & Quality

| Command | Description |
|---------|-------------|
| `/analyze` | Check consistency across spec/plan/tasks |
| `/clarify` | Detect ambiguities and ask targeted questions |
| `/checklist` | Generate quality validation checklists |

### Project Management

| Command | Description |
|---------|-------------|
| `/constitution` | Manage project principles and rules |
| `/suggest` | Generate suggestion documents with stakeholder interviews |
| `/update-workbench` | Update workbench with latest improvements |

## Parallel Execution

### Task Format

- **Single**: `T001` - Execute one task interactively
- **Range**: `T001-T005` - Execute tasks 1 through 5 in parallel
- **List**: `T001, T003, T007-T010` - Execute specific tasks in parallel

### Example Workflows

```bash
# Implement a single task with full user interaction
/implement T001

# Implement multiple tasks in parallel (autonomous)
/implement T001-T005

# Implement specific tasks
/implement T001, T003, T007

# Audit all tasks from 1 to 10
/audit T001-T010
```

### Parallel vs Single Mode

**Single Mode** (1 task):
- Interactive execution with user feedback
- Step-by-step implementation
- User can intervene at any point

**Parallel Mode** (2+ tasks):
- Spawns subagents for each task
- Autonomous execution
- Aggregated results table
- Efficient for bulk operations

## Project-Specific Customization

### Adding Custom Commands

Create your own commands alongside workbench commands:

```bash
# Your project
.claude/commands/
├── analyze.md        # (symlink to workbench)
├── implement.md      # (symlink to workbench)
└── my-custom-cmd.md  # Your custom command (not symlinked)
```

The workbench only symlinks individual files, so your custom commands coexist safely.

### Adding Custom Agents

Same pattern for subagents:

```bash
.claude/agents/
├── implement-task.md     # (symlink to workbench)
├── audit-task.md         # (symlink to workbench)
└── my-custom-agent.md    # Your custom agent
```

### Customizing Memory

Edit memory files to match your project:

```bash
memory/
├── constitution.md           # Your project's core principles
├── development-protocols.md  # Your tech stack and patterns
└── program_overview.md       # Your product vision
```

## Updating the Workbench

### Manual Update

```bash
cd ai-software-dev-workbench
git pull origin main  # or fetch latest from your source
./install.sh          # Re-run installer to update symlinks
```

### Using Update Command

From your project directory:

```bash
# Update from official spec-kit only
/update-workbench

# Update from official spec-kit + learn from another project
/update-workbench ../other-project

# Update from multiple sources
/update-workbench ../project1 ../project2
```

The update command:
- Fetches latest official spec-kit
- Analyzes custom improvements from provided projects
- Merges updates while preserving workbench custom features
- Strips any experimental features (like serena references)
- Updates paths to match workbench conventions

## Directory Structure

```
ai-software-dev-workbench/
├── install.sh                    # Installation script
├── README.md                     # This file
└── speckit/
    ├── scripts/bash/             # Bash helper scripts
    │   ├── common.sh
    │   ├── check-prerequisites.sh
    │   ├── setup-plan.sh
    │   ├── create-new-feature.sh
    │   └── update-agent-context.sh
    ├── templates/
    │   ├── commands/             # AI command files
    │   │   ├── specify.md
    │   │   ├── plan.md
    │   │   ├── tasks.md
    │   │   ├── implement.md
    │   │   ├── implement-single.md
    │   │   ├── implement-parallel.md
    │   │   ├── audit.md
    │   │   ├── audit-single.md
    │   │   ├── audit-parallel.md
    │   │   ├── analyze.md
    │   │   ├── clarify.md
    │   │   ├── constitution.md
    │   │   ├── suggest.md
    │   │   └── update-workbench.md
    │   ├── agents/               # AI subagent files
    │   │   ├── implement-task.md
    │   │   └── audit-task.md
    │   ├── spec-template.md
    │   ├── plan-template.md
    │   ├── tasks-template.md
    │   ├── checklist-template.md
    │   └── agent-file-template.md
    └── memory/                   # Framework memory templates
        ├── constitution.md
        ├── development-protocols.md
        ├── program_overview.md
        └── task-execution-patterns.md
```

## Path Conventions

The workbench uses parent-relative paths to enable drop-in portability:

- `specs/` - Feature specifications at project root
- `memory/` - Project memory at project root
- `speckit/` - Workbench framework (symlinked to project)

This differs from:
- **Official spec-kit**: Uses `.specify/specs/`
- **Older patterns**: Used `speckit/specs/` inside workbench

## Workflow Example

```bash
# 1. Create a feature branch
git checkout -b 001-user-authentication

# 2. Create feature specification
/specify
# AI guides you through creating spec.md

# 3. Generate implementation plan
/plan
# AI creates plan.md with architecture decisions

# 4. Break down into tasks
/tasks
# AI creates tasks.md with numbered tasks

# 5. Implement tasks in parallel
/implement T001-T005
# AI spawns 5 subagents to implement tasks concurrently

# 6. Audit completed tasks
/audit T001-T005
# AI verifies implementation and marks tasks complete

# 7. Check overall consistency
/analyze
# AI validates spec/plan/tasks alignment
```

## Troubleshooting

### Commands not found after installation

```bash
# Re-run the installer
cd ai-software-dev-workbench
./install.sh

# Verify symlinks
ls -la .claude/commands/
```

### Path errors in commands

All commands should use:
- `specs/[BRANCH_NAME]/` for features
- `memory/` for project context
- `speckit/scripts/bash/` for helper scripts

If you see `speckit/specs/` or `speckit/memory/`, those are old paths.

### Parallel execution not working

Ensure you're using the router pattern commands:
- `implement.md` (router) → `implement-single.md` or `implement-parallel.md`
- `audit.md` (router) → `audit-single.md` or `audit-parallel.md`

### Memory files not loading

Check that memory files exist:
```bash
ls -la memory/
```

If missing, copy templates:
```bash
cp ai-software-dev-workbench/speckit/memory/*.md memory/
```

## Contributing

This workbench is a consolidation of:
- [GitHub Spec-Kit](https://github.com/github/spec-kit) - Official framework
- Custom enhancements from personal projects
- Community improvements

To contribute improvements back to the workbench:
1. Implement features in your project
2. Share the project path with `/update-workbench`
3. Review and merge useful patterns

## License

This workbench bundles and extends the MIT-licensed [GitHub Spec-Kit](https://github.com/github/spec-kit).
Custom enhancements follow the same MIT license.

---

**Happy spec-driven development! 🚀**
