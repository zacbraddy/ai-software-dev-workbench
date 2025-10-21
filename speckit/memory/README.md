# Framework Memory Templates

This directory contains **template files only** - not actual project memory.

## Purpose

These templates are copied to your project's `memory/` directory during installation and serve as starting points for your project-specific context files.

## Files

- `constitution.md` - Template for project principles and rules

## What Should Go Here

**Only generic templates** that work for any project:
- Placeholder content
- Examples and patterns
- Instructions on how to customize
- No project-specific details

## What Should NOT Go Here

**Project-specific content** belongs in your project's memory folder:
- TechSift's LinkedIn compliance rules
- Specific tech stacks (React, SST, etc.)
- Revenue targets
- Customer names
- Business strategies

## Installation Process

When `install.sh` runs:
1. Checks if project already has `memory/constitution.md`
2. If not, copies `speckit/memory/constitution.md` to project
3. User customizes the copied file for their project
4. Framework templates remain generic

## Adding New Templates

To add a new memory template:
1. Create generic template in `speckit/memory/`
2. Add copy logic to `install.sh`
3. Document in this README
4. Update main README.md

---

**Remember**: This is the **framework**, not your project. Keep it generic!
