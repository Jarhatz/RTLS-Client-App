import React, { useContext, useEffect, useState } from "react";
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
  TouchableOpacity,
  Image,
} from "react-native";
import { Stack } from "react-native-flex-layout";
import { Avatar, Box, Button, TextInput } from "@react-native-material/core";
import {
  ActivityIndicator,
  Text,
  IconButton,
  Dialog,
  Portal,
  Divider,
} from "react-native-paper";
import {
  Feather,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import SiteContext from "../comps/SiteContext";
import { DBClient } from "../comps/DBClient";
import { S3Client } from "../comps/S3Client";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

function UsersPage({ navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [scannedUsers, setScannedUsers] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState(null);
  const [userImageMap, setUserImageMap] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      scanUsers();
      return () => {
        setScannedUsers(null);
        setFilteredUsers(null);
        setUserImageMap({});
      };
    }, [siteId])
  );

  const scanUsers = async () => {
    try {
      const params = {
        TableName: "sites_" + siteId + "_users",
      };
      const response = await DBClient.scan(params);
      const items = response.Items;
      items.sort((a, b) => {
        if (a.alert.S > b.alert.S) return -1;
        if (a.alert.S < b.alert.S) return 1;
        if (a.user_tag.S !== "" && b.user_tag.S === "") return -1;
        if (a.user_tag.S === "" && b.user_tag.S !== "") return 1;
        return a.user_name.S <= b.user_name.S ? -1 : 1;
      });
      setScannedUsers(items);
      setFilteredUsers(items);
      items.forEach(async (item) => {
        if (item.pic_key.S !== "") {
          try {
            const params = {
              Bucket: "rtls-sites-assets",
              Key: item.pic_key.S,
            };
            const imageObj = await S3Client.getObject(params).promise();
            const uri = `data:image/jpeg;base64,${imageObj.Body.toString(
              "base64"
            )}`;
            setUserImageMap((dict) => ({
              ...dict,
              [item.user_name.S]: uri,
            }));
          } catch (error) {
            console.warn("[1] UserPage.js: ", error);
            setUserImageMap((dict) => ({
              ...dict,
              [item.user_name.S]: "",
            }));
          }
        } else {
          setUserImageMap((dict) => ({
            ...dict,
            [item.user_name.S]: "",
          }));
        }
      });
    } catch (error) {
      console.log("[2] UserPage.js: ", error);
    }
  };

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredUsers(scannedUsers);
    } else {
      setFilteredUsers(
        scannedUsers.filter((user) => {
          if (user.user_name.S.startsWith(query.toUpperCase())) return true;
          if (
            user.user_tag.S !== "" &&
            user.user_tag.S.substring(
              user.user_tag.S.length - 4,
              user.user_tag.S.length
            ).startsWith(query.toUpperCase())
          )
            return true;
          return false;
        })
      );
    }
  };

  const formatUserName = (name) => {
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
  };

  const showLocations = (locations) => {
    return (
      formatUserName(locations[0].S) +
      " (" +
      locations[1].S +
      ", " +
      locations[2].S +
      ")"
    );
  };

  const renderAvatar = (username) => {
    if (userImageMap[username] === "") {
      return (
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
      );
    } else {
      return (
        <Avatar
          style={{
            backgroundColor: "white",
          }}
          image={{ uri: userImageMap[username] }}
        />
      );
    }
  };

  const handleScrollView = () => {
    if (filteredUsers.length === 0) {
      return (
        <Box style={styles.noUserBoxStyle}>
          <Stack
            style={styles.noUserBoxInsideStyle}
            direction="column"
            spacing={height * 0.01}
          >
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
            <Stack
              style={{
                alignItems: "center",
                justifyContent: "space-between",
              }}
              direction="row"
            >
              <Text
                style={{ color: "black", fontWeight: "bold" }}
                variant="titleMedium"
              >
                No Users
              </Text>
              <MaterialCommunityIcons
                name="link-off"
                size={24}
                color="crimson"
              />
            </Stack>
            <Divider style={{ width: width * 0.8 }} bold={true} />
          </Stack>
          <Text
            style={{ color: "gray", alignSelf: "center" }}
            variant="titleSmall"
          >
            No users were found. You may add new users.{"\n\n"}
          </Text>
        </Box>
      );
    } else {
      return filteredUsers.map(scrollUserView);
    }
  };

  const scrollUserView = (user, id) => {
    return (
      <Box style={styles.userBoxStyle} key={id}>
        <Stack
          style={styles.userBoxInsideStyle}
          direction="column"
          spacing={height * 0.01}
        >
          <Stack
            style={{ alignItems: "center", justifyContent: "space-between" }}
            direction="row"
          >
            <Stack direction="column" spacing={height * 0.01}>
              {renderAvatar(user.user_name.S)}
              <Text>
                {user.user_tag.S === "" ? (
                  <Text
                    style={{ color: "gray", fontStyle: "italic" }}
                    variant="titleMedium"
                  >
                    #0000 -{" "}
                  </Text>
                ) : (
                  <Text
                    style={{ color: "royalblue", fontStyle: "italic" }}
                    variant="titleMedium"
                  >
                    #
                    {user.user_tag.S.substring(
                      user.user_tag.S.length - 4,
                      user.user_tag.S.length
                    ) + " - "}
                  </Text>
                )}
                <Text
                  style={{ color: "black", fontWeight: "bold" }}
                  variant="titleMedium"
                >
                  {formatUserName(user.user_name.S)}
                </Text>
              </Text>
            </Stack>
            {user.user_tag.S === "" ? (
              <MaterialCommunityIcons
                style={{ alignSelf: "flex-start" }}
                name="link-off"
                size={24}
                color="crimson"
              />
            ) : (
              <MaterialCommunityIcons
                style={{ alignSelf: "flex-start" }}
                name="link"
                size={24}
                color="green"
              />
            )}
          </Stack>
          <Divider style={{ width: width * 0.8 }} bold={true} />
          <Stack
            style={{ alignItems: "center", justifyContent: "space-between" }}
            direction="row"
          >
            <Stack
              style={{ width: width * 0.5 }}
              direction="column"
              spacing={height * 0.01}
            >
              <Stack
                style={{ alignItems: "center" }}
                direction="row"
                spacing={width * 0.02}
              >
                <Ionicons name="battery-full" size={20} color="gray" />
                <Text style={{ color: "gray" }} variant="titleSmall">
                  {user.battery ? user.battery.S : "N/A"}
                </Text>
              </Stack>
              <Stack
                style={{ alignItems: "center" }}
                direction="row"
                spacing={width * 0.02}
              >
                {user.alert.S === "0" ? (
                  <MaterialCommunityIcons
                    name="alert-circle-check-outline"
                    size={20}
                    color="green"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={20}
                    color="crimson"
                  />
                )}
                {user.alert.S === "0" ? (
                  <Text style={{ color: "green" }} variant="titleSmall">
                    No Alerts
                  </Text>
                ) : (
                  <Text
                    style={{ color: "crimson", fontWeight: "bold" }}
                    variant="titleSmall"
                  >
                    Alert
                  </Text>
                )}
              </Stack>
              <Stack
                style={{ alignItems: "center" }}
                direction="row"
                spacing={width * 0.02}
              >
                <MaterialCommunityIcons
                  name="target-account"
                  size={20}
                  color="gray"
                />
                <Text style={{ color: "gray" }} variant="titleSmall">
                  {user.location.L.length === 0
                    ? "Unknown"
                    : showLocations(user.location.L)}
                </Text>
              </Stack>
            </Stack>
            <Button
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderColor: "royalblue",
                borderWidth: 1,
              }}
              variant="outlined"
              color="royalblue"
              loading={true}
              loadingIndicator={(props) => (
                <MaterialCommunityIcons
                  name="account-edit"
                  size={24}
                  color="royalblue"
                />
              )}
              loadingIndicatorPosition="overlay"
              onPress={() =>
                navigation.navigate("UsersEdit", {
                  userName: user.user_name.S,
                  currentUserTag: user.user_tag.S,
                  currentUserPicUri: userImageMap[user.user_name.S],
                })
              }
            />
          </Stack>
          <Divider style={{ width: width * 0.8 }} bold={true} />
          <Button
            style={{ width: width * 0.8, alignSelf: "center" }}
            variant="text"
            color="royalblue"
            title="View"
            trailing={(props) => (
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="royalblue"
              />
            )}
            onPress={() => {
              navigation.navigate("Map");
            }}
          />
        </Stack>
      </Box>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <View style={{ flex: 1, backgroundColor: "whitesmoke" }}>
        <Stack style={styles.centered} direction="column">
          <TextInput
            style={{
              width: width * 0.9,
            }}
            label="Search"
            placeholder="Search by Name or ID"
            color="royalblue"
            variant="standard"
            value={searchQuery}
            onChangeText={(text) => handleSearchQuery(text)}
            leading={(props) => (
              <MaterialCommunityIcons
                name="account-search"
                size={24}
                color="black"
              />
            )}
            trailing={(props) => (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setFilteredUsers(scannedUsers);
                }}
              >
                <View>
                  <Feather name="x-circle" size={20} color="gray" />
                </View>
              </TouchableOpacity>
            )}
          />
          <ScrollView style={styles.scrollStackStyle}>
            <Stack
              style={{ alignItems: "center", paddingBottom: height * 0.1 }}
              direction="column"
              spacing={height * 0.02}
            >
              {filteredUsers ? (
                handleScrollView()
              ) : (
                <ActivityIndicator
                  color="royalblue"
                  size="large"
                  animating={true}
                />
              )}
            </Stack>
          </ScrollView>
          <TouchableOpacity onPress={() => navigation.navigate("UsersAdd")}>
            <View>
              <Button
                style={styles.addBtnStyle}
                title="Add User"
                color="royalblue"
                leading={(props) => (
                  <Ionicons name="person-add-sharp" size={20} color="white" />
                )}
                onPress={() => navigation.navigate("UsersAdd")}
              />
            </View>
          </TouchableOpacity>
        </Stack>
      </View>
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
    paddingBottom: height * 0.015,
  },
  scrollStackStyle: {
    flex: 1,
    width: width,
    paddingTop: height * 0.025,
    paddingBottom: height * 0.025,
  },
  addBtnStyle: {
    width: width * 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
  userBoxStyle: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: "white",
    borderColor: "lightgray",
    borderWidth: 1,
  },
  userBoxInsideStyle: {
    paddingTop: height * 0.01,
    paddingBottom: height * 0.01,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
    justifyContent: "center",
  },
  noUserBoxStyle: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: "white",
    borderColor: "lightgray",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noUserBoxInsideStyle: {
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
    justifyContent: "center",
  },
});

export default UsersPage;
