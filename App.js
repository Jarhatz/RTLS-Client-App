import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomePage from './pages/HomePage';
import JoinSitePage from './pages/JoinSite';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const Stack = createStackNavigator();

  if (loggedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions = {{headerShown: false}}>
          <Stack.Screen name = 'HomePage' component = {HomePage}/>
        </Stack.Navigator>
      </NavigationContainer>
    )
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions = {{headerShown: false}}>
          <Stack.Screen name = 'JoinSite' component = {JoinSitePage}/>
          <Stack.Screen name = 'HomePage' component = {HomePage}/>
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
};

export default App;
