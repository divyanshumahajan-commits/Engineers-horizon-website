#!/bin/bash
# Engineers Horizon website - local preview on a Mac. Double-click to start, close the window to stop.
cd "$(dirname "$0")"
PORT=8080
echo ""
echo "  Engineers Horizon website is running at:  http://localhost:$PORT/"
echo "  Keep this window open while you browse. Close it to stop the website."
echo ""
(sleep 1; open "http://localhost:$PORT/") &
if command -v python3 >/dev/null 2>&1; then python3 -m http.server $PORT --bind 127.0.0.1
else echo "Python 3 is needed on a Mac. Install it from https://www.python.org/downloads/ and try again."; read -p "Press Enter to close"; fi
