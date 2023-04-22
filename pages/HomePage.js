import React from 'react';
import {Dimensions, StyleSheet, SafeAreaView, Text} from 'react-native';
import {Button, TextInput, IconButton} from '@react-native-material/core';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Ionicons} from '@expo/vector-icons'; 

import TemplatePage from './TemplatePage.js';
import SettingsPage from './SettingsPage.js';

const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

const HomePage = ({navigation}) => {
  // const [loggedIn, setLoggedIn] = useState('yes');

  const Tab = createBottomTabNavigator();

  // const storeLoggedIn = async (storedValue) => {
  //   try {
  //     await AsyncStorage.setItem('isLoggedIn', storedValue);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <Tab.Navigator screenOptions = {({route}) => ({
      tabBarActiveTintColor: 'mediumseagreen',
      tabBarIcon: ({focused, color, size}) => {
        let iconName;
        if (route.name === 'Users') {
          if (focused){
            return <Ionicons name = 'md-people' size = {size} color = 'mediumseagreen'/>;
          } else {
            return <Ionicons name = 'md-people-outline' size = {size} color = {color}/>;
          }
        } else if (route.name === 'Devices') {
          if (focused){
            return <MaterialCommunityIcons name = 'smoke-detector' size = {size} color = 'mediumseagreen'/>;
          } else {
            return <MaterialCommunityIcons name = 'smoke-detector-outline' size = {size} color = {color}/>;
          }
        } else {
          if (focused){
            return <Ionicons name = 'settings' size = {size} color = 'mediumseagreen'/>;
          } else {
            return <Ionicons name = 'settings-outline' size = {size} color = {color}/>;
          }
        }
      },
    })}
    >
      <Tab.Screen name = 'Users' component = {TemplatePage}/>
      <Tab.Screen name = 'Devices' component = {TemplatePage}/>
      <Tab.Screen name = 'Settings' component = {SettingsPage}/>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: 'center',
  },
  centeredStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomePage;