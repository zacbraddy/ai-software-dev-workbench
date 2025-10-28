---
description: Synthesize and coalesce project knowledge from CLAUDE.md into long-term locations
scripts: speckit/scripts/bash/coalesce-analysis.sh --json
---

The user input to you can be provided directly by the agent or as a command argument.

User input:

$ARGUMENTS

# Coalesce Knowledge Command

This command synthesizes knowledge from CLAUDE.md and coalesces it into appropriate long-term storage locations: memory files, skills, or project documentation.

## Step 1: Load Context and Validate Configuration

1. **Parse the bash script output** (already executed via frontmatter):
   - Extract JSON into variables
   - `spec`: Current spec information (dir, name, completion_percent, total_tasks, completed_tasks)
   - `claude_md`: CLAUDE.md file information (path, size_bytes, line_count, exists)
   - `memory`: Memory directory information (dir, files[], exists)
   - `skills`: Skills directory information (dir, files[], exists)
   - `documentation`: Documentation configuration (configured, type, instructions)
   - `project_root`: Absolute path to project root

2. **Validate Documentation Configuration**:
   ```
   IF documentation.configured == false:
       Display error message:

       ⚠️  Documentation structure not configured!

       Before running /coalesce-knowledge, you must configure your project's
       documentation approach in CLAUDE.md.

       Steps:
       1. Open CLAUDE.md
       2. Find the "## Documentation Structure" section (near the end)
       3. Uncomment ONE of the provided options or create your own
       4. Save the file
       5. Restart Claude Code (IMPORTANT: new CLAUDE.md must be loaded)
       6. Run /coalesce-knowledge again

       Available options:
       - OPTION 1: No documentation (memory/skills only)
       - OPTION 2: Simple /docs/ folder structure
       - OPTION 3: Docusaurus website
       - OPTION 4: Custom documentation requirements file

       EXIT COMMAND - Do not proceed further
   ```

3. **Read Required Files**:
   - Read `claude_md.path` (CLAUDE.md)
   - Read `spec.dir/spec.md` if exists
   - Read `spec.dir/plan.md` if exists
   - Read `spec.dir/tasks.md` if exists
   - Read existing memory files from `memory.files[]`
   - Read existing skill files from `skills.files[]`

## Step 2: Spec Completion Detection

1. **Determine Mode Based on Completion**:
   ```
   completion = spec.completion_percent

   IF completion >= 90:
       mode = "END_OF_SPEC"
       mode_description = "Knowledge is stable and ready for permanence"
   ELSE IF completion > 0:
       mode = "MID_SPEC"
       mode_description = "Knowledge marked as provisional (may change during development)"
   ELSE:
       mode = "NO_ACTIVE_SPEC"
       mode_description = "General knowledge organization"
   ```

2. **Announce Assumption and Confirm with User**:
   ```markdown
   📊 **Spec Status**: {spec.name} ({completion}% complete - {spec.completed_tasks}/{spec.total_tasks} tasks)
   📄 **CLAUDE.md**: {claude_md.line_count} lines ({size_in_KB}KB){warning_if_large}
   🔧 **Mode**: {mode} - {mode_description}
   📋 **Documentation**: {documentation.type}

   Is this correct? Reply "yes" to continue or correct me if needed.
   ```

3. **Wait for User Confirmation**:
   - If user corrects spec completion status, adjust mode accordingly
   - If user confirms, proceed to analysis

## Step 3: Knowledge Analysis

Analyze CLAUDE.md and categorize each major section into one of these categories:

### Category Definitions

**A. Keep in CLAUDE.md**
- Critical quality gates that must ALWAYS be loaded
- Quick reference material needed in ALL contexts (e.g., design system colors)
- Pattern consistency rules that prevent architectural drift
- Command references
- Recently changed patterns (< 1 month old)

**B. Move to memory/**
Determine target file based on content nature:
- **memory/constitution.md**: Core principles, non-negotiable rules, business compliance
- **memory/development-protocols.md**: Technical patterns, tool choices, stack decisions
- **memory/task-execution-patterns.md**: Workflow processes, quality gates, debugging protocols
- **memory/program_overview.md**: Business context, customer information, product vision (rarely)

**C. Move to .claude/skills/{project-name}/**
- MCP integration workflows specific to this project
- Project-specific implementation patterns
- Quality gates tied to this codebase's architecture
- Decision-making frameworks specific to this domain

**D. Extract to Documentation**
Based on `documentation.type`:
- **no_docs**: Skip this category (everything goes to memory/skills)
- **simple_docs**: Create markdown files in /docs/ subdirectories
- **docusaurus**: Create MDX files with frontmatter in website/docs/ or docs/
- **custom**: Follow project's documentation guide

Candidates for extraction:
- Detailed examples and code samples (>50 lines)
- Framework usage guides
- Migration guides (after migration complete)
- Architectural decision records (ADRs)
- API specifications

**E. Remove from CLAUDE.md**
- Deprecated patterns explicitly marked as obsolete
- Completed migrations (e.g., "BaseHandler removed in T064.11")
- Superseded technology choices
- Temporary guidance no longer relevant
- Duplicate information (already in memory/skills/docs)

### Analysis Process

1. **Parse CLAUDE.md Section by Section**:
   - Identify major sections (## headers)
   - For each section, determine:
     - Content purpose (what does it teach/enforce?)
     - Usage frequency (always needed vs sometimes needed)
     - Stability (stable pattern vs evolving)
     - Size (line count)
     - Dependencies (references other sections?)

2. **Apply Categorization Logic**:
   ```
   FOR each section IN claude_md:
       IF section.contains("CRITICAL") OR section.size < 30:
           category = "A. Keep"
       ELSE IF section.contains("Established:") AND section.age > 30_days:
           IF section.size > 50:
               category = "D. Extract" + "B. Move to memory"
           ELSE:
               category = "B. Move to memory"
       ELSE IF section.is_deprecated OR section.references_removed_tech:
           category = "E. Remove"
       ELSE IF section.is_workflow OR section.is_mcp_integration:
           category = "C. Move to skills"
       ELSE IF section.size > 100 AND section.has_detailed_examples:
           category = "D. Extract" (with summary remaining in CLAUDE.md)
       ELSE:
           category = "B. Move to memory"
   ```

3. **Check for Contradictions and Duplications**:
   - When assigning to memory/skills, check if similar content exists
   - Flag contradictions for user review
   - Suggest consolidation where appropriate

## Step 4: Generate Interactive Report

Create a comprehensive numbered report:

```markdown
# Knowledge Coalescing Report

📊 **Spec**: {spec.name} ({completion}% complete - {mode} MODE)
📄 **CLAUDE.md**: {line_count} lines ({size}KB){warning_indicator}
📋 **Documentation**: {documentation.type}

---

## Proposed Actions

### A. Keep in CLAUDE.md ({count} items)

{For each item:}
{number}. **{Section Title}** (lines {start}-{end}, {line_count} lines)
    📍 Location: {section_identifier}
    📝 Reason: {why_keeping}

    Preview: "{first_20_chars}...{last_20_chars}"

### B. Coalesce to memory/ ({count} items)

{For each item:}
{number}. **{Section Title}** (lines {start}-{end}, {line_count} lines)
    📍 Target: memory/{target_file}.md
    📝 Section: "{target_section_name}"
    🔧 Mode: {mode} {if mid_spec: "(will add provisional marker)"}
    ⚠️  {if_contradiction: "May contradict existing content - review needed"}

    Preview: "{first_20_chars}...{last_20_chars}"

### C. Coalesce to .claude/skills/{project-name}/ ({count} items)

{For each item:}
{number}. **{Section Title}** (lines {start}-{end}, {line_count} lines)
    📍 Target: .claude/skills/{project}/SKILL.md
    📝 Section: "{target_section_name}"
    🔧 Mode: {mode} {if mid_spec: "(will add provisional marker)"}

    Preview: "{first_20_chars}...{last_20_chars}"

### D. Extract to Documentation ({count} items)

{For each item:}
{number}. **{Section Title}** (lines {start}-{end}, {line_count} lines)
    📍 Target: {doc_path}/{filename}.md
    📝 Action: Create detailed doc, keep summary in CLAUDE.md
    {if docusaurus: "📋 Format: MDX with frontmatter"}

    Preview: "{first_20_chars}...{last_20_chars}"

### E. Remove from CLAUDE.md ({count} items)

{For each item:}
{number}. **{Section Title}** (lines {start}-{end}, {line_count} lines)
    📝 Reason: {why_removing}

    Preview: "{first_20_chars}...{last_20_chars}"

---

## Summary Statistics

- **Keep**: {count_A} items ({line_count_A} lines)
- **Move to memory**: {count_B} items ({line_count_B} lines)
- **Move to skills**: {count_C} items ({line_count_C} lines)
- **Extract to docs**: {count_D} items ({line_count_D} lines)
- **Remove**: {count_E} items ({line_count_E} lines)

**Projected CLAUDE.md size**: ~{projected_lines} lines (down from {current_lines})

---

## Input Options

You can use these commands to control what gets implemented:

**Execute all or by category:**
- `Implement: all` - Execute all proposed actions
- `Implement: A, B, D` - Execute specific categories (A, B, C, D, E)

**Execute specific items:**
- `Implement: 1, 3, 5-7, 16` - Execute numbered items (supports ranges)
- `Implement: all except 13, 20-22` - Execute all but excluded items

**Remove items from plan:**
- `Skip: 6, 14` - Remove these items from plan (won't be deferred, just ignored)

**Discuss freely:**
- Ask questions, suggest changes, or discuss specific items
- I will acknowledge your points and adjust the plan
- I will NOT regenerate the full report after each message (only if you request it)

---

💬 **Let's discuss any changes, or tell me what to implement...**
```

## Step 5: Conversation Loop

1. **Wait for User Input**
2. **Parse Input Type**:
   ```
   IF input matches "Implement:":
       Parse selection (all, categories, ranges, exclusions)
       Proceed to Step 6 (Execution)
   ELSE IF input matches "Skip:":
       Parse item numbers
       Remove from internal plan
       Acknowledge: "Removed items {list} from plan. Anything else?"
       RETURN to Step 5 (wait for more input)
   ELSE IF input contains discussion/questions:
       Respond to user's points
       Update internal plan based on discussion
       Ask: "Would you like me to regenerate the report with these changes, or shall we continue discussing?"
       RETURN to Step 5 (wait for more input)
   ```

3. **Do NOT Regenerate Report Unnecessarily**:
   - Only regenerate if user explicitly requests: "Show me the updated report"
   - Otherwise, keep track of changes internally and continue conversation
   - This prevents pestering the user with walls of text after each message

## Step 6: Execution Phase

For each approved item, execute the appropriate action:

### A. Keep in CLAUDE.md
```
No action needed - content remains in place
```

### B. Move to memory/{target_file}.md
```markdown
1. Read target memory file (e.g., memory/development-protocols.md)

2. Determine appropriate section to add content

3. Check for contradictions/duplications:
   - Search target file for similar concepts
   - If found, flag for consolidation
   - Ask user how to resolve if contradiction detected

4. Format content for memory file:
   IF mode == "MID_SPEC":
       Add provisional marker:
       ```
       <!-- META: provisional=true spec={spec.name} added={YYYY-MM-DD} -->
       ### {Section Title}

       {Content}

       <!-- /META -->
       ```
   ELSE IF mode == "END_OF_SPEC":
       Add established marker:
       ```
       ### {Section Title}

       {Content}

       **Established**: {YYYY-MM-DD} (spec: {spec.name})
       ```

5. Insert content into target section of memory file

6. Write updated memory file

7. Update CLAUDE.md:
   - Remove original content
   - Add reference: "See memory/{file}.md - {section} for {topic}"

8. Track change for final summary
```

### C. Move to .claude/skills/{project-name}/SKILL.md
```markdown
1. Read target skill file

2. Determine appropriate section (or create new section)

3. Format content for skill file:
   IF mode == "MID_SPEC":
       Update YAML frontmatter at top:
       ```yaml
       ---
       name: {project-name}
       description: ...
       provisional:
         - section: "{Section Name}"
           spec: "{spec.name}"
           added: "{YYYY-MM-DD}"
       ---
       ```

4. Add content to skill file under appropriate section

5. Write updated skill file

6. Update CLAUDE.md:
   - Remove original content
   - Add reference: "See .claude/skills/{project}/SKILL.md for {topic} implementation patterns"

7. Track change for final summary
```

### D. Extract to Documentation
```markdown
1. Parse documentation configuration to determine format

2. Create target documentation file:

   IF documentation.type == "simple_docs":
       - Create markdown file at target path (e.g., /docs/frameworks/pattern.md)
       - Format: Standard markdown

   ELSE IF documentation.type == "docusaurus":
       - Create MDX file at target path
       - Add frontmatter:
         ```yaml
         ---
         sidebar_position: {auto_increment}
         title: {Section Title}
         ---
         ```
       - Format content for public documentation (broader audience)

   ELSE IF documentation.type == "custom":
       - Follow project's documentation.instructions
       - Create file according to custom rules

3. Write content to documentation file

4. Update CLAUDE.md:
   - Reduce detailed content to 2-3 paragraph summary
   - Add link: "See {doc_path} for complete implementation guide"
   - Keep critical reference material (e.g., quick lookup tables)

5. Track change for final summary (include new file path)
```

### E. Remove from CLAUDE.md
```markdown
1. Identify exact line range to remove

2. Remove content from CLAUDE.md

3. Clean up any orphaned headers or formatting

4. Track change for final summary (what was removed and why)
```

### Skip (Items Not Selected)
```markdown
1. Add deferred marker to CLAUDE.md around non-selected content:
   ```
   <!-- COALESCE_DEFER: item={number} reason="{user_provided_reason}" date={YYYY-MM-DD} -->
   {Original content remains unchanged}
   <!-- /COALESCE_DEFER -->
   ```

2. Track for final summary

3. Note: Future runs of /coalesce-knowledge can detect these markers and re-propose
```

## Step 7: Post-Execution Validation

After all actions executed:

1. **Verify CLAUDE.md is valid markdown**:
   - Check for orphaned headers
   - Check for broken links
   - Fix any formatting issues

2. **Update "Recent Changes" section** (if exists in CLAUDE.md):
   - Add entry: "**{spec.name}** ({YYYY-MM-DD}): Knowledge coalesced - {summary of main changes}"
   - Keep last 3 entries, remove older ones

3. **Generate final summary** (next step)

## Step 8: Final Summary

```markdown
# ✅ Coalescing Complete

## Changes Made

### CLAUDE.md
- **Before**: {original_line_count} lines ({original_size}KB)
- **After**: {new_line_count} lines ({new_size}KB)
- **Reduction**: {reduction_count} lines ({reduction_percent}%)

**Updates**:
- Added {count} documentation links
- Added {count} memory file references
- Added {count} skill file references
- Marked {count} items as deferred for future review

### memory/{file}.md
{For each modified memory file:}
- **{filename}**: Added {count} new sections ({line_count} lines)
  {if mid_spec: "- {count} marked as provisional (MID-SPEC mode)"}
  - Sections: {list_of_section_names}

### .claude/skills/{project}/SKILL.md
{If modified:}
- Updated {count} sections ({line_count} lines added)
  {if mid_spec: "- Marked as provisional in frontmatter"}
  - Sections: {list_of_section_names}

### Documentation Created
{For each new doc file:}
- **{filepath}** (NEW - {line_count} lines)
  - Extracted from CLAUDE.md lines {start}-{end}
  - {if docusaurus: "Format: MDX with frontmatter"}

### Content Removed
- **{count} deprecated sections** ({line_count} lines total)
  - {list_of_removed_topics}

### Deferred Items
- **{count} items** not implemented (marked with COALESCE_DEFER)
  - Items: {list_of_item_numbers}
  - Reasons: {summary_of_reasons}

---

## ⚠️  CRITICAL: Next Steps

**YOU MUST RESTART CLAUDE CODE FOR CHANGES TO TAKE EFFECT!**

Memory files and skills are loaded at startup. Your current session is still using the old versions.

**Steps to complete**:

1. **Review all changes** (check git diff):
   ```bash
   git diff CLAUDE.md
   git diff memory/
   git diff .claude/skills/
   {if docs: "git diff docs/"}
   ```

2. **Run quality checks** (if applicable):
   ```bash
   npm run lint
   npm run typecheck
   ```

3. **Commit changes** (if satisfied):
   ```bash
   git add CLAUDE.md memory/ .claude/skills/ {docs}
   git commit -m "chore: coalesce knowledge from CLAUDE.md

   - Reduced CLAUDE.md from {old_lines} to {new_lines} lines
   - {main_changes_summary}

   Generated via /coalesce-knowledge command"
   ```

4. **🔄 RESTART CLAUDE CODE** (exit and reopen CLI)

5. **Verify changes loaded**:
   - Start Claude Code
   - Run a test command (e.g., /specify --help)
   - Check that new memory/skills are in context

---

## Future Coalescing Runs

**Run /coalesce-knowledge again**:

{if mid_spec:}
- ✅ **At end of spec {spec.name}** (currently {completion}% complete)
  - Command will re-evaluate provisional markers
  - Validates decisions made during mid-spec run
  - Removes provisional markers for stable patterns

- 📏 When CLAUDE.md approaches ~800 lines again
- 🏗️  After major architectural decisions accumulate
- 📚 When new sections need organization

{if end_of_spec:}
- 📏 When CLAUDE.md exceeds ~800 lines
- 🏗️  At end of next major spec implementation
- 📚 After significant pattern changes

---

Would you like me to explain any of the changes in detail?
```

## Important Behaviour Rules

1. **Do NOT regenerate the full report after every user message** during conversation loop
   - Only regenerate if explicitly requested
   - Keep discussion conversational and acknowledge points

2. **Always validate documentation configuration** before proceeding
   - Never attempt extraction without knowing where to extract

3. **Ask for clarification when contradictions detected**
   - Don't silently override existing memory/skill content
   - Present conflict to user and ask how to resolve

4. **Use structured metadata for provisional markers**
   - LLM-parseable format for easy detection in future runs
   - Include spec, date, and optionally task/phase

5. **Track ALL changes for final summary**
   - Users need comprehensive report of what changed where

6. **Always remind user to restart Claude Code**
   - Memory and skills don't reload during session
   - Critical step that users often forget

7. **Preserve critical reference material in CLAUDE.md**
   - Don't extract everything - some things need to stay for quick access
   - Balance between size reduction and usability

8. **When in doubt about categorization, ask the user**
   - Better to confirm than make wrong decision
   - Use progressive disclosure - ask about one section at a time if needed

## Success Criteria

✅ Documentation configuration validated before proceeding
✅ Spec completion correctly detected and mode set
✅ User confirmed mode before analysis
✅ All CLAUDE.md sections categorized appropriately
✅ Interactive report presented with numbered items
✅ Conversation loop allows discussion without report spam
✅ Flexible selection syntax parsed correctly
✅ All approved actions executed automatically
✅ Provisional markers added for mid-spec knowledge
✅ Deferred items marked for future re-evaluation
✅ Memory files updated without contradictions
✅ Skills files updated with proper markers
✅ Documentation files created per project configuration
✅ CLAUDE.md reduced in size while preserving critical content
✅ Final summary shows all changes comprehensively
✅ User reminded to restart Claude Code
