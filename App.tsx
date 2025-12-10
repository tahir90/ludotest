import React, { useEffect } from 'react'
import { Provider } from 'react-redux';
import { persistor, store } from '$redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '$navigation/RootNavigator';
import { setupAppStateListener, removeAppStateListener } from './src/helpers/SoundUtils';

const App = () => {
  useEffect(() => {
    // Setup app state listener to handle background/foreground
    setupAppStateListener();
    
    // Cleanup on unmount
    return () => {
      removeAppStateListener();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RootNavigator />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  )
}

export default App