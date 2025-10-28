#!/usr/bin/env bash
#
# AI Software Development Workbench Installer
#
# This script installs the workbench into the parent directory.
# Run from inside the ai-software-dev-workbench directory.
#
# Usage: cd ai-software-dev-workbench && ./install.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Software Development Workbench Installer             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the directory where this script is located (should be ai-software-dev-workbench)
WORKBENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(cd "$WORKBENCH_DIR/.." && pwd)"
PROJECT_NAME="$(basename "$PARENT_DIR")"
WORKBENCH_NAME="$(basename "$WORKBENCH_DIR")"

echo -e "${BLUE}Workbench directory:${NC} $WORKBENCH_DIR"
echo -e "${BLUE}Installing to:${NC} $PARENT_DIR ($PROJECT_NAME)"
echo ""

# Confirm installation
read -p "Continue with installation? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1
fi

echo ""
echo -e "${GREEN}Creating directory structure...${NC}"

# Create real directories in parent
mkdir -p "$PARENT_DIR/specs"
mkdir -p "$PARENT_DIR/memory"
mkdir -p "$PARENT_DIR/speckit"
mkdir -p "$PARENT_DIR/.claude/commands"
mkdir -p "$PARENT_DIR/.claude/agents"
echo -e "${GREEN}  ✓ Created directory structure${NC}"

# Symlink individual command files
echo ""
echo -e "${GREEN}Symlinking command files...${NC}"
for cmd_file in "$WORKBENCH_DIR/speckit/templates/commands"/*.md; do
    cmd_name="$(basename "$cmd_file")"
    target="$PARENT_DIR/.claude/commands/$cmd_name"
    relative_source="../../$WORKBENCH_NAME/speckit/templates/commands/$cmd_name"

    if [ -f "$target" ] && [ ! -L "$target" ]; then
        echo -e "${YELLOW}  ⚠ Skipping $cmd_name (project-specific file exists)${NC}"
    elif [ -L "$target" ]; then
        echo -e "${BLUE}  ↻ Updating $cmd_name${NC}"
        ln -sf "$relative_source" "$target"
    else
        echo -e "${GREEN}  ✓ Linking $cmd_name${NC}"
        ln -s "$relative_source" "$target"
    fi
done

# Symlink individual agent files
echo ""
echo -e "${GREEN}Symlinking agent files...${NC}"
for agent_file in "$WORKBENCH_DIR/speckit/templates/agents"/*.md; do
    agent_name="$(basename "$agent_file")"
    target="$PARENT_DIR/.claude/agents/$agent_name"
    relative_source="../../$WORKBENCH_NAME/speckit/templates/agents/$agent_name"

    if [ -f "$target" ] && [ ! -L "$target" ]; then
        echo -e "${YELLOW}  ⚠ Skipping $agent_name (project-specific file exists)${NC}"
    elif [ -L "$target" ]; then
        echo -e "${BLUE}  ↻ Updating $agent_name${NC}"
        ln -sf "$relative_source" "$target"
    else
        echo -e "${GREEN}  ✓ Linking $agent_name${NC}"
        ln -s "$relative_source" "$target"
    fi
done

# Symlink settings.local.json if it exists in workbench
echo ""
echo -e "${GREEN}Symlinking settings...${NC}"
if [ -f "$WORKBENCH_DIR/.claude/settings.local.json" ]; then
    settings_target="$PARENT_DIR/.claude/settings.local.json"
    settings_source="../$WORKBENCH_NAME/.claude/settings.local.json"

    if [ -f "$settings_target" ] && [ ! -L "$settings_target" ]; then
        echo -e "${YELLOW}  ⚠ Skipping settings.local.json (project-specific file exists)${NC}"
    else
        ln -sf "$settings_source" "$settings_target"
        echo -e "${GREEN}  ✓ Linked settings.local.json${NC}"
    fi
fi

# Symlink speckit directories
echo ""
echo -e "${GREEN}Symlinking speckit directories...${NC}"
if [ -d "$WORKBENCH_DIR/speckit/scripts" ]; then
    scripts_target="$PARENT_DIR/speckit/scripts"
    scripts_source="../$WORKBENCH_NAME/speckit/scripts"

    if [ -e "$scripts_target" ] && [ ! -L "$scripts_target" ]; then
        echo -e "${YELLOW}  ⚠ Skipping scripts (directory exists)${NC}"
    else
        ln -sf "$scripts_source" "$scripts_target"
        echo -e "${GREEN}  ✓ Linked speckit/scripts${NC}"
    fi
fi

if [ -d "$WORKBENCH_DIR/speckit/templates" ]; then
    templates_target="$PARENT_DIR/speckit/templates"
    templates_source="../$WORKBENCH_NAME/speckit/templates"

    if [ -e "$templates_target" ] && [ ! -L "$templates_target" ]; then
        echo -e "${YELLOW}  ⚠ Skipping templates (directory exists)${NC}"
    else
        ln -sf "$templates_source" "$templates_target"
        echo -e "${GREEN}  ✓ Linked speckit/templates${NC}"
    fi
fi

# Create memory templates if they don't exist
echo ""
echo -e "${GREEN}Setting up project memory files...${NC}"
if [ ! -f "$PARENT_DIR/memory/constitution.md" ]; then
    cp "$WORKBENCH_DIR/speckit/memory/constitution.md" "$PARENT_DIR/memory/constitution.md"
    echo -e "${GREEN}  ✓ Created memory/constitution.md (customise for your project)${NC}"
else
    echo -e "${BLUE}  → memory/constitution.md already exists${NC}"
fi

# Create a minimal README for memory directory
if [ ! -f "$PARENT_DIR/memory/README.md" ]; then
    cat > "$PARENT_DIR/memory/README.md" << 'EOF'
# Project Memory

This directory contains project-specific memory files that provide context to AI assistants.

## Files

- `constitution.md` - Core principles and non-negotiable rules
- `development-protocols.md` - Technical standards and patterns
- `program_overview.md` - Product vision and business context
- `task-execution-patterns.md` - Quality gates and workflow patterns

## Usage

These files are automatically loaded by spec-kit commands to provide business and technical context.
Customise them for your project's specific needs.
EOF
    echo -e "${GREEN}  ✓ Created memory/README.md${NC}"
fi

# Detect and configure documentation structure
echo ""
echo -e "${GREEN}Detecting documentation structure...${NC}"

DOCS_DETECTION=""

# Detect Docusaurus
if [ -f "$PARENT_DIR/website/docusaurus.config.js" ]; then
    DOCS_DETECTION="docusaurus_website"
    echo -e "${BLUE}  ✓ Detected Docusaurus at /website/${NC}"
elif [ -f "$PARENT_DIR/docs/docusaurus.config.js" ]; then
    DOCS_DETECTION="docusaurus_docs"
    echo -e "${BLUE}  ✓ Detected Docusaurus at /docs/${NC}"
elif [ -d "$PARENT_DIR/docs" ]; then
    DOCS_DETECTION="simple_docs"
    echo -e "${BLUE}  ✓ Detected /docs/ directory${NC}"
else
    DOCS_DETECTION="none"
    echo -e "${BLUE}  → No documentation structure detected${NC}"
fi

# Check if CLAUDE.md exists and needs documentation section
if [ -f "$PARENT_DIR/CLAUDE.md" ]; then
    if grep -q "## Documentation Structure" "$PARENT_DIR/CLAUDE.md"; then
        echo -e "${BLUE}  → CLAUDE.md already has Documentation Structure section${NC}"
    else
        echo -e "${YELLOW}  ⚠ Adding Documentation Structure section to CLAUDE.md${NC}"
        cat >> "$PARENT_DIR/CLAUDE.md" << 'EOF'

## Documentation Structure

<!--
IMPORTANT: Configure your project's documentation approach before running /coalesce-knowledge.
Uncomment ONE of the options below, or create a custom configuration.
-->

<!-- OPTION 1: No Documentation
## Documentation Structure

This project does not maintain separate documentation files. All architectural decisions
and patterns are kept in CLAUDE.md, memory/ files, and .claude/skills/.

When /coalesce-knowledge extracts content from CLAUDE.md, it should:
- Move to memory/ files for business/workflow knowledge
- Move to .claude/skills/ for project-specific patterns
- Keep critical reference material in CLAUDE.md with size limits
-->

<!-- OPTION 2: Simple Docs Folder
## Documentation Structure

Documentation Location: `/docs/`

Structure:
- `/docs/architecture/` - Architectural decisions and patterns
- `/docs/frameworks/` - Framework usage guides
- `/docs/api/` - API specifications

When /coalesce-knowledge extracts content from CLAUDE.md (>50 lines), it should:
- Create markdown files in appropriate /docs/ subdirectories
- Update CLAUDE.md with links: "See /docs/architecture/pattern-name.md for details"
- Keep only summary and essential reference material in CLAUDE.md
-->

<!-- OPTION 3: Docusaurus Website
## Documentation Structure

Documentation Location: Docusaurus site at `/website/` (or `/docs/` if different)

Docusaurus Config: `website/docusaurus.config.js`
Content Location: `website/docs/`

Structure:
- `website/docs/architecture/` - ADRs and architectural patterns
- `website/docs/guides/` - Development guides and workflows
- `website/docs/api/` - API reference

When /coalesce-knowledge extracts content from CLAUDE.md, it should:
- Create properly formatted Docusaurus MDX files with frontmatter:
  ```yaml
  ---
  sidebar_position: 1
  ---
  ```
- Update navigation in docusaurus.config.js if needed
- Update CLAUDE.md with links to published docs
- Consider that docs are published, so write for broader audience
-->

<!-- OPTION 4: Custom Documentation Requirements
## Documentation Structure

See `docs/DOCUMENTATION_GUIDE.md` for complete documentation requirements and constraints.

Summary:
- [Brief description of your documentation approach]
- [Special tools or processes required]
- [Link formatting conventions]
-->

---

**TODO: Uncomment and configure the appropriate documentation option above, then restart Claude Code.**

EOF
        echo -e "${GREEN}  ✓ Documentation Structure section added to CLAUDE.md${NC}"

        case "$DOCS_DETECTION" in
            "docusaurus_website")
                echo -e "${BLUE}     Hint: Consider using OPTION 3 (Docusaurus at /website/)${NC}"
                ;;
            "docusaurus_docs")
                echo -e "${BLUE}     Hint: Consider using OPTION 3 (Docusaurus at /docs/)${NC}"
                ;;
            "simple_docs")
                echo -e "${BLUE}     Hint: Consider using OPTION 2 (Simple /docs/ folder)${NC}"
                ;;
            "none")
                echo -e "${BLUE}     Hint: Consider using OPTION 1 (No documentation) or OPTION 2 (Simple /docs/ folder)${NC}"
                ;;
        esac
    fi
else
    echo -e "${BLUE}  → No CLAUDE.md found (will be added when created)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Installation Complete!                                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Directory structure created:${NC}"
echo "  $PARENT_DIR/specs/              - Feature specifications"
echo "  $PARENT_DIR/memory/             - Project context and principles"
echo "  $PARENT_DIR/speckit/            - Symlinked scripts and templates"
echo "  $PARENT_DIR/.claude/commands/   - AI commands (individual symlinks)"
echo "  $PARENT_DIR/.claude/agents/     - AI subagents (individual symlinks)"
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo "  /specify          - Create a new feature specification"
echo "  /plan             - Generate implementation plan"
echo "  /tasks            - Break down plan into tasks"
echo "  /implement        - Implement tasks (single: T001, range: T001-T005, list: T001, T003)"
echo "  /audit            - Audit completed tasks"
echo "  /analyze          - Check consistency across spec/plan/tasks"
echo "  /clarify          - Detect ambiguities and ask questions"
echo "  /constitution     - Manage project principles"
echo "  /coalesce-knowledge - Synthesize knowledge from CLAUDE.md into long-term storage"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Customise memory/constitution.md for your project"
echo "  2. Configure Documentation Structure in CLAUDE.md (for /coalesce-knowledge)"
echo "  3. Create a feature branch (e.g., git checkout -b 001-my-feature)"
echo "  4. Run /specify to start a new feature"
echo ""
echo -e "${GREEN}Happy coding!${NC}"
