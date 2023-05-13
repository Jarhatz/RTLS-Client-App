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
} from "react-native-gesture-handler";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import SiteContext from "../comps/SiteContext";
import { DBClient } from "../comps/DBClient";
import { S3Client } from "../comps/S3Client";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

const MapPage = () => {
  const { siteId, setSiteId } = useContext(SiteContext);
  const { siteName, setSiteName } = useContext(SiteContext);
  const [siteMapUri, setSiteMapUri] = useState(null);
  const zoomableViewRef = useRef(null);
  let mapOriginalWidth = null;
  let mapOriginalHeight = null;
  const [newAnchorBannerVisible, setNewAnchorBannerVisible] = useState(false);
  const [newAnchorState, setNewAnchorState] = useState(false);

  useEffect(() => {
    getSiteMapImage();
  }, [siteId]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     getSiteMapImage();
  //     return () => {
  //       setSiteMapUri(null);
  //     };
  //   }, [siteId])
  // );

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
      const touchX = gestureState["x0"];
      const touchY = gestureState["y0"];
      const offsetX = zoomableViewObj["offsetX"];
      const offsetY = zoomableViewObj["offsetY"];
      const zoomLevel = zoomableViewRef.current["zoomLevel"];

      const zoomWidth = width / zoomLevel;
      const zoomX = (touchX * zoomWidth) / width;
      const universalX =
        (width / 2 - offsetX - zoomWidth / 2 + zoomX) *
        (mapOriginalWidth / width);
      console.log("universalX: ", universalX);

      const zoomHeight = height / zoomLevel;
      const zoomY = (touchY * zoomHeight) / height;
      const universalY =
        (height / 2 - offsetY - zoomHeight / 2 + zoomY) *
        (mapOriginalHeight / height);
      console.log("universalY: ", universalY);
      console.log();
    },
    []
  );

  return (
    <View style={styles.container}>
      <ReactNativeZoomableView
        ref={zoomableViewRef}
        maxZoom={10}
        minZoom={1}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={true}
        longPressDuration={10}
        onLongPress={handleImagePress}
      >
        <Image
          style={{ flex: 1, width: width * 0.9, aspectRatio: 1 }}
          resizeMode="contain"
          source={{ uri: siteMapUri }}
        />
      </ReactNativeZoomableView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});

export default MapPage;
