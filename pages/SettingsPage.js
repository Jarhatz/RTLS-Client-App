import React, {useContext} from "react";
import {Alert, Dimensions, StyleSheet, View, ScrollView, Text} from "react-native";
import {Button, TextInput, Divider} from "@react-native-material/core";
import {Stack} from "react-native-flex-layout";
import AsyncStorage from '@react-native-async-storage/async-storage';
import SiteContext from "../comps/SiteContext";

const {width} = Dimensions.get("window");
const {height} = Dimensions.get("window");

function SettingsPage({navigation, route}) {
  const {siteInfo, setSiteInfo} = useContext(SiteContext);

  const handlePress = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const values = await AsyncStorage.multiGet(keys);
    console.log(values);
    console.log(siteInfo);
  };

  // const handleDelete = async () => {
  //   await AsyncStorage.removeItem("signedIn");
  // };

  return (
    <View style={styles.centered}>
      <ScrollView>
        <Stack style={styles.centeredStack} direction="column" spacing={height * 0.03}>
          <Text style={{ color: "dimgray", alignSelf: "flex-start", fontSize: 16}}>Site: {siteInfo["site_name"].S}</Text>
          {/* <Text style={{ color: "dimgray", alignSelf: "flex-start", fontSize: 16}}>{siteInfo["site_"].S}</Text>
          <Text style={{ color: "dimgray", alignSelf: "flex-start", fontSize: 16}}>{siteInfo["site_name"].S}</Text>
          <Text style={{ color: "dimgray", alignSelf: "flex-start", fontSize: 16}}>{siteInfo["site_name"].S}</Text> */}
          
          
          <Divider style={{ width: width * 0.9 }} color="lightgray"/>
          <Text style={{ color: "dimgray", alignSelf: "flex-start", fontSize: 16}}>Press below to leave this site</Text>
          <Button
            style={{width: width * 0.75, borderWidth: 1, borderColor: "red"}}
            variant = "outlined"
            title = "Leave Site"
            color = "red"
            onPress = {() => {
              Alert.alert("Leave Site", "Are you sure you would like to leave the site? You will have to join the site with the Site Code once again", [
                {text: "Yes", style: "destructive", onPress: () => {AsyncStorage.setItem("site_id", "0"); navigation.navigate("JoinSite")}},
                {text: "No" },
              ])}}/>
          <Divider style={{ width: width * 0.9 }} color="lightgray"/>
          <Button
            style={{width: width * 0.75, borderWidth: 1, borderColor: "blue"}}
            variant = "outlined"
            title = "Show Storage"
            color = "blue"
            onPress = {handlePress}/>
          {/* <Button title = "Debug Delete" onPress={handleDelete}/> */}
        </Stack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    centeredStack: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: height * 0.04,
    }
  });

export default SettingsPage;