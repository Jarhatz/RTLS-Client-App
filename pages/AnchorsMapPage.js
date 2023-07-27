import React, {
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  Animated,
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
  PanResponder,
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
import Svg, { Circle, G, Image as SvgImage } from "react-native-svg";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  gestureHandlerRootHOC,
} from "react-native-gesture-handler";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import SiteContext from "../comps/SiteContext";
import { DBClient } from "../comps/DBClient";
import { S3Client } from "../comps/S3Client";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

function MapAnchorsPage({ route, navigation }) {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { anchorID, currentAnchorName, mac, currentLocation } = route.params;
  const { siteName, setSiteName } = useContext(SiteContext);
  const [siteMapUri, setSiteMapUri] = useState(null);
  const zoomableViewRef = useRef(null);
  const [locationX, setLocationX] = useState(0);
  const [locationY, setLocationY] = useState(0);
  const [anchorPositionX, setAnchorPositionX] = useState(0);
  const [anchorPositionY, setAnchorPositionY] = useState(0);
  let mapOriginalWidth = null;
  let mapOriginalHeight = null;

  useEffect(() => {
    getSiteMapImage();
  }, [siteId]);

  const getSiteMapImage = async () => {
    try {
      const params = {
        Bucket: "rtls-sites-assets",
        Key: "site_" + siteId + "_map",
      };
      const siteMapImageResponse = await S3Client.getObject(params).promise();
      const uri = `data:image/jpeg;base64,${siteMapImageResponse.Body.toString(
        "base64"
      )}`;
      setSiteMapUri(uri);
      Image.getSize(uri, (width, height) => {
        mapOriginalWidth = width;
        mapOriginalHeight = height;
      });
    } catch (error) {
      console.warn(error);
    }
  };

  const handleImagePress = useCallback(
    (event, gestureState, zoomableViewObj) => {
      // console.log(gestureState);
      // console.log(zoomableViewObj);
      if (gestureState["numberActiveTouches"] < 2) {
        const touchX = gestureState["x0"];
        const touchY = gestureState["y0"];
        const offsetX = zoomableViewObj["offsetX"];
        const offsetY = zoomableViewObj["offsetY"];
        const zoomLevel = zoomableViewRef.current["zoomLevel"];

        const imageWidth = width;
        const zoomWidth = imageWidth / zoomLevel;
        const zoomX = (touchX * zoomWidth) / imageWidth;
        const scaledX = imageWidth / 2 - offsetX - zoomWidth / 2 + zoomX;
        const scaledWidth = mapOriginalWidth / imageWidth;
        const universalX = scaledX * scaledWidth;

        const imageHeight = mapOriginalHeight / scaledWidth;
        const zoomHeight = imageHeight / zoomLevel;
        const zoomY = (touchY * zoomHeight) / imageHeight;
        const scaledY = imageHeight / 2 - offsetY - zoomHeight / 2 + zoomY;
        const scaledHeight = mapOriginalHeight / imageHeight;
        const universalY = scaledY * scaledHeight;
        // console.log("scaledX: ", scaledX);
        // console.log("scaledY: ", scaledY);
        // console.log("universalX: ", universalX);
        // console.log("universalY: ", universalY);
        setLocationX(Math.round(universalX));
        setLocationY(Math.round(universalY));
        setAnchorPositionX(scaledX * 2);
        setAnchorPositionY(scaledY);
      }
    },
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <ReactNativeZoomableView
        ref={zoomableViewRef}
        maxZoom={10}
        minZoom={1}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={true}
        longPressDuration={500}
        onLongPress={handleImagePress}
      >
        <Image
          style={{ flex: 1, width: width, aspectRatio: 1 }}
          resizeMode="contain"
          source={{ uri: siteMapUri }}
        />
        <MaterialCommunityIcons
          style={[
            styles.anchorStyle,
            { left: anchorPositionX, top: anchorPositionY },
          ]}
          name="radio-tower"
          size={10}
          color="royalblue"
        />
      </ReactNativeZoomableView>
      <View style={{ position: "absolute", top: height * 0.1 }}>
        <Box style={styles.boxStyle}>
          <Stack
            style={{
              alignItems: "center",
            }}
            direction="row"
            spacing={width * 0.05}
          >
            <MaterialIcons name="info-outline" size={20} color="royalblue" />
            <Text style={{ alignSelf: "center" }}>
              Long Press to set Location
            </Text>
          </Stack>
        </Box>
      </View>
      <View
        style={{
          position: "absolute",
          alignSelf: "center",
          bottom: height * 0.02,
        }}
      >
        <Stack
          style={{
            width: width * 0.9,
            alignItems: "center",
            justifyContent: "space-around",
          }}
          direction="row"
        >
          <Button
            style={{
              width: width * 0.3,
              borderWidth: 1,
              borderColor: "royalblue",
            }}
            variant="outlined"
            title="Back"
            color="royalblue"
            leading={(props) => (
              <Ionicons name="arrow-back" size={24} color="royalblue" />
            )}
            onPress={() => {
              navigation.navigate("AnchorsView", {
                anchorID: anchorID,
                currentAnchorName: currentAnchorName,
                mac: mac,
                currentLocation: currentLocation,
              });
            }}
          />
          <Button
            style={{ width: width * 0.3 }}
            title="Done"
            color="royalblue"
            trailing={(props) => (
              <Ionicons name="arrow-forward" size={24} color="white" />
            )}
            onPress={() => {
              navigation.navigate("AnchorsView", {
                anchorID: anchorID,
                currentAnchorName: currentAnchorName,
                mac: mac,
                currentLocation: [locationX.toString(), locationY.toString()],
              });
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  anchorStyle: {
    position: "absolute",
  },
  boxStyle: {
    width: width * 0.75,
    height: height * 0.05,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
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
});

export default MapAnchorsPage;
