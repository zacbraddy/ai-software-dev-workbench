import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Escapes a string for safe use in shell commands by replacing single quotes
 * with '\'' and wrapping the result in single quotes.
 * @param arg - The string to escape
 * @returns The escaped string safe for shell command interpolation
 */
function escapeShellArg(arg: string): string {
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Represents a Beads Epic - the top-level container for a feature or project.
 */
export interface BeadsEpic {
  id: string;
  type: 'epic';
  title: string;
  status: 'pending' | 'planning' | 'in-progress' | 'complete';
  priority: number;
  created_at: string;
}

/**
 * Represents a Beads Story - a mid-level container for user stories or phases.
 */
export interface BeadsStory {
  id: string;
  type: 'story';
  title: string;
  parent: string;
  status: 'pending' | 'in-progress' | 'complete';
  priority: number;
  created_at: string;
}

/**
 * Represents a Beads Task - an individual implementation unit.
 */
export interface BeadsTask {
  id: string;
  type: 'task';
  title: string;
  description?: string;
  parent: string;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked';
  priority: number;
  dependencies?: string[];
  created_at: string;
  updated_at: string;
  history?: Array<{
    timestamp: string;
    action: string;
    user: string;
  }>;
}

/**
 * Response from the `bd ready` command containing tasks ready to be worked on.
 */
export interface BeadsReadyResponse {
  ready_tasks: Array<{
    id: string;
    title: string;
    type: 'task';
    priority: number;
    status: string;
  }>;
}

/**
 * Response from the `bd list` command containing all issues.
 */
export interface BeadsListResponse {
  issues: Array<BeadsEpic | BeadsStory | BeadsTask>;
}

/**
 * Union type representing any Beads issue type.
 */
export type BeadsIssue = BeadsEpic | BeadsStory | BeadsTask;

/**
 * Options for creating a new Beads issue.
 */
export interface BeadsCreateOptions {
  title: string;
  type: 'epic' | 'story' | 'task';
  priority: number;
  parent?: string;
  description?: string;
  bodyFile?: string;
  deps?: string;
}

/**
 * Options for updating a Beads issue status.
 */
export interface BeadsUpdateOptions {
  issueId: string;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked';
}

/**
 * Options for adding a dependency between Beads issues.
 */
export interface BeadsDepOptions {
  childId: string;
  parentId: string;
}

/**
 * Response from the `bd config list` command.
 */
export interface BeadsConfigListResponse {
  [key: string]: string;
}

/**
 * Represents a group of duplicate issues detected by Beads.
 */
export interface BeadsDuplicateGroup {
  hash: string;
  issues: Array<{
    id: string;
    title: string;
    references: number;
  }>;
}

/**
 * Response from the `bd duplicates` command.
 */
export interface BeadsDuplicatesResponse {
  groups: BeadsDuplicateGroup[];
}

/**
 * Client for interacting with the Beads CLI task management system.
 * Provides type-safe wrappers around Beads CLI commands with proper error handling.
 */
export class BeadsClient {
  private bdCommand: string = 'bd';

  /**
   * Creates a new BeadsClient instance.
   * @param bdCommand - Optional custom path to the bd command (defaults to 'bd')
   */
  constructor(bdCommand?: string) {
    if (bdCommand) {
      this.bdCommand = bdCommand;
    }
  }

  /**
   * Initialises a new Beads database in the current directory.
   * @param options - Initialisation options
   * @param options.stealth - If true, runs in stealth mode (minimal output)
   * @throws {Error} If initialisation fails
   */
  async init(options: { stealth?: boolean } = {}): Promise<void> {
    const stealthFlag = options.stealth ? '--stealth' : '';
    const command = `${this.bdCommand} init ${stealthFlag}`.trim();

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to initialize Beads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new Beads issue (epic, story, or task).
   * @param options - Issue creation options
   * @returns The created issue with its assigned ID
   * @throws {Error} If creation fails
   */
  async create(options: BeadsCreateOptions): Promise<BeadsIssue> {
    const { title, type, priority, parent, description, bodyFile, deps } = options;

    const parentFlag = parent ? `--parent ${parent}` : '';
    const descriptionFlag = description ? `-d ${escapeShellArg(description)}` : '';
    const bodyFileFlag = bodyFile ? `--body-file=${escapeShellArg(bodyFile)}` : '';
    const depsFlag = deps ? `--deps ${deps}` : '';

    const command = `${this.bdCommand} create ${escapeShellArg(title)} -t ${type} -p ${priority} ${parentFlag} ${descriptionFlag} ${bodyFileFlag} ${depsFlag} --json`.trim();

    try {
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout.trim()) as BeadsIssue;
    } catch (error) {
      throw new Error(`Failed to create ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new Epic (top-level container).
   * @param title - Epic title
   * @param priority - Priority level (default: 1)
   * @returns The created epic
   * @throws {Error} If creation fails
   */
  async createEpic(title: string, priority: number = 1): Promise<BeadsEpic> {
    return this.create({ title, type: 'epic', priority }) as Promise<BeadsEpic>;
  }

  /**
   * Creates a new Story under a parent Epic.
   * @param title - Story title
   * @param parentId - ID of the parent epic
   * @param priority - Priority level (default: 1)
   * @returns The created story
   * @throws {Error} If creation fails
   */
  async createStory(title: string, parentId: string, priority: number = 1): Promise<BeadsStory> {
    return this.create({ title, type: 'story', priority, parent: parentId }) as Promise<BeadsStory>;
  }

  /**
   * Creates a new Task under a parent Story.
   * @param title - Task title
   * @param parentId - ID of the parent story
   * @param priority - Priority level (default: 2)
   * @returns The created task
   * @throws {Error} If creation fails
   */
  async createTask(title: string, parentId: string, priority: number = 2): Promise<BeadsTask> {
    return this.create({ title, type: 'task', priority, parent: parentId }) as Promise<BeadsTask>;
  }

  /**
   * Updates the status of a Beads issue.
   * @param options - Update options
   * @throws {Error} If update fails
   */
  async update(options: BeadsUpdateOptions): Promise<void> {
    const { issueId, status } = options;
    const command = `${this.bdCommand} update ${issueId} --status ${status}`;

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to update ${issueId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates the status of multiple Beads issues at once.
   * @param issueIds - Array of issue IDs to update
   * @param status - New status to apply to all issues
   * @throws {Error} If update fails
   */
  async updateMultiple(issueIds: string[], status: string): Promise<void> {
    const command = `${this.bdCommand} update ${issueIds.join(' ')} --status ${status}`;

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to update issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Closes a Beads issue with an optional reason.
   * @param issueId - ID of the issue to close
   * @param reason - Optional reason for closing
   * @throws {Error} If close operation fails
   */
  async close(issueId: string, reason?: string): Promise<void> {
    const reasonFlag = reason ? `--reason ${escapeShellArg(reason)}` : '';
    const command = `${this.bdCommand} close ${issueId} ${reasonFlag}`.trim();

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to close ${issueId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Adds a dependency relationship between two issues (child depends on parent).
   * @param options - Dependency options
   * @throws {Error} If adding dependency fails
   */
  async addDependency(options: BeadsDepOptions): Promise<void> {
    const { childId, parentId } = options;
    const command = `${this.bdCommand} dep add ${childId} ${parentId}`;

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to add dependency ${childId} -> ${parentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Shows detailed information about a specific issue.
   * @param issueId - ID of the issue to show
   * @returns The issue details
   * @throws {Error} If show operation fails
   */
  async show(issueId: string): Promise<BeadsIssue> {
    const command = `${this.bdCommand} show ${issueId} --json`;

    try {
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout.trim()) as BeadsIssue;
    } catch (error) {
      throw new Error(`Failed to show ${issueId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets a list of tasks that are ready to be worked on (no blocking dependencies).
   * @returns Response containing ready tasks
   * @throws {Error} If ready query fails
   */
  async ready(): Promise<BeadsReadyResponse> {
    const command = `${this.bdCommand} ready --json`;

    try {
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout.trim()) as BeadsReadyResponse;
    } catch (error) {
      throw new Error(`Failed to get ready tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lists all issues in the Beads database.
   * @returns Response containing all issues
   * @throws {Error} If list operation fails
   */
  async list(): Promise<BeadsListResponse> {
    const command = `${this.bdCommand} list --json`;

    try {
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout.trim()) as BeadsListResponse;
    } catch (error) {
      throw new Error(`Failed to list issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Synchronises the Beads database (should be called at session end before git push).
   * @throws {Error} If sync fails
   */
  async sync(): Promise<void> {
    const command = `${this.bdCommand} sync`;

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Runs health checks on the Beads database and optionally fixes issues.
   * @param options - Doctor options
   * @param options.fix - If true, automatically fix detected issues
   * @returns Output from the doctor command
   * @throws {Error} If doctor command fails
   */
  async doctor(options: { fix?: boolean } = {}): Promise<string> {
    const fixFlag = options.fix ? '--fix' : '';
    const command = `${this.bdCommand} doctor ${fixFlag}`.trim();

    try {
      const { stdout } = await execAsync(command);
      return stdout;
    } catch (error) {
      throw new Error(`Beads doctor failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks the installed Beads CLI version.
   * @returns Version string
   * @throws {Error} If version check fails
   */
  async checkVersion(): Promise<string> {
    const command = `${this.bdCommand} --version`;

    try {
      const { stdout } = await execAsync(command);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to check Beads version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sets a configuration value in the Beads database.
   * @param key - Configuration key
   * @param value - Configuration value
   * @throws {Error} If config set fails
   */
  async setConfig(key: string, value: string): Promise<void> {
    const command = `${this.bdCommand} config set ${key} ${escapeShellArg(value)}`;

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to set config ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets a configuration value from the Beads database.
   * @param key - Configuration key
   * @returns Configuration value
   * @throws {Error} If config get fails
   */
  async getConfig(key: string): Promise<string> {
    const command = `${this.bdCommand} config get ${key}`;

    try {
      const { stdout } = await execAsync(command);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get config ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lists all configuration values in the Beads database.
   * @returns Object containing all configuration key-value pairs
   * @throws {Error} If config list fails
   */
  async listConfig(): Promise<BeadsConfigListResponse> {
    const command = `${this.bdCommand} config list --json`;

    try {
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout.trim()) as BeadsConfigListResponse;
    } catch (error) {
      throw new Error(`Failed to list config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Removes a configuration value from the Beads database.
   * @param key - Configuration key to remove
   * @throws {Error} If config unset fails
   */
  async unsetConfig(key: string): Promise<void> {
    const command = `${this.bdCommand} config unset ${key}`;

    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to unset config ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detects and optionally merges duplicate issues in the Beads database.
   * @param options - Duplicate detection options
   * @param options.autoMerge - If true, automatically merge detected duplicates
   * @returns Response containing duplicate groups
   * @throws {Error} If duplicate detection fails
   */
  async duplicates(options: { autoMerge?: boolean } = {}): Promise<BeadsDuplicatesResponse> {
    const autoMergeFlag = options.autoMerge ? '--auto-merge' : '';
    const command = `${this.bdCommand} duplicates ${autoMergeFlag} --json`.trim();

    try {
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout.trim()) as BeadsDuplicatesResponse;
    } catch (error) {
      throw new Error(`Failed to check duplicates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Removes closed issues from the Beads database to maintain performance.
   * Should be run after backing up issues.jsonl to spec folder.
   * @param options - Cleanup options
   * @param options.dryRun - If true, shows what would be cleaned up without actually removing anything
   * @returns Output from the cleanup command
   * @throws {Error} If cleanup fails
   */
  async cleanup(options: { dryRun?: boolean } = {}): Promise<string> {
    const dryRunFlag = options.dryRun ? '--dry-run' : '';
    const command = `${this.bdCommand} cleanup ${dryRunFlag}`.trim();

    try {
      const { stdout } = await execAsync(command);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to run bd cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Outputs workflow context for Claude to inject into conversation.
   * This achieves 10-50x token efficiency (1-2k tokens vs 10-50k tokens with MCP-only approaches).
   * @returns Workflow context output
   * @throws {Error} If prime fails
   */
  async prime(): Promise<string> {
    const command = `${this.bdCommand} prime`;

    try {
      const { stdout } = await execAsync(command);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to run bd prime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sets up Claude integration by installing SessionStart and PreCompact hooks.
   * The hooks automatically run `bd prime` to inject workflow context into Claude sessions.
   * @param options - Setup options
   * @param options.project - If true, install hooks at project level
   * @param options.stealth - If true, run in stealth mode (minimal output)
   * @param options.check - If true, check hook installation status
   * @param options.remove - If true, remove installed hooks
   * @returns Output from the setup command
   * @throws {Error} If setup fails
   */
  async setupClaude(options: { project?: boolean; stealth?: boolean; check?: boolean; remove?: boolean } = {}): Promise<string> {
    const flags = [];
    if (options.project) flags.push('--project');
    if (options.stealth) flags.push('--stealth');
    if (options.check) flags.push('--check');
    if (options.remove) flags.push('--remove');

    const command = `${this.bdCommand} setup claude ${flags.join(' ')}`.trim();

    try {
      const { stdout } = await execAsync(command);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to setup Claude integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Default singleton instance of BeadsClient for convenient access.
 * Use this for most operations: `import { beads } from './beads'`
 */
export const beads = new BeadsClient();
