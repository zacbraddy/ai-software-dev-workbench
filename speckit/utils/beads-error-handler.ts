/**
 * Beads CLI Error Handler
 *
 * Provides sophisticated error handling for Beads CLI operations with:
 * - Error categorization (CLI not found, database corruption, network, etc.)
 * - User-friendly error messages
 * - Recovery suggestions
 * - Structured error information for logging/debugging
 */

/**
 * Categories of Beads CLI errors
 */
export enum BeadsErrorCategory {
  /** Beads CLI not installed or not in PATH */
  CLI_NOT_FOUND = 'CLI_NOT_FOUND',
  /** Beads database corruption detected */
  DATABASE_CORRUPTION = 'DATABASE_CORRUPTION',
  /** Network/git sync failure */
  SYNC_FAILURE = 'SYNC_FAILURE',
  /** Invalid command syntax or parameters */
  INVALID_COMMAND = 'INVALID_COMMAND',
  /** Issue not found in database */
  ISSUE_NOT_FOUND = 'ISSUE_NOT_FOUND',
  /** Dependency cycle detected */
  DEPENDENCY_CYCLE = 'DEPENDENCY_CYCLE',
  /** JSON parsing failure */
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',
  /** Permission denied (file system or git) */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** Beads not initialised in repository */
  NOT_INITIALISED = 'NOT_INITIALISED',
  /** Unknown error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Structured error information with recovery suggestions
 */
export interface BeadsError {
  /** Error category for programmatic handling */
  category: BeadsErrorCategory;
  /** User-friendly error message */
  message: string;
  /** Suggested recovery steps */
  suggestions: string[];
  /** Original error details for debugging */
  originalError?: Error;
  /** Command that failed */
  command?: string;
}

/**
 * Error patterns to detect specific Beads CLI error scenarios
 */
const ERROR_PATTERNS = [
  {
    pattern: /bd: command not found|bd: not found/i,
    category: BeadsErrorCategory.CLI_NOT_FOUND,
    message: 'Beads CLI not found. The bd command is not installed or not in your PATH.',
    suggestions: [
      'Install Beads CLI: npm install -g @beads/bd',
      'Verify installation: bd --version',
      'Check PATH includes npm global bin directory',
    ],
  },
  {
    pattern: /database is locked|database corruption|database file is corrupt/i,
    category: BeadsErrorCategory.DATABASE_CORRUPTION,
    message: 'Beads database corruption detected.',
    suggestions: [
      'Run: bd doctor --fix',
      'If that fails, rollback via git: git checkout HEAD~1 .beads/',
      'Reimport: bd import -i .beads/issues.jsonl',
      'Verify: bd list --json',
    ],
  },
  {
    pattern: /sync failed|push failed|network|connection refused|could not resolve host/i,
    category: BeadsErrorCategory.SYNC_FAILURE,
    message: 'Failed to sync Beads database to remote repository.',
    suggestions: [
      'Check internet connection',
      'Verify git remote is accessible: git remote -v',
      'Try manual sync: bd sync',
      'Check git status: git status',
    ],
  },
  {
    pattern: /unknown flag|invalid argument|unexpected argument|usage:/i,
    category: BeadsErrorCategory.INVALID_COMMAND,
    message: 'Invalid Beads CLI command syntax.',
    suggestions: [
      'Check command syntax in Beads documentation',
      'Verify all required flags are provided',
      'Ensure flag values are properly quoted',
    ],
  },
  {
    pattern: /issue not found|no such issue|invalid issue id/i,
    category: BeadsErrorCategory.ISSUE_NOT_FOUND,
    message: 'Specified issue ID not found in Beads database.',
    suggestions: [
      'Verify issue ID is correct: bd list --json',
      'Check if issue was closed: bd show <id> --json',
      'Ensure database is up to date: bd sync',
    ],
  },
  {
    pattern: /circular dependency|dependency cycle|cycle detected/i,
    category: BeadsErrorCategory.DEPENDENCY_CYCLE,
    message: 'Circular dependency detected. Task dependencies form a cycle.',
    suggestions: [
      'Review task dependencies: bd show <id> --json',
      'Remove cyclic dependency: bd dep remove <child> <parent>',
      'Restructure task relationships to be acyclic',
    ],
  },
  {
    pattern: /unexpected token|invalid json|json parse error/i,
    category: BeadsErrorCategory.JSON_PARSE_ERROR,
    message: 'Failed to parse JSON output from Beads CLI.',
    suggestions: [
      'Run command without --json flag to see raw output',
      'Check if Beads CLI version is compatible: bd --version',
      'Verify .beads/issues.jsonl is valid JSON Lines format',
    ],
  },
  {
    pattern: /permission denied|eacces|access denied|operation not permitted/i,
    category: BeadsErrorCategory.PERMISSION_DENIED,
    message: 'Permission denied accessing Beads files or git repository.',
    suggestions: [
      'Check file permissions: ls -la .beads/',
      'Ensure you own the .beads/ directory',
      'Verify git repository permissions',
      'Try: sudo chown -R $USER .beads/',
    ],
  },
  {
    pattern: /not initialized|no beads database found|run bd init/i,
    category: BeadsErrorCategory.NOT_INITIALISED,
    message: 'Beads not initialised in this repository.',
    suggestions: [
      'Initialise Beads: bd init',
      'Verify .beads/ directory exists',
      'Check you are in the repository root',
    ],
  },
];

/**
 * Categorises a Beads CLI error and provides recovery suggestions.
 *
 * @param error - The original error from Beads CLI execution
 * @param command - The Beads command that failed (optional)
 * @returns Structured error information with recovery suggestions
 */
export function categoriseBeadsError(error: Error, command?: string): BeadsError {
  const errorMessage = error.message.toLowerCase();

  // Try to match against known error patterns
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(errorMessage)) {
      return {
        category: pattern.category,
        message: pattern.message,
        suggestions: pattern.suggestions,
        originalError: error,
        command,
      };
    }
  }

  // Unknown error - return generic information
  return {
    category: BeadsErrorCategory.UNKNOWN,
    message: `Beads CLI operation failed: ${error.message}`,
    suggestions: [
      'Run: bd doctor to diagnose issues',
      'Check Beads CLI version: bd --version (require v0.44.0+)',
      'Review command syntax in contracts/beads-cli.md',
      'Check git status and repository state',
    ],
    originalError: error,
    command,
  };
}

/**
 * Formats a BeadsError into a user-friendly error message with recovery suggestions.
 *
 * @param beadsError - The categorised Beads error
 * @returns Formatted error message string
 */
export function formatBeadsError(beadsError: BeadsError): string {
  const lines: string[] = [];

  lines.push(`❌ ${beadsError.message}`);
  lines.push('');

  if (beadsError.command) {
    lines.push(`Failed command: ${beadsError.command}`);
    lines.push('');
  }

  if (beadsError.suggestions.length > 0) {
    lines.push('💡 Recovery suggestions:');
    beadsError.suggestions.forEach((suggestion, index) => {
      lines.push(`   ${index + 1}. ${suggestion}`);
    });
    lines.push('');
  }

  if (beadsError.originalError) {
    lines.push('🔍 Technical details:');
    lines.push(`   ${beadsError.originalError.message}`);
  }

  return lines.join('\n');
}

/**
 * Wraps a Beads CLI operation with error handling and user-friendly messages.
 *
 * @param operation - Async operation to execute (typically a BeadsClient method)
 * @param command - Description of the Beads command being executed
 * @returns Result of the operation
 * @throws {Error} Formatted error with recovery suggestions
 *
 * @example
 * ```typescript
 * const epic = await handleBeadsError(
 *   () => beads.createEpic('My Feature', 1),
 *   'bd create "My Feature" -t epic -p 1 --json'
 * );
 * ```
 */
export async function handleBeadsError<T>(
  operation: () => Promise<T>,
  command?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const beadsError = categoriseBeadsError(
      error instanceof Error ? error : new Error(String(error)),
      command
    );

    // Throw formatted error that includes recovery suggestions
    throw new Error(formatBeadsError(beadsError));
  }
}

/**
 * Checks if Beads CLI is available in the system.
 *
 * @returns true if Beads CLI is installed and accessible
 */
export async function isBeadsInstalled(): Promise<boolean> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    await execAsync('bd --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if Beads is initialised in the current repository.
 *
 * @returns true if .beads/ directory exists and contains issues.jsonl
 */
export async function isBeadsInitialised(): Promise<boolean> {
  const { access } = await import('fs/promises');
  const { join } = await import('path');

  try {
    await access(join(process.cwd(), '.beads', 'issues.jsonl'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates Beads CLI version meets minimum requirements.
 *
 * @param minVersion - Minimum required version (e.g., '0.44.0')
 * @returns true if installed version meets or exceeds minimum
 */
export async function validateBeadsVersion(minVersion: string): Promise<boolean> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync('bd --version');
    const installedVersion = stdout.trim().replace(/^v/, '');

    return compareVersions(installedVersion, minVersion) >= 0;
  } catch {
    return false;
  }
}

/**
 * Compares two semantic version strings.
 *
 * @param version1 - First version (e.g., '1.2.3')
 * @param version2 - Second version (e.g., '1.2.0')
 * @returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
function compareVersions(version1: string, version2: string): number {
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
}
