import React, { useContext, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [visibleDialog1, setVisibleDialog1] = useState(false);
  const [visibleDialog2, setVisibleDialog2] = useState(false);

  const showDialog = (dialogType) => {
    if (dialogType === 1) {
      setVisibleDialog1(true);
    } else {
      setVisibleDialog2(true);
    }
  };

  const hideDialog = (dialogType) => {
    if (dialogType === 1) {
      setVisibleDialog1(false);
    } else {
      setVisibleDialog2(false);
    }
  };

  const handleSaveBtn = async () => {
    Keyboard.dismiss();
    setLoading(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, backgroundColor: "whitesmoke" }}>
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
                {" #" +
                  anchorID.substring(anchorID.length - 4, anchorID.length)}
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
                  *Enter a name for the anchor to easily identify and monitor
                  this anchor
                </Text>
              </Stack>
            </Box>
            <Box style={styles.boxStyle}>
              <Stack
                style={styles.boxInsideStyle}
                direction="column"
                spacing={height * 0.01}
              >
                <Text>
                  <Text variant="titleMedium">Anchor Location: </Text>
                  {currentLocation[0].S === "" ? (
                    <Text style={{ color: "gray" }}>[x: --, y: --]</Text>
                  ) : (
                    <Text style={{ color: "gray" }}>
                      [x: {currentLocation[0]}, y: {currentLocation[1]}]
                    </Text>
                  )}
                </Text>
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
                  onPress={() => {
                    navigation.navigate("AnchorsMap", {
                      anchorID: anchorID,
                      currentAnchorName: currentAnchorName,
                      mac: mac,
                      currentLocation: currentLocation,
                    });
                  }}
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
              <TouchableOpacity onPress={handleSaveBtn}>
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
                    onPress={handleSaveBtn}
                  />
                </View>
              </TouchableOpacity>
            </Stack>
          </Stack>
          <Portal>
            <Dialog
              style={{ backgroundColor: "white" }}
              visible={visibleDialog1}
              onDismiss={() => hideDialog(1)}
            >
              <Dialog.Title style={{ color: "royalblue", fontWeight: "bold" }}>
                What is Tag ID?
              </Dialog.Title>
              <Dialog.Content>
                <Stack
                  style={{
                    alignItems: "center",
                    justifyContent: "space-evenly",
                  }}
                  direction="column"
                >
                  <Text variant="bodyMedium">
                    The Tag ID is a 4-character field that is used to pair a tag
                    to a user to monitor their whereabouts. Tags can be paired
                    to only one user at a time. They can also be updated or
                    added to a user at any point in time.
                    {"\n"}
                  </Text>
                </Stack>
              </Dialog.Content>
            </Dialog>
            <Dialog
              style={{ backgroundColor: "white" }}
              visible={visibleDialog2}
              onDismiss={() => hideDialog(2)}
            >
              <Dialog.Title style={{ color: "royalblue", fontWeight: "bold" }}>
                Invalid Tag ID
              </Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">
                  The Tag ID you entered is the same as the current Tag ID for
                  this user. Please enter an alternate Tag ID to edit this user.
                  {"\n"}
                </Text>
                <Text style={{ fontWeight: "bold" }} variant="labelLarge">
                  User:
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  title="OK"
                  color="royalblue"
                  onPress={() => hideDialog(2)}
                />
              </Dialog.Actions>
            </Dialog>
            <ActivityIndicator
              style={{
                flex: 1,
                alignSelf: "center",
                width: width * 0.01,
                height: width * 0.01,
              }}
              color="royalblue"
              size="large"
              animating={loading}
            />
          </Portal>
        </View>
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
