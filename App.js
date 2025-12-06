import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import WelcomeScreen from './WelcomeScreen';
import GymList from './GymList';
import GymDetails from './GymDetails';
import EditGymScreen from './screens/EditGymScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import { AuthProvider } from './contexts/AuthContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer style={{ flex: 1, height: '100vh', overflow: 'hidden' }}>
        <Stack.Navigator screenOptions={{ 
          cardStyle: { flex: 1 },
          contentStyle: Platform.OS === 'web' ? { height: '100%' } : { flex: 1 }
        }}>
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SignIn" 
            component={SignInScreen}
            options={{ 
              title: 'Sign In',
              headerStyle: {
                backgroundColor: '#f8fafc',
              },
              headerTintColor: '#1e293b',
              headerTitleStyle: {
                fontWeight: '700',
              },
            }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen}
            options={{ 
              title: 'Create Account',
              headerStyle: {
                backgroundColor: '#ffffff',
              },
              headerTintColor: '#1e293b',
              headerTitleStyle: {
                fontWeight: '700',
              },
            }}
          />
          <Stack.Screen 
            name="GymList" 
            component={GymList}
            options={{ 
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="GymDetails" 
            component={GymDetails}
          />
          <Stack.Screen 
            name="EditGym" 
            component={EditGymScreen} 
            options={{ title: 'Edit Gym' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

