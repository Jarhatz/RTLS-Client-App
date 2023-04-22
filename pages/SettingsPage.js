import React from 'react';
import {Alert, Dimensions, StyleSheet, View, ScrollView, Text} from 'react-native';
import {Button, TextInput, Divider} from '@react-native-material/core';
import {Stack} from 'react-native-flex-layout';

const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

const handleLeaveSiteBtn = () => {
  navigation.navigate('JoinSite');
  // Set static global loggedIn value to false
}

const SettingsPage = ({navigation}) => {
  return (
    <View style = {styles.centered}>
      <ScrollView>
        <Stack style = {styles.centeredStack} direction = 'column' spacing = {height * 0.03}>
          <Text style = {{color: 'dimgray', alignSelf: 'flex-start', fontSize: 16}}>Press below to choose a new site</Text>
          <Button
            style = {{width: width * 0.75, borderWidth: 1, borderColor: 'red'}}
            variant = 'outlined'
            title = 'Leave Site'
            color = 'red'
            onPress = {() => {Alert.alert('Leave Site', 'Are you sure you would like to leave the site? You will have to join the site with the Site Code once again', [
              {text: 'Yes', onPress: () => {navigation.navigate('JoinSite')}},
              {text: 'No'},
            ])}}
          />
          <Divider style = {{width: width * 0.9}} color = 'lightgray'/>
        </Stack>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centeredStack: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: height * 0.04,
    }
  });

export default SettingsPage;