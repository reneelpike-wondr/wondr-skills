#!/bin/bash
# Wondr Skills — One-line installer
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/REPLACE_OWNER/wondr-skills/main/install.sh | bash
#
# What it does:
#   1. Installs Bun (if missing) — needed for the web dashboard
#   2. Downloads the board-dashboard skill into ~/.claude/skills/
#   3. Runs the skill's setup script (creates ~/board/, installs slash commands, loads examples)
#   4. Tells you how to start the dashboard

set -e

REPO_RAW="https://raw.githubusercontent.com/REPLACE_OWNER/wondr-skills/main"
SKILL_DIR="$HOME/.claude/skills/board-dashboard"

echo ""
echo "  Wondr Skills — Installer"
echo "  ========================"
echo ""

# Step 1 — Bun
if ! command -v bun &> /dev/null; then
  echo "  Installing Bun (needed for the web dashboard)..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"

  # Persist to shell profile if not already there
  if ! grep -q 'BUN_INSTALL' "$HOME/.zshrc" 2>/dev/null; then
    cat >> "$HOME/.zshrc" <<EOF

# Bun
export BUN_INSTALL="\$HOME/.bun"
export PATH="\$BUN_INSTALL/bin:\$PATH"
EOF
  fi
  echo "  Bun installed."
else
  echo "  Bun already installed — skipping."
fi
echo ""

# Step 2 — download board-dashboard skill
echo "  Downloading board-dashboard skill..."
mkdir -p "$SKILL_DIR/commands" "$SKILL_DIR/examples/_active"

for f in SKILL.md server.ts index.html setup.sh; do
  curl -fsSL "$REPO_RAW/skills/board-dashboard/$f" -o "$SKILL_DIR/$f"
done

for f in board.md board-add.md board-cleanup.md board-scan.md; do
  curl -fsSL "$REPO_RAW/skills/board-dashboard/commands/$f" -o "$SKILL_DIR/commands/$f"
done

for f in _ideas.md _quick.md; do
  curl -fsSL "$REPO_RAW/skills/board-dashboard/examples/$f" -o "$SKILL_DIR/examples/$f"
done

for f in client-work.md marketing-launch.md my-saas-project.md; do
  curl -fsSL "$REPO_RAW/skills/board-dashboard/examples/_active/$f" -o "$SKILL_DIR/examples/_active/$f"
done

echo "  Skill files in place."
echo ""

# Step 3 — run the skill's setup
chmod +x "$SKILL_DIR/setup.sh"
bash "$SKILL_DIR/setup.sh"

echo ""
echo "  ============================================================"
echo "  All done!"
echo ""
echo "  To start the web dashboard, run:"
echo "    bun run ~/board/dashboard/server.ts"
echo ""
echo "  Then open http://localhost:3333 in your browser."
echo "  ============================================================"
echo ""
