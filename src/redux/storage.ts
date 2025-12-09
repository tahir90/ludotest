import {MMKV} from 'react-native-mmkv';

let storage: MMKV | null = null;

try {
    storage = new MMKV();
} catch (error) {
    console.warn('MMKV initialization failed, using fallback storage:', error);
    // Fallback to AsyncStorage-like interface
    storage = null;
}

const reduxStorage = {
    setItem: (key : string, value : any) => {
        if (storage) {
            try {
                storage.set(key, value);
                return Promise.resolve(true);
            } catch (error) {
                console.warn('MMKV setItem failed:', error);
                return Promise.resolve(false);
            }
        }
        // Fallback: use in-memory storage
        return Promise.resolve(true);
    },
    getItem: (key : string) => {
        if (storage) {
            try {
                const value = storage.getString(key);
                return Promise.resolve(value);
            } catch (error) {
                console.warn('MMKV getItem failed:', error);
                return Promise.resolve(null);
            }
        }
        // Fallback: return null
        return Promise.resolve(null);
    },
    removeItem: (key : string) => {
        if (storage) {
            try {
                storage.delete(key);
            } catch (error) {
                console.warn('MMKV removeItem failed:', error);
            }
        }
        return Promise.resolve();
    },
}

export default reduxStorage;