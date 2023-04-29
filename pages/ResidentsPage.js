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

function ResidentsPage({ navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const [residentSearchName, setResidentSearchName] = useState("");

  const handleSearchBtn = () => {
    Keyboard.dismiss();
    console.log("Search: ", residentSearchName);
    setResidentSearchName("");
  };

  const handleAddResidentBtn = () => {
    navigation.navigate("AddResident");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <View style={{ flex: 1, backgroundColor: "whitesmoke" }}>
        <Stack
          style={styles.centered}
          direction="column"
          spacing={height * 0.015}
        >
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
              spacing={height * 0.01}
            >
              <Text>Residents: {}</Text>
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
  },
  addBtnStyle: {
    width: width * 0.9,
    height: height * 0.065,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ResidentsPage;
