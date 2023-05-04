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
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import SiteContext from "../comps/SiteContext";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { DBClient } from "../comps/DBClient";
import { S3Client } from "../comps/S3Client";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");
const tagIdImage = require("../images/tag-id-dialog.jpg");

function EditUserPage({ route, navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { userName, currentUserTag, currentUserPicUri } = route.params;
  const [userPicUri, setUserPicUri] = useState(currentUserPicUri);
  const [userTag, setUserTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleDialog1, setVisibleDialog1] = useState(false);
  const [visibleDialog2, setVisibleDialog2] = useState(false);
  const [visibleDialog3, setVisibleDialog3] = useState(false);
  const [visibleDialog4, setVisibleDialog4] = useState(false);
  let response1 = false;
  let response2 = false;
  let response3 = false;

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

  const takePhoto = async () => {
    let { status } = await Camera.requestCameraPermissionsAsync();

    if (status === "granted") {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.1,
      });
      if (!result.canceled) {
        setUserPicUri(result.assets[0].uri);
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Denied",
        "Please enable camera roll permissions to use this feature.",
        [
          {
            text: "OK",
          },
        ]
      );
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.1,
      });
      if (!result.canceled) {
        setUserPicUri(result.assets[0].uri);
      }
    }
  };

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
      const getResponse = await DBClient.getItem(userParams);
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
            const updateResponse = await DBClient.updateItem(tagParams);
          } catch (error) {
            console.log(error);
          }
        }
        if (getResponse.Item.pic_key.S !== "") {
          const imageParams = {
            Bucket: "rtls-sites-assets",
            Key: getResponse.Item.pic_key.S,
          };
          try {
            const response = await S3Client.deleteObject(imageParams).promise();
          } catch (error) {
            console.log(error);
          }
        }
        const deleteResponse = await DBClient.deleteItem(userParams);
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

  const uploadImage = async (uri, imageKey) => {
    const imageResponse = await fetch(uri);
    const imageBlob = await imageResponse.blob();
    const params = {
      Bucket: "rtls-sites-assets",
      Key: imageKey,
      Body: imageBlob,
      ContentType: "image/jpeg",
    };
    try {
      const uploadResponse = await S3Client.putObject(params).promise();
    } catch (error) {
      console.log(error);
    }
  };

  const handleOkBtn = async () => {
    Keyboard.dismiss();
    setLoading(true);

    let imageUploadFinish = 0;
    let updateUserImageFinish = 0;
    let updateUserFinish = 0;
    let updateTagFinish = 0;
    let unpairOldTagFinish = 0;
    let unpairOldUserFinish = 0;
    const cleanUserName = userName.toUpperCase().trim().replace(/\s+/g, " ");
    const tagId = "SITE_" + siteId + "_TAG_" + userTag.toUpperCase();

    if (tagId === currentUserTag) {
      if (userPicUri === currentUserPicUri) {
        setLoading(false);
        showDialog(4); // No User Edit
      } else {
        if (userTag !== "") {
          setLoading(false);
          showDialog(2); // Same Tag ID
        } else {
          // USER WITH NO CURRENT TAG ID | UPLOAD PHOTO
          let imageKey =
            "site_" + siteId + "_user_" + cleanUserName.replace(" ", "-");
          imageUploadFinish = 1;
          uploadImage(userPicUri, imageKey);
          imageUploadFinish = 2;
          if (currentUserPicUri === "") {
            // CREATE PICTURE KEY FOR USER
            try {
              const updateUserParams = {
                TableName: "sites_" + siteId + "_users",
                Key: {
                  user_name: { S: cleanUserName },
                },
                UpdateExpression: "SET pic_key = :value",
                ExpressionAttributeValues: {
                  ":value": { S: imageKey },
                },
                ReturnValues: "ALL_NEW",
              };
              updateUserImageFinish = 1;
              const updateUserResponse = await DBClient.updateItem(
                updateUserParams
              );
              updateUserImageFinish = 2;
            } catch (error) {
              console.log(error);
            }
          }
          if (
            imageUploadFinish === 2 &&
            (updateUserImageFinish === 0 || updateUserImageFinish === 2)
          ) {
            setLoading(false);
            const delayed = setTimeout(() => {
              navigation.navigate("UsersHome");
            }, 1000);
          }
        }
      }
    } else {
      if (userTag === "") {
        if (userPicUri === currentUserPicUri) {
          setLoading(false);
          showDialog(4); // No User Edit
        } else {
          let imageKey =
            "site_" + siteId + "_user_" + cleanUserName.replace(" ", "-");
          imageUploadFinish = 1;
          uploadImage(userPicUri, imageKey);
          imageUploadFinish = 2;
          if (currentUserPicUri === "") {
            // CREATE PICTURE KEY FOR USER
            try {
              const updateUserParams = {
                TableName: "sites_" + siteId + "_users",
                Key: {
                  user_name: { S: cleanUserName },
                },
                UpdateExpression: "SET pic_key = :value",
                ExpressionAttributeValues: {
                  ":value": { S: imageKey },
                },
                ReturnValues: "ALL_NEW",
              };
              updateUserImageFinish = 1;
              const updateUserResponse = await DBClient.updateItem(
                updateUserParams
              );
              updateUserImageFinish = 2;
            } catch (error) {
              console.log(error);
            }
          }
          if (
            imageUploadFinish === 2 &&
            (updateUserImageFinish === 0 || updateUserImageFinish === 2)
          ) {
            setLoading(false);
            const delayed = setTimeout(() => {
              navigation.navigate("UsersHome");
            }, 1000);
          }
        }
      } else {
        try {
          // USERS ATTEMPTING TO CHANGE TAG ID
          const newTagParams = {
            TableName: "sites_" + siteId + "_tags",
            Key: {
              tag_id: { S: tagId },
            },
          };
          const newTagResponse = await DBClient.getItem(newTagParams);
          if (newTagResponse.Item === undefined) {
            setLoading(false);
            showDialog(3); // Invalid Tag ID
          } else {
            // TAG ID VALIDATED
            if (userPicUri !== currentUserPicUri) {
              let imageKey =
                "site_" + siteId + "_user_" + cleanUserName.replace(" ", "-");
              imageUploadFinish = 1;
              uploadImage(userPicUri, imageKey);
              imageUploadFinish = 2;
              if (currentUserPicUri === "") {
                // CREATE PICTURE KEY FOR USER
                try {
                  const updateUserParams = {
                    TableName: "sites_" + siteId + "_users",
                    Key: {
                      user_name: { S: cleanUserName },
                    },
                    UpdateExpression: "SET pic_key = :value",
                    ExpressionAttributeValues: {
                      ":value": { S: imageKey },
                    },
                    ReturnValues: "ALL_NEW",
                  };
                  updateUserImageFinish = 1;
                  const updateUserResponse = await DBClient.updateItem(
                    updateUserParams
                  );
                  updateUserImageFinish = 2;
                } catch (error) {
                  console.log(error);
                }
              }
            }
            if (currentUserTag !== "") {
              try {
                // UNPAIR OLD TAG FROM CURRENT USER
                const updateOldTagParams = {
                  TableName: "sites_" + siteId + "_tags",
                  Key: {
                    tag_id: { S: currentUserTag },
                  },
                  UpdateExpression: "SET user_name = :value",
                  ExpressionAttributeValues: {
                    ":value": { S: "" },
                  },
                  ReturnValues: "ALL_NEW",
                };
                unpairOldTagFinish = 1;
                const updateOldTagResponse = await DBClient.updateItem(
                  updateOldTagParams
                );
                unpairOldTagFinish = 2;
              } catch (error) {
                console.log(error);
              }
            }
            if (newTagResponse.Item.user_name.S !== "") {
              try {
                // UNPAIR OLD USER FROM NEW TAG
                const updateOldUserParams = {
                  TableName: "sites_" + siteId + "_users",
                  Key: {
                    user_name: { S: newTagResponse.Item.user_name.S },
                  },
                  UpdateExpression: "SET user_tag = :value",
                  ExpressionAttributeValues: {
                    ":value": { S: "" },
                  },
                  ReturnValues: "ALL_NEW",
                };
                unpairOldUserFinish = 1;
                const updateOldUserResponse = await DBClient.updateItem(
                  updateOldUserParams
                );
                unpairOldUserFinish = 2;
              } catch (error) {
                console.log(error);
              }
            }
            try {
              // UPDATE USER WITH NEW TAG
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
              updateUserFinish = 1;
              const updateUserResponse = await DBClient.updateItem(
                updateUserParams
              );
              updateUserFinish = 2;

              // UPDATE NEW TAG'S PAIRED USER
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
              updateTagFinish = 1;
              const updateTagResponse = await DBClient.updateItem(
                updateTagParams
              );
              updateTagFinish = 2;
              if (
                updateTagFinish === 2 &&
                updateUserFinish === 2 &&
                (unpairOldUserFinish === 0 || unpairOldUserFinish === 2) &&
                (unpairOldTagFinish === 0 || unpairOldTagFinish === 2) &&
                (imageUploadFinish === 0 ||
                  (imageUploadFinish === 2 &&
                    (updateUserImageFinish === 0 ||
                      updateUserImageFinish === 2)))
              ) {
                setLoading(false);
                const delayed = setTimeout(() => {
                  navigation.navigate("UsersHome");
                }, 1000);
              }
            } catch (error) {
              console.log(error);
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
                variant="headlineMedium"
              >
                Edit User
              </Text>
              <Box style={styles.addBoxStyle}>
                <Stack style={styles.userPictureBoxInsideStyle} direction="row">
                  {userPicUri === "" ? (
                    <Avatar
                      style={{
                        backgroundColor: "white",
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                      icon={(props) => (
                        <Ionicons name="person-sharp" size={28} color="black" />
                      )}
                    />
                  ) : (
                    <Avatar
                      style={{ backgroundColor: "white" }}
                      image={{ uri: userPicUri }}
                    />
                  )}
                  <Stack
                    style={{
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                    direction="column"
                  >
                    <Button
                      style={{
                        borderWidth: 0,
                        borderColor: "gray",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      variant="text"
                      title="take photo"
                      color="gray"
                      leading={(props) => (
                        <Ionicons name="camera-sharp" size={22} color="gray" />
                      )}
                      onPress={takePhoto}
                    />
                    <Button
                      style={{
                        borderWidth: 0,
                        borderColor: "gray",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      variant="text"
                      title="choose image"
                      color="gray"
                      leading={(props) => (
                        <FontAwesome name="photo" size={18} color="gray" />
                      )}
                      onPress={pickImage}
                    />
                  </Stack>
                </Stack>
              </Box>
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
              <Dialog
                style={{ backgroundColor: "white" }}
                visible={visibleDialog4}
                onDismiss={() => hideDialog(4)}
              >
                <Dialog.Title
                  style={{ color: "royalblue", fontWeight: "bold" }}
                >
                  Invalid Edit
                </Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    There are no changes to the current user. Please make any
                    valid changes to confirm the edit.{"\n"}
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // paddingTop: height * 0.1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "whitesmoke",
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
  userPictureBoxInsideStyle: {
    paddingTop: height * 0.025,
    paddingBottom: height * 0.025,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  bottomBtnStyle: {
    width: width * 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default EditUserPage;
