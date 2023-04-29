import React, { useContext, useState } from "react";
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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from "react-native";
import { Stack } from "react-native-flex-layout";
import { Button, TextInput, Box } from "@react-native-material/core";
import {
  ActivityIndicator,
  Text,
  IconButton,
  Card,
  Dialog,
  Portal,
  DataTable,
  Divider,
} from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SiteContext from "../comps/SiteContext";
import { dbClient } from "../comps/DBClient";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

function AddResidentPage({ navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const tagIdImage = require("../images/tag-id-dialog.jpg");
  const [residentName, setResidentName] = useState("");
  const [residentTag, setResidentTag] = useState("");
  const [visibleDialog1, setVisibleDialog1] = useState(false);
  const [visibleDialog2, setVisibleDialog2] = useState(false);
  const [visibleDialog3, setVisibleDialog3] = useState(false);

  const handleSubmitBtn = async () => {};

  const handleAddBtn = () => {
    Keyboard.dismiss();
    console.log(siteId);
    console.log(siteName);
    if (residentName.length == 0) {
      showDialog(2);
    } else {
      console.log("Added User!");
    }
  };

  const handleBackBtn = () => {
    navigation.navigate("HomeResidents");
  };

  const showDialog = (dialogType) => {
    if (dialogType === 1) {
      setVisibleDialog1(true);
    } else if (dialogType === 2) {
      setVisibleDialog2(true);
    } else {
      setVisibleDialog3(true);
    }
  };

  const hideDialog = (dialogType) => {
    if (dialogType === 1) {
      setVisibleDialog1(false);
    } else if (dialogType === 2) {
      setVisibleDialog2(false);
    } else {
      setVisibleDialog3(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.select({ ios: 0, android: 50 })}
        >
          <View style={{ flex: 1, backgroundColor: "whitesmoke" }}>
            <Stack
              style={styles.addCentered}
              direction="column"
              spacing={height * 0.05}
            >
              <Text
                style={{
                  fontWeight: "bold",
                }}
                variant="headlineLarge"
              >
                Add Resident
              </Text>
              <Box style={styles.addBoxStyle}>
                <Stack
                  style={styles.addBoxInsideStyle}
                  direction="column"
                  spacing={height * 0.01}
                >
                  <Text variant="titleMedium">
                    Enter the name of the resident:
                  </Text>
                  <TextInput
                    style={{ width: width * 0.8 }}
                    label="Full Name"
                    placeholder="First Last"
                    color="crimson"
                    variant="standard"
                    leading={(props) => (
                      <Ionicons name="person-sharp" size={24} color="black" />
                    )}
                    value={residentName}
                    onChangeText={(text) => setResidentName(text)}
                  />
                  <Text style={{ color: "crimson" }} variant="bodyMedium">
                    *[Required]
                  </Text>
                </Stack>
              </Box>
              <Box style={styles.addBoxStyle}>
                <Stack
                  style={styles.addBoxInsideStyle}
                  direction="column"
                  spacing={height * 0.01}
                >
                  <Text variant="titleMedium">
                    Pair a tag for the resident:
                  </Text>
                  <Stack
                    style={{ justifyContent: "space-between" }}
                    direction="row"
                  >
                    <TextInput
                      style={{ width: width * 0.4 }}
                      label="Tag ID"
                      placeholder="----"
                      color="crimson"
                      variant="standard"
                      leading={(props) => (
                        <MaterialCommunityIcons
                          name="watch"
                          size={24}
                          color="black"
                        />
                      )}
                      keyboardType="name-phone-pad"
                      value={residentTag}
                      onChangeText={(text) => setResidentTag(text)}
                    />
                    <TouchableOpacity
                      style={{ alignItems: "center", justifyContent: "center" }}
                      onPress={() => {
                        Keyboard.dismiss();
                        showDialog(1);
                      }}
                    >
                      <View>
                        <Button
                          style={{
                            borderWidth: 0,
                            borderColor: "crimson",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          variant="outlined"
                          title="Tag ID"
                          color="crimson"
                          leading={(props) => (
                            <Ionicons
                              name="help-circle-outline"
                              size={24}
                              color="crimson"
                            />
                          )}
                          onPress={() => {
                            Keyboard.dismiss();
                            showDialog(1);
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </Stack>
                  <Text style={{ color: "crimson" }} variant="bodyMedium">
                    *[Optional] can be paired at any time
                  </Text>
                </Stack>
              </Box>
              <Stack
                style={styles.bottomBtnStyle}
                direction="row"
                spacing={width * 0.1}
              >
                <TouchableOpacity onPress={handleBackBtn}>
                  <View>
                    <Button
                      style={{
                        width: width * 0.4,
                        height: height * 0.065,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingTop: 10,
                        paddingBottom: 10,
                        borderWidth: 2,
                        borderColor: "crimson",
                      }}
                      variant="outlined"
                      title="Back"
                      color="crimson"
                      leading={(props) => (
                        <Ionicons name="arrow-back" size={24} color="crimson" />
                      )}
                      onPress={handleBackBtn}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddBtn}>
                  <View>
                    <Button
                      style={{
                        width: width * 0.4,
                        height: height * 0.065,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Add"
                      color="crimson"
                      leading={(props) => (
                        <Ionicons
                          name="person-add-sharp"
                          size={24}
                          color="white"
                        />
                      )}
                      onPress={handleAddBtn}
                    />
                  </View>
                </TouchableOpacity>
              </Stack>
            </Stack>
            <Portal>
              {/* <ActivityIndicator animating={true} color="crimson" /> */}
              <Dialog
                style={{ backgroundColor: "white" }}
                visible={visibleDialog1}
                onDismiss={() => hideDialog(1)}
              >
                <Dialog.Title style={{ color: "crimson", fontWeight: "bold" }}>
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
                      The Tag ID is a 4-character field that is used to pair a
                      tag to a resident to monitor their whereabouts. Tags can
                      be paired to only one resident at a time. They can also be
                      updated or added to a resident at any point in time.
                      {"\n"}
                    </Text>
                    <Image
                      source={tagIdImage}
                      style={{ width: 200, height: 200 }}
                    />
                    <Text style={{ fontWeight: "bold" }} variant="labelLarge">
                      {"\n"}You can find the Tag ID on the back of the tag
                      device. It is the last 4 characters of the text underneath
                      the QR code.
                    </Text>
                  </Stack>
                </Dialog.Content>
              </Dialog>
              <Dialog
                style={{ backgroundColor: "white" }}
                visible={visibleDialog2}
                onDismiss={() => hideDialog(2)}
              >
                <Dialog.Title style={{ color: "crimson", fontWeight: "bold" }}>
                  Invalid Name
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    Please enter a name for the resident you wish to add.
                  </Text>
                  <Text style={{ fontWeight: "bold" }} variant="labelLarge">
                    [Firstname Lastname]
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    title="OK"
                    color="crimson"
                    onPress={() => hideDialog(2)}
                  />
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    width: width,
    alignItems: "center",
    paddingBottom: height * 0.015,
  },
  addCentered: {
    flex: 1,
    width: width,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingTop: height * 0.05,
    paddingBottom: height * 0.05,
  },
  addBoxStyle: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: "white",
    borderColor: "lightgray",
    borderWidth: 1,
  },
  addBoxInsideStyle: {
    paddingTop: height * 0.025,
    paddingBottom: height * 0.025,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
    justifyContent: "center",
  },
  bottomBtnStyle: {
    width: width * 0.9,
    height: height * 0.065,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AddResidentPage;
