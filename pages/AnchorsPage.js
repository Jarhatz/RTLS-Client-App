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
  Button as PaperButton,
  SegmentedButtons,
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

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

function AnchorsPage({ navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [scannedAnchors, setScannedAnchors] = useState(null);
  const [filteredAnchors, setFilteredAnchors] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      scanAnchors();
      return () => {
        setScannedAnchors(null);
        setFilteredAnchors(null);
      };
    }, [siteId])
  );

  const scanAnchors = async () => {
    try {
      const params = {
        TableName: "sites_" + siteId + "_anchors",
      };
      const response = await DBClient.scan(params);
      const items = response.Items;
      items.sort((a, b) => {
        if (a.online.S === "1" && b.online.S === "0") return 1;
        if (a.online.S === "0" && b.online.S === "1") return -1;
        if (a.anchor_name.S === "" && b.anchor_name.S !== "") return 1;
        if (a.anchor_name.S !== "" && b.anchor_name.S === "") return -1;
        return a.anchor_name.S >= b.anchor_name.S ? 1 : -1;
      });
      setScannedAnchors(items);
      setFilteredAnchors(items);
    } catch (error) {
      console.log("[2] UserPage.js: ", error);
    }
  };

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredAnchors(scannedAnchors);
    } else {
      setFilteredAnchors(
        scannedAnchors.filter((anchor) => {
          if (anchor.anchor_name.S.startsWith(query.toUpperCase())) return true;
          if (
            anchor.anchor_id.S !== "" &&
            anchor.anchor_id.S.substring(
              anchor.anchor_id.S.length - 4,
              anchor.anchor_id.S.length
            ).startsWith(query.toUpperCase())
          )
            return true;
          return false;
        })
      );
    }
  };

  const formatAnchorName = (name) => {
    if (name === "") {
      return "[Unnamed]";
    } else {
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
    }
  };

  const handleScrollView = () => {
    if (filteredAnchors.length === 0) {
      return (
        <Box style={styles.noAnchorBoxStyle}>
          <Stack
            style={styles.noAnchorBoxInsideStyle}
            direction="column"
            spacing={height * 0.01}
          >
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
                No Anchors
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
            No anchors were found. Please try a different search query.{"\n"}
          </Text>
        </Box>
      );
    } else {
      return filteredAnchors.map(scrollAnchorView);
    }
  };

  const scrollAnchorView = (anchor, id) => {
    return (
      <Box style={styles.anchorBoxStyle} key={id}>
        <Stack
          style={styles.anchorBoxInsideStyle}
          direction="column"
          spacing={height * 0.01}
        >
          <Stack
            style={{ alignItems: "center", justifyContent: "space-between" }}
            direction="row"
          >
            <Text>
              <Text
                style={{ color: "royalblue", fontStyle: "italic" }}
                variant="titleMedium"
              >
                #
                {anchor.anchor_id.S.substring(
                  anchor.anchor_id.S.length - 4,
                  anchor.anchor_id.S.length
                )}{" "}
                -{" "}
              </Text>
              <Text
                style={{ color: "black", fontWeight: "bold" }}
                variant="titleMedium"
              >
                {formatAnchorName(anchor.anchor_name.S)}
              </Text>
            </Text>
            {anchor.online.S === "0" ? (
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
            style={{ width: width * 0.5 }}
            direction="column"
            spacing={height * 0.01}
          >
            <Stack
              style={{ alignItems: "center" }}
              direction="row"
              spacing={width * 0.02}
            >
              <Ionicons name="code-working-outline" size={20} color="gray" />
              <Text style={{ color: "gray" }} variant="titleSmall">
                {anchor.mac.S}
              </Text>
            </Stack>
            <Stack
              style={{ alignItems: "center" }}
              direction="row"
              spacing={width * 0.02}
            >
              <MaterialIcons name="location-pin" size={20} color="gray" />
              <Text style={{ color: "gray" }} variant="titleSmall">
                {anchor.coordinates.L[0].S === "" ||
                anchor.coordinates.L[1].S === ""
                  ? "No Location Set"
                  : "(x: " +
                    anchor.coordinates.L[0].S +
                    ", y: " +
                    anchor.coordinates.L[1].S +
                    ")"}
              </Text>
            </Stack>
          </Stack>
          <Divider style={{ width: width * 0.8 }} bold={true} />
          <Button
            style={{ width: width * 0.8, alignSelf: "center" }}
            variant="text"
            color="royalblue"
            title="edit"
            trailing={(props) => (
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="royalblue"
              />
            )}
            onPress={() => {
              navigation.navigate("AnchorsView", {
                anchorID: anchor.anchor_id.S,
                currentAnchorName: anchor.anchor_name.S,
                mac: anchor.mac.S,
                currentLocation: [
                  anchor.coordinates.L[0].S,
                  anchor.coordinates.L[1].S,
                ],
              });
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
              <MaterialCommunityIcons name="magnify" size={24} color="black" />
            )}
            trailing={(props) => (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
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
              {filteredAnchors ? (
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
    backgroundColor: "whitesmoke",
  },
  centered: {
    flex: 1,
    width: width,
    alignItems: "center",
    paddingBottom: height * 0.015,
  },
  scrollStackStyle: {
    width: width,
    paddingTop: height * 0.025,
    paddingBottom: height * 0.025,
  },
  anchorBoxStyle: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: "white",
    borderColor: "lightgray",
    borderWidth: 1,
  },
  anchorBoxInsideStyle: {
    paddingTop: height * 0.02,
    paddingBottom: height * 0.01,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
    justifyContent: "center",
  },
  noAnchorBoxStyle: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: "white",
    borderColor: "lightgray",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noAnchorBoxInsideStyle: {
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05,
    justifyContent: "center",
  },
});

export default AnchorsPage;
