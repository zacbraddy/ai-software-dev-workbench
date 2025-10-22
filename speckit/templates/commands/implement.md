---
description: Complete the implementation of one or more tasks from the current spec. Pass single task (T001), range (T001-T005), or list (T001, T003, T007-T010).
---

User input: $ARGUMENTS

## Task Detection and Mode Selection

1. **Parse task specification(s)** from `$ARGUMENTS`:
   - Single task: `T001` (regex: `/^T\d{3}$/`)
   - Range: `T001-T005` (regex: `/^T\d{3}-T\d{3}$/`)
   - List with ranges: `T001, T003-T005, T009` (comma-separated, can include ranges)

2. **Validate format**:
   - If no valid task format detected, STOP and tell user: "Please provide task ID(s) in format: T001 (single), T001-T005 (range), or T001, T003-T005 (list)"
   - Extract all task IDs from ranges and lists into array

3. **Load context** (required for both modes):
   - Run `bash speckit/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks`
   - Parse JSON output to extract:
     - `FEATURE_DIR` - Path to feature specification directory
     - `AVAILABLE_DOCS` - List of available documentation files

4. **Determine execution mode and load appropriate script**:
   ```
   task_count = length of extracted task IDs array

   if (task_count == 1) {
     MODE = "SINGLE"
     Read and execute: .claude/commands/implement-single.md
   } else {
     MODE = "PARALLEL"
     Read and execute: .claude/commands/implement-parallel.md
   }
   ```

5. **Execute the loaded script**:
   - Pass variables: $TASK_ID (single) or $TASK_IDS (parallel), $FEATURE_DIR, $AVAILABLE_DOCS
   - Follow all instructions in the loaded script
   - Do NOT continue reading this file beyond this point

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
