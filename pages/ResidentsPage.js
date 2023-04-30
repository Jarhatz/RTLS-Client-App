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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
            <Text style={{ fontWeight: "bold" }} variant="titleLarge">
              {formatResidentName(resident.res_name.S)}
            </Text>
            <IconButton
              icon="trash-can-outline"
              iconColor="crimson"
              size={24}
              containerColor="white"
              onPress={() => console.log("Delete User!")}
            />
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
              style={{ width: width * 0.7, height: height * 0.0655 }}
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
              style={{ alignItems: "center" }}
              direction="column"
              spacing={height * 0.03}
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
    height: height * 0.065,
    alignItems: "center",
    justifyContent: "center",
  },
  userBoxStyle: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
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
