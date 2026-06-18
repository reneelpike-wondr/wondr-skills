---
name: higgsfield-creator
description: Generate AI videos and B-roll on Higgsfield using Playwright browser automation. Activates when user wants to create AI video content, B-roll for reels, or cinematic clips. Translates plain English content briefs into Higgsfield-optimised prompts, drives the Higgsfield interface to upload reference photos, configure camera motion and lighting, generate videos, and download results.
---

# Higgsfield Creator Skill

## What this skill does

Turns a plain-English content brief into a finished AI-generated video clip from Higgsfield, using Playwright to drive the browser.

The user describes what they want. This skill:
1. Translates it into a Higgsfield-optimised prompt
2. Opens Higgsfield in the browser (via Playwright MCP)
3. Uploads the reference photo if needed
4. Selects the right camera motion preset
5. Configures lighting and style
6. Generates the video
7. Downloads the result to the right folder

## Prerequisites

- User must be logged into Higgsfield in their browser (do this once manually)
- Playwright MCP must be available
- Reference photos saved in: `wondr/content/raw-video/higgsfield-reference-photos/`
- Output folder: `wondr/content/raw-video/higgsfield-output/`

## The Brief Framework — How to Write Higgsfield Prompts

Use this exact structure for every prompt:

```
[SUBJECT] [ACTION] in [SETTING], [LIGHTING/MOOD], [CAMERA MOVEMENT], [STYLE], [DURATION]
```

### Component breakdown

**SUBJECT** — Who or what is in the video
- "Renee" (use reference photo for character consistency)
- "A woman in her mid-30s with long brown hair"
- "Hands typing on a laptop"
- A product, scene, or object

**ACTION** — What they're doing (be specific, present-tense)
- "working at her laptop"
- "writing in a notebook"
- "looking out the window thoughtfully"
- "laughing while talking"

**SETTING** — Where it happens (be specific)
- "at a wooden dining table with plants in background"
- "in a sunlit home office"
- "at a beachside cafe with ocean view"
- "in a minimalist white kitchen"

**LIGHTING/MOOD** — This changes everything
- "soft natural morning light"
- "golden hour, warm tones"
- "moody overcast afternoon"
- "bright clean studio lighting"
- "candlelit, intimate atmosphere"

**CAMERA MOVEMENT** — Pick from Higgsfield's presets
- "slow dolly-in" — camera moves toward subject (great for emphasis)
- "dolly-out" — pulls back to reveal scene
- "static shot" — no movement
- "crane shot" — sweeping vertical movement
- "drone shot" — overhead/bird's eye
- "tracking shot" — follows subject
- "bullet-time" — frozen moment with rotation

**STYLE** — Visual aesthetic
- "cinematic"
- "documentary"
- "candid handheld"
- "polished lifestyle"
- "moody editorial"

**DURATION** — 5 or 10 seconds (Higgsfield default)

### Examples

**For a Wondr workshop reel B-roll:**
> "Renee working on her laptop at a wooden dining table, plants and books in background, soft natural morning light streaming through window, slow dolly-in shot, cinematic warm tones, 5 seconds"

**For an entertainment/visual gag (the multiple-Renees idea):**
> "Three identical Renees sitting in a row at separate laptops working intensely, while a fourth Renee in workout clothes does pilates on a reformer in the foreground, bright morning light, static wide shot, polished lifestyle aesthetic, 5 seconds"

**For an "AI working" abstract clip:**
> "Hands typing rapidly on a laptop keyboard, soft glow from screen reflecting on hands, moody indoor lighting, slow dolly-in close-up, cinematic, 5 seconds"

## Workflow — How to drive Higgsfield with Playwright

### Step 1 — Open Higgsfield

Use Playwright to navigate to: `https://higgsfield.ai`

If user is logged in, the dashboard loads. If not, prompt user to log in manually first.

### Step 2 — Choose the right model

Higgsfield has multiple models. For B-roll style content with character consistency, use **Soul** (for character-based) or the latest video model.

### Step 3 — Upload reference photo (if character-based)

Click upload → select from `/Users/reneepike/my-assistant/wondr/content/raw-video/higgsfield-reference-photos/`

### Step 4 — Paste the prompt

Use the brief framework above. Always check the prompt is grammatically clean — no "and and" or duplicate words from concatenation.

### Step 5 — Select camera motion

Pick from the camera preset menu based on what the brief specified.

### Step 6 — Generate and wait

Click generate. Wait for completion (usually 30-90 seconds).

### Step 7 — Download

Save the result to: `/Users/reneepike/my-assistant/wondr/content/raw-video/higgsfield-output/`

Filename format: `[date]-[brief-summary].mp4`
Example: `2026-04-12-renee-laptop-morning.mp4`

## Briefing Checklist — Before generating

Before kicking off Playwright, confirm:

- [ ] Subject is clear and specific
- [ ] Setting is described in detail (3+ visual elements)
- [ ] Lighting/mood is named (soft morning / golden hour / moody)
- [ ] Camera movement is specified using Higgsfield's preset names
- [ ] Style is named (cinematic / documentary / lifestyle)
- [ ] Reference photo path is provided (if character-based)
- [ ] Output filename is decided

## Costs and limits

- Higgsfield credits expire after 90 days
- Each generation uses credits (varies by model and length)
- Free tier: 10 credits/day, 1 job at a time
- Starter: more credits, multiple concurrent jobs

Be efficient — don't burn credits on test prompts. Get the brief right first.

## Common mistakes to avoid

1. **Vague subjects** — "a person" produces inconsistent results. Always reference photo or describe in detail.
2. **No lighting specified** — defaults to flat/boring lighting. Always name the mood.
3. **No camera movement** — static clips feel dead. Pick a movement.
4. **Trying to generate full reels** — clips are 5-10 seconds. Stitch in CapCut for longer content.
5. **Skipping the reference photo** — character consistency falls apart without one.

## Integration with Wondr Content Engine

When a Wondr Notion content card is marked "Needs B-roll":
1. Read the post script/copy
2. Identify 1-3 visual moments that need B-roll
3. Write a Higgsfield brief for each using the framework above
4. Generate the clips
5. Save to output folder
6. Update the Notion card with the file paths

This skill should be triggered whenever the user mentions:
- "Generate B-roll"
- "Create a Higgsfield video"
- "I need a visual clip for [reel/carousel]"
- "Make me an AI video of..."
