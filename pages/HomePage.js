import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SiteContext from "../comps/SiteContext.js";
import { DBClient } from "../comps/DBClient";

import UsersPage from "./UsersPage.js";
import AddUserPage from "./UsersAddPage.js";
import EditUserPage from "./UsersEditPage.js";
import MapPage from "./MapPage.js";
import SettingsPage from "./SettingsPage.js";
import TemplatePage from "./TemplatePage.js";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomePage() {
  const navigation = useNavigation();
  const [siteId, setSiteId] = useState("0");
  const [siteName, setSiteName] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("site_id").then((value) => {
      setSiteId(value);
    });
  });

  useEffect(() => {
    const getItem = async () => {
      const params = {
        TableName: "sites",
        Key: {
          site_id: { S: siteId },
        },
      };
      DBClient.getItem(params, (err, data) => {
        if (err) {
          console.err(err);
          setSiteName(null);
        } else {
          setSiteName(data.Item["site_name"].S);
        }
      });
    };
    getItem();
  }, [siteId]);

  useFocusEffect(
    React.useCallback(() => {
      navigation.navigate("Users");
      return () => {};
    }, [])
  );

  return (
    <SiteContext.Provider
      value={{
        siteId: siteId,
        setSiteId: setSiteId,
        siteName: siteName,
        setSiteName: setSiteName,
      }}
    >
      <Tab.Navigator
        initialRouteName="Users"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "royalblue",
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "Users") {
              if (focused) {
                return (
                  <Ionicons name="md-people" size={size} color="royalblue" />
                );
              } else {
                return (
                  <Ionicons
                    name="md-people-outline"
                    size={size}
                    color={color}
                  />
                );
              }
            } else if (route.name === "Map") {
              if (focused) {
                return <Ionicons name="map" size={size} color="royalblue" />;
              } else {
                return (
                  <Ionicons name="map-outline" size={size} color={color} />
                );
              }
            } else if (route.name === "Devices") {
              if (focused) {
                return (
                  <MaterialCommunityIcons
                    name="smoke-detector"
                    size={size}
                    color="royalblue"
                  />
                );
              } else {
                return (
                  <MaterialCommunityIcons
                    name="smoke-detector-outline"
                    size={size}
                    color={color}
                  />
                );
              }
            } else {
              if (focused) {
                return (
                  <Ionicons name="settings" size={size} color="royalblue" />
                );
              } else {
                return (
                  <Ionicons name="settings-outline" size={size} color={color} />
                );
              }
            }
          },
        })}
      >
        <Tab.Screen name="Users" component={UsersStack} />
        <Tab.Screen name="Map" component={MapPage} />
        <Tab.Screen name="Devices" component={TemplatePage} />
        <Tab.Screen name="Settings" component={SettingsPage} />
      </Tab.Navigator>
    </SiteContext.Provider>
  );
}

function UsersStack() {
  const navigation = useNavigation();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      navigation.navigate("UsersHome");
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator
      initialRouteName="UsersHome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="UsersHome" component={UsersPage} />
      <Stack.Screen name="UsersAdd" component={AddUserPage} />
      <Stack.Screen name="UsersEdit" component={EditUserPage} />
    </Stack.Navigator>
  );
}

export default HomePage;
