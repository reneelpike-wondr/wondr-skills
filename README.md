# Wondr Skills

A growing collection of Claude Code skills curated and shared by [Wondr Agency](https://wondragency.com.au).

These are battle-tested skills Renee uses to run Wondr — now packaged so you can install them in one line.

---

## Available Skills

### `board-dashboard` — Cross-Session Task Board

A persistent task board that tracks everything you're working on across all Claude Code sessions. Includes a visual web dashboard with kanban boards, drag-and-drop, priority sorting, and real-time updates.

- 4 slash commands (`/board`, `/board-add`, `/board-cleanup`, `/board-scan`)
- Auto-categorisation into Business, Product, Tech, Marketing, Finance, Sales, Operations
- Auto-tagging based on keywords
- Web dashboard at `http://localhost:3333`
- TodoWrite integration for a live status bar in every chat

> **Original author:** [Luke Selr](https://gist.github.com/lukeselr/a10b61cbe43d639d28d6a084dd70ed51) — shared under MIT-style attribution. Curated and re-packaged here with credit.

---

## Install (One Line)

Open a terminal and paste this:

```bash
curl -fsSL https://raw.githubusercontent.com/REPLACE_OWNER/wondr-skills/main/install.sh | bash
```

The installer will:

1. Check that **Bun** is installed (and install it if not)
2. Copy the skill files into `~/.claude/skills/`
3. Run the board-dashboard setup script (creates `~/board/`, installs 4 slash commands, loads example projects)
4. Print the next step (how to start the web dashboard)

---

## Install (Manual / Step-by-Step)

If you'd rather see what's happening:

```bash
git clone https://github.com/REPLACE_OWNER/wondr-skills.git ~/wondr-skills-src
bash ~/wondr-skills-src/install.sh
```

---

## After Install — Start the Dashboard

```bash
bun run ~/board/dashboard/server.ts
```

Then open **http://localhost:3333** in your browser.

---

## Slash Commands

Once installed, you can use these inside any Claude Code chat:

| Command | What it does |
|---|---|
| `/board` | Show your full task board in chat |
| `/board-add Fix login bug > my-saas` | Add a task to a project |
| `/board-add Buy groceries` | Add a quick one-off task |
| `/board-cleanup` | Flag stale tasks, archive done projects |
| `/board-scan` | Auto-populate the board from recent sessions |

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

## License

MIT — see [LICENSE](LICENSE) for full text.

Original board-dashboard work © Luke Selr. Wondr packaging and additions © Renee Pike / Wondr Agency.

---

*Built and shared by [Wondr Agency](https://wondragency.com.au) — helping founders ship with AI.*
