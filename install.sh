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
echo "  /specify     - Create a new feature specification"
echo "  /plan        - Generate implementation plan"
echo "  /tasks       - Break down plan into tasks"
echo "  /implement   - Implement tasks (single: T001, range: T001-T005, list: T001, T003)"
echo "  /audit       - Audit completed tasks"
echo "  /analyze     - Check consistency across spec/plan/tasks"
echo "  /clarify     - Detect ambiguities and ask questions"
echo "  /constitution - Manage project principles"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Customise memory/constitution.md for your project"
echo "  2. Create a feature branch (e.g., git checkout -b 001-my-feature)"
echo "  3. Run /specify to start a new feature"
echo ""
echo -e "${GREEN}Happy coding!${NC}"
