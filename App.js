import "react-native-gesture-handler";
import React, {useState, useEffect} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingPage from "./pages/LoadingPage";
import HomePage from "./pages/HomePage";
import JoinSitePage from "./pages/JoinSite";

const Stack = createStackNavigator();

const App = () => {
  const [siteCode, setSiteCode] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("site_id").then((value) => {
      setSiteCode(value);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <LoadingPage/>
    )
  }
  if (siteCode === "0") {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions = {{headerShown: false, gestureEnabled: false, gestureDirection: 'horizontal'}}>
          <Stack.Screen name = "JoinSite" component = {JoinSitePage}/>
          <Stack.Screen name = "HomePage" component = {HomePage}/> 
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions = {{headerShown: false, gestureEnabled: false, gestureDirection: 'horizontal'}}>
        <Stack.Screen name = "HomePage" component = {HomePage}/>
        <Stack.Screen name = "JoinSite" component = {JoinSitePage}/> 
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;
