---
name: bot-inbox-sweep
description: Sweep the Notion Bot Inbox, classify each capture, and route to either Marketing CMO (content-related) or SIDEKICK (everything else) for review and action. Use when starting the day, when asked to "sweep the bot inbox" / "check bot inbox" / "what's in the bot inbox", or as part of the daily Paperclip routine. Read-only by default — mutations require explicit approval.
---

# Bot Inbox Sweep

## Purpose

The Telegram bot captures Renee's on-the-go thoughts into the Notion Bot Inbox. This skill triages those captures into the right hands — Marketing CMO for content, SIDEKICK for everything else — so nothing rots.

## When to use

- Trigger phrases: "sweep the bot inbox", "check bot inbox", "what's in the bot inbox", "triage bot inbox"
- Daily Paperclip routine `daily-bot-inbox-sweep` (fires 7am Brisbane, after the 6am Command Centre brief)
- Whenever Renee references the bot inbox as having items to action

## Modes

The skill runs in one of two modes depending on context:

**🟢 Manual mode** (default — when Renee triggers it live)
- Sweep + classify + present the triaged report
- WAIT for explicit approval before any mutation
- On approval: archive / board-add / comment-flag as approved

**🌙 Routine mode** (when invoked by the `daily-bot-inbox-sweep` Paperclip routine)
- Sweep + classify + log only — no archives, no board-adds
- CMO items: add a Notion comment tagging them for the CMO routine to pick up (low-risk handoff, reversible)
- SIDEKICK items: written to the log as *"queued for next live session"* — Renee approves and I action them when she's next at the laptop
- Always: write the full triaged report to 📥 Daily Bot Inbox Sweep Log (page `3730973e-550d-81bb-86ac-e3610bcb41e7`) and push a one-line Telegram summary via the bot
- Always: update the "Last swept" line on the Bot Inbox page

To force routine mode from a live session: include "routine mode" in the prompt.

## Sources of truth

- 📥 Bot Inbox: `32d0973e-550d-81ac-bf2d-eeee2f77ec57`
- 📦 Bot Inbox — Archive: `3460973e-550d-81a3-9a96-cb57456c37db`
- 🎯 Wondr Command Centre: `3270973e-550d-8068-87c3-dbcf314b9f83` (for cross-referencing current state)
- 🤍 Wondr Marketing Hub: `36b0973e-550d-81e8-8859-d107a0a7bcfa` (CMO source of truth)

## Steps

1. **Fetch** the Bot Inbox page. List all child pages that aren't the Reference or Archive — these are the new captures.
2. **Read** each capture's title + body.
3. **Classify** each into one of two routes using the rules table below.
4. **For CMO-routed items**: prepare a flag for the Marketing CMO routine. Include the original capture link plus a one-line note: *"Should we action this given current strategy + state?"* Pull context from Wondr Marketing Hub before recommending.
5. **For SIDEKICK-routed items**: triage into one of:
   - **Action now** — quick task we can knock out in the session
   - **Add to board** — bigger work, needs scheduling (via /board-add)
   - **Archive** — duplicate, already done, no-op
   - **Question for Renee** — needs her decision before action
6. **Present the triaged report** (format below). Wait for Renee's explicit approval before any mutation.
7. **On approval**:
   - Add board items via /board-add
   - For items Renee approves for archive: add a top-level Notion comment `[ARCHIVE]` on the capture page — the [[bot-inbox-archive-cleanup]] routine will move it to the Archive page on its weekly Sunday run. Do NOT move the page directly; the archive routine owns moves.
   - For action-now items: action them, then add `[ARCHIVE]` once complete (same downstream cleanup)
   - For CMO-flagged items: leave in place, add a top-level Notion comment tagging the CMO routine to pick up
8. **Update the "Last swept" line** at the top of the Bot Inbox page to today's date and a one-line summary (e.g. *"Last swept: Mon 2 June 2026 — 5 items: 2 CMO, 2 SIDEKICK, 1 tagged for archive."*).

## Routing rules

| Capture content | Route to | Why |
|---|---|---|
| Content idea, hook, post, caption, carousel, reel, Substack draft | **CMO** | Marketing owns content end-to-end (see [[feedback-sidekick-cmo-scope]]) |
| Content engine adjustments, voice tweaks, pillar changes | **CMO** | Same |
| Ad copy, campaign idea, funnel WORDS, email subject lines, landing-page copy | **CMO** | Marketing owns funnel words (see [[feedback-funnel-ownership-split]]) |
| Funnel WIRING, automations, integrations, ManyChat/GHL plumbing | **SIDEKICK** | Funnel wiring is SIDEKICK |
| Ops decision, tool eval, infra change, skill build | **SIDEKICK** | Non-marketing ops |
| Workshop logistics, Wondr Lab build tasks | **SIDEKICK** | Non-marketing ops |
| Mon+Co, allied health engagements, partnerships | **SIDEKICK** | Non-marketing ops |
| Question for Renee with no clear action | **SIDEKICK** (escalate) | Needs her decision |
| Ambiguous | **SIDEKICK** (escalate) | Default to SIDEKICK until classified |

## Output format

```
📥 Bot Inbox Sweep — {date}

{N} items in inbox.
→ {X} flagged for CMO (content)
→ {Y} for SIDEKICK (ops/wiring/other)
→ {Z} questions for Renee

────────────────────────────────
🤍 CMO — for content review
────────────────────────────────
1. {title} → {one-line summary}
   Recommend: {action} — {strategy context from Marketing Hub}
   {Notion link}
2. ...

────────────────────────────────
🛠️ SIDEKICK — proposed triage
────────────────────────────────
1. {title} → {one-line summary}
   Proposed: {Action now / Add to board / Archive}
   {Notion link}
2. ...

────────────────────────────────
❓ For Renee — needs your call
────────────────────────────────
1. {title} → {question}
   {Notion link}
────────────────────────────────

Approve all / approve sidekick only / approve item N / discuss?
```

## Rules (non-negotiable)

- **Explicit approval before mutation** — never archive, route, or board-add without Renee's go-ahead (see [[feedback-explicit-approval-only]]).
- **Never delete** — archive only by moving to the Archive page (see [[feedback-never-delete]]).
- **Marketing scope check** — anything content-related goes to CMO, never SIDEKICK (see [[feedback-sidekick-cmo-scope]]).
- **Read-only by default** — the sweep itself reads + classifies. The only mutations after approval are: (a) archiving, (b) board-adding, (c) flagging CMO items with a Notion comment, (d) updating the "Last swept" line.

## Failure modes to watch

- Bot Inbox empty → output "Inbox clear — nothing to sweep" and exit.
- Notion integration access lost → page returns `object_not_found`. Fix per [[project-telegram-vps-setup]] (re-add Wondr-Claude-Bot integration).
- Capture is just a single word or fragment → flag as "ambiguous → for Renee".

## Cross-references

- [[feedback-sidekick-cmo-scope]] — ownership rules that drive routing
- [[feedback-funnel-ownership-split]] — funnel words vs wiring split
- [[feedback-explicit-approval-only]] — approval-before-mutation rule
- [[feedback-never-delete]] — archive, don't delete
- [[project-telegram-vps-setup]] — the bot writing into this inbox
- [[project-sidekick-skill-packaging]] — broader rollout context
- [[reference-command-centre-routine]] — 6am Paperclip routine this sits alongside
