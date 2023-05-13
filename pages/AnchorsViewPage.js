import React, { useContext, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from "react-native";
import { Stack } from "react-native-flex-layout";
import { Avatar, Button, TextInput, Box } from "@react-native-material/core";
import { ActivityIndicator, Text, Dialog, Portal } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SiteContext from "../comps/SiteContext";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { DBClient } from "../comps/DBClient";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

function formatAnchorName(name) {
  if (name === "") {
    return "Ex) Room 2A Anchor";
  } else {
    let formattedName = "";
    capitalizeNext = false;
    for (let i = 0; i < name.length; i++) {
      if (i === 0) {
        formattedName += name[0];
      } else if (capitalizeNext) {
        formattedName += name[i];
        capitalizeNext = false;
      } else if (name[i] === " ") {
        formattedName += " ";
        capitalizeNext = true;
      } else {
        formattedName += name[i].toLowerCase();
      }
    }
    return formattedName;
  }
}

function ViewAnchorsPage({ route, navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { anchorID, currentAnchorName, mac, currentLocation } = route.params;
  const [anchorName, setAnchorName] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Stack
          style={styles.centered}
          direction="column"
          spacing={height * 0.05}
        >
          <Text>
            <Text
              style={{
                fontWeight: "bold",
              }}
              variant="headlineMedium"
            >
              Anchor
            </Text>
            <Text
              style={{ color: "royalblue", fontStyle: "italic" }}
              variant="headlineMedium"
            >
              {" #" + anchorID.substring(anchorID.length - 4, anchorID.length)}
            </Text>
          </Text>
          <Box style={styles.boxStyle}>
            <Stack
              style={styles.boxInsideStyle}
              direction="column"
              spacing={height * 0.01}
            >
              <Text variant="titleMedium">Anchor name:</Text>
              <TextInput
                style={{ width: width * 0.8 }}
                label="Name"
                placeholder={formatAnchorName(currentAnchorName)}
                color="royalblue"
                variant="outlined"
                value={anchorName}
                onChangeText={setAnchorName}
                leading={(props) => (
                  <MaterialCommunityIcons
                    name="alphabetical-variant"
                    size={24}
                    color="black"
                  />
                )}
              />
              <Text style={{ color: "royalblue" }} variant="bodyMedium">
                *Enter a name for the anchor to easily identify and monitor this
                anchor
              </Text>
            </Stack>
          </Box>
          <Box style={styles.boxStyle}>
            <Stack
              style={styles.boxInsideStyle}
              direction="column"
              spacing={height * 0.01}
            >
              <Text variant="titleMedium">Anchor Location:</Text>
              <Button
                style={{ width: width * 0.5, alignSelf: "center" }}
                title="Choose Location"
                color="royalblue"
                leading={(props) => (
                  <MaterialCommunityIcons
                    name="target"
                    size={20}
                    color="white"
                  />
                )}
                onPress={() => navigation.navigate("AnchorsMap")}
              />
              <Text style={{ color: "royalblue" }} variant="bodyMedium">
                *Select a phsyical position for the anchor using the site map
              </Text>
            </Stack>
          </Box>
          <Stack
            style={styles.bottomBtnStyle}
            direction="row"
            spacing={width * 0.1}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("AnchorsHome")}
            >
              <View>
                <Button
                  style={{
                    width: width * 0.3,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "royalblue",
                  }}
                  variant="outlined"
                  title="Back"
                  color="royalblue"
                  leading={(props) => (
                    <Ionicons name="arrow-back" size={24} color="royalblue" />
                  )}
                  onPress={() => navigation.navigate("AnchorsHome")}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log("Save Button Clicked!")}
            >
              <View>
                <Button
                  style={{
                    width: width * 0.3,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Save"
                  color="royalblue"
                  trailing={(props) => (
                    <Ionicons name="arrow-forward" size={24} color="white" />
                  )}
                  onPress={() => console.log("Save Button Clicked!")}
                />
              </View>
            </TouchableOpacity>
          </Stack>
        </Stack>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "whitesmoke",
  },
  centered: {
    flex: 1,
    width: width,
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "whitesmoke",
  },
  boxStyle: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  boxInsideStyle: {
    paddingTop: height * 0.025,
    paddingBottom: height * 0.025,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
    justifyContent: "center",
  },
  bottomBtnStyle: {
    width: width * 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ViewAnchorsPage;
