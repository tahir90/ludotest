#!/bin/bash

ADB_PATH="$HOME/Library/Android/sdk/platform-tools/adb"

echo "🔊 Testing Volume Detection in App"
echo "=================================="
echo ""

# Function to set volume and wait
set_volume() {
    local vol=$1
    local percent=$2
    echo "📱 Setting system volume to $percent% (value: $vol/15)..."
    $ADB_PATH shell settings put system volume_music $vol
    sleep 1
    
    # Get actual volume
    ACTUAL_VOL=$($ADB_PATH shell dumpsys audio | grep -A 2 "STREAM_MUSIC" | grep "streamVolume" | awk '{print $2}')
    echo "   ✅ System volume is now: $ACTUAL_VOL/15"
    
    # Calculate 0-1 scale
    VOL_0_1=$(echo "scale=2; $ACTUAL_VOL / 15" | bc)
    echo "   📊 In app format (0-1): $VOL_0_1"
    echo ""
}

echo "Current volume state:"
CURRENT=$($ADB_PATH shell dumpsys audio | grep -A 2 "STREAM_MUSIC" | grep "streamVolume" | awk '{print $2}')
echo "  System volume: $CURRENT/15"
CURRENT_0_1=$(echo "scale=2; $CURRENT / 15" | bc)
echo "  App format: $CURRENT_0_1"
echo ""

echo "🧪 Testing volume changes..."
echo "   (The app should detect these changes when you navigate between screens)"
echo ""

# Test different volumes
set_volume 5 "33"
set_volume 10 "67"
set_volume 15 "100"

echo "✅ Volume test complete!"
echo ""
echo "📱 Next steps:"
echo "   1. Keep your app open"
echo "   2. Run this script again to change volume"
echo "   3. Navigate to a different screen (Home → Ludo Board)"
echo "   4. Check logs with: adb logcat | grep -i 'refreshed system volume'"
echo "   5. You should see the app detect the new volume!"
