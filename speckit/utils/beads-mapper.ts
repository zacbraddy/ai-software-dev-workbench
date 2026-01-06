import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Parsed data from spec.md file.
 */
export interface ParsedSpec {
  featureTitle: string;
  overview: string;
  userStories: UserStory[];
  functionalRequirements: string[];
}

/**
 * Represents a user story from spec.md.
 */
export interface UserStory {
  id: string; // e.g., "US1", "US2"
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  goal: string;
  independentTest: string;
  acceptanceScenarios: string[];
}

/**
 * Parsed data from plan.md file.
 */
export interface ParsedPlan {
  summary: string;
  technicalContext: string;
  phases: Phase[];
  dependencies: string;
}

/**
 * Represents an implementation phase from plan.md.
 */
export interface Phase {
  name: string;
  objective: string;
  tasks: string[];
}

/**
 * Parsed data from tasks.md file.
 */
export interface ParsedTasks {
  phases: TaskPhase[];
}

/**
 * Represents a phase grouping from tasks.md.
 */
export interface TaskPhase {
  phaseNumber: number;
  name: string;
  purpose: string;
  tasks: Task[];
  checkpoints?: string[];
}

/**
 * Represents an individual task from tasks.md.
 */
export interface Task {
  id: string; // e.g., "T001"
  title: string;
  description: string;
  parallel: boolean; // true if [P] marker present
  dependencies: string[]; // Task IDs this task depends on
  filePaths: string[];
  acceptanceCriteria: string[];
  notes: string[]; // IMPORTANT, CRITICAL, WARNING, TEMPORARY markers
}

/**
 * Synthesised Epic description ready for Beads.
 */
export interface SynthesisedEpic {
  title: string;
  description: string; // Full markdown description following template
}

/**
 * Synthesised Story description ready for Beads.
 */
export interface SynthesisedStory {
  title: string;
  priority: number; // 1 for P1, 2 for P2, 3 for P3
  description: string; // Full markdown description following template
}

/**
 * Synthesised Task description ready for Beads.
 */
export interface SynthesisedTask {
  taskId: string;
  title: string;
  priority: number; // Default 2 for normal tasks
  description: string; // Full markdown description following template
  parallel: boolean;
  dependencies: string[]; // Task IDs (T001, T002, etc.)
}

/**
 * Parses a spec.md file and extracts structured data.
 */
export function parseSpec(specPath: string): ParsedSpec {
  const content = readFileSync(specPath, 'utf-8');
  const lines = content.split('\n');

  // Extract feature title (first line: # Feature Specification: ...)
  const titleMatch = lines.find(line => line.startsWith('# Feature Specification:'));
  const featureTitle = titleMatch ? titleMatch.replace('# Feature Specification: ', '').trim() : 'Untitled Feature';

  // Extract overview (after title, before first ## heading)
  let overview = '';
  let inOverview = false;
  for (const line of lines) {
    if (line.startsWith('# Feature Specification:')) {
      inOverview = true;
      continue;
    }
    if (inOverview && line.startsWith('##')) {
      break;
    }
    if (inOverview && line.trim()) {
      overview += line + '\n';
    }
  }
  overview = overview.trim();

  // Extract user stories
  const userStories: UserStory[] = [];
  let currentStory: Partial<UserStory> | null = null;
  let inAcceptanceScenarios = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect user story header: ### User Story N - Title (Priority: PX)
    const storyMatch = line.match(/^### User Story (\d+) - (.+?) \(Priority: (P\d)\)/);
    if (storyMatch) {
      if (currentStory) {
        userStories.push(currentStory as UserStory);
      }
      const [, id, title, priority] = storyMatch;
      currentStory = {
        id: `US${id}`,
        title: title.trim(),
        priority: priority as 'P1' | 'P2' | 'P3',
        goal: '',
        independentTest: '',
        acceptanceScenarios: []
      };
      inAcceptanceScenarios = false;
      continue;
    }

    if (!currentStory) continue;

    // Extract goal (line starting with "As a")
    if (line.startsWith('As a ') || line.startsWith('As an ')) {
      currentStory.goal = line.trim();
      continue;
    }

    // Extract independent test criteria (**Independent Test**: ...)
    if (line.includes('**Independent Test**:')) {
      // Read lines until we hit the next ** or empty line
      let testText = line.replace(/\*\*Independent Test\*\*:/, '').trim();
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('**') || lines[j].trim() === '') break;
        testText += ' ' + lines[j].trim();
      }
      currentStory.independentTest = testText;
      continue;
    }

    // Extract acceptance scenarios
    if (line.includes('**Acceptance Scenarios**:')) {
      inAcceptanceScenarios = true;
      continue;
    }

    if (inAcceptanceScenarios && line.match(/^\d+\./)) {
      currentStory.acceptanceScenarios = currentStory.acceptanceScenarios || [];
      currentStory.acceptanceScenarios.push(line.trim());
    }
  }

  if (currentStory) {
    userStories.push(currentStory as UserStory);
  }

  // Extract functional requirements (simplified - just count FR- mentions)
  const functionalRequirements = content.match(/FR-\d{3}/g) || [];

  return {
    featureTitle,
    overview,
    userStories,
    functionalRequirements: [...new Set(functionalRequirements)]
  };
}

/**
 * Parses a plan.md file and extracts structured data.
 */
export function parsePlan(planPath: string): ParsedPlan {
  const content = readFileSync(planPath, 'utf-8');
  const lines = content.split('\n');

  // Extract summary (first paragraph after title)
  let summary = '';
  let inSummary = false;
  for (const line of lines) {
    if (line.startsWith('## Summary')) {
      inSummary = true;
      continue;
    }
    if (inSummary && line.startsWith('##')) {
      break;
    }
    if (inSummary && line.trim()) {
      summary += line + ' ';
    }
  }
  summary = summary.trim();

  // Extract technical context
  let technicalContext = '';
  let inTechContext = false;
  for (const line of lines) {
    if (line.startsWith('## Technical Context')) {
      inTechContext = true;
      continue;
    }
    if (inTechContext && line.startsWith('##')) {
      break;
    }
    if (inTechContext && line.trim()) {
      technicalContext += line + ' ';
    }
  }
  technicalContext = technicalContext.trim();

  // Extract phases (simplified - look for ## Phase N: patterns)
  const phases: Phase[] = [];
  let currentPhase: Partial<Phase> | null = null;

  for (const line of lines) {
    const phaseMatch = line.match(/^## Phase \d+: (.+)/);
    if (phaseMatch) {
      if (currentPhase) {
        phases.push(currentPhase as Phase);
      }
      currentPhase = {
        name: phaseMatch[1].trim(),
        objective: '',
        tasks: []
      };
      continue;
    }

    if (currentPhase && line.startsWith('**Objective**:')) {
      currentPhase.objective = line.replace('**Objective**:', '').trim();
    }
  }

  if (currentPhase) {
    phases.push(currentPhase as Phase);
  }

  // Extract dependencies section
  let dependencies = '';
  let inDeps = false;
  for (const line of lines) {
    if (line.startsWith('## Dependencies') || line.startsWith('### Dependencies')) {
      inDeps = true;
      continue;
    }
    if (inDeps && line.startsWith('##')) {
      break;
    }
    if (inDeps && line.trim()) {
      dependencies += line + ' ';
    }
  }
  dependencies = dependencies.trim();

  return {
    summary,
    technicalContext,
    phases,
    dependencies
  };
}

/**
 * Parses a tasks.md file and extracts structured task data.
 */
export function parseTasks(tasksPath: string): ParsedTasks {
  const content = readFileSync(tasksPath, 'utf-8');
  const lines = content.split('\n');

  const phases: TaskPhase[] = [];
  let currentPhase: Partial<TaskPhase> | null = null;
  let currentTask: Partial<Task> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect phase header: ## Phase N: Name
    const phaseMatch = line.match(/^## Phase (\d+): (.+)/);
    if (phaseMatch) {
      if (currentPhase && currentTask) {
        currentPhase.tasks = currentPhase.tasks || [];
        currentPhase.tasks.push(currentTask as Task);
        currentTask = null;
      }
      if (currentPhase) {
        phases.push(currentPhase as TaskPhase);
      }

      const [, phaseNum, phaseName] = phaseMatch;
      currentPhase = {
        phaseNumber: parseInt(phaseNum, 10),
        name: phaseName.trim(),
        purpose: '',
        tasks: [],
        checkpoints: []
      };
      continue;
    }

    if (!currentPhase) continue;

    // Extract purpose
    if (line.startsWith('**Purpose**:')) {
      currentPhase.purpose = line.replace('**Purpose**:', '').trim();
      continue;
    }

    // Detect task: - [ ] T001 [P] Description or - [x] T001 Description
    const taskMatch = line.match(/^- \[([ xX])\] (T\d{3}) (\[P\])?\s*(.+)/);
    if (taskMatch) {
      if (currentTask) {
        currentPhase.tasks = currentPhase.tasks || [];
        currentPhase.tasks.push(currentTask as Task);
      }

      const [, _status, taskId, parallelMarker, title] = taskMatch;
      const fullDescription = title.trim();

      // Extract file paths from task description (paths with / or ending in .ts, .md, .json, etc.)
      const filePathMatches = fullDescription.match(/[\w\-/]+\.[\w]+|[\w\-/]+\/[\w\-/]+/g) || [];
      const filePaths = filePathMatches.filter(p =>
        p.includes('/') || p.match(/\.(ts|js|md|json|yml|yaml|sh|tsx|jsx)$/)
      );

      // Extract markers (IMPORTANT, CRITICAL, WARNING, TEMPORARY, SKIPPED, NOTE, etc.)
      const markerPatterns = /\b(IMPORTANT|CRITICAL|WARNING|TEMPORARY|SKIPPED|NOTE|DEPRECATED|LEGACY)\b[^.!?]*/gi;
      const notes = fullDescription.match(markerPatterns) || [];

      // Extract acceptance criteria indicators
      const criteriaIndicators = [
        'ensure', 'verify', 'must', 'should', 'confirm', 'check',
        'validate', 'test', 'implement', 'create', 'update'
      ];
      const acceptanceCriteria: string[] = [];

      // Look for criteria patterns in description
      for (const indicator of criteriaIndicators) {
        const regex = new RegExp(`${indicator}[^.!?]*`, 'gi');
        const matches = fullDescription.match(regex);
        if (matches) {
          acceptanceCriteria.push(...matches.map(m => m.trim()));
        }
      }

      currentTask = {
        id: taskId,
        title: fullDescription,
        description: fullDescription,
        parallel: parallelMarker === '[P]',
        dependencies: [],
        filePaths: [...new Set(filePaths)],
        acceptanceCriteria: [...new Set(acceptanceCriteria)].slice(0, 3), // Limit to top 3
        notes: [...new Set(notes)]
      };
      continue;
    }

    // Extract checkpoints
    if (line.includes('**Checkpoint')) {
      currentPhase.checkpoints = currentPhase.checkpoints || [];
      currentPhase.checkpoints.push(line.trim());
    }
  }

  // Push final task and phase
  if (currentPhase && currentTask) {
    currentPhase.tasks = currentPhase.tasks || [];
    currentPhase.tasks.push(currentTask as Task);
  }
  if (currentPhase) {
    phases.push(currentPhase as TaskPhase);
  }

  return { phases };
}

/**
 * Synthesises an Epic description from parsed spec and plan data.
 * Follows the Epic template from contracts/beads-synthesis-templates.md.
 */
export function synthesiseEpic(spec: ParsedSpec, plan: ParsedPlan, tasks: ParsedTasks): SynthesisedEpic {
  // Identify P1, P2, P3 stories
  const p1Stories = spec.userStories.filter(s => s.priority === 'P1');
  const p2Stories = spec.userStories.filter(s => s.priority === 'P2');
  const p3Stories = spec.userStories.filter(s => s.priority === 'P3');

  // Count total tasks
  const totalTasks = tasks.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);

  const description = `# ${spec.featureTitle}

## Overview
${spec.overview || 'Feature implementation for enhanced functionality.'}

## Implementation Strategy
- **MVP First**: ${p1Stories.map(s => s.id + ' (' + s.title + ')').join(', ') || 'Core functionality'} form the minimum viable implementation
- **Incremental Delivery**: ${p2Stories.length > 0 ? p2Stories.map(s => s.id).join(', ') : 'N/A'} add enhanced features. ${p3Stories.length > 0 ? p3Stories.map(s => s.id).join(', ') + ' provide' : ''} ${p3Stories.length > 0 ? 'documentation and polish' : ''}
- **Parallel Team**: Stories can be developed in parallel after foundational work completes

## Overall Dependency Flow
${plan.dependencies || 'Sequential implementation following phase order'}

## Story Dependency Rules
${spec.userStories.map(s => `- ${s.id} must complete before subsequent stories can leverage its features`).join('\n')}

## Scope
${spec.functionalRequirements.length} functional requirements, ${totalTasks} tasks, ${tasks.phases.length} phases
`;

  return {
    title: spec.featureTitle,
    description
  };
}

/**
 * Synthesises a Story description from a user story and related data.
 * Follows the Story template from contracts/beads-synthesis-templates.md.
 */
export function synthesiseStory(userStory: UserStory, phase: TaskPhase, plan: ParsedPlan): SynthesisedStory {
  const priorityMap = { P1: 1, P2: 2, P3: 3 };
  const priority = priorityMap[userStory.priority] || 2;

  const description = `# ${userStory.title}

## Goal
${userStory.goal || 'Deliver functionality as specified in acceptance scenarios.'}

## Independent Test Criteria
${userStory.independentTest || 'Test by executing related commands and verifying expected behaviour.'}

## Acceptance Scenarios
${userStory.acceptanceScenarios.map(s => '- ' + s).join('\n')}

## Checkpoints${phase.checkpoints && phase.checkpoints.length > 0 ? '\n' + phase.checkpoints.map(c => '- ' + c).join('\n') : '\nN/A'}

## Technical Notes
${plan.technicalContext || 'Follow established project patterns and architecture.'}

## Dependencies
- Sequential implementation following phase order
- Parallel execution possible for tasks marked [P]
`;

  return {
    title: userStory.title,
    priority,
    description
  };
}

/**
 * Synthesises a Task description from parsed task data.
 * Follows the Task template from contracts/beads-synthesis-templates.md.
 */
export function synthesiseTask(task: Task): SynthesisedTask {
  // Generate file paths section
  const filePathsSection = task.filePaths.length > 0
    ? task.filePaths.map(p => `- ${p}`).join('\n')
    : '- File paths not specified in task description (see task title for context)';

  // Generate acceptance criteria section
  const criteriaSection = task.acceptanceCriteria.length > 0
    ? task.acceptanceCriteria.map(c => `- ${c}`).join('\n')
    : '- Task completed as described in title\n- Implementation follows project patterns and conventions\n- Code compiles without errors';

  // Generate notes section
  const notesSection = task.notes.length > 0
    ? task.notes.map(n => `- ${n}`).join('\n')
    : 'Follow standard implementation patterns';

  // Generate testing instructions based on task content
  const hasTest = task.title.toLowerCase().includes('test');
  const hasBuild = task.title.toLowerCase().includes('build') || task.title.toLowerCase().includes('compile');
  const hasScript = task.title.toLowerCase().includes('script') || task.title.toLowerCase().includes('.sh');

  let testingInstructions = 'Verify task completion by:\n';
  if (task.filePaths.length > 0) {
    testingInstructions += `1. Reviewing changes to: ${task.filePaths.join(', ')}\n`;
  }
  if (hasBuild) {
    testingInstructions += '2. Running build command to verify compilation\n';
  }
  if (hasTest) {
    testingInstructions += '2. Running test suite to verify functionality\n';
  }
  if (hasScript) {
    testingInstructions += '2. Executing script and verifying expected output\n';
  }
  if (!hasBuild && !hasTest && !hasScript) {
    testingInstructions += '2. Running relevant tests or commands to verify functionality\n';
  }
  testingInstructions += '3. Ensuring no regressions in existing functionality';

  const description = `# ${task.id} - ${task.title}

## File Paths
${filePathsSection}

## Acceptance Criteria
${criteriaSection}

## Task-Specific Notes
${notesSection}

## Dependencies
- Depends on: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}
- Parallel with: ${task.parallel ? 'Can run in parallel with other [P] tasks' : 'Sequential execution required'}

## Testing Instructions (post-completion)
${testingInstructions}
`;

  return {
    taskId: task.id,
    title: task.title,
    priority: 2,
    description,
    parallel: task.parallel,
    dependencies: task.dependencies
  };
}

/**
 * Main mapper function that orchestrates parsing and synthesis.
 * Reads spec.md, plan.md, and tasks.md from a feature directory.
 */
export function mapSpecKitToBeads(featureDir: string): {
  epic: SynthesisedEpic;
  stories: SynthesisedStory[];
  tasks: SynthesisedTask[];
} {
  const specPath = join(featureDir, 'spec.md');
  const planPath = join(featureDir, 'plan.md');
  const tasksPath = join(featureDir, 'tasks.md');

  const spec = parseSpec(specPath);
  const plan = parsePlan(planPath);
  const tasks = parseTasks(tasksPath);

  const epic = synthesiseEpic(spec, plan, tasks);

  // Map user stories to Beads stories
  const stories: SynthesisedStory[] = [];
  for (const userStory of spec.userStories) {
    // Find corresponding phase (simplified - match by name or ID)
    const phase = tasks.phases.find(p =>
      p.name.includes(userStory.title) || p.name.includes(userStory.id)
    ) || tasks.phases[0]; // Fallback to first phase if no match

    stories.push(synthesiseStory(userStory, phase, plan));
  }

  // Map all tasks from all phases
  const allTasks: SynthesisedTask[] = [];
  for (const phase of tasks.phases) {
    for (const task of phase.tasks) {
      allTasks.push(synthesiseTask(task));
    }
  }

  return {
    epic,
    stories,
    tasks: allTasks
  };
}
