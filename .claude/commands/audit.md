Audit a task after it has been implemented. Pass the argument of the Task ID to this command.

**IMPORTANT**: Before you begin run the regex `/^T\d\d\d$/` against $ARGUMENTS. If it matches then continue,
if it does not then **stop the current audit process immediately** tell the user that they need to enter a 
task number for the current feature which they would like to audit and then **DO NOT CONTINUE WITH THE AUDIT**.

The current feature can be determined by examining the current branch name.

Using the current branch name you will be able to find the tasks.md that you need to look at. It will be in the path
`specs/[BRANCH_NAME]/tasks.md`.

Now execute the audit protocol for this task.

## Task Completion Audit Protocol

### Audit Process:
1. **Review task description**: Re-read the original task requirements from tasks.md
2. **Compare implementation**: Check what you've implemented against the task description
3. **Verify code quality**: Run lint, format, and typecheck scripts for any changed projects and fix all errors
4. **Run tests**: Execute relevant tests and ensure no unexpected failures (expected TDD failures are acceptable)
5. **Identify gaps**: Look for missing functionality or poor implementations as described by the original task
6. **Present findings**: Share any changes needed with rationale for each change
7. **Await verification**: Give the user the opportunity to suggest changes which you will dicuss together and possibly 
implement. If new implementation changes are made off the back of this discussion then this is the end of this audit 
process and the user will request another audit using the audit command at a later time. If there is no discussion or 
the user is happy to proceed they will say "I verify the task is complete" when ready in this case continue to the next
step
8. **Mark complete**: Mark the tasks in the operating tasks.md as complete. Only mark task complete in tasks.md after user verification.

### What to look for:
- **Missing pieces**: Functionality described in task but not implemented
- **Poor implementation**: Code that doesn't meet the task requirements
- **NOT looking for**: Over-engineering, premature optimisation, or additional features

### What NOT to do:
- **Do NOT ask** if user wants task marked complete
- **Do NOT mark** task complete without user saying "I verify the task is complete"
- **Do NOT add** features not requested in the original task

