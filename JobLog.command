
#!/bin/bash

cd "$(dirname "$0")" || exit 1

./start-joblog.sh

echo ""
echo "JobLog has stopped."
read -r -p "Press Enter to close this window..."
