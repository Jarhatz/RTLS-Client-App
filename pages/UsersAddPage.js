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
const tagIdImage = require("../images/tag-id-dialog.jpg");

function AddUserPage({ navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const [userName, setUserName] = useState("");
  const [userTag, setUserTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleDialog1, setVisibleDialog1] = useState(false);
  const [visibleDialog2, setVisibleDialog2] = useState(false);
  const [visibleDialog3, setVisibleDialog3] = useState(false);
  const [visibleDialog4, setVisibleDialog4] = useState(false);
  let response1 = false;
  let response2 = false;
  let response3 = false;
  let response4 = false;

  const handleNavigate = () => {
    if (
      (response2 && response3 && response4) ||
      (response3 && response4) ||
      response1
    ) {
      setLoading(false);
      navigation.navigate("UsersHome");
    }
  };

  const handleAddBtn = async () => {
    Keyboard.dismiss();
    setLoading(true);
    if (userName.length < 4) {
      setLoading(false);
      showDialog(2); // Invalid User Name
    } else {
      const getUserParams = {
        TableName: "sites_" + siteId + "_users",
        Key: {
          user_name: {
            S: userName.toUpperCase().trim().replace(/\s+/g, " "),
          },
        },
      };
      try {
        const getUserResponse = await dbClient.getItem(getUserParams);
        if (getUserResponse.Item === undefined) {
          if (userTag.length === 0) {
            // USER NAME ONLY PROVIDED
            const putUserParams = {
              TableName: "sites_" + siteId + "_users",
              Item: {
                user_name: {
                  S: userName.toUpperCase().trim().replace(/\s+/g, " "),
                },
                user_tag: { S: "" },
                location: { L: [] },
                alert: { S: "0" },
              },
            };
            try {
              const putUserResponse = await dbClient.putItem(putUserParams);
              response1 = true;
              handleNavigate();
            } catch (error) {
              console.error(error);
            }
          } else {
            // USER NAME PROVIDED WITH TAG ID
            const tagId = "SITE_" + siteId + "_TAG_" + userTag.toUpperCase();
            const getTagParams = {
              TableName: "sites_" + siteId + "_tags",
              Key: {
                tag_id: {
                  S: tagId,
                },
              },
            };
            try {
              const getTagResponse = await dbClient.getItem(getTagParams);
              if (getTagResponse.Item === undefined) {
                setLoading(false);
                showDialog(4); // Invalid Tag ID
              } else {
                if (getTagResponse.Item["user_name"].S !== "") {
                  const updateUserParams = {
                    TableName: "sites_" + siteId + "_users",
                    Key: {
                      user_name: { S: getTagResponse.Item["user_name"].S },
                    },
                    UpdateExpression: "SET user_tag = :value1",
                    ExpressionAttributeValues: {
                      ":value1": { S: "" },
                    },
                    ReturnValues: "ALL_NEW",
                  };
                  try {
                    const updateUserResponse = await dbClient.updateItem(
                      updateUserParams
                    );
                    response2 = true;
                  } catch (error) {
                    console.error(error);
                  }
                }
                const putUserParams = {
                  TableName: "sites_" + siteId + "_users",
                  Item: {
                    user_name: {
                      S: userName.toUpperCase().trim().replace(/\s+/g, " "),
                    },
                    user_tag: { S: tagId },
                    location: { L: [] },
                    alert: { S: "0" },
                  },
                };
                try {
                  const putUserResponse = await dbClient.putItem(putUserParams);
                  response3 = true;
                } catch (error) {
                  console.error(error);
                }
                const updateTagParams = {
                  TableName: "sites_" + siteId + "_tags",
                  Key: {
                    tag_id: {
                      S: tagId,
                    },
                  },
                  UpdateExpression: "SET user_name = :value1",
                  ExpressionAttributeValues: {
                    ":value1": {
                      S: userName.toUpperCase().trim().replace(/\s+/g, " "),
                    },
                  },
                  ReturnValues: "ALL_NEW",
                };
                try {
                  const updateTagResponse = await dbClient.updateItem(
                    updateTagParams
                  );
                  response4 = true;
                } catch (error) {
                  console.error(error);
                }
                handleNavigate();
              }
            } catch (error) {
              console.error(error);
            }
          }
        } else {
          setLoading(false);
          showDialog(3); // Invalid User Name
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const showDialog = (dialogType) => {
    if (dialogType === 1) {
      setVisibleDialog1(true);
    } else if (dialogType === 2) {
      setVisibleDialog2(true);
    } else if (dialogType === 3) {
      setVisibleDialog3(true);
    } else {
      setVisibleDialog4(true);
    }
  };

  const hideDialog = (dialogType) => {
    if (dialogType === 1) {
      setVisibleDialog1(false);
    } else if (dialogType === 2) {
      setVisibleDialog2(false);
    } else if (dialogType === 3) {
      setVisibleDialog3(false);
    } else {
      setVisibleDialog4(false);
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
                Add User
              </Text>
              <Box style={styles.addBoxStyle}>
                <Stack
                  style={styles.addBoxInsideStyle}
                  direction="column"
                  spacing={height * 0.01}
                >
                  <Text variant="titleMedium">Enter the name of the user:</Text>
                  <TextInput
                    style={{ width: width * 0.8 }}
                    label="Full Name"
                    placeholder="First Last"
                    color="royalblue"
                    variant="standard"
                    leading={(props) => (
                      <Ionicons name="person-sharp" size={24} color="black" />
                    )}
                    value={userName}
                    onChangeText={(text) => setUserName(text)}
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
                  <Text variant="titleMedium">Pair a tag for the user:</Text>
                  <Stack
                    style={{ justifyContent: "space-between" }}
                    direction="row"
                  >
                    <TextInput
                      style={{ width: width * 0.4 }}
                      label="Tag ID"
                      placeholder="----"
                      maxLength={4}
                      color="royalblue"
                      variant="standard"
                      leading={(props) => (
                        <MaterialCommunityIcons
                          name="watch"
                          size={24}
                          color="black"
                        />
                      )}
                      keyboardType="name-phone-pad"
                      value={userTag}
                      onChangeText={(text) => setUserTag(text)}
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
                            borderColor: "royalblue",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          variant="text"
                          title="Tag ID"
                          color="royalblue"
                          trailing={(props) => (
                            <Ionicons
                              name="help-circle-outline"
                              size={24}
                              color="royalblue"
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
                  <Text style={{ color: "royalblue" }} variant="bodyMedium">
                    *[Optional] can be paired at any time
                  </Text>
                </Stack>
              </Box>
              <Stack
                style={styles.bottomBtnStyle}
                direction="row"
                spacing={width * 0.1}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate("UsersHome")}
                >
                  <View>
                    <Button
                      style={{
                        width: width * 0.4,
                        height: height * 0.05,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingTop: 10,
                        paddingBottom: 10,
                        borderWidth: 2,
                        borderColor: "royalblue",
                      }}
                      variant="outlined"
                      title="Back"
                      color="royalblue"
                      leading={(props) => (
                        <Ionicons
                          name="arrow-back"
                          size={24}
                          color="royalblue"
                        />
                      )}
                      onPress={() => navigation.navigate("UsersHome")}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddBtn}>
                  <View>
                    <Button
                      style={{
                        width: width * 0.4,
                        height: height * 0.05,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Add"
                      color="royalblue"
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
              <Dialog
                style={{ backgroundColor: "white" }}
                visible={visibleDialog1}
                onDismiss={() => hideDialog(1)}
              >
                <Dialog.Title
                  style={{ color: "royalblue", fontWeight: "bold" }}
                >
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
                      tag to a user to monitor their whereabouts. Tags can be
                      paired to only one user at a time. They can also be
                      updated or added to a user at any point in time.
                      {"\n"}
                    </Text>
                    <Image
                      source={tagIdImage}
                      style={{ width: width / 2, height: width / 2 }}
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
                <Dialog.Title
                  style={{ color: "royalblue", fontWeight: "bold" }}
                >
                  Invalid User Name
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    Please enter a full name for the user you wish to add. The
                    name you added is two short.
                    {"\n"}
                  </Text>
                  <Text style={{ fontWeight: "bold" }} variant="labelLarge">
                    User: [{userName.toUpperCase()}]
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
              <Dialog
                style={{ backgroundColor: "white" }}
                visible={visibleDialog3}
                onDismiss={() => hideDialog(3)}
              >
                <Dialog.Title
                  style={{ color: "royalblue", fontWeight: "bold" }}
                >
                  Invalid User Name
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    The user name you have entered already exists. Please add a
                    new name or edit the existing user.{"\n"}
                  </Text>
                  <Text style={{ fontWeight: "bold" }} variant="labelLarge">
                    User: [{userName.toUpperCase()}]
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    title="OK"
                    color="royalblue"
                    onPress={() => hideDialog(3)}
                  />
                </Dialog.Actions>
              </Dialog>
              <Dialog
                style={{ backgroundColor: "white" }}
                visible={visibleDialog4}
                onDismiss={() => hideDialog(4)}
              >
                <Dialog.Title
                  style={{ color: "royalblue", fontWeight: "bold" }}
                >
                  Invalid Tag ID
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    The Tag ID you have entered does not exist. Please enter a
                    valid Tag ID to pair it to a new user.{"\n"}
                  </Text>
                  <Text style={{ fontWeight: "bold" }} variant="labelLarge">
                    Tag ID: [{userTag.toUpperCase()}]
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    title="OK"
                    color="royalblue"
                    onPress={() => hideDialog(4)}
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
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
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
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AddUserPage;
