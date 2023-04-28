import React, { useContext } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Button } from "@react-native-material/core";
import { Text, Divider } from "react-native-paper";
import { Stack } from "react-native-flex-layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SiteContext from "../comps/SiteContext";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

function SettingsPage({ navigation, route }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);

  const handlePress = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const values = await AsyncStorage.multiGet(keys);
    console.log("Storage: ", values);
    console.log("Site ID: ", siteId);
    console.log("Site Name: ", siteName);
  };

  // const handleDelete = async () => {
  //   await AsyncStorage.removeItem("signedIn");
  // };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <ScrollView style={{ backgroundColor: "whitesmoke" }}>
        <Stack
          style={styles.centered}
          direction="column"
          spacing={height * 0.03}
        >
          <Text
            style={{
              color: "black",
              alignSelf: "flex-start",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Site Name:
          </Text>
          <Text
            style={{ color: "dimgray", textAlign: "center" }}
            variant="headlineLarge"
          >
            {siteName}
          </Text>
          <Divider style={{ width: width * 0.9 }} bold={true} />
          <Text
            style={{
              color: "black",
              alignSelf: "flex-start",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Leave Site:
          </Text>
          <Text
            style={{ color: "dimgray", textAlign: "center" }}
            variant="bodyMedium"
          >
            You can always rejoin a site with the unique Site Code or the QR
            Code.
          </Text>
          <Button
            style={{
              width: width * 0.75,
              borderWidth: 1,
              borderColor: "red",
            }}
            variant="outlined"
            title="Leave Site"
            color="red"
            onPress={() => {
              Alert.alert(
                "Leave Site",
                "Are you sure you would like to leave the site?",
                [
                  {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => {
                      AsyncStorage.setItem("site_id", "0");
                      setSiteId("0");
                      setSiteName(null);
                      navigation.navigate("JoinSite");
                    },
                  },
                  { text: "No" },
                ]
              );
            }}
          />
          <Divider style={{ width: width * 0.9 }} bold={true} />
          <Text
            style={{
              color: "black",
              alignSelf: "flex-start",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Debug Options:
          </Text>
          <Button
            style={{ width: width * 0.75, borderWidth: 1, borderColor: "blue" }}
            variant="outlined"
            title="Show Vars"
            color="blue"
            onPress={handlePress}
          />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: height * 0.015,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
  },
});

export default SettingsPage;
