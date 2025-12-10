#!/bin/bash

# Script to copy sound files to iOS app bundle
# This script runs during Xcode build to ensure sound files are included in the bundle

SOUNDS_SOURCE_DIR="${SRCROOT}/Sounds"
SOUNDS_DEST_DIR="${BUILT_PRODUCTS_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"

# Create destination directory if it doesn't exist
mkdir -p "${SOUNDS_DEST_DIR}"

# Copy all .mp3 files from ios/ directory to the app bundle
if [ -d "${SRCROOT}" ]; then
    find "${SRCROOT}" -maxdepth 1 -name "*.mp3" -exec cp {} "${SOUNDS_DEST_DIR}/" \;
    echo "✅ Copied sound files to bundle: ${SOUNDS_DEST_DIR}"
else
    echo "⚠️ Source directory not found: ${SRCROOT}"
fi

