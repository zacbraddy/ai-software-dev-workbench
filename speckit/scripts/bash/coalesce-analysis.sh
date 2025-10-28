#!/usr/bin/env bash
#
# Coalesce Analysis Script
# Gathers context for the /coalesce-knowledge command
#
# Usage: ./coalesce-analysis.sh [--json]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

source "$SCRIPT_DIR/common.sh"

JSON_OUTPUT=false
if [[ "$1" == "--json" ]]; then
    JSON_OUTPUT=true
fi

get_spec_completion() {
    local tasks_file="$1"

    if [[ ! -f "$tasks_file" ]]; then
        echo "0"
        return
    fi

    local total_tasks=$(grep -c "^- \[[ x]\] T[0-9]" "$tasks_file" 2>/dev/null || echo "0")
    local completed_tasks=$(grep -c "^- \[x\] T[0-9]" "$tasks_file" 2>/dev/null || echo "0")

    if [[ $total_tasks -eq 0 ]]; then
        echo "0"
    else
        echo "scale=1; ($completed_tasks * 100) / $total_tasks" | bc
    fi
}

parse_documentation_config() {
    local claude_md="$1"

    if [[ ! -f "$claude_md" ]]; then
        echo "not_found"
        return
    fi

    if ! grep -q "## Documentation Structure" "$claude_md"; then
        echo "not_configured"
        return
    fi

    if grep -q "TODO: Uncomment and configure" "$claude_md"; then
        echo "not_configured"
        return
    fi

    local config_start=$(grep -n "## Documentation Structure" "$claude_md" | head -1 | cut -d: -f1)
    local config_end=$(tail -n +$config_start "$claude_md" | grep -n "^## " | sed -n '2p' | cut -d: -f1)

    if [[ -z "$config_end" ]]; then
        config_end=$(wc -l < "$claude_md")
    else
        config_end=$((config_start + config_end - 1))
    fi

    local config_section=$(sed -n "${config_start},${config_end}p" "$claude_md")

    if echo "$config_section" | grep -q "^## Documentation Structure" | grep -v "^<!--"; then
        if echo "$config_section" | grep -q "does not maintain separate documentation files"; then
            echo "no_docs"
        elif echo "$config_section" | grep -q "Documentation Location:.*Docusaurus"; then
            echo "docusaurus"
        elif echo "$config_section" | grep -q "Documentation Location:.*docs/"; then
            echo "simple_docs"
        elif echo "$config_section" | grep -q "See.*DOCUMENTATION_GUIDE"; then
            echo "custom"
        else
            echo "configured"
        fi
    else
        echo "not_configured"
    fi
}

extract_documentation_instructions() {
    local claude_md="$1"

    if [[ ! -f "$claude_md" ]]; then
        echo ""
        return
    fi

    local config_start=$(grep -n "^## Documentation Structure$" "$claude_md" | grep -v "^<!--" | head -1 | cut -d: -f1)

    if [[ -z "$config_start" ]]; then
        echo ""
        return
    fi

    local config_end=$(tail -n +$config_start "$claude_md" | grep -n "^## " | sed -n '2p' | cut -d: -f1)

    if [[ -z "$config_end" ]]; then
        config_end=$(wc -l < "$claude_md")
    else
        config_end=$((config_start + config_end - 1))
    fi

    sed -n "${config_start},${config_end}p" "$claude_md" | sed 's/"/\\"/g' | tr '\n' ' '
}

if [[ ! $JSON_OUTPUT == true ]]; then
    echo "Error: This script must be called with --json flag"
    exit 1
fi

CLAUDE_MD="$PROJECT_ROOT/CLAUDE.md"
MEMORY_DIR="$PROJECT_ROOT/memory"
SKILLS_DIR="$PROJECT_ROOT/.claude/skills"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
SPEC_DIR=""
SPEC_NAME=""
COMPLETION_PERCENT=0
TOTAL_TASKS=0
COMPLETED_TASKS=0

if [[ -d "$PROJECT_ROOT/specs/$CURRENT_BRANCH" ]]; then
    SPEC_DIR="$PROJECT_ROOT/specs/$CURRENT_BRANCH"
    SPEC_NAME="$CURRENT_BRANCH"

    if [[ -f "$SPEC_DIR/tasks.md" ]]; then
        TOTAL_TASKS=$(grep -c "^- \[[ x]\] T[0-9]" "$SPEC_DIR/tasks.md" 2>/dev/null || echo "0")
        COMPLETED_TASKS=$(grep -c "^- \[x\] T[0-9]" "$SPEC_DIR/tasks.md" 2>/dev/null || echo "0")

        if [[ $TOTAL_TASKS -gt 0 ]]; then
            COMPLETION_PERCENT=$(echo "scale=1; ($COMPLETED_TASKS * 100) / $TOTAL_TASKS" | bc)
        fi
    fi
fi

CLAUDE_MD_SIZE=0
CLAUDE_MD_LINES=0
if [[ -f "$CLAUDE_MD" ]]; then
    CLAUDE_MD_SIZE=$(wc -c < "$CLAUDE_MD")
    CLAUDE_MD_LINES=$(wc -l < "$CLAUDE_MD")
fi

MEMORY_FILES=()
if [[ -d "$MEMORY_DIR" ]]; then
    while IFS= read -r -d '' file; do
        MEMORY_FILES+=("$(basename "$file")")
    done < <(find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -print0 | sort -z)
fi

PROJECT_SKILL_DIR=""
SKILL_FILES=()
if [[ -d "$SKILLS_DIR" ]]; then
    for skill_dir in "$SKILLS_DIR"/*; do
        if [[ -d "$skill_dir" ]] && [[ $(basename "$skill_dir") != "." ]] && [[ $(basename "$skill_dir") != ".." ]]; then
            PROJECT_SKILL_DIR="$skill_dir"
            while IFS= read -r -d '' file; do
                SKILL_FILES+=("$(basename "$file")")
            done < <(find "$skill_dir" -maxdepth 1 -name "*.md" -print0 | sort -z)
            break
        fi
    done
fi

DOCS_CONFIG=$(parse_documentation_config "$CLAUDE_MD")
DOCS_INSTRUCTIONS=$(extract_documentation_instructions "$CLAUDE_MD")

cat << EOF
{
  "spec": {
    "dir": "$SPEC_DIR",
    "name": "$SPEC_NAME",
    "completion_percent": $COMPLETION_PERCENT,
    "total_tasks": $TOTAL_TASKS,
    "completed_tasks": $COMPLETED_TASKS
  },
  "claude_md": {
    "path": "$CLAUDE_MD",
    "size_bytes": $CLAUDE_MD_SIZE,
    "line_count": $CLAUDE_MD_LINES,
    "exists": $([ -f "$CLAUDE_MD" ] && echo "true" || echo "false")
  },
  "memory": {
    "dir": "$MEMORY_DIR",
    "files": [$(printf '"%s",' "${MEMORY_FILES[@]}" | sed 's/,$//')],
    "exists": $([ -d "$MEMORY_DIR" ] && echo "true" || echo "false")
  },
  "skills": {
    "dir": "$PROJECT_SKILL_DIR",
    "files": [$(printf '"%s",' "${SKILL_FILES[@]}" | sed 's/,$//')],
    "exists": $([ -n "$PROJECT_SKILL_DIR" ] && echo "true" || echo "false")
  },
  "documentation": {
    "configured": $([ "$DOCS_CONFIG" != "not_configured" ] && [ "$DOCS_CONFIG" != "not_found" ] && echo "true" || echo "false"),
    "type": "$DOCS_CONFIG",
    "instructions": "$DOCS_INSTRUCTIONS"
  },
  "project_root": "$PROJECT_ROOT"
}
EOF
