Add a task or project to the board.

Instructions:

1. Parse the arguments below for: a task description and an optional project name
   - Format: "task description" or "task description > project-name"
   - If no project specified, it goes to _quick.md

2. If a project name is given:
   - Check if a matching file exists in `~/board/_active/`
   - If yes, add the task under "## Open" as `- [ ] task description`
   - If no matching file exists, create a new project file in `_active/` with the standard template (frontmatter with status/created/updated, sections for Open/In Progress/Done/Context)
   - Add the task under "## Open"

3. If no project name is given:
   - Add the task to `~/board/_quick.md` under "## Open" as `- [ ] task description`

4. Update the `updated` date in frontmatter to today

5. Confirm what was added and where (one line)

Arguments: $ARGUMENTS
