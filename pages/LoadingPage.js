import React from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import { ActivityIndicator } from "@react-native-material/core";

const { height } = Dimensions.get("window");

const LoadingPage = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator animating={true} color="royalblue" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingTop: height * 0.1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  centeredStack: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoadingPage;
