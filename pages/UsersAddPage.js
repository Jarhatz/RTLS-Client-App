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
import { DBClient } from "../comps/DBClient";
import { S3Client } from "../comps/S3Client";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");
const tagIdImage = require("../images/tag-id-dialog.jpg");

function AddUserPage({ navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const [userPicUri, setUserPicUri] = useState("");
  const [userName, setUserName] = useState("");
  const [userTag, setUserTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleDialog1, setVisibleDialog1] = useState(false);
  const [visibleDialog2, setVisibleDialog2] = useState(false);
  const [visibleDialog3, setVisibleDialog3] = useState(false);
  const [visibleDialog4, setVisibleDialog4] = useState(false);

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

  const handleAddBtn = async () => {
    Keyboard.dismiss();
    setLoading(true);

    let imageUploadFinish = 0;
    let userCreationFinish = 0;
    let unpairOldUserFinish = 0;
    let updateTagPairing = 0;
    const cleanUserName = userName.toUpperCase().trim().replace(/\s+/g, " ");

    if (cleanUserName.length < 4 && cleanUserName.indexOf(" ") === -1) {
      setLoading(false);
      showDialog(2); // Invalid User Name
    } else {
      try {
        const getUserParams = {
          TableName: "sites_" + siteId + "_users",
          Key: {
            user_name: {
              S: cleanUserName,
            },
          },
          ProjectionExpression: "user_tag",
        };
        const getUserResponse = await DBClient.getItem(getUserParams);
        if (getUserResponse.Item === undefined) {
          // USER NAME VALIDATED
          let imageKey = "";
          if (userPicUri !== "") {
            imageUploadFinish = 1;
            imageKey =
              "site_" + siteId + "_user_" + cleanUserName.replace(" ", "-");
            uploadImage(userPicUri, imageKey);
            imageUploadFinish = 2;
          }
          if (userTag === "") {
            // CREATE USER WITH NO TAG
            try {
              const putUserParams = {
                TableName: "sites_" + siteId + "_users",
                Item: {
                  user_name: {
                    S: cleanUserName,
                  },
                  user_tag: { S: "" },
                  pic_key: { S: imageKey },
                  location: { L: [] },
                  alert: { S: "0" },
                },
              };
              userCreationFinish = 1;
              const putUserResponse = await DBClient.putItem(putUserParams);
              userCreationFinish = 2;
              if (
                userCreationFinish === 2 &&
                (imageUploadFinish === 0 || imageUploadFinish === 2)
              ) {
                const delayed = setTimeout(() => {
                  navigation.navigate("UsersHome");
                }, 1000);
              }
            } catch (error) {
              console.error(error);
            }
          } else {
            const tagId = "SITE_" + siteId + "_TAG_" + userTag.toUpperCase();
            try {
              const getTagParams = {
                TableName: "sites_" + siteId + "_tags",
                Key: {
                  tag_id: {
                    S: tagId,
                  },
                },
                ProjectionExpression: "user_name",
              };
              const getTagResponse = await DBClient.getItem(getTagParams);
              if (getTagResponse.Item === undefined) {
                setLoading(false);
                showDialog(4); // Invalid Tag ID
              } else {
                // TAG ID VALIDATED
                if (getTagResponse.Item["user_name"].S !== "") {
                  try {
                    // UNPAIR EXISTING USER
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
                    unpairOldUserFinish = 1;
                    const updateUserResponse = await DBClient.updateItem(
                      updateUserParams
                    );
                    unpairOldUserFinish = 2;
                  } catch (error) {
                    console.error(error);
                  }
                }
                try {
                  // CREATE USER WITH TAG
                  const putUserParams = {
                    TableName: "sites_" + siteId + "_users",
                    Item: {
                      user_name: {
                        S: cleanUserName,
                      },
                      user_tag: { S: tagId },
                      pic_key: { S: imageKey },
                      location: { L: [] },
                      alert: { S: "0" },
                    },
                  };
                  userCreationFinish = 1;
                  const putUserResponse = await DBClient.putItem(putUserParams);
                  userCreationFinish = 2;

                  // UPDATE TAG'S PAIRED USER
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
                        S: cleanUserName,
                      },
                    },
                    ReturnValues: "ALL_NEW",
                  };
                  updateTagPairing = 1;
                  const updateTagResponse = await DBClient.updateItem(
                    updateTagParams
                  );
                  updateTagPairing = 2;
                  if (
                    updateTagPairing === 2 &&
                    userCreationFinish === 2 &&
                    (unpairOldUserFinish === 0 || unpairOldUserFinish === 2)
                  ) {
                    const delayed = setTimeout(() => {
                      navigation.navigate("UsersHome");
                    }, 1000);
                  }
                } catch (error) {
                  console.error(error);
                }
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
                    *[Required]{"\n"}
                  </Text>
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
                    Please enter a first and last name for the user you wish to
                    add.{"\n"}
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

export default AddUserPage;
