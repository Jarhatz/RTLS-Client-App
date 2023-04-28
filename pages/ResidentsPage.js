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
} from "react-native";
import { Stack } from "react-native-flex-layout";
import { Button, TextInput } from "@react-native-material/core";
import { Text, IconButton, Card, DataTable, Divider } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import SiteContext from "../comps/SiteContext";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

function ResidentsPage({ navigation, route }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const [residentSearchName, setResidentSearchName] = useState("");

  const handleSearchBtn = () => {
    Keyboard.dismiss();
    console.log("Search: ", residentSearchName);
    setResidentSearchName("");
  };

  const handleAddResidentBtn = () => {
    console.log("Add Resident");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <View style={{ backgroundColor: "whitesmoke" }}>
        <Stack
          style={styles.centered}
          direction="column"
          spacing={height * 0.015}
        >
          <Stack style={styles.searchBarStyle} direction="row">
            <TextInput
              style={{ width: width * 0.7, height: height * 0.0655 }}
              label="Search Resident"
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
            <Button
              style={{
                width: width * 0.2,
                height: height * 0.0655,
                paddingTop: 10,
                paddingBottom: 10,
              }}
              color="crimson"
              loading={true}
              loadingIndicator={(props) => (
                <Ionicons name="search" size={24} color="white" />
              )}
              loadingIndicatorPosition="overlay"
              onPress={handleSearchBtn}
            />
          </Stack>
          <ScrollView style={styles.scrollStackStyle}>
            <Stack
              style={{ alignItems: "center" }}
              direction="column"
              spacing={height * 0.01}
            >
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
              <Text>YYOYO</Text>
            </Stack>
          </ScrollView>
          <Button
            style={styles.addBtnStyle}
            title="Add Resident"
            color="crimson"
            leading={(props) => (
              <Ionicons name="person-add-sharp" size={24} color="white" />
            )}
            onPress={handleSearchBtn}
          />
        </Stack>
      </View>
    </SafeAreaView>
    //     <ScrollView>
    //     <Card mode="contained">
    //       <Card.Title title="Card Title" subtitle="Card Subtitle" />
    //       <Card.Content>
    //         <DataTable>
    //           <DataTable.Header>
    //             <DataTable.Title>Header 1</DataTable.Title>
    //             <DataTable.Title>Header 2</DataTable.Title>
    //             <DataTable.Title>Header 3</DataTable.Title>
    //           </DataTable.Header>

    //           <DataTable.Row>
    //             <DataTable.Cell>Data 1</DataTable.Cell>
    //             <DataTable.Cell>Data 2</DataTable.Cell>
    //             <DataTable.Cell>Data 3</DataTable.Cell>
    //           </DataTable.Row>

    //           <DataTable.Row>
    //             <DataTable.Cell>Data 4</DataTable.Cell>
    //             <DataTable.Cell>Data 5</DataTable.Cell>
    //             <DataTable.Cell>Data 6</DataTable.Cell>
    //           </DataTable.Row>
    //         </DataTable>
    //       </Card.Content>
    //     </Card>
    //   </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    paddingTop: height * 0.015,
    paddingBottom: height * 0.015,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
  },
  searchBarStyle: {
    width: width * 0.9,
    height: height * 0.0655,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollStackStyle: {
    flex: 1,
    width: width * 0.9,
    backgroundColor: "lightblue",
  },
  addBtnStyle: {
    width: width * 0.9,
    height: height * 0.0655,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ResidentsPage;
