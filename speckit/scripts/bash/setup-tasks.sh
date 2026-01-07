#!/usr/bin/env bash

set -e

# Parse command line arguments
JSON_MODE=false
ARGS=()

for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --help|-h)
            echo "Usage: $0 [--json]"
            echo "  --json    Output results in JSON format"
            echo "  --help    Show this help message"
            exit 0
            ;;
        *)
            ARGS+=("$arg")
            ;;
    esac
done

# Get script directory and load common functions
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get all paths and variables from common functions
eval $(get_feature_paths)

# Check if we're on a proper feature branch (only for git repos)
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT" || exit 1

# Ensure the feature directory exists
mkdir -p "$FEATURE_DIR"

# Check if Beads CLI is installed
if ! command -v bd &> /dev/null; then
    echo "ERROR: Beads CLI not found. Please install it first:" >&2
    echo "  npm install -g @beads/bd" >&2
    echo "  OR brew install steveyegge/beads/bd" >&2
    exit 1
fi

# Verify Beads version is >= 0.44.0
BEADS_VERSION=$(bd --version 2>/dev/null || echo "0.0.0")
REQUIRED_VERSION="0.44.0"

# Simple version comparison (assumes semantic versioning)
version_gte() {
    # Returns 0 if $1 >= $2
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

if ! version_gte "$BEADS_VERSION" "$REQUIRED_VERSION"; then
    echo "ERROR: Beads CLI version $BEADS_VERSION is too old (required: >= $REQUIRED_VERSION)" >&2
    echo "Please upgrade: npm update -g @beads/bd" >&2
    exit 1
fi

# Check if Beads is already initialized in repository
BEADS_DIR="$REPO_ROOT/.beads"

if [[ ! -d "$BEADS_DIR" ]]; then
    # Initialize Beads (standard mode with git commits)
    echo "Initializing Beads in repository..." >&2
    cd "$REPO_ROOT"
    bd init

    if [[ $? -ne 0 ]]; then
        echo "ERROR: Failed to initialize Beads" >&2
        exit 1
    fi

    echo "Beads initialized successfully" >&2
else
    echo "Beads already initialized (found $BEADS_DIR)" >&2
fi

# Check if Claude hooks are installed
HOOKS_INSTALLED=false
if bd setup claude --check &> /dev/null; then
    HOOKS_INSTALLED=true
    echo "Claude hooks already installed" >&2
else
    echo "Claude hooks not installed (run: bd setup claude --project)" >&2
fi

# Output results
if $JSON_MODE; then
    printf '{"BEADS_DIR":"%s","BEADS_VERSION":"%s","HOOKS_INSTALLED":"%s","FEATURE_DIR":"%s","BRANCH":"%s"}\n' \
        "$BEADS_DIR" "$BEADS_VERSION" "$HOOKS_INSTALLED" "$FEATURE_DIR" "$CURRENT_BRANCH"
else
    echo "BEADS_DIR: $BEADS_DIR"
    echo "BEADS_VERSION: $BEADS_VERSION"
    echo "HOOKS_INSTALLED: $HOOKS_INSTALLED"
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
fi
