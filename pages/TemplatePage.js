import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

const TemplatePage = () => {
  return (
    <View style = {styles.centeredStack}>
      <Text>This is a new page!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    centeredStack: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default TemplatePage;