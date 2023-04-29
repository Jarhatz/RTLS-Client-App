import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SiteContext from "../comps/SiteContext.js";
import { dbClient } from "../comps/DBClient";
import TemplatePage from "./TemplatePage.js";
import ResidentsPage from "./ResidentsPage.js";
import AddResidentPage from "./AddResidentsPage.js";
import SettingsPage from "./SettingsPage.js";

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
      dbClient.getItem(params, (err, data) => {
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
      navigation.navigate("Residents");
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
        initialRouteName="Residents"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "crimson",
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "Residents") {
              if (focused) {
                return (
                  <Ionicons name="md-people" size={size} color="crimson" />
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
            } else if (route.name === "Alerts") {
              if (focused) {
                return (
                  <MaterialCommunityIcons
                    name="bell"
                    size={size}
                    color="crimson"
                  />
                );
              } else {
                return (
                  <MaterialCommunityIcons
                    name="bell-outline"
                    size={size}
                    color={color}
                  />
                );
              }
            } else if (route.name === "Devices") {
              if (focused) {
                return (
                  <MaterialCommunityIcons
                    name="smoke-detector"
                    size={size}
                    color="crimson"
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
                return <Ionicons name="settings" size={size} color="crimson" />;
              } else {
                return (
                  <Ionicons name="settings-outline" size={size} color={color} />
                );
              }
            }
          },
        })}
      >
        <Tab.Screen name="Residents" component={ResidentsStack} />
        <Tab.Screen name="Alerts" component={TemplatePage} />
        <Tab.Screen name="Devices" component={TemplatePage} />
        <Tab.Screen name="Settings" component={SettingsPage} />
      </Tab.Navigator>
    </SiteContext.Provider>
  );
}

function ResidentsStack() {
  const navigation = useNavigation();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      navigation.navigate("HomeResidents");
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator
      initialRouteName="HomeResidents"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="HomeResidents" component={ResidentsPage} />
      <Stack.Screen name="AddResident" component={AddResidentPage} />
    </Stack.Navigator>
  );
}

export default HomePage;
