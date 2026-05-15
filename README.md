# Wondr Skills

A growing collection of Claude Code skills curated and extended by [Wondr Agency](https://wondragency.com.au).

These are the same tools Renee uses to run Wondr day-to-day — now packaged so you can install them in one line.

---

## Available Skills

### `board-dashboard` — Cross-Session Task Board

A persistent task board that tracks everything you're working on across all Claude Code chat sessions. Includes a Wondr-branded web kanban, due dates, overdue badges, auto-categorisation, and optional auto-start at login.

**What you get:**
- A live kanban dashboard at `http://localhost:3333` (Wondr palette + fonts)
- 4 slash commands (`/board`, `/board-add`, `/board-cleanup`, `/board-scan`)
- Due date syntax (`| due: YYYY-MM-DD`) with **Wine** (overdue), **Burnt** (today/soon), and neutral badges
- Project headers flag a red dot when anything is overdue
- Auto-categorisation, auto-tagging, drag-and-drop, real-time updates
- Optional macOS LaunchAgent — dashboard auto-starts at login, restarts on crash

---

## Install (One Line)

Open a terminal and paste this:

```bash
curl -fsSL https://raw.githubusercontent.com/REPLACE_OWNER/wondr-skills/main/install.sh | bash
```

The installer will:

1. Install **Bun** (the runtime that powers the web dashboard) if it's missing
2. Copy the skill files into `~/.claude/skills/`
3. Set up the board structure at `~/board/` with example projects
4. Print the next step (how to start the dashboard)

---

## Install (Manual / Step-by-Step)

If you'd rather see what's happening:

```bash
git clone https://github.com/REPLACE_OWNER/wondr-skills.git ~/wondr-skills-src
bash ~/wondr-skills-src/install.sh
```

---

## After Install — Start the Dashboard

**Option 1 — Run it manually each time:**

```bash
bun run ~/board/dashboard/server.ts
```

Then open **http://localhost:3333** in your browser.

**Option 2 — Auto-start at login (Recommended, Mac only):**

```bash
bash ~/.claude/skills/board-dashboard/setup-launchagent.sh
```

The dashboard starts automatically every time you log in and restarts itself if it ever crashes. To turn it off later, re-run with `--uninstall`.

---

## Slash Commands

Once installed, use these inside any Claude Code chat:

| Command | What it does |
|---|---|
| `/board` | Show your full task board in chat |
| `/board-add Fix login bug > my-saas` | Add a task to a project |
| `/board-add Buy groceries` | Add a quick one-off task |
| `/board-cleanup` | Flag stale tasks, archive done projects |
| `/board-scan` | Auto-populate the board from recent sessions |

---

## Due Dates

Add a due date to any task:

```
- [ ] Build the landing page | due: 2026-05-19
```

The dashboard automatically badges it as overdue, due today, or due soon based on today's date.

---

## File Structure

```
~/board/
  _active/          one markdown file per active project
  _done/            archived completed projects
  _ideas.md         ideas + backlog
  _quick.md         one-off tasks not tied to a project
  _log.md           session activity feed
  dashboard/        the web dashboard (server.ts + index.html)
```

---

## Updating

Re-running the install command updates the skill to the latest version. Your `~/board/` data is never touched.

---

## License & Acknowledgments

MIT — see [LICENSE](LICENSE) for full text.

This skill builds on a task-board pattern originally shared by [Luke Selr](https://gist.github.com/lukeselr/a10b61cbe43d639d28d6a084dd70ed51), extended significantly for Wondr with Wondr branding, due dates, overdue surfacing, the LaunchAgent installer, and the SessionStart context hook used in Renee's private setup.

---

*Built and shared by [Wondr Agency](https://wondragency.com.au) — helping founders ship with AI.*
