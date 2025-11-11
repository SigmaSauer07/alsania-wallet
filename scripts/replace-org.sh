#!/bin/bash

# replace-org.sh
# This script replaces occurrences of 'alsania-dev' with 'alsania-io' in the repo.

# Preview mode flag
PREVIEW=false

while getopts "p" opt; do
  case $opt in
    p) PREVIEW=true ;;  
    *) exit 1 ;;  
  esac  
done

# Replace command
if $PREVIEW; then
  echo "Preview: No changes will be made."  
else
  echo "Replacing 'alsania-dev' with 'alsania-io'..."  
  # Actual replacement logic here
fi
