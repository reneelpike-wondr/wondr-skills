---
name: bot-inbox-archive-cleanup
description: Weekly sweep that moves processed Bot Inbox captures to the Archive page. Pairs with bot-inbox-sweep. Triggered by `[ARCHIVE]` Notion comments added when SIDEKICK actions an item or CMO marks it resolved. Read-only on the inbox itself; the only mutation is the Notion page-move (never delete).
---

# Bot Inbox Archive Cleanup

## Purpose

Once captures are actioned (SIDEKICK) or reviewed-and-decided (CMO), they shouldn't keep re-appearing in the Daily Bot Inbox Sweep. This skill moves them to the Archive page so the inbox stays a true backlog of *new* work.

## When to use

- Trigger phrase: "clean up the bot inbox archive", "archive processed captures"
- Weekly Paperclip routine `weekly-bot-inbox-archive-cleanup` (fires 8pm Brisbane every Sunday, after CMO's 6pm scheduling sweep)
- Anytime the inbox feels cluttered with already-handled items

## How items get marked for archive

The actioning agent (live SIDEKICK or the CMO routine) adds a top-level Notion comment with exact text:

```
[ARCHIVE]
```

That's the signal. No comment = not ready to archive.

The Daily Bot Inbox Sweep skill (`bot-inbox-sweep`) auto-adds `[ARCHIVE]` when Renee approves an item in live (manual) mode. The CMO routine should do the same when it decides "leave" or "actioned" on a flagged item.

## Steps

1. Fetch the Bot Inbox page (`32d0973e-550d-81ac-bf2d-eeee2f77ec57`). List all child pages. Skip `📚 Bot Inbox — Reference` and `📦 Bot Inbox — Archive` themselves.
2. For each remaining capture: fetch its top-level Notion comments.
3. If a comment contains the exact string `[ARCHIVE]`: queue this page for archival.
4. Build a triaged report (format below) and write a new section at the top of the 📥 Daily Bot Inbox Sweep Log page (`3730973e-550d-81bb-86ac-e3610bcb41e7`).
5. **Move** each queued page to the 📦 Bot Inbox — Archive page (`3460973e-550d-81a3-9a96-cb57456c37db`) using Notion's move-page API. Never delete.
6. Update the "Last archived" line at the top of the 📦 Bot Inbox — Archive page to today's date: *"Last cleanup: {date} — {N} items archived."*

## Output format (appended to Sweep Log)

```
## 🧹 Archive Cleanup — {today's date}

{N} captures archived.

1. **{title}** → archived (was tagged by {SIDEKICK / CMO} on {date})
   New location: {Archive Notion link}
2. ...

If 0: "Inbox clean — nothing to archive this week."
```

## Modes

**🟢 Routine mode** (Paperclip)
- Find tagged → move → log. No approval needed since `[ARCHIVE]` comment is the prior approval.

**🟢 Manual mode** (Renee asks live)
- Same as routine, but report the queue first and wait for "yes archive" before moving. Useful if Renee wants to spot-check the queue before committing.

## Rules (non-negotiable)

- **Never delete** — archive by moving the page (see [[feedback-never-delete]]).
- **Only act on `[ARCHIVE]` comment** — never auto-archive by age or heuristic. Explicit signal only (per [[feedback-explicit-approval-only]]).
- **Skip Reference + Archive sub-pages** — they are structural, not captures.
- **Log every move** — auditable trail in the Sweep Log + the Archive's "Last cleanup" line.

## Edge cases

- **Empty queue**: write `Inbox clean — nothing to archive this week.` to the Sweep Log and exit.
- **Capture has both an `[ARCHIVE]` comment and unresolved content**: still archive — the comment is the contract.
- **Move fails (Notion API error)**: skip that item, log the failure with the original link, continue with the rest. Renee can chase later.

## Cross-references

- [[bot-inbox-sweep]] — produces the captures + adds `[ARCHIVE]` tags on approval
- [[feedback-never-delete]] — archive, don't delete
- [[feedback-explicit-approval-only]] — explicit signal required
- [[project-sidekick-skill-packaging]] — broader rollout
