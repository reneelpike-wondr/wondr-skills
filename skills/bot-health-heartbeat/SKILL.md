---
name: bot-health-heartbeat
description: Daily health check on the Wondr Telegram bot. v1 detects silent failure by inactivity threshold — if no Bot Inbox capture in 7+ days, flag for investigation. Use as the Paperclip routine `daily-bot-health-heartbeat` (fires 7:05am Brisbane, just after the Daily Bot Inbox Sweep), or live when Renee asks "is the bot alive?".
---

# Bot Health Heartbeat

## Purpose

On 2026-06-02 we caught the Telegram bot in an 18-day silent failure — PM2 said "online" but Notion writes were silently failing. This skill is the early-warning system: detect silence sooner, flag for triage.

## When to use

- Trigger phrases: "is the bot alive?", "check bot health", "bot heartbeat"
- Daily Paperclip routine `daily-bot-health-heartbeat` (fires 7:05am Brisbane)
- After bot.js changes, to confirm he's still saving

## v1 Detection logic (inactivity-based)

1. Fetch the Bot Inbox page (`32d0973e-550d-81ac-bf2d-eeee2f77ec57`).
2. List all child pages. Skip `📚 Bot Inbox — Reference` and `📦 Bot Inbox — Archive`.
3. Find the most recently created/modified capture.
4. Compute the age of that capture (days since last modified).
5. Apply the threshold:
   - **≤ 3 days**: 🟢 Healthy — bot is being used and writing. Log "OK" silently.
   - **4–6 days**: 🟡 Quiet — could be Renee not using the bot OR early-stage silent failure. Log a soft note in the Bot Inbox Sweep Log: *"Bot quiet — last capture {N} days ago. Worth a manual ping test if it stays quiet 3+ more days."*
   - **≥ 7 days**: 🔴 Alert — flag a Notion comment on the Bot Inbox page: *"⚠️ Bot Health Heartbeat — no captures in {N} days. Could be silent failure (see [[project-telegram-vps-setup]] for diagnosis steps). Renee: send a Telegram test ping and confirm it lands."*

## False positive disclaimer

v1 is inactivity-based — it can't distinguish "bot dead" from "Renee not using bot." If Renee genuinely goes quiet, the alert fires anyway. v2 will replace this with an active heartbeat written by the bot itself each hour (planned alongside the v2 Telegram push from the routine).

## Modes

**🟢 Routine mode** (Paperclip `daily-bot-health-heartbeat`)
- Run check, log result silently if healthy
- On 🟡 or 🔴: write to the Daily Bot Inbox Sweep Log (append a one-liner at the top) AND on 🔴 add the comment on the Bot Inbox page
- Never blocks or pages Renee directly

**🟢 Manual mode** (Renee asks live)
- Run check, report status directly in chat with verdict + age
- Skip the Notion comment unless 🔴

## v2 plan (when wired with Telegram push)

Modify `bot.js` to write `lastAlive: {ISO timestamp}` to a dedicated Notion property/page every hour via `setInterval`. Then this skill checks:
- Heartbeat < 2 hours old → 🟢 Healthy
- 2–24 hours → 🟡 Investigate
- > 24 hours → 🔴 Down

Active heartbeat eliminates the false-positive class. Targets a Notion page or property update; bot.js + Notion access is already in place.

## Diagnosis pointer (for 🔴 alerts)

When a 🔴 alert fires:
1. SSH into `openclaw` as `wondr` user
2. `pm2 list` — confirm `wondr-bot` is running
3. `pm2 logs wondr-bot --lines 100 --nostream` — look for `object_not_found` (Notion access lost) or rate-limit cascades
4. If Notion access lost: re-add Wondr-Claude-Bot integration to the Bot Inbox page (see [[project-telegram-vps-setup]])
5. `pm2 restart wondr-bot` after fix

## Cross-references

- [[project-telegram-vps-setup]] — VPS architecture + the 2026-06-02 failure diagnosis
- [[bot-inbox-sweep]] — the daily sweep this heartbeat sits alongside
- [[project-sidekick-skill-packaging]] — broader rollout
