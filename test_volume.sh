#!/bin/bash

# Test script to verify volume changes in Android emulator
# Usage: ./test_volume.sh

ADB_PATH="$HOME/Library/Android/sdk/platform-tools/adb"

echo "🔊 Testing Volume in Android Emulator"
echo "======================================"
echo ""

# Get current volume
echo "1. Current system volume (0-15 scale):"
$ADB_PATH shell dumpsys audio | grep -A 2 "STREAM_MUSIC" | grep "streamVolume" | awk '{print $2}'
echo ""

# Get current volume as percentage (0-1 scale)
echo "2. Current volume in app format (0-1 scale):"
CURRENT_VOL=$(($($ADB_PATH shell dumpsys audio | grep -A 2 "STREAM_MUSIC" | grep "streamVolume" | awk '{print $2}') * 100 / 15))
echo "Scale: 0-15 = $CURRENT_VOL% (0.$(printf "%02d" $CURRENT_VOL) in 0-1 scale)"
echo ""

# Test setting different volumes
echo "3. Testing volume changes..."
echo "   Setting volume to 5 (33%)..."
$ADB_PATH shell settings put system volume_music 5
sleep 1
echo "   Current volume: $($ADB_PATH shell dumpsys audio | grep -A 2 "STREAM_MUSIC" | grep "streamVolume" | awk '{print $2}')/15"
echo ""

echo "   Setting volume to 10 (67%)..."
$ADB_PATH shell settings put system volume_music 10
sleep 1
echo "   Current volume: $($ADB_PATH shell dumpsys audio | grep -A 2 "STREAM_MUSIC" | grep "streamVolume" | awk '{print $2}')/15"
echo ""

echo "   Setting volume to 15 (100%)..."
$ADB_PATH shell settings put system volume_music 15
sleep 1
echo "   Current volume: $($ADB_PATH shell dumpsys audio | grep -A 2 "STREAM_MUSIC" | grep "streamVolume" | awk '{print $2}')/15"
echo ""

echo "✅ Volume test complete!"
echo ""
echo "📱 To test in your app:"
echo "   1. Open your app"
echo "   2. Run this script to change volume"
echo "   3. Check app logs: adb logcat | grep -i volume"
echo "   4. The app should detect the volume change when you navigate between screens"

