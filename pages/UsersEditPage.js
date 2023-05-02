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

function EditUserPage({ route, navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { userName, currentUserTag } = route.params;
  const [userTag, setUserTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleDialog1, setVisibleDialog1] = useState(false);
  const [visibleDialog2, setVisibleDialog2] = useState(false);
  const [visibleDialog3, setVisibleDialog3] = useState(false);
  let response1 = false;
  let response2 = false;
  let response3 = false;

  const formatUserName = (name) => {
    const spaceIndex = name.indexOf(" ");
    if (spaceIndex < 0) {
      return name[0] + name.substring(1, name.length).toLowerCase();
    } else {
      return (
        name[0] +
        name.substring(1, spaceIndex).toLowerCase() +
        " " +
        name[spaceIndex + 1] +
        name.substring(spaceIndex + 2, name.length).toLowerCase()
      );
    }
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

  const handleDeleteBtn = async () => {
    Keyboard.dismiss();
    setLoading(true);
    const userParams = {
      TableName: "sites_" + siteId + "_users",
      Key: {
        user_name: { S: userName },
      },
    };
    try {
      const getResponse = await dbClient.getItem(userParams);
      if (getResponse.Item !== undefined) {
        if (getResponse.Item.user_tag.S !== "") {
          const tagParams = {
            TableName: "sites_" + siteId + "_tags",
            Key: {
              tag_id: {
                S: getResponse.Item.user_tag.S,
              },
            },
            UpdateExpression: "SET user_name = :value1",
            ExpressionAttributeValues: {
              ":value1": {
                S: "",
              },
            },
            ReturnValues: "ALL_NEW",
          };
          try {
            const updateResponse = await dbClient.updateItem(tagParams);
          } catch (error) {
            console.log(error);
          }
        }
        const deleteResponse = await dbClient.deleteItem(userParams);
        response1 = true;
        if (response1) {
          setLoading(false);
          navigation.navigate("UsersHome");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOkBtn = async () => {
    Keyboard.dismiss();
    setLoading(true);
    if (userTag.length < 4) {
      setLoading(false);
      showDialog(3);
    } else {
      tagId = "SITE_" + siteId + "_TAG_" + userTag.toUpperCase();
      if (currentUserTag === tagId) {
        setLoading(false);
        showDialog(2);
      } else {
        try {
          const newTagParams = {
            TableName: "sites_" + siteId + "_tags",
            Key: {
              tag_id: { S: tagId },
            },
          };
          const response = await dbClient.getItem(newTagParams);
          if (response.Item === undefined) {
            setLoading(false);
            showDialog(3);
          } else {
            if (currentUserTag !== "") {
              try {
                const updateOldTagParams = {
                  TableName: "sites_" + siteId + "_tags",
                  Key: {
                    tag_id: { S: currentUserTag },
                  },
                  UpdateExpression: "SET user_name = :value1",
                  ExpressionAttributeValues: {
                    ":value1": { S: "" },
                  },
                  ReturnValues: "ALL_NEW",
                };
                const updateOldTagResponse = await dbClient.updateItem(
                  updateOldTagParams
                );
              } catch (error) {
                console.log(error);
              }
            }
            if (response.Item.user_name.S !== "") {
              try {
                const updateOldUserParams = {
                  TableName: "sites_" + siteId + "_users",
                  Key: {
                    user_name: { S: response.Item.user_name.S },
                  },
                  UpdateExpression: "SET user_tag = :value1",
                  ExpressionAttributeValues: {
                    ":value1": { S: "" },
                  },
                  ReturnValues: "ALL_NEW",
                };
                const updateOldUserResponse = await dbClient.updateItem(
                  updateOldUserParams
                );
              } catch (error) {
                console.log(error);
              }
            }
            try {
              const updateUserParams = {
                TableName: "sites_" + siteId + "_users",
                Key: {
                  user_name: { S: userName },
                },
                UpdateExpression: "SET user_tag = :value1",
                ExpressionAttributeValues: {
                  ":value1": { S: tagId },
                },
                ReturnValues: "ALL_NEW",
              };
              const updateUserResponse = await dbClient.updateItem(
                updateUserParams
              );
              response2 = true;
            } catch (error) {
              console.log(error);
            }
            try {
              const updateTagParams = {
                TableName: "sites_" + siteId + "_tags",
                Key: {
                  tag_id: { S: tagId },
                },
                UpdateExpression: "SET user_name = :value1",
                ExpressionAttributeValues: {
                  ":value1": { S: userName },
                },
                ReturnValues: "ALL_NEW",
              };
              const updateTagResponse = await dbClient.updateItem(
                updateTagParams
              );
              response3 = true;
            } catch (error) {
              console.log(error);
            }
            if (response2 && response3) {
              setLoading(false);
              navigation.navigate("UsersHome");
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
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
                Edit User
              </Text>
              <Box style={styles.addBoxStyle}>
                <Stack
                  style={styles.addBoxInsideStyle}
                  direction="column"
                  spacing={height * 0.01}
                >
                  <Text variant="titleMedium">Selected user:</Text>
                  <TextInput
                    style={{ width: width * 0.8 }}
                    editable={false}
                    label="Name"
                    color="royalblue"
                    variant="filled"
                    leading={(props) => (
                      <Ionicons name="person-sharp" size={24} color="black" />
                    )}
                    value={formatUserName(userName)}
                  />
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
                      placeholder={
                        currentUserTag === ""
                          ? "----"
                          : currentUserTag.substring(
                              currentUserTag.indexOf("_TAG_") + 5,
                              currentUserTag.length
                            )
                      }
                      maxLength={4}
                      color="royalblue"
                      variant="filled"
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
                </Stack>
              </Box>
              <Stack
                style={styles.bottomBtnStyle}
                direction="row"
                spacing={width * 0.05}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate("UsersHome")}
                >
                  <View>
                    <Button
                      style={{
                        width: width * 0.3,
                        height: height * 0.05,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingTop: 10,
                        paddingBottom: 10,
                        borderWidth: 2,
                        borderColor: "royalblue",
                      }}
                      variant="outlined"
                      title="BACK"
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
                <Button
                  style={{
                    width: width * 0.15,
                    height: height * 0.05,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: "crimson",
                    borderWidth: 2,
                  }}
                  variant="outlined"
                  color="crimson"
                  loading={true}
                  loadingIndicator={(props) => (
                    <Ionicons name="trash" size={24} color="crimson" />
                  )}
                  loadingIndicatorPosition="overlay"
                  onPress={() => {
                    Alert.alert(
                      "Delete User",
                      "Are you sure you would like to delete the user? This cannot be undone.",
                      [
                        {
                          text: "Yes",
                          style: "destructive",
                          onPress: () => {
                            handleDeleteBtn();
                          },
                        },
                        { text: "No" },
                      ]
                    );
                  }}
                />
                <TouchableOpacity onPress={handleOkBtn}>
                  <View>
                    <Button
                      style={{
                        width: width * 0.3,
                        height: height * 0.05,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="OK"
                      color="royalblue"
                      trailing={(props) => (
                        <Ionicons
                          name="arrow-forward"
                          size={24}
                          color="white"
                        />
                      )}
                      onPress={handleOkBtn}
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
                  Invalid Tag ID
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    The Tag ID you entered is the same as the current Tag ID for
                    this user. Please enter an alternate Tag ID to edit this
                    user.{"\n"}
                  </Text>
                  <Text style={{ fontWeight: "bold" }} variant="labelLarge">
                    User: [{userTag.toUpperCase()}]
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
                    onPress={() => hideDialog(3)}
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
    backgroundColor: "whitesmoke",
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

export default EditUserPage;
