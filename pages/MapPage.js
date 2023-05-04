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
  ImageBackground,
} from "react-native";
import { Stack } from "react-native-flex-layout";
import { Box, Button, TextInput } from "@react-native-material/core";
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
import { dbClient } from "../comps/DBClient";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

const MapPage = () => {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const [siteMapBase64, setSiteMapBase64] = useState(null);

  useEffect(() => {
    getSiteMapBase64();
  }, [siteId]);

  const getSiteMapBase64 = async () => {
    const params = {
      Bucket: "rtls-sites-assets",
      Key: "site_" + siteId + "_map",
    };
    // try {
    //   const response = await dbClient.getItem(params);
    //   const attr = response.Item.site_map.S;
    //   setSiteMapBase64(attr);
    // } catch (error) {
    //   console.log(error);
    // }
  };

  return (
    <View>
      {/* <ImageBackground
        source={{ uri: `data:image/png;base64,${siteMapBase64}` }}
        style={{ width: width, height: height }}
      > */}
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={"dark-content"} />
        <Text>Map Page</Text>
      </SafeAreaView>
      {/* </ImageBackground> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // paddingTop: height * 0.1,
    alignItems: "center",
  },
});

export default MapPage;
