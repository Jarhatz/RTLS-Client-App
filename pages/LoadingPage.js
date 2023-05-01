import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { ActivityIndicator } from "@react-native-material/core";

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
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredStack: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoadingPage;
