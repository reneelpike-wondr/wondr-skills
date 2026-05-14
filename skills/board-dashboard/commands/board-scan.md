Scan recent Claude Code sessions and suggest board entries based on what you've been working on.

Instructions:

1. Find the Claude Code projects directory. Check these paths in order:
   - `~/.claude/projects/` - look for subdirectories containing .jsonl files
   - Use the first directory that has session files

2. List the 20 most recently modified .jsonl files (these are chat sessions)

3. For each session file, read the first 10 lines and extract:
   - The first user message (type: "user" in the JSON)
   - Strip any XML tags from the content
   - Take the first 100 characters as the session summary

4. Group the sessions by likely topic/theme:
   - Look for common keywords across sessions
   - Group by project name if sessions mention similar files or topics

5. Compare against existing board projects in `~/board/_active/`:
   - Flag sessions that match existing projects (these might have tasks to add)
   - Flag sessions that don't match any project (these might be new projects)

6. Present findings:
   **Sessions matching existing projects:**
   - [project-name]: 3 recent sessions about [topic]

   **Potential new projects (no board entry yet):**
   - [suggested-name]: 2 sessions about [topic]
     First session: "[first user message preview]"

   **Uncategorized sessions:**
   - [session preview] (X days ago)

7. Ask the user which entries to create:
   - For matching projects: offer to add tasks based on session content
   - For new projects: offer to create a project file with initial tasks
   - Skip uncategorized unless the user wants them

8. Create the selected board entries

Arguments: $ARGUMENTS
