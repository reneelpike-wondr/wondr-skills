---
name: board-dashboard
description: "Persistent cross-session task board with web dashboard. Tracks projects, tasks, and ideas across all your Claude Code sessions so nothing gets lost. Auto-captures work, auto-categorizes, auto-tags. Includes a visual web dashboard with drag-and-drop kanban, priority sorting, and real-time updates."
---

# Board Dashboard - Cross-Session Task Management

A persistent task board that lives at `~/board/` and tracks everything you're working on across all Claude Code chat sessions. Includes a web dashboard with kanban boards, priority sorting, color-coded tags, and real-time live updates.

## When to Use

- When the user mentions "board", "task board", "dashboard", "track tasks", "what am I working on", "show my tasks", or "what's in progress"
- At the start of ANY session: check `~/board/_active/` to see what's in flight and surface relevant context
- When finishing work: update the board automatically

## Setup

Run the setup script:

```bash
bash ~/.claude/skills/board-dashboard/setup.sh
```

This creates the board structure, installs example data, copies slash commands, and installs the web dashboard.

## Slash Commands

- `/board` - Show the task board summary in chat
- `/board-add <task> > <project>` - Add a task (to a project, or quick tasks if no project)
- `/board-cleanup` - Flag stale tasks, archive completed projects
- `/board-scan` - Scan recent sessions and suggest board entries

## Web Dashboard

Start the dashboard server (requires Bun):

```bash
bun run ~/board/dashboard/server.ts
```

Then open port 3333 in your browser in your browser.

**Features:**
- Two views: **Projects** (kanban boards) and **Tasks** (flat priority list)
- Drag-and-drop tasks between Open, In Progress, and Done
- Auto-categorization: Business, Product, Tech, Marketing, Finance, Sales, Operations
- Auto-tagging: crm, ads, video, team, events, course, tech, content, finance, infra
- Color-coded tags and category headers
- Priority auto-detection (high = revenue/sales, med = ops/events, low = infra)
- Real-time updates via SSE (changes in any Claude Code session appear instantly)
- Search with / keyboard shortcut
- Staleness indicators on projects not updated in 5+ days
- Task notes (pencil icon on any card)
- Progress bars per project
- Dark mode toggle

## Board Structure

```
~/board/
  _active/          <- one markdown file per active project
  _done/            <- archived completed projects
  _ideas.md         <- ideas and backlog
  _quick.md         <- one-off tasks not tied to a project
  _log.md           <- session activity feed
  dashboard/        <- web dashboard (server.ts + index.html)
```

## Project File Format

Each project in `_active/` follows this format:

```markdown
---
status: active
created: 2026-04-09
updated: 2026-04-09
---

# Project Name

## Open
- [ ] Task description (under 15 words)

## In Progress
- [~] Task being actively worked on

## Done
- [x] Completed task (2026-04-09)

## Context
- Key reference info any session might need
```

## Add This to Your CLAUDE.md

Copy and paste this into your CLAUDE.md file to make every Claude Code session automatically track tasks:

```markdown
## Task Board (Auto-Capture)

The task board lives at `~/board/`. It tracks all work across sessions so nothing gets lost.

### On Session Start - MANDATORY
Every session MUST do this before any other work:
1. Run `ls ~/board/_active/` to see all active projects
2. Read the relevant project files for the user's request
3. **Output a status summary** at the top of your first response showing:
   - Which project(s) this session relates to
   - What's currently in-progress and open for those projects
4. Create a TodoWrite task list for the session's work immediately

### When Starting Work
1. If it matches an existing project in `~/board/_active/`, update that file:
   - Move the relevant task to "In Progress" (`[ ]` becomes `[~]`)
   - If no matching task exists, add one under "In Progress"
2. If it's a new multi-session effort, create a new project file in `~/board/_active/`
3. If it's a quick one-off, add it to `~/board/_quick.md` under "In Progress"
4. Update the `updated` date in frontmatter

### When Finishing Work - MANDATORY
1. Move the task to "Done" with today's date: `[x] Task name (YYYY-MM-DD)`
2. Append a brief entry to `~/board/_log.md` (what was done, which project)
3. Update the `updated` date in frontmatter
4. Mark the TodoWrite item as `completed`

### Rules
- Do NOT ask before updating the board. Just do it.
- Keep task descriptions under 15 words
- One task = one line. No sub-bullets in task lists.
- If a project has zero open or in-progress items, move the file to `~/board/_done/`
- Format: `[ ]` = open, `[~]` = in progress, `[x]` = done

### In-Session Task Tracking (TodoWrite) - MANDATORY
The TodoWrite list is your **live status bar** pinned to the top of the chat. It must ALWAYS be present and current.
- **First action of every session:** create a TodoWrite list. Before reading files, before running commands, before anything.
- **The list must exist for the entire session.** When all items complete, add next steps or a wrap-up item. Never let it go empty.
- **Update in real time.** Mark `in_progress` the moment you start. Mark `completed` the moment you finish. Never batch.
- **ANY 2+ step task gets tracked.** No exceptions.
- **New requests mid-session:** add to the existing list immediately.
- When a task completes, update the matching `~/board/_active/` project file too.
```
