Complete the implementation of a task in the curren spec. Pass the argument of the Task ID to this command.

**IMPORTANT**: Before you begin run the regex `/^T\d\d\d([a-z])*$/` against $ARGUMENTS. If it matches then continue,
if it does not then **stop the current audit process immediately** tell the user that they need to enter a
task number for the current feature which they would like to audit and then **DO NOT CONTINUE WITH THE AUDIT**.

The current feature can be determined by examining the current branch name.

Using the current branch name you will be able to find the tasks.md that you need to look at. It will be in the path
`specs/[BRANCH_NAME]/tasks.md`.

Once you have the tasks.md you should be able to identify the task that the user wants to implement.

Please perform the implementation.
