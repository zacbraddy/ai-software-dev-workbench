---
description: Update ai-software-dev-workbench with latest official spec-kit and custom improvements from other projects
---

User input: $ARGUMENTS

## Update Workbench Command

This command updates the ai-software-dev-workbench with:
1. Latest official spec-kit from GitHub
2. Custom improvements from other projects (if paths provided)
3. Preserves custom features (suggest.md, parallel execution, memory templates)

### Usage

```
/update-workbench
/update-workbench ../techsift
/update-workbench ../project1 ../project2
```

### Execution Steps

1. **Parse Arguments**

Parse `$ARGUMENTS` to get list of custom project paths to inspect (if any)

2. **Fetch Official Spec-Kit**

Fetch latest files from https://github.com/github/spec-kit:
- `scripts/bash/*.sh` - Latest bash scripts
- `templates/commands/*.md` - Latest command files
- `templates/*.md` - Latest template files
- `memory/constitution.md` - Framework constitution

3. **Read Current Workbench**

Read current ai-software-dev-workbench implementation:
- `speckit/scripts/bash/*.sh`
- `speckit/templates/commands/*.md`
- `speckit/templates/agents/*.md`
- `speckit/templates/*.md`
- `speckit/memory/*.md`

4. **Read Custom Projects** (if paths provided)

For each project path in `$ARGUMENTS`:
- Check if path exists and contains `.claude/commands/` or `speckit/`
- Read custom commands, scripts, and patterns
- Extract useful improvements and customizations
- Note any serena references to strip

5. **Analyze Differences**

Compare:
- Official spec-kit vs current workbench
- Custom projects vs current workbench
- Identify new features, bug fixes, improvements

Present summary:
```markdown
## Updates Available

### From Official Spec-Kit
- check-prerequisites.sh: Added --foo flag for bar
- implement.md: Improved error handling
- NEW: checklist.md command

### From ../techsift
- audit-parallel.md: Enhanced fix selection syntax
- NEW: Custom memory templates

### Custom Features to Preserve
- ✓ suggest.md (stakeholder workflow)
- ✓ Parallel execution (ranges/lists)
- ✓ Router pattern (implement/audit)
- ✓ Non-git fallback support
```

6. **Confirm Update**

Ask user: "Apply these updates? (y/n)"

If no, exit.

7. **Apply Updates**

Update files in ai-software-dev-workbench:
- Overwrite bash scripts with latest patterns
- Merge command improvements
- Add new commands
- Preserve custom features:
  - suggest.md
  - implement-parallel.md / implement-single.md
  - audit-parallel.md / audit-single.md
  - Agent files (implement-task.md, audit-task.md)
  - Memory templates

Strip any serena references found in custom projects.

Update paths in all files:
- `speckit/specs/` → `specs/`
- `speckit/memory/` → `memory/`

8. **Validation**

Check updated files:
- Verify no serena references remain
- Verify paths are correct
- Verify custom features preserved

9. **Summary**

Report:
```markdown
## Update Complete

### Files Updated
- speckit/scripts/bash/common.sh
- speckit/templates/commands/implement.md
... (list all updated files)

### New Files Added
- speckit/templates/commands/checklist.md
... (list all new files)

### Custom Features Preserved
- ✓ suggest.md
- ✓ Parallel execution
- ✓ Router pattern
- ✓ Non-git fallback

### Next Steps
- Review changes: git diff
- Test a command: /specify or /implement
- If all good, consider committing updates
```

## Behaviour Rules

- **Read-Only First**: Analyze all sources before making changes
- **User Approval**: Always confirm before applying updates
- **Preserve Custom**: Never overwrite unique custom features
- **Strip Serena**: Remove all serena references from custom sources
- **Path Correction**: Ensure all paths use specs/ and memory/ at parent root
- **Validation**: Verify updates before reporting completion

## Error Handling

- Invalid path → Report which path doesn't exist
- No changes needed → Report "Workbench is up to date"
- Fetch failure → Report GitHub connectivity issue
- Path conflicts → Ask user which version to keep

## Success Criteria

- Latest official spec-kit features integrated
- Custom improvements from provided projects merged
- Custom workbench features preserved
- No serena references remain
- All paths corrected to parent root pattern
- User informed of all changes made
