#!/bin/bash
# Board Dashboard Setup
# One-command installer for the cross-session task board system.
# Run: bash ~/.claude/skills/board-dashboard/setup.sh

set -e

BOARD_DIR="$HOME/board"
SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMANDS_DIR="$HOME/.claude/commands"
TODAY=$(date +%Y-%m-%d)

echo ""
echo "  /board - Cross-Session Task Board"
echo "  ================================="
echo ""

# Check for Bun
if ! command -v bun &> /dev/null; then
  echo "  Bun is required for the web dashboard."
  echo "  Install it: curl -fsSL https://bun.sh/install | bash"
  echo ""
  echo "  Continuing without web dashboard..."
  NO_BUN=true
fi

# Create directory structure
echo "  Creating ~/board/ structure..."
mkdir -p "$BOARD_DIR/_active"
mkdir -p "$BOARD_DIR/_done"
mkdir -p "$BOARD_DIR/dashboard"

# Create _quick.md if it doesn't exist
if [ ! -f "$BOARD_DIR/_quick.md" ]; then
  cat > "$BOARD_DIR/_quick.md" << EOF
---
status: active
updated: $TODAY
---

# Quick Tasks

## Open

## In Progress

## Done
EOF
fi

# Create _ideas.md if it doesn't exist
if [ ! -f "$BOARD_DIR/_ideas.md" ]; then
  cat > "$BOARD_DIR/_ideas.md" << EOF
---
status: active
updated: $TODAY
---

# Ideas & Backlog

## Open

## In Progress

## Done
EOF
fi

# Create _log.md if it doesn't exist
if [ ! -f "$BOARD_DIR/_log.md" ]; then
  cat > "$BOARD_DIR/_log.md" << EOF
# Session Log

## $TODAY

### Setup
- **What**: Board dashboard installed
- **Status**: System initialized
EOF
fi

# Copy example data if board is empty (first-time setup)
ACTIVE_COUNT=$(ls -1 "$BOARD_DIR/_active/" 2>/dev/null | wc -l | tr -d ' ')
if [ "$ACTIVE_COUNT" = "0" ]; then
  echo "  Loading example projects (delete these anytime)..."
  cp -r "$SKILL_DIR/examples/_active/"* "$BOARD_DIR/_active/" 2>/dev/null || true
  if [ -f "$SKILL_DIR/examples/_ideas.md" ]; then
    cp "$SKILL_DIR/examples/_ideas.md" "$BOARD_DIR/_ideas.md"
  fi
  if [ -f "$SKILL_DIR/examples/_quick.md" ]; then
    cp "$SKILL_DIR/examples/_quick.md" "$BOARD_DIR/_quick.md"
  fi
fi

# Install dashboard files
echo "  Installing web dashboard..."
cp "$SKILL_DIR/server.ts" "$BOARD_DIR/dashboard/server.ts"
cp "$SKILL_DIR/index.html" "$BOARD_DIR/dashboard/index.html"

# Install slash commands
echo "  Installing slash commands..."
mkdir -p "$COMMANDS_DIR"
for cmd in board board-add board-cleanup board-scan; do
  if [ -f "$SKILL_DIR/commands/$cmd.md" ]; then
    cp "$SKILL_DIR/commands/$cmd.md" "$COMMANDS_DIR/$cmd.md"
  fi
done

echo ""
echo "  Setup complete!"
echo ""
echo "  Structure:"
echo "    ~/board/_active/     Project files (one per project)"
echo "    ~/board/_done/       Archived completed projects"
echo "    ~/board/_ideas.md    Ideas and backlog"
echo "    ~/board/_quick.md    Quick one-off tasks"
echo "    ~/board/_log.md      Session activity feed"
echo "    ~/board/dashboard/   Web dashboard"
echo ""
echo "  Slash commands:"
echo "    /board               View task board in chat"
echo "    /board-add           Add a task or project"
echo "    /board-cleanup       Clean up stale tasks"
echo "    /board-scan          Scan sessions to populate board"
echo ""

if [ -z "$NO_BUN" ]; then
  echo "  Web dashboard:"
  echo "    bun run ~/board/dashboard/server.ts"
  echo "    Then open your browser to port 3333"
  echo ""
fi
