import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

const LoadingPage = () => {
  return (
    <View style = {styles.container}>
      <Text>Loading...</Text>
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