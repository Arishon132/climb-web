import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './WelcomeScreen';
import GymList from './GymList';
import GymDetails from './GymDetails';
import EditGymScreen from './screens/EditGymScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="GymList" 
          component={GymList}
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
  );
}
