import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingPage from "./pages/LoadingPage";
import HomePage from "./pages/HomePage";
import JoinSitePage from "./pages/JoinSite";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "royalblue",
  },
};

const Stack = createStackNavigator();

function App() {
  const [siteCode, setSiteCode] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("site_id").then((value) => {
      setSiteCode(value);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingPage />;
  }
  if (siteCode === "0") {
    return (
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
              gestureDirection: "horizontal",
            }}
          >
            <Stack.Screen name="JoinSite" component={JoinSitePage} />
            <Stack.Screen name="HomePage" component={HomePage} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    );
  }
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            gestureDirection: "horizontal",
          }}
        >
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="JoinSite" component={JoinSitePage} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
