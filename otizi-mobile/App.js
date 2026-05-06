// App.js — OtiZi Mobile Entry Point
import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/store/authStore';
import AppNavigator from './src/navigation/AppNavigator';

import { registerForPushNotificationsAsync, sendTokenToBackend } from './src/services/notificationService';
import { useAuth } from './src/store/authStore';

function AppContent() {
  const { token, user } = useAuth();

  React.useEffect(() => {
    if (token && user) {
      registerForPushNotificationsAsync().then(pushToken => {
        if (pushToken) {
          sendTokenToBackend(pushToken);
        }
      });
    }
  }, [token, user]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
