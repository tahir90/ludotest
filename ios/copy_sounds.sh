#!/bin/bash

# Script to copy sound files to iOS app bundle
# This script runs during Xcode build to ensure sound files are included in the bundle

SOUNDS_SOURCE_DIR="${SRCROOT}/LudoApp"
SOUNDS_DEST_DIR="${BUILT_PRODUCTS_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"

# Create destination directory if it doesn't exist
mkdir -p "${SOUNDS_DEST_DIR}"

# Copy all .mp3 files from LudoApp directory to the app bundle
if [ -d "${SOUNDS_SOURCE_DIR}" ]; then
    find "${SOUNDS_SOURCE_DIR}" -maxdepth 1 -name "*.mp3" -exec cp {} "${SOUNDS_DEST_DIR}/" \;
    echo "✅ Copied sound files from ${SOUNDS_SOURCE_DIR} to bundle: ${SOUNDS_DEST_DIR}"
    ls -la "${SOUNDS_DEST_DIR}"/*.mp3 2>/dev/null | wc -l | xargs echo "   Total .mp3 files in bundle:"
else
    echo "⚠️ Source directory not found: ${SOUNDS_SOURCE_DIR}"
fi

