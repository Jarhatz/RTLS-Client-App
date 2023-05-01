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

function ResidentsPage({ navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const [residentSearchName, setResidentSearchName] = useState("");
  const [scannedResidents, setScannedResidents] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      scanResidents();
      return () => {
        setScannedResidents(null);
      };
    }, [siteId])
  );

  const scanResidents = async () => {
    const params = {
      TableName: "sites_" + siteId + "_residents",
    };
    try {
      const response = await dbClient.scan(params);
      setScannedResidents(response.Items);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchBtn = () => {
    Keyboard.dismiss();
    console.log("Search: ", residentSearchName);
    setResidentSearchName("");
  };

  const handleAddResidentBtn = () => {
    navigation.navigate("AddResident");
  };

  const formatResidentName = (name) => {
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

  const formatResidentTag = (tagId) => {
    if (tagId === "") {
      return "#0000 - ";
    } else {
      const tagIdIndex = tagId.indexOf("_TAG_") + 5;
      return "#" + tagId.substring(tagIdIndex, tagId.length) + " - ";
    }
  };

  const scannedResidentView = (resident, id) => {
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
              <Text
                style={{ color: "gray", fontStyle: "italic" }}
                variant="titleMedium"
              >
                {formatResidentTag(resident.res_tag.S)}
              </Text>
              <Text
                style={{ color: "black", fontWeight: "bold" }}
                variant="titleMedium"
              >
                {formatResidentName(resident.res_name.S)}
              </Text>
            </Text>
            {resident.res_tag.S === "" ? (
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
            <Stack direction="column" spacing={height * 0.01}>
              <Stack
                style={{ alignItems: "center" }}
                direction="row"
                spacing={width * 0.02}
              >
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={16}
                  color="gray"
                />
                <Text style={{ color: "gray" }} variant="titleSmall">
                  {" " + siteName}
                </Text>
              </Stack>
              <Stack
                style={{ alignItems: "center" }}
                direction="row"
                spacing={width * 0.02}
              >
                <MaterialIcons name="location-pin" size={20} color="gray" />
                <Text style={{ color: "gray" }} variant="titleSmall">
                  {JSON.stringify(resident.location)}
                </Text>
              </Stack>
            </Stack>
            <TouchableOpacity onPress={() => console.log("Edit user!")}>
              <View>
                <Button
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  color="crimson"
                  loading={true}
                  loadingIndicator={(props) => (
                    <MaterialCommunityIcons
                      name="account-edit"
                      size={24}
                      color="white"
                    />
                  )}
                  loadingIndicatorPosition="overlay"
                  onPress={() => console.log("Edit user!")}
                />
              </View>
            </TouchableOpacity>
          </Stack>
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
              label="Search Resident"
              placeholder="First Last"
              color="crimson"
              variant="outlined"
              value={residentSearchName}
              leading={(props) => (
                <MaterialCommunityIcons
                  name="account-search"
                  size={24}
                  color="black"
                />
              )}
              onChangeText={(text) => setResidentSearchName(text)}
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
                  color="crimson"
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
              {scannedResidents ? (
                scannedResidents.map(scannedResidentView)
              ) : (
                <ActivityIndicator
                  color="crimson"
                  size="large"
                  animating={true}
                />
              )}
              {/* <Text>End of ScrollView</Text> */}
            </Stack>
          </ScrollView>
          <TouchableOpacity onPress={handleAddResidentBtn}>
            <View>
              <Button
                style={styles.addBtnStyle}
                title="Add Resident"
                color="crimson"
                leading={(props) => (
                  <Ionicons name="person-add-sharp" size={24} color="white" />
                )}
                onPress={handleAddResidentBtn}
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

export default ResidentsPage;
