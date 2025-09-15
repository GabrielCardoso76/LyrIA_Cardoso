import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatScreen from './src/pages/ChatScreen';
import LoginScreen from './src/pages/LoginScreen';
import RegistrationScreen from './src/pages/RegistrationScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('chat'); // Start with chat for now

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onNavigateToRegister={() => handleNavigate('register')} />;
      case 'register':
        return <RegistrationScreen onNavigateToLogin={() => handleNavigate('login')} />;
      case 'chat':
      default:
        // In a real app, we'd pass a prop to the header to show a "login" button
        // For now, the only way to get to login is to change the initial state above
        return <ChatScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      {renderScreen()}
    </SafeAreaProvider>
  );
}

export default App;
