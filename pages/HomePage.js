import React, {useState, useEffect, createContext} from "react";
import {Platform, Dimensions, StatusBar, StyleSheet, SafeAreaView, Text} from "react-native";
import {Button, TextInput, IconButton} from "@react-native-material/core";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {MaterialCommunityIcons, Ionicons} from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TemplatePage from "./TemplatePage.js";
import SettingsPage from "./SettingsPage.js";
import {dbClient} from "../comps/DBClient";
import SiteContext from "../comps/SiteContext.js"

const HomePage = ({route}) => {
  const [siteId, setSiteId] = useState('0');
  const [siteInfo, setSiteInfo] = useState({});
  const Tab = createBottomTabNavigator();

  useEffect(() => {
    AsyncStorage.getItem("site_id").then((value) => {
      setSiteId(value);
    });
  }, []);

  useEffect(() => {
    const getItem = async () => {
      const params = {
        TableName: 'sites',
        Key: {
          site_id: {S: siteId}
        },
      };
      dbClient.getItem(params, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          setSiteInfo(data.Item);
        }
      });
    }
    getItem();
  }, [siteId]);

  return (
    <SiteContext.Provider value = {{siteInfo, setSiteInfo}}>
      <Tab.Navigator initialRouteName = "Residents" screenOptions = {({route}) => ({
        tabBarActiveTintColor: "crimson", // "#6200ed",
        tabBarIcon: ({focused, color, size}) => {
          if (route.name === "Residents") {
            if (focused) {
              return <Ionicons name = "md-people" size = {size} color = "crimson"/>;
            } else {
              return <Ionicons name = "md-people-outline" size = {size} color = {color}/>;
            }
          } else if (route.name === "Alerts") {
            if (focused) {
              return <MaterialCommunityIcons name = "bell" size = {size} color = "crimson"/>;
            } else {
              return <MaterialCommunityIcons name = "bell-outline" size = {size} color = {color}/>;
            }
          } else if (route.name === "Devices") {
            if (focused) {
              return <MaterialCommunityIcons name = "smoke-detector" size = {size} color = "crimson"/>;
            } else {
              return <MaterialCommunityIcons name = "smoke-detector-outline" size = {size} color = {color}/>;
            }
          } else {
            if (focused) {
              return <Ionicons name = "settings" size = {size} color = "crimson"/>;
            } else {
              return <Ionicons name = "settings-outline" size = {size} color = {color}/>;
            }
          }
        },
      })}>
        <Tab.Screen name = "Residents" component = {TemplatePage}/>
        <Tab.Screen name = "Alerts" component = {TemplatePage}/>
        <Tab.Screen name = "Devices" component = {TemplatePage}/>
        <Tab.Screen name = "Settings" component = {SettingsPage} initialParams = {route.params}/>
      </Tab.Navigator>
    </SiteContext.Provider>
  );
};

export default HomePage;
