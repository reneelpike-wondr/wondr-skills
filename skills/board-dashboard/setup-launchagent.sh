#!/bin/bash
# Optional: install a macOS LaunchAgent so the dashboard auto-starts at login.
# Safe to re-run — replaces existing agent if present.
#
# To remove: bash this script with --uninstall

set -e

PLIST_PATH="$HOME/Library/LaunchAgents/com.wondr.board.plist"
SERVER_PATH="$HOME/board/dashboard/server.ts"
BUN_PATH="$HOME/.bun/bin/bun"

if [ "$1" = "--uninstall" ]; then
  echo "  Uninstalling LaunchAgent..."
  launchctl unload "$PLIST_PATH" 2>/dev/null || true
  rm -f "$PLIST_PATH"
  echo "  Done. Dashboard will no longer auto-start."
  exit 0
fi

if [ ! -x "$BUN_PATH" ]; then
  echo "  Bun not found at $BUN_PATH"
  echo "  Install it first: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

if [ ! -f "$SERVER_PATH" ]; then
  echo "  Dashboard server not found at $SERVER_PATH"
  echo "  Did you run the main installer first?"
  exit 1
fi

# Unload any existing agent first (idempotent)
launchctl unload "$PLIST_PATH" 2>/dev/null || true

mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wondr.board</string>

    <key>ProgramArguments</key>
    <array>
        <string>${BUN_PATH}</string>
        <string>run</string>
        <string>${SERVER_PATH}</string>
    </array>

    <key>WorkingDirectory</key>
    <string>${HOME}/board/dashboard</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>HOME</key>
        <string>${HOME}</string>
        <key>PATH</key>
        <string>${HOME}/.bun/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>ProcessType</key>
    <string>Background</string>

    <key>StandardOutPath</key>
    <string>/tmp/wondr-board.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/wondr-board.err</string>
</dict>
</plist>
EOF

# Kill anything currently bound to port 3333 to avoid conflict
pkill -f "bun.*board.*server.ts" 2>/dev/null || true
sleep 1

launchctl load -w "$PLIST_PATH"
sleep 2

if launchctl list | grep -q com.wondr.board; then
  echo ""
  echo "  Auto-start installed."
  echo "  Dashboard will run automatically every time you log in to this Mac."
  echo "  It's running RIGHT NOW: http://localhost:3333"
  echo ""
  echo "  To turn off auto-start later, run:"
  echo "    bash $(realpath "$0") --uninstall"
else
  echo "  Something went wrong loading the LaunchAgent. Check:"
  echo "    /tmp/wondr-board.err"
  exit 1
fi
