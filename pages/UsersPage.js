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
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import SiteContext from "../comps/SiteContext";
import { dbClient } from "../comps/DBClient";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

function UsersPage({ navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const [userSearchName, setUserSearchName] = useState("");
  const [scannedUsers, setScannedUsers] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      scanUsers();
      return () => {
        setScannedUsers(null);
      };
    }, [siteId])
  );

  const scanUsers = async () => {
    const params = {
      TableName: "sites_" + siteId + "_users",
    };
    try {
      const response = await dbClient.scan(params);
      const items = response.Items;
      items.sort((a, b) => {
        if (b.alert.S !== a.alert.S) return b.alert.S - a.alert.S;
        if (b.user_tag.S !== a.user_tag.S) return b.user_tag.S ? 1 : -1;
        return a.user_name.S.localeCompare(b.user_name.S);
      });
      setScannedUsers(items);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchBtn = () => {
    Keyboard.dismiss();
    console.log("Search: ", userSearchName);
    setUserSearchName("");
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

  const showLocations = (locations) => {
    return JSON.stringify(locations);
  };

  const scannedUserView = (user, id) => {
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
                    user.user_tag.S.indexOf("_TAG_") + 5,
                    user.user_tag.S.length
                  )}{" "}
                  -{" "}
                </Text>
              )}
              <Text
                style={{ color: "black", fontWeight: "bold" }}
                variant="titleMedium"
              >
                {formatUserName(user.user_name.S)}
              </Text>
            </Text>
            {user.user_tag.S === "" ? (
              <MaterialCommunityIcons
                name="link-off"
                size={24}
                color="crimson"
              />
            ) : (
              <MaterialCommunityIcons name="link" size={24} color="green" />
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
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={20}
                  color="gray"
                />
                <Text style={{ color: "gray" }} variant="titleSmall">
                  {siteName}
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
                <MaterialIcons name="location-pin" size={20} color="gray" />
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
          <Stack style={styles.searchBarStyle} direction="row">
            <TextInput
              style={{
                width: width * 0.7,
                height: height * 0.0655,
              }}
              label="Search User"
              placeholder="First Last"
              color="royalblue"
              variant="outlined"
              value={userSearchName}
              leading={(props) => (
                <MaterialCommunityIcons
                  name="account-search"
                  size={24}
                  color="black"
                />
              )}
              onChangeText={(text) => setUserSearchName(text)}
            />
            <TouchableOpacity onPress={handleSearchBtn}>
              <View>
                <Button
                  style={{
                    width: width * 0.2,
                    height: height * 0.0655,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  color="royalblue"
                  loading={true}
                  loadingIndicator={(props) => (
                    <Ionicons name="search" size={24} color="white" />
                  )}
                  loadingIndicatorPosition="overlay"
                  onPress={handleSearchBtn}
                />
              </View>
            </TouchableOpacity>
          </Stack>
          <ScrollView style={styles.scrollStackStyle}>
            <Stack
              style={{ alignItems: "center", paddingBottom: height * 0.1 }}
              direction="column"
              spacing={height * 0.02}
            >
              {scannedUsers ? (
                scannedUsers.map(scannedUserView)
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
                  <Ionicons name="person-add-sharp" size={24} color="white" />
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
  searchBarStyle: {
    width: width,
    height: height * 0.0655,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "whitesmoke",
  },
  scrollStackStyle: {
    flex: 1,
    width: width,
    paddingTop: height * 0.025,
    paddingBottom: height * 0.025,
  },
  addBtnStyle: {
    width: width * 0.9,
    height: height * 0.05,
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
});

export default UsersPage;
