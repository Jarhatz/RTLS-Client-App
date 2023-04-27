import React, {useState, useEffect} from "react";
import {Alert, Dimensions, Platform, StatusBar, StyleSheet, SafeAreaView, Keyboard, View, Text, TouchableWithoutFeedback} from "react-native";
import {Stack} from "react-native-flex-layout";
import {useNavigation} from "@react-navigation/native";
import {Button, TextInput, IconButton} from "@react-native-material/core";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {BarCodeScanner} from "expo-barcode-scanner";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {dbClient} from "../comps/DBClient";

const {width} = Dimensions.get("window");
const {height} = Dimensions.get("window");

const JoinSitePage = () => {
  const navigation = useNavigation();
  const [cameraPermission, setCameraPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  const [siteCodeInput, setSiteCodeInput] = useState("");

  useEffect(() => {
    getCameraPermission();
  }, []);

  const getCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setCameraPermission(status === "granted");
    })();
  };

  const checkCode = async (code, codeType) => {
    var params;
    if (codeType) {
      params = {
        TableName: "sites",
        FilterExpression: "qr_code = :value",
        ExpressionAttributeValues: {
          ":value": { S: code }
        }
      };
    } else {
      params = {
        TableName: "sites",
        FilterExpression: "site_code = :value",
        ExpressionAttributeValues: {
          ":value": { S: code }
        }
      };
    }
    try {
      const response = await dbClient.scan(params);
      return response.Items;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleSubmitBtn = async () => {
    Keyboard.dismiss();
    if (siteCodeInput.length >= 4) {
      const items = await checkCode(siteCodeInput, 0);
      if (items.length) {
        setSiteCodeInput("");
        AsyncStorage.setItem("site_id", items[0]["site_id"].S);
        navigation.navigate("HomePage");
        
      } else {
        Alert.alert("Code Failed", "Invalid site code. Please try again", [{ text: "OK" }]);
      }
    } else {
      Alert.alert("Code Failed", "Invalid site code length. Please try again", [{ text: "OK" }]);
    }
  };

  // Handle QR Code Scan
  const handleQRCodeScanned = async ({type, data}) => {
    setScanned(true);
    if (data.length !== 64) {
      Alert.alert("Scan Failed", "Invalid QR code. Please try again", [{ text: "OK" }]);
    } else {
      const items = await checkCode(data, 1);
      if (items.length) {
        setSiteCodeInput("");
        AsyncStorage.setItem("site_id", items[0]["site_id"].S);
        navigation.navigate("HomePage");
      } else {
        Alert.alert("Scan Failed", "Invalid QR code. Please try again", [{ text: "OK" }]);
      }
      siteCode = data.substring(10);
    }
  };

  const handlePress = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const values = await AsyncStorage.multiGet(keys);
    console.log(values);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Stack style={styles.centeredStack} direction="column" spacing={height * 0.03}>
          <Stack style={styles.centeredStack} direction="column" spacing={height * 0.01}>
            <Text style={{fontSize: 30, fontWeight: "bold"}}>1. Type Code</Text>
            <TextInput
              style={{ width: width * 0.75 }}
              label="Site Code"
              color="crimson"
              value={siteCodeInput}
              keyboardType="numeric"
              leading={props => <MaterialCommunityIcons name="office-building-cog-outline" size={24} color="black" />}
              onChangeText={text => setSiteCodeInput(text)}/>
            <Button
              style={{ width: width * 0.5 }}
              title="Submit"
              color="crimson"
              onPress={handleSubmitBtn}/>
            <Text style={{
              fontSize: 14,
            }}>*Every site has a unique code</Text>
          </Stack>
          <Text style={{ fontSize: 20, fontStyle: "italic" }}>OR</Text>
          <Stack style={styles.centeredStack} direction="column" spacing={height * 0.01}>
            {cameraPermission ? <Text style={{fontSize: 30, fontWeight: "bold"}}>2. Scan QR Code</Text> :
              <Stack style={styles.centeredStack} direction="row" spacing={width * 0.1}>
                <Text style={{fontSize: 30, fontWeight: "bold"}}>2. Scan QR Code</Text>
                <IconButton
                  backgroundColor="black"
                  icon={props => <MaterialCommunityIcons name="camera-off" size={24} color="white"/>}
                  onPress={() => getCameraPermission()} />
              </Stack>}
            <View style={styles.qrCodeBox}>
              <BarCodeScanner
                style={{ width: width * 0.75, height: width * 0.75 }}
                onBarCodeScanned={scanned ? undefined : handleQRCodeScanned} />
            </View>
            {cameraPermission ? <Button style={{ width: width * 0.5 }} title="Scan" color="crimson" onPress={() => setScanned(false)} /> : <Button style={{ width: width * 0.5 }} title="Rescan" color="crimson"/>}
            <Text style={{
              fontSize: 14,
            }}>*Every site has a scannable QR Code</Text>
          </Stack>
          {/* <Button title = "Show Storage" onPress={handlePress}/> */}
        </Stack>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

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
  qrCodeBox: {
    width: width * 0.75,
    height: width * 0.75,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "black"
  },
});

export default JoinSitePage;
