# AI Software Development Workbench

A professional, portable spec-driven development framework for AI-assisted software projects. Combines the battle-tested [GitHub Spec-Kit](https://github.com/github/spec-kit) with powerful enhancements: parallel task execution, Claude Skills integration, project memory systems, and flexible customisation workflows.

**Perfect for**: Solo developers, startups, and teams who want structured AI-assisted development without enterprise overhead.

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Project Customisation](#project-customisation)
- [Commands Reference](#commands-reference)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Quick Start

**Get up and running in 5 minutes:**

```bash
# 1. Add workbench to your project (recommended: as git submodule)
cd your-project
git submodule add https://github.com/zacbraddy/ai-software-dev-workbench.git

# 2. Run the installer
cd ai-software-dev-workbench
./install.sh

# 3. Return to project root
cd ..

# 4. Customise your project memory (optional but recommended)
vim memory/constitution.md           # Your project's core principles
vim memory/development-protocols.md  # Your tech stack and patterns
vim memory/program_overview.md       # Your product vision

# 5. Start building features!
git checkout -b 001-user-authentication
/specify  # Create feature spec interactively
/plan     # Generate implementation plan
/tasks    # Break down into executable tasks
/implement T001-T005  # Implement tasks in parallel
```

**First Feature Workflow:**

```bash
/specify              # Describe your feature
/plan                 # Generate architecture plan
/tasks                # Break into numbered tasks
/implement T001       # Implement first task (interactive)
/implement T002-T010  # Implement remaining tasks (parallel)
/audit T001-T010      # Validate implementation quality
/analyze              # Check spec/plan/tasks consistency
```

## Features

### Core Spec-Kit Features
- **Spec-Driven Development**: Feature specs → Implementation plans → Task breakdown → Execution
- **Quality Validation**: Built-in audit workflows with code quality gates
- **Multi-Agent Support**: Works with Claude Code, Copilot, Gemini, Cursor, and other AI assistants
- **Checklist System**: Quality validation with customisable checklists
- **Non-Git Fallback**: Works in non-git repositories (uses fallback logic)

### Workbench Enhancements

#### 1. Parallel Task Execution
Execute multiple tasks concurrently with automatic mode detection:
- **Single task**: `/implement T001` - Interactive with user feedback
- **Range**: `/implement T001-T005` - Autonomous parallel execution
- **List**: `/implement T001, T003, T007-T010` - Mixed ranges and singles

#### 2. Claude Skills Integration ⭐
**Native extension point** for project-specific customisations:
- Create `.claude/skills/your-project/SKILL.md` with project patterns
- Skills auto-activate when relevant (model-invoked)
- Only 30-50 tokens until loaded (highly efficient)
- Perfect for: MCP integrations, team coding standards, architectural patterns

**Example Use Cases:**
- Activate Serena MCP for symbolic code analysis
- Enforce startup-specific development philosophy
- Apply business context hierarchy (revenue-first, customer validation)
- Add debugging escalation protocols
- Inject domain-specific quality gates

#### 3. Project Memory System
Structured context files that guide AI decision-making:
- `memory/constitution.md` - Non-negotiable principles and compliance rules
- `memory/development-protocols.md` - Tech stack, architecture, code standards
- `memory/program_overview.md` - Business context, product vision, roadmap
- `memory/task-execution-patterns.md` - Workflow guidance and quality gates

#### 4. Router Pattern
Automatic mode detection for optimal execution:
- Commands analyse input and route to single or parallel mode
- No user configuration needed
- Maximises efficiency for bulk operations

#### 5. Stakeholder Workflow
Generate suggestion documents with built-in interview process:
- `/suggest` command for feature exploration
- Structured stakeholder input collection
- Integration with spec workflow

## Installation

### Method 1: Git Submodule (Recommended)

Best for projects under version control:

```bash
cd your-project
git submodule add https://github.com/zacbraddy/ai-software-dev-workbench.git
cd ai-software-dev-workbench
./install.sh
cd ..
git add .
git commit -m "Add ai-software-dev-workbench"
```

**Benefits:**
- Track workbench version in your repo
- Easy updates via `git submodule update --remote`
- Team members get workbench automatically with `git clone --recurse-submodules`

### Method 2: Direct Clone

For quick setup or non-git projects:

```bash
cd your-project
git clone https://github.com/your-username/ai-software-dev-workbench.git
cd ai-software-dev-workbench
./install.sh
cd ..
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

## Commands Reference

### Feature Workflow Commands

The core spec-driven development workflow:

| Command | Purpose | Interactive? | Example |
|---------|---------|-------------|---------|
| `/specify` | Create feature specification | ✅ Yes | `/specify` |
| `/plan` | Generate implementation plan | ✅ Yes | `/plan` |
| `/tasks` | Break plan into numbered tasks | ✅ Yes | `/tasks` |
| `/implement` | Implement task(s) | Depends | `/implement T001` (interactive)<br>`/implement T001-T005` (parallel) |
| `/audit` | Validate implementation | Depends | `/audit T001` (interactive)<br>`/audit T001-T005` (parallel) |

**Task Specification Formats:**
- **Single**: `T001` - Interactive mode with user feedback
- **Range**: `T001-T005` - Parallel mode (autonomous)
- **List**: `T001, T003, T007-T010` - Mixed format

### Analysis & Quality Commands

Validate and improve your specifications:

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/analyze` | Check spec/plan/tasks consistency | After completing tasks.md, before implementation |
| `/clarify` | Detect ambiguities, ask questions | When spec is unclear or incomplete |
| `/checklist` | Generate quality validation checklists | Before major releases or milestones |

### Project Management Commands

Manage project context and updates:

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/constitution` | Create/update project principles | Initial setup, major policy changes |
| `/suggest` | Generate suggestion documents | Feature discovery, stakeholder alignment |
| `/update-workbench` | Update from official spec-kit | Monthly maintenance, after improvements |

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

## Project Customisation

The workbench provides three layers of customisation: **Skills** (recommended), **Memory Files**, and **Custom Commands/Agents**.

### Layer 1: Claude Skills (Recommended)

**Claude Skills** are the primary extension point for project-specific customisations. Skills auto-activate when relevant and compose cleanly with base commands.

#### Creating a Project Skill

```bash
# 1. Create skill directory
mkdir -p .claude/skills/your-project-name

# 2. Create SKILL.md with frontmatter
cat > .claude/skills/your-project-name/SKILL.md << 'EOF'
---
name: your-project-name
description: Project-specific patterns for [your project]. Auto-activates for /implement and /audit commands.
---

# Your Project Skill

## MCP Integration

If the XYZ MCP is available:
- Call mcp__xyz__initialize before tasks
- Use symbolic tools for code analysis

## Project-Specific Patterns

### Development Philosophy
- Your startup/team context
- Decision-making hierarchy
- Pattern usage guidelines

### Quality Gates
- Additional validation requirements
- Project-specific linting rules
- Security considerations

### Tech Stack Context
- Framework versions and patterns
- Architecture decisions
- Integration requirements
EOF
```

#### Skill Use Cases

**MCP Integration:**
```markdown
## Serena MCP Integration

If serena MCP tools are available:
  - Call mcp__serena__initial_instructions
  - Use symbolic code analysis for token efficiency
```

**Business Context:**
```markdown
## Startup Development Context

Working on a startup product (solo founder, £100k/month target):
- Revenue-first: features must contribute to business goals
- Right-sized patterns: DDD/hexagonal when they provide value
- Ship working code using appropriate architectural patterns
```

**Debugging Protocols:**
```markdown
## Escalation Protocol

If stuck during implementation:
1. First 3 attempts: Try approaches based on research
2. After 3 failures: Switch to web search
3. After 10 total attempts: Escalate with evidence
```

#### Skill Benefits

✅ **Native Claude feature** - no custom framework
✅ **Auto-activated** - model-invoked when relevant
✅ **Efficient** - 30-50 tokens until loaded
✅ **Composable** - works with base commands
✅ **Git-tracked** - team members get customisations

### Layer 2: Memory Files

Memory files provide **persistent context** that guides all AI decisions:

```bash
memory/
├── constitution.md           # Non-negotiable principles
├── development-protocols.md  # Tech stack and patterns
├── program_overview.md       # Business context
└── task-execution-patterns.md  # Workflow guidance
```

**Edit these files to match your project:**

```bash
# Your project's core principles and compliance rules
vim memory/constitution.md

# Your tech stack, architecture decisions, code standards
vim memory/development-protocols.md

# Your product vision, market context, business goals
vim memory/program_overview.md
```

**Memory files are loaded by:**
- Base commands (implement, audit, specify, plan, tasks)
- Skills (can reference memory files for additional context)
- All subagents (automatic context loading)

### Layer 3: Custom Commands & Agents

Add project-specific commands alongside base commands:

```bash
# Custom command (coexists with symlinked base commands)
.claude/commands/
├── analyze.md              # ← Symlink to workbench
├── implement.md            # ← Symlink to workbench
└── deploy-staging.md       # ← Your custom command

# Custom agent (coexists with symlinked base agents)
.claude/agents/
├── implement-task.md       # ← Symlink to workbench
├── audit-task.md           # ← Symlink to workbench
└── deploy-verifier.md      # ← Your custom agent
```

**The installer skips existing files**, so custom commands are never overwritten.

### Customisation Decision Matrix

| Need | Use | Example |
|------|-----|---------|
| MCP activation | Skill | Activate Serena for symbolic analysis |
| Business context | Memory | Startup context, revenue targets |
| Team patterns | Skill + Memory | Coding standards, architecture |
| Debugging rules | Skill | Escalation protocol, retry logic |
| Project workflow | Custom Command | Deploy, release, migration |
| Tech stack info | Memory | Framework versions, patterns |
| Quality gates | Skill | Additional validation rules |

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

## Advanced Usage

### Complete Feature Workflow Example

```bash
# 1. Create feature branch (numeric prefix for ordering)
git checkout -b 001-user-authentication

# 2. Create specification
/specify
# AI guides through: description, user stories, acceptance criteria

# 3. Generate implementation plan
/plan
# Creates: architecture, tech stack, file structure, dependencies

# 4. Break into tasks
/tasks
# Generates: numbered tasks (T001-T0XX), dependencies, acceptance criteria

# 5. Validate before coding
/analyze
# Checks consistency across spec/plan/tasks

# 6. Implement strategically
/implement T001              # Foundation (interactive)
/implement T002-T010         # Features (parallel)
/implement T011, T015        # High-priority (parallel)

# 7. Validate quality
/audit T001-T015
# Verifies: acceptance criteria, code quality, tests, docs

# 8. Final check
/analyze
# Ensures implementation matches spec
```

### Skill + Memory Best Practices

**Team Setup Pattern:**

```bash
# 1. Shared memory files (checked into git)
memory/
├── constitution.md          # Security, API standards, compliance
├── development-protocols.md # Next.js 14, PostgreSQL, TypeScript strict
└── program_overview.md      # SaaS product, B2B market, revenue goals

# 2. Project skill (auto-activates for team)
.claude/skills/acme-corp/SKILL.md
---
name: acme-corp
description: ACME Corp patterns. Auto-activates for implement/audit.
---

## Decision Hierarchy
1. Security (GDPR, SOC2) - non-negotiable
2. UX (a11y, performance) - high priority
3. Maintainability (tests, docs) - required

## MCP Integration
Activate Serena MCP for symbolic code analysis

## Quality Gates
- API changes → schema updates
- UI changes → Storybook stories
- DB changes → migrations + rollback plan
```

**Result:** Every command automatically applies team standards.

### Multi-Project Management

```bash
# Workbench shared across projects via submodule
project-a/
├── ai-software-dev-workbench/  # Git submodule
├── .claude/skills/project-a/   # A-specific patterns
└── memory/                      # A-specific context

project-b/
├── ai-software-dev-workbench/  # Same submodule
├── .claude/skills/project-b/   # B-specific patterns
└── memory/                      # B-specific context

# Update all projects
for proj in project-a project-b; do
  cd $proj/ai-software-dev-workbench && git pull && cd ../..
done
```

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

**Symptom:** `/implement` or other commands don't work

**Solution:**
```bash
# 1. Re-run installer
cd ai-software-dev-workbench
./install.sh
cd ..

# 2. Verify symlinks created
ls -la .claude/commands/  # Should show symlinks (lrwxrwxrwx)

# 3. Check workbench location
# Should be at project root, not nested
ls ai-software-dev-workbench/install.sh  # Should exist
```

### Skills not activating

**Symptom:** Project-specific patterns not being applied

**Diagnosis:**
```bash
# 1. Check skill exists
ls -la .claude/skills/*/SKILL.md

# 2. Verify YAML frontmatter
head -5 .claude/skills/your-project/SKILL.md
# Should show:
# ---
# name: your-project
# description: ...
# ---
```

**Solution:**
- Ensure `name` is lowercase, alphanumeric, hyphens only
- Ensure `description` clearly mentions when skill applies
- Example: "Auto-activates for /implement and /audit commands"

### Memory files not loading

**Symptom:** AI doesn't seem aware of project context

**Solution:**
```bash
# 1. Check files exist at project root
ls -la memory/
# Should contain: constitution.md, development-protocols.md, etc.

# 2. If missing, create from templates
cp ai-software-dev-workbench/speckit/memory/*.md memory/

# 3. Verify content
cat memory/constitution.md  # Should have project-specific content
```

### Path errors in commands

**Symptom:** Commands reference wrong paths (`speckit/memory/` instead of `memory/`)

**Diagnosis:**
```bash
# Check command paths
grep -r "speckit/memory" .claude/commands/
grep -r "speckit/specs" .claude/commands/
# Should return empty (no results)
```

**Solution:**
```bash
# Update workbench to latest version
cd ai-software-dev-workbench
git pull origin main
cd ..

# Re-run installer
cd ai-software-dev-workbench && ./install.sh && cd ..
```

### Parallel execution not working

**Symptom:** Multiple tasks execute sequentially instead of in parallel

**Diagnosis:**
- Check task format: `T001-T005` (correct) vs `T001 T005` (incorrect)
- Router commands should load parallel mode automatically

**Solution:**
```bash
# Ensure router pattern commands exist
ls -la .claude/commands/ | grep -E "(implement|audit).md"

# Should show:
# implement.md (router)
# implement-single.md
# implement-parallel.md
# audit.md (router)
# audit-single.md
# audit-parallel.md
```

### Git submodule not cloning

**Symptom:** Team members clone repo but workbench is empty

**Solution:**
```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>

# Or initialize after cloning
git submodule update --init --recursive

# Run installer
cd ai-software-dev-workbench && ./install.sh && cd ..
```

### Symlinks broken after moving project

**Symptom:** Commands stop working after moving project to different directory

**Solution:**
```bash
# Symlinks use relative paths, should work after move
# If broken, re-run installer
cd ai-software-dev-workbench
./install.sh
cd ..
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
