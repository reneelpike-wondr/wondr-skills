Clean up the task board. Flag stale items and archive completed projects.

Instructions:

1. Read all files in `~/board/_active/` and `~/board/_quick.md`

2. Flag these issues:
   - Items marked `[~]` (in-progress) with a project `updated` date 3+ days old
   - Projects where `updated` date is 7+ days old
   - Done items older than 14 days (candidates for cleanup)
   - Projects with zero open and zero in-progress items (ready to archive)

3. Present findings as a compact list:
   - **Stale in-progress**: list items and which project
   - **Stale projects**: list projects not updated in 7+ days
   - **Ready to archive**: projects with nothing open
   - **Old done items**: count per project

4. Ask the user which actions to take:
   - Archive completed projects (move file to `_done/`)
   - Remove old done items
   - Reset stale in-progress items back to open

5. If `~/board/_log.md` has entries older than 30 days, trim them

6. Execute whatever the user approves

Arguments: $ARGUMENTS
