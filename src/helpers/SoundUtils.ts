import { SOUNDS } from "$assets/sfx";
import SoundPlayer from "react-native-sound-player";

// Volume state management
let currentVolume: number = 1.0;
let isMuted: boolean = false;
let isLooping: boolean = false;
let currentLoopSound: SOUND_NAME | null = null;

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

let finishedPlayingHandler: (() => void) | null = null;

const handleFinishedPlaying = () => {
    if (isLooping && currentLoopSound && !isMuted) {
        try {
            const soundPath = getSoundPath(currentLoopSound);
            SoundPlayer.playAsset(soundPath);
        } catch (err) {
            console.error("Can't loop the sound file", err);
        }
    }
};

export const playSound = (soundName: SOUND_NAME, loop: boolean = false, volume: number = 1.0) => {
    try {
        const soundPath = getSoundPath(soundName);
        
        if (loop) {
            isLooping = true;
            currentLoopSound = soundName;
            currentVolume = volume;
            
            // Remove old listener if exists
            if (finishedPlayingHandler) {
                try {
                    SoundPlayer.removeEventListener('FinishedPlaying');
                } catch (e) {
                    // Ignore if listener doesn't exist
                }
            }
            // Add new listener
            finishedPlayingHandler = handleFinishedPlaying;
            SoundPlayer.addEventListener('FinishedPlaying', handleFinishedPlaying);
            
            if (!isMuted) {
                SoundPlayer.playAsset(soundPath);
            }
        } else {
            if (!isMuted) {
                SoundPlayer.playAsset(soundPath);
            }
        }
    } catch (err) {
        console.error("Can't play the sound file", err);
    }
}

export const setMusicVolume = (volume: number) => {
    currentVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    // Note: react-native-sound-player doesn't support volume control directly
    // We'll use mute/unmute as a workaround
    // For full volume control, you'd need to use react-native-sound or another library
}

export const muteMusic = () => {
    isMuted = true;
    try {
        SoundPlayer.stop();
    } catch (err) {
        console.error("Can't mute music", err);
    }
}

export const unmuteMusic = () => {
    isMuted = false;
    if (isLooping && currentLoopSound) {
        try {
            const soundPath = getSoundPath(currentLoopSound);
            SoundPlayer.playAsset(soundPath);
        } catch (err) {
            console.error("Can't unmute music", err);
        }
    }
}

export const toggleMusicMute = (): boolean => {
    if (isMuted) {
        unmuteMusic();
        return false; // Now unmuted
    } else {
        muteMusic();
        return true; // Now muted
    }
}

export const getMusicMuted = (): boolean => {
    return isMuted;
}

export const stopSound = () => {
    try {
        isLooping = false;
        currentLoopSound = null;
        if (finishedPlayingHandler) {
            try {
                SoundPlayer.removeEventListener('FinishedPlaying');
            } catch (e) {
                // Ignore if listener doesn't exist
            }
            finishedPlayingHandler = null;
        }
        SoundPlayer.stop();
    } catch (err) {
        console.error("Can't stop the sound", err);
    }
}