import { SOUNDS } from "$assets/sfx";
import SoundPlayer from "react-native-sound-player";
import Sound from "react-native-sound";
import { Platform } from 'react-native';

// Enable playback in silence mode
Sound.setCategory('Playback', true); // true = mixWithOthers

// Try to import volume manager methods, but handle if it's not linked
let volumeManager: any = null;
try {
  volumeManager = require('react-native-volume-manager');
  console.log('VolumeManager loaded:', !!volumeManager, 'Has setVolume:', typeof volumeManager?.setVolume === 'function');
} catch (e) {
  console.warn('react-native-volume-manager not available, using fallback', e);
}

// Volume state management
let currentVolume: number = 1.0;
let isMusicMuted: boolean = false; // Only affects background music
let isLooping: boolean = false;
let currentLoopSound: SOUND_NAME | null = null;
let isMusicPlaying: boolean = false;
let backgroundMusicInstance: Sound | null = null; // Use react-native-sound for background music with volume control

export const getSoundPath = (soundName: SOUND_NAME): any => {
    switch(soundName){
        case "dice_roll" :
            return SOUNDS.DiceRoll
        case "cheer" :
            return SOUNDS.Cheer
        case "collide" :
            return SOUNDS.Collide
        case "game_start" :
            return SOUNDS.GameStart
        case "sound_girl1" :
            return SOUNDS.Girl1
        case "sound_girl2" :
            return SOUNDS.Girl2
        case "sound_girl3" :
            return SOUNDS.Girl3
        case "sound_girl0" :
            return SOUNDS.Girl4
        case "home" :
            return SOUNDS.Home
        case "home_win" :
            return SOUNDS.HomeWin
        case "pile_move" :
            return SOUNDS.PileMove
        case "safe_spot" :
            return SOUNDS.SafeSpot
        case "ui" :
            return SOUNDS.UI
        default :
            throw new Error(`Sound ${soundName} not found`);
    }
}

// Get filename for react-native-sound (needs string filename, not require path)
export const getSoundFileName = (soundName: SOUND_NAME): string => {
    switch(soundName){
        case "dice_roll" :
            return "dice_roll.mp3"
        case "cheer" :
            return "cheer.mp3"
        case "collide" :
            return "collide.mp3"
        case "game_start" :
            return "game_start.mp3"
        case "sound_girl1" :
            return "girl1.mp3"
        case "sound_girl2" :
            return "girl2.mp3"
        case "sound_girl3" :
            return "girl3.mp3"
        case "sound_girl0" :
            return "girl4.mp3"
        case "home" :
            return "home.mp3"
        case "home_win" :
            return "home_win.mp3"
        case "pile_move" :
            return "pile_move.mp3"
        case "safe_spot" :
            return "safe_spot.mp3"
        case "ui" :
            return "ui.mp3"
        default :
            throw new Error(`Sound ${soundName} not found`);
    }
}

// Helper function to play a loaded sound effect
const playSoundEffect = (soundEffect: Sound, soundName: SOUND_NAME) => {
    try {
        console.log('✅ Sound loaded:', soundName, 'duration:', soundEffect.getDuration() + 's');
        
        // Set volume to 100% for sound effects
        soundEffect.setVolume(1.0);
        console.log('🔊 Volume set to 100% (1.0)');
        
        // Play the sound effect (will play simultaneously with background music)
        console.log('▶️ Playing sound effect...');
        soundEffect.play((success) => {
            if (success) {
                console.log('✅ Sound effect played successfully:', soundName);
            } else {
                console.error('❌ Playback failed:', soundName);
            }
            // Release the sound after playing
            soundEffect.release();
            console.log('🗑️ Sound released:', soundName);
        });
    } catch (err) {
        console.error('❌ Error playing sound effect:', soundName, err);
    }
};

let finishedPlayingHandler: (() => void) | null = null;

const handleFinishedPlaying = () => {
    // Loop the background music if it should be looping
    // This handler is for react-native-sound-player (fallback)
    if (isLooping && currentLoopSound && !isMusicMuted && isMusicPlaying && !backgroundMusicInstance) {
        try {
            const soundPath = getSoundPath(currentLoopSound);
            SoundPlayer.playAsset(soundPath);
            console.log('🔁 Looping background music (SoundPlayer):', currentLoopSound);
        } catch (err) {
            console.error("❌ Can't loop the sound file", err);
        }
    }
};

export const playSound = async (soundName: SOUND_NAME, loop: boolean = false, volume: number = 1.0) => {
    try {
        const soundPath = getSoundPath(soundName);
        
        if (loop) {
            // Use react-native-sound for background music (has volume control)
            // If music is already playing, just adjust volume
            if (isLooping && isMusicPlaying && backgroundMusicInstance) {
                console.log('🎵 Music already playing, adjusting volume to:', volume);
                backgroundMusicInstance.setVolume(volume);
                currentVolume = volume;
                return;
            }
            
            // Only start music if it's not already playing
            if (!isMusicPlaying) {
                isLooping = true;
                currentLoopSound = soundName;
                isMusicPlaying = true;
                
                // Use react-native-sound for background music (has volume control)
                const fileName = getSoundFileName(soundName).replace('.mp3', '');
                const soundPath = Platform.OS === 'ios' ? fileName : (fileName + '.mp3');
                
                console.log('🎵 Starting background music with react-native-sound:', soundName);
                console.log('📁 Sound path:', soundPath);
                
                backgroundMusicInstance = new Sound(soundPath, Sound.MAIN_BUNDLE, (error) => {
                    if (error) {
                        console.error('❌ Failed to load background music:', soundName, error);
                        // Fallback to SoundPlayer if react-native-sound fails
                        console.log('⚠️ Falling back to SoundPlayer');
                        backgroundMusicInstance = null;
                        if (!isMusicMuted) {
                            try {
                                SoundPlayer.playAsset(soundPath);
                                finishedPlayingHandler = handleFinishedPlaying;
                                SoundPlayer.addEventListener('FinishedPlaying', handleFinishedPlaying);
                            } catch (e) {
                                console.error('❌ Fallback to SoundPlayer also failed:', e);
                            }
                        }
                        return;
                    }
                    
                    console.log('✅ Background music loaded:', soundName);
                    
                    // Set volume and enable looping
                    backgroundMusicInstance.setVolume(volume);
                    backgroundMusicInstance.setNumberOfLoops(-1); // -1 = infinite loop
                    currentVolume = volume;
                    
                    if (!isMusicMuted) {
                        backgroundMusicInstance.play((success) => {
                            if (success) {
                                console.log('✅ Background music started:', soundName);
                            } else {
                                console.error('❌ Failed to play background music:', soundName);
                            }
                        });
                    }
                });
            } else {
                // Music is playing but we want to adjust volume
                if (backgroundMusicInstance) {
                    console.log('🎵 Adjusting background music volume to:', volume);
                    backgroundMusicInstance.setVolume(volume);
                    currentVolume = volume;
                } else {
                    // Fallback: use system volume if using SoundPlayer
                    await setMusicVolume(volume);
                }
            }
        } else {
            // For non-looping sounds (sound effects) - use react-native-sound with native files
            console.log('🎵 === PLAYING SOUND EFFECT ===');
            console.log('Sound name:', soundName);
            console.log('Music muted?', isMusicMuted);
            console.log('System volume:', currentVolume);
            
            // Sound effects ALWAYS play (independent of music mute)
            try {
                // Get filename for native resources
                // On iOS, react-native-sound with MAIN_BUNDLE expects just the filename without extension
                // On Android, it expects filename with extension
                const fileName = getSoundFileName(soundName).replace('.mp3', '');
                console.log('📁 Loading from native:', fileName, 'Platform:', Platform.OS);
                
                // For iOS, use filename without extension; for Android, use with extension
                const soundPath = Platform.OS === 'ios' ? fileName : (fileName + '.mp3');
                
                // Create Sound instance from native resources (MAIN_BUNDLE)
                const soundEffect = new Sound(soundPath, Sound.MAIN_BUNDLE, (error) => {
                    if (error) {
                        // On iOS, if loading without extension fails, try with extension as fallback
                        if (Platform.OS === 'ios' && !soundPath.endsWith('.mp3')) {
                            console.log('⚠️ iOS: Retrying with .mp3 extension...');
                            const soundEffectRetry = new Sound(fileName + '.mp3', Sound.MAIN_BUNDLE, (retryError) => {
                                if (retryError) {
                                    console.error('❌ Failed to load sound (both attempts):', fileName, retryError);
                                    console.error('💡 Make sure sound files are in the iOS app bundle');
                                    return;
                                }
                                playSoundEffect(soundEffectRetry, soundName);
                            });
                            return;
                        }
                        console.error('❌ Failed to load sound:', fileName, error);
                        console.error('💡 Make sure sound files are in the app bundle');
                        return;
                    }
                    
                    playSoundEffect(soundEffect, soundName);
                });
                
            } catch (err) {
                console.error("❌ Exception playing sound effect:", soundName, err);
            }
            console.log('🎵 === END PLAYING SOUND EFFECT ===');
        }
    } catch (err) {
        console.error("Can't play the sound file", err);
    }
}

export const setMusicVolume = async (volume: number) => {
    try {
        currentVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
        console.log('🔊 === SETTING MUSIC VOLUME ===');
        console.log('Target volume:', currentVolume, `(${Math.round(currentVolume * 100)}%)`);
        console.log('Platform:', Platform.OS);
        console.log('VolumeManager available:', !!volumeManager);
        console.log('Has setVolume:', typeof volumeManager?.setVolume === 'function');
        
        // Set system media volume (0.0 to 1.0)
        if (volumeManager && typeof volumeManager.setVolume === 'function') {
            try {
                // On iOS, we need to ensure the volume is set correctly
                // The volume manager should handle iOS-specific requirements
                const result = await volumeManager.setVolume(currentVolume);
                console.log('✅ VolumeManager.setVolume called, result:', result);
                
                // Verify the volume was set (iOS might need a small delay)
                if (Platform.OS === 'ios') {
                    // Give iOS a moment to apply the volume change
                    setTimeout(async () => {
                        try {
                            const verifyResult = await volumeManager.getVolume();
                            const actualVolume = verifyResult?.volume || verifyResult;
                            console.log('✅ Verified volume after setting:', actualVolume, `(${Math.round((actualVolume || 0) * 100)}%)`);
                        } catch (e) {
                            console.warn('⚠️ Could not verify volume:', e);
                        }
                    }, 100);
                }
            } catch (e) {
                console.error('❌ Error calling setVolume:', e);
                console.error('Error details:', JSON.stringify(e, null, 2));
            }
        } else {
            console.warn('⚠️ VolumeManager.setVolume not available');
            console.warn('VolumeManager object:', volumeManager);
        }
        console.log('🔊 === END SETTING MUSIC VOLUME ===');
    } catch (err) {
        console.error("❌ Can't set volume", err);
    }
}

export const getMusicVolume = async (): Promise<number> => {
    try {
        if (volumeManager && typeof volumeManager.getVolume === 'function') {
            const result = await volumeManager.getVolume();
            const volume = result?.volume || result;
            if (typeof volume === 'number') {
                currentVolume = volume;
                return volume;
            }
        }
        return currentVolume;
    } catch (err) {
        console.error("Can't get volume", err);
        return currentVolume;
    }
}

export const muteMusic = async () => {
    console.log('🔇 === MUTING MUSIC ===');
    console.log('Before mute - isMusicMuted:', isMusicMuted);
    console.log('Before mute - currentVolume:', currentVolume);
    
    isMusicMuted = true;
    
    try {
        // Stop the background music (react-native-sound or SoundPlayer)
        if (backgroundMusicInstance) {
            try {
                backgroundMusicInstance.pause();
                console.log('✅ Background music paused (react-native-sound)');
            } catch (e) {
                console.error('❌ Error pausing music:', e);
            }
        } else {
            try {
                SoundPlayer.stop();
                console.log('✅ Background music stopped (SoundPlayer)');
            } catch (e) {
                console.error('❌ Error stopping music:', e);
            }
        }
        
        // Save current volume for when we unmute (but don't change it now!)
        if (backgroundMusicInstance) {
            // Volume is already saved in currentVolume
            console.log('💾 Saved current volume:', currentVolume);
        } else if (volumeManager && typeof volumeManager.getVolume === 'function') {
            try {
                const result = await volumeManager.getVolume();
                const volume = result?.volume || result;
                if (typeof volume === 'number' && volume > 0) {
                    currentVolume = volume;
                    console.log('💾 Saved current volume:', currentVolume);
                }
            } catch (e) {
                console.log('⚠️ Could not get volume, keeping current:', currentVolume);
            }
        }
        
        // DO NOT SET SYSTEM VOLUME TO 0
        // That would mute ALL sounds including dice roll!
        console.log('✅ Music muted - system volume unchanged for sound effects');
        
    } catch (err) {
        console.error("❌ Can't mute music", err);
    }
    
    console.log('After mute - isMusicMuted:', isMusicMuted);
    console.log('After mute - currentVolume:', currentVolume);
    console.log('🔇 === END MUTING MUSIC ===');
}

export const unmuteMusic = async () => {
    console.log('Unmuting music...');
    isMusicMuted = false;
    try {
        // Restore volume (use saved volume or default to 0.4 for background)
        const volumeToRestore = currentVolume > 0 ? currentVolume : 0.5;
        console.log('Restoring volume to:', volumeToRestore);
        
        if (volumeManager && typeof volumeManager.setVolume === 'function') {
            try {
                await volumeManager.setVolume(volumeToRestore);
                console.log('Volume restored to:', volumeToRestore, 'via VolumeManager');
            } catch (e) {
                console.log('Error setting volume:', e);
            }
        } else {
            console.warn('VolumeManager.setVolume not available - resuming sound only');
        }
        
        currentVolume = volumeToRestore;
        
        if (isLooping && currentLoopSound) {
            const soundPath = getSoundPath(currentLoopSound);
            SoundPlayer.playAsset(soundPath);
            console.log('Sound resumed');
        }
    } catch (err) {
        console.error("Can't unmute music", err);
        // Fallback: just resume sound
        if (isLooping && currentLoopSound) {
            try {
                const soundPath = getSoundPath(currentLoopSound);
                SoundPlayer.playAsset(soundPath);
            } catch (e) {
                console.error("Can't resume sound", e);
            }
        }
    }
    console.log('Music unmuted, isMusicMuted:', isMusicMuted);
}

export const toggleMusicMute = async (): Promise<boolean> => {
    if (isMusicMuted) {
        await unmuteMusic();
        return false; // Now unmuted
    } else {
        await muteMusic();
        return true; // Now muted
    }
}

export const getMusicMuted = (): boolean => {
    return isMusicMuted;
}

export const stopSound = () => {
    try {
        console.log('Stopping sound completely');
        isLooping = false;
        currentLoopSound = null;
        isMusicPlaying = false;
        isMusicMuted = true; // Mark as muted when stopped
        // Clear the handler reference
        finishedPlayingHandler = null;
        SoundPlayer.stop();
    } catch (err) {
        console.error("Can't stop the sound", err);
    }
}

export const isMusicCurrentlyPlaying = (): boolean => {
    return isMusicPlaying && isLooping && !isMusicMuted;
}