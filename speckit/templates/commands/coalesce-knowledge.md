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

**CRITICAL**: The bash script `coalesce-analysis.sh` has ALREADY been executed via the frontmatter `scripts:` directive. The JSON output is available in the command context. DO NOT run your own manual bash commands to gather this data - you will get incorrect results and waste tokens.

1. **Parse the bash script output** (already executed via frontmatter):
   - The script output is provided as JSON in the command context
   - Extract JSON into variables:
     - `spec`: Current spec information (dir, name, completion_percent, total_tasks, completed_tasks)
     - `claude_md`: CLAUDE.md file information (path, size_bytes, line_count, exists)
     - `memory`: Memory directory information (dir, files[], exists)
     - `skills`: Skills directory information (dir, files[], exists)
     - `documentation`: Documentation configuration (configured, type, instructions)
     - `project_root`: Absolute path to project root
   - **Trust this data** - it comes from the correct script execution

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

## Step 2: Spec Completion Detection & Mode Configuration

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

2. **If END_OF_SPEC Mode, Scan for Additional Work**:

   **Phase A: Identify provisional content requiring validation**
   - Search all memory files for `<!-- META: provisional=true spec={spec.name}` markers
   - Search skill files for provisional frontmatter entries matching current spec
   - Count and categorise provisional items found:
     - Items from current spec (need validation/finalisation)
     - Items from other specs (leave untouched)

   **Phase B: Identify spec files with extractable long-term knowledge**
   - Check for existence of spec files: spec.md, plan.md, research.md, data-model.md
   - Scan contracts/ directory if exists
   - Read each file and identify sections with long-term value:
     - **spec.md**: Decision rationales, constraints, business rules, non-functional requirements
     - **plan.md**: Architectural patterns established, integration strategies, reusable approaches
     - **research.md**: Technology evaluations, technical discoveries, competitor analysis
     - **data-model.md**: Schema patterns, data modelling decisions
     - **contracts/**: API contracts, interface definitions
   - Count extractable sections per file

   **Phase C: Check if spec already processed**
   - Look for `.coalesced-*` file in spec directory
   - If found, note the previous processing date
   - User can override to reprocess if needed

3. **Announce Assumption and Confirm with User**:

   **If MID_SPEC or NO_ACTIVE_SPEC**:
   ```markdown
   📊 **Spec Status**: {spec.name} ({completion}% complete - {spec.completed_tasks}/{spec.total_tasks} tasks)
   📄 **CLAUDE.md**: {claude_md.line_count} lines ({size_in_KB}KB){warning_if_large}
   🔧 **Mode**: {mode} - {mode_description}
   📋 **Documentation**: {documentation.type}

   Is this correct? Reply "yes" to continue or correct me if needed.
   ```

   **If END_OF_SPEC**:
   ```markdown
   📊 **Spec Status**: {spec.name} ({completion}% complete - END_OF_SPEC MODE)
   📄 **CLAUDE.md**: {claude_md.line_count} lines ({size_in_KB}KB){warning_if_large}
   📋 **Documentation**: {documentation.type}

   🔍 **Provisional Content Found**:
   - {count} items in memory/ files requiring validation (from spec: {spec.name})
   - {count} items in .claude/skills/ requiring validation (from spec: {spec.name})
   {if count > 0: "These will be validated against final implementation"}

   📚 **Spec Files Analysis**:
   - spec.md: {count} sections with long-term value identified
   - plan.md: {count} architectural patterns to preserve
   - research.md: {count} decisions to document
   - data-model.md: {exists ? count + " schema patterns" : "not found"}
   - contracts/: {count} files found
   {if any_count > 0: "Knowledge from these files will be extracted to permanent locations"}

   {if previously_coalesced:}
   ⚠️  This spec was previously coalesced on {previous_date}. Reprocessing will update based on current state.

   This will be a comprehensive consolidation including:
   1. CLAUDE.md cleanup (as usual)
   2. Provisional content validation & finalisation ({count} items)
   3. Spec knowledge extraction to permanent locations ({count} sections)

   Continue? Reply "yes" or correct any details.
   ```

4. **Wait for User Confirmation**:
   - If user corrects spec completion status, adjust mode accordingly
   - If user confirms, proceed to appropriate analysis based on mode

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

## Step 6.5: Validate and Finalise Provisional Content (END_OF_SPEC Mode Only)

**ONLY execute this step if mode == "END_OF_SPEC"**

This step processes all provisional content markers that were added during MID_SPEC runs and finalises them based on the completed implementation.

### Memory File Provisional Items

For each provisional item found in memory files (from Step 2, Phase A):

1. **Read the provisional section**:
   - Extract content between `<!-- META: provisional=true spec={spec.name} -->` and `<!-- /META -->`
   - Identify the memory file, section name, and content

2. **Present item to user for validation**:
   ```markdown
   ### Provisional Item {number} of {total}

   📍 **Location**: memory/{filename}.md
   📝 **Section**: {section_name}
   📅 **Added**: {date_from_metadata}
   📊 **From Spec**: {spec.name}

   **Content Preview**:
   ```
   {first_100_chars_of_content}...
   ```

   **Validation Options**:
   1. **Establish** - Pattern used and proven, convert to established (remove provisional marker)
   2. **Remove** - Pattern not used or superseded, delete from memory
   3. **Keep Provisional** - Pattern still evolving, leave as-is
   4. **Edit** - Content needs adjustment before establishing
   5. **Skip** - Deal with this later

   Your choice (1-5)?
   ```

3. **Wait for user response and execute**:
   - **Option 1 (Establish)**:
     - Remove `<!-- META: provisional=true ... -->` and `<!-- /META -->` markers
     - Add established marker: `**Established**: {YYYY-MM-DD} (spec: {spec.name})`
     - Track change for summary

   - **Option 2 (Remove)**:
     - Delete entire section including markers
     - Clean up any orphaned headers
     - Track change for summary

   - **Option 3 (Keep Provisional)**:
     - Leave unchanged
     - Track as "still provisional" for summary

   - **Option 4 (Edit)**:
     - Present current content in editable format
     - Accept user's edited version
     - Remove provisional marker, add established marker with edited content
     - Track change for summary

   - **Option 5 (Skip)**:
     - Leave unchanged
     - Track as "skipped" for summary

4. **Repeat for all provisional items in memory files**

### Skill File Provisional Items

For each provisional item found in skill file frontmatter:

1. **Read the skill file and parse provisional entries**:
   ```yaml
   ---
   name: techsift
   description: ...
   provisional:
     - section: "Lambda Handler Patterns"
       spec: "002-user-and-tenant"
       added: "2025-10-20"
   ---
   ```

2. **Present item to user for validation** (same options as memory files):
   ```markdown
   ### Provisional Skill Item {number} of {total}

   📍 **Location**: .claude/skills/{project-name}/SKILL.md
   📝 **Section**: {section_name}
   📅 **Added**: {added_date}
   📊 **From Spec**: {spec.name}

   **Content Preview**:
   {Find section in skill file body and show preview}

   [Same validation options 1-5 as above]
   ```

3. **Execute user's choice**:
   - **Option 1 (Establish)**: Remove entry from provisional frontmatter array
   - **Option 2 (Remove)**: Remove entry from provisional frontmatter AND delete section from skill file body
   - **Option 3 (Keep Provisional)**: Leave unchanged
   - **Option 4 (Edit)**: Present section content, accept edits, remove from provisional frontmatter
   - **Option 5 (Skip)**: Leave unchanged

4. **Clean up frontmatter**:
   - If provisional array becomes empty, remove the entire `provisional:` key
   - Write updated skill file

## Step 6.6: Extract Knowledge from Spec Files (END_OF_SPEC Mode Only)

**ONLY execute this step if mode == "END_OF_SPEC"**

This step extracts long-term valuable knowledge from spec directory files and moves it to permanent locations.

### General Extraction Principles

- **COPY, don't move**: Spec files remain as historical record
- **Add source metadata**: All extracted content should reference source spec and file
- **Batch by target file**: Group extractions by destination to minimise file operations
- **Skip if already coalesced**: Check for `.coalesced-*` marker (unless user overrides)

### spec.md Extraction

1. **Identify extractable sections**:
   Look for sections like:
   - "Constraints" / "Non-Functional Requirements"
   - "Business Rules"
   - "Decision:", "Rationale:", "Why:" headings
   - "Compliance" / "Security Requirements"
   - "Out of Scope" (useful for future reference)

2. **Categorise each section**:
   - **Constitution material**: Compliance rules, business constraints, non-negotiable requirements
   - **Development protocols**: Technical constraints, stack decisions, architecture requirements
   - **Documentation**: Detailed API specs, complex business rules (>50 lines)

3. **Present extraction plan to user**:
   ```markdown
   ## spec.md Knowledge Extraction

   Found {count} sections worth preserving:

   1. **Constraints** (lines {start}-{end}) → memory/constitution.md § Business Constraints
   2. **Tech Stack Decision** (lines {start}-{end}) → memory/development-protocols.md § Stack Choices
   3. **API Design Details** (lines {start}-{end}) → /docs/api/user-management-api.md (new file)

   Approve all, or reply with item numbers to select specific extractions.
   Reply "skip" to skip spec.md entirely.
   ```

4. **Execute approved extractions**:
   For each approved item:
   - Read target file (memory or docs)
   - Find appropriate section (create if doesn't exist)
   - Format content with source attribution:
     ```markdown
     {Content from spec.md}

     **Source**: spec {spec.name} - spec.md (lines {start}-{end})
     **Established**: {YYYY-MM-DD}
     ```
   - Insert into target file
   - Track change for summary

### plan.md Extraction

1. **Identify extractable sections**:
   - "Architecture" / "Technical Approach"
   - "Integration Strategy"
   - "Implementation Patterns"
   - "Phase X: ..." sections with reusable approaches
   - Diagrams (as references to preserve)

2. **Categorise**:
   - **Development protocols**: Architectural patterns, integration approaches
   - **Task execution patterns**: Reusable implementation workflows
   - **Documentation**: Detailed integration guides (>50 lines), architecture diagrams

3. **Present and execute** (same flow as spec.md)

### research.md Extraction

1. **Identify extractable sections**:
   - "Technology Evaluation: [Tech]"
   - "Decision: [Choice] over [Alternative]"
   - "Competitor Analysis"
   - "Technical Discoveries" / "Findings"
   - "Trade-offs" / "Pros and Cons"

2. **Categorise**:
   - **Development protocols**: Technology choices, technical decisions
   - **Program overview**: Competitor analysis, market research (business-relevant)
   - **Documentation**: Detailed evaluations, technical deep-dives

3. **Present and execute** (same flow)

### data-model.md Extraction

1. **Identify extractable sections**:
   - "Schema Design Decisions"
   - "Data Modelling Patterns"
   - "Relationship Patterns"
   - Complete entity definitions (if reusable pattern)

2. **Categorise**:
   - **Development protocols**: Data modelling patterns, schema decisions
   - **Documentation**: Complete schema reference, entity relationship diagrams

3. **Present and execute** (same flow)

### contracts/ Directory Extraction

1. **List all contract files**:
   - API contracts (REST, GraphQL, gRPC, etc.)
   - Interface definitions
   - Type definitions (if not already in code)

2. **Determine extraction targets**:
   - **Documentation**: All contracts → `/docs/api/` or `/docs/contracts/`
   - Create one doc file per contract file
   - Preserve directory structure: `contracts/user-api.yaml` → `/docs/api/user-api.md`

3. **Present batch extraction plan**:
   ```markdown
   ## contracts/ Directory Extraction

   Found {count} contract files:

   1. contracts/user-management-api.yaml → /docs/api/user-management-api.md
   2. contracts/tenant-api.yaml → /docs/api/tenant-api.md

   Extract all to /docs/api/? (yes/no/select)
   ```

4. **Execute**: Create documentation files with contract content and metadata

### Mark Spec as Coalesced

After all extractions complete:

1. **Create completion marker file**:
   ```
   File: {spec.dir}/.coalesced-{YYYY-MM-DD}

   Content:
   ---
   coalesced_date: {YYYY-MM-DD}
   spec_name: {spec.name}
   spec_completion: {completion_percent}%

   knowledge_extracted_to:
     - memory/constitution.md: {count} sections
     - memory/development-protocols.md: {count} sections
     - memory/task-execution-patterns.md: {count} sections
     - docs/api/: {count} files
     - docs/architecture/: {count} files

   provisional_items_processed:
     established: {count}
     removed: {count}
     kept_provisional: {count}
     skipped: {count}

   notes: |
     {Any user-provided notes about this consolidation}
   ---
   ```

2. **Track all extractions for final summary**

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
  {if end_of_spec: "- {count} extracted from spec files"}
  {if end_of_spec: "- {count} provisional items established"}
  - Sections: {list_of_section_names}

### .claude/skills/{project}/SKILL.md
{If modified:}
- Updated {count} sections ({line_count} lines added)
  {if mid_spec: "- Marked as provisional in frontmatter"}
  {if end_of_spec: "- {count} provisional items established (removed from provisional array)"}
  - Sections: {list_of_section_names}

### Documentation Created
{For each new doc file:}
- **{filepath}** (NEW - {line_count} lines)
  - Extracted from {source: "CLAUDE.md" or "spec files"}
  {if from_claude_md: "- Original location: CLAUDE.md lines {start}-{end}"}
  {if from_spec_files: "- Source: {spec.name}/{filename}"}
  - {if docusaurus: "Format: MDX with frontmatter"}

### Content Removed
- **{count} deprecated sections** ({line_count} lines total)
  - {list_of_removed_topics}

### Deferred Items
- **{count} items** not implemented (marked with COALESCE_DEFER)
  - Items: {list_of_item_numbers}
  - Reasons: {summary_of_reasons}

{if end_of_spec:}

---

### 🎯 END_OF_SPEC Additional Consolidation

#### Provisional Content Validation
- **Established**: {count} items converted to permanent patterns
  - Memory files: {count} sections
  - Skill files: {count} sections
- **Removed**: {count} items (patterns not used or superseded)
- **Kept Provisional**: {count} items (still evolving)
- **Skipped**: {count} items (deferred for future review)

#### Spec Knowledge Extraction
- **spec.md**: {count} sections extracted
  - To memory/constitution.md: {count}
  - To memory/development-protocols.md: {count}
  - To docs/: {count}
- **plan.md**: {count} sections extracted
  - To memory/development-protocols.md: {count}
  - To memory/task-execution-patterns.md: {count}
  - To docs/architecture/: {count}
- **research.md**: {count} sections extracted
  - To memory/development-protocols.md: {count}
  - To memory/program_overview.md: {count}
  - To docs/: {count}
- **data-model.md**: {count} sections extracted
  - To memory/development-protocols.md: {count}
  - To docs/: {count}
- **contracts/**: {count} files extracted
  - To docs/api/: {count}
  - To docs/contracts/: {count}

#### Spec Completion Marker
- Created: {spec.dir}/.coalesced-{YYYY-MM-DD}
- This spec will not be reprocessed in future coalesce runs (unless you override)

{/if}

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

8. **When in doubt about categorisation, ask the user**
   - Better to confirm than make wrong decision
   - Use progressive disclosure - ask about one section at a time if needed

9. **END_OF_SPEC mode requires comprehensive consolidation**
   - MUST process Steps 6.5 (provisional validation) and 6.6 (spec extraction)
   - Do not skip these steps even if CLAUDE.md has no changes
   - Provisional content exists independently of CLAUDE.md state
   - Spec files always contain valuable knowledge worth extracting

10. **Spec files are historical records - never delete or modify them**
    - ALWAYS copy content when extracting, never move
    - Spec directories serve as project history
    - .coalesced-{date} marker prevents reprocessing, not deletion

## Success Criteria

### Universal (All Modes)
✅ Documentation configuration validated before proceeding
✅ Spec completion correctly detected and mode set
✅ User confirmed mode before analysis
✅ All CLAUDE.md sections categorised appropriately
✅ Interactive report presented with numbered items
✅ Conversation loop allows discussion without report spam
✅ Flexible selection syntax parsed correctly
✅ All approved actions executed automatically
✅ Memory files updated without contradictions
✅ Documentation files created per project configuration
✅ CLAUDE.md reduced in size while preserving critical content
✅ Final summary shows all changes comprehensively
✅ User reminded to restart Claude Code

### MID_SPEC Mode Specific
✅ Provisional markers added for all new knowledge
✅ Deferred items marked for future re-evaluation
✅ Skills files updated with proper provisional frontmatter

### END_OF_SPEC Mode Specific
✅ All provisional content from current spec identified and scanned
✅ User given validation options for each provisional item
✅ Provisional markers removed or kept based on user choices
✅ Spec files analysed for long-term knowledge
✅ Extractable sections identified and categorised correctly
✅ User approves extraction plan before execution
✅ Spec knowledge extracted with proper source attribution
✅ Spec files left intact (COPY not move)
✅ .coalesced-{date} marker created in spec directory
✅ Final summary includes provisional validation and spec extraction statistics
