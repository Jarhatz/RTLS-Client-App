import React, {useState, useEffect} from 'react';
import {Alert, Dimensions, Platform, StatusBar, StyleSheet, SafeAreaView, Keyboard, View, Text, TouchableWithoutFeedback} from 'react-native';
import {Stack} from 'react-native-flex-layout';
import {Button, TextInput, IconButton} from '@react-native-material/core';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {ddbDocClient} from "../libs/DDBDocClient.js";
import {GetCommand, QueryCommand} from '@aws-sdk/client-dynamodb';


const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');
// const RTLS_AWS_ACCESS_KEY_ID = Config.RTLS_AWS_ACCESS_KEY_ID;
// const RTLS_AWS_SECRET_ACCESS_KEY = Config.RTLS_AWS_SECRET_ACCESS_KEY; 

const JoinSitePage = ({navigation}) => {

  const [cameraPermission, setCameraPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  const [siteCodeText, setSiteCodeText] = useState('');
  var siteCode = '';

  // Request Camera Permission
  useEffect(() => {
    // console.log(RTLS_AWS_ACCESS_KEY_ID);
    // console.log(RTLS_AWS_SECRET_ACCESS_KEY);
    askCameraPermission();
  }, []);

  const askCameraPermission = () => {
    (async () => {
      const {status} = await BarCodeScanner.requestPermissionsAsync();
      setCameraPermission(status === 'granted');
    })()
  }

  const sendQuery = async () => {
    try {
      const data = await ddbDocClient.send(new QueryCommand(params))
    } catch {

    }
  }

  // const dynamoDB = new AWS.DynamoDB.DocumentClient({
  //   region: 'YOUR_REGION',
  //   accessKeyId: 'YOUR_ACCESS_KEY_ID',
  //   secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  // });

  // const params = {
  //   TableName: 'YOUR_TABLE_NAME',
  // };
  
  // dynamoDB.scan(params, (error, data) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log(data);
  //   }
  // });

  const handleSubmitBtn = () => {
    Keyboard.dismiss();
    let mySiteCode = siteCodeText;
    setSiteCodeText('');
    console.log('Site Code: ' + mySiteCode);
    navigation.navigate('HomePage');
  }

  // Handle QR Code Scan
  const handleQRCodeScanned = ({type, data}) => {
    setScanned(true);
    if (data.length == 0 || !data.startsWith('site-code-')) {
      Alert.alert('Scan Failed', 'Invalid site code, please try again', [{text : 'OK'}]);
    } else {
      siteCode = data.substring(10);
      console.log('Site-Code: ' + siteCode);
    }
  }

  return (
    <SafeAreaView style = {styles.container}>
      <StatusBar barStyle = {'dark-content'}/>
      <TouchableWithoutFeedback onPress = {Keyboard.dismiss} accessible = {false}>
        <Stack style = {styles.centeredStack} direction = 'column' spacing = {height * 0.03}>
          <Stack style = {styles.centeredStack} direction = 'column' spacing = {height * 0.01}>
            <Text style = {{fontSize: 30, fontWeight: 'bold'}}>1. Type Code</Text>
            <TextInput
              style = {{width: width * 0.75}}
              label = "Site Code"
              value = {siteCodeText}
              keyboardType = 'numeric'
              leading = {props => <MaterialCommunityIcons name = 'office-building-cog-outline' size = {24} color = 'black'/>}
              onChangeText = {text => setSiteCodeText(text)}
            />
            <Button
              style = {{width: width * 0.5}}
              title = 'Submit'
              color = 'mediumseagreen'
              onPress = {handleSubmitBtn}
            />
            <Text style = {{
              fontSize: 14,
            }}>*Ask your administration for your site's unique code</Text>
          </Stack>
          <Text style = {{fontSize: 20, fontStyle: 'italic'}}>OR</Text>
          <Stack style = {styles.centeredStack} direction = 'column' spacing = {height * 0.01}>
            {
              cameraPermission ? <Text style = {{fontSize: 30, fontWeight: 'bold'}}>2. Scan QR Code</Text> :
              <Stack style = {styles.centeredStack} direction = 'row' spacing = {width * 0.1}>
                <Text style = {{fontSize: 30}}>2. Scan QR Code</Text>
                <IconButton
                  backgroundColor = 'black'
                  icon = {props => <MaterialCommunityIcons name = 'camera-off' size = {24} color = 'white'/>}
                  onPress = {() => askCameraPermission()}
                />
              </Stack>
            }
            <View style = {styles.qrCodeBox}>
              <BarCodeScanner
              style = {{width: width * 0.75, height: width * 0.75}}
                onBarCodeScanned = {scanned ? undefined : handleQRCodeScanned}
              />
            </View>
            {cameraPermission ? <Button style = {{width: width * 0.5}} title = 'Scan' color = 'mediumseagreen' onPress = {() => setScanned(false)}/> : <Button style = {{width: width * 0.5}} title = 'Rescan'/>}
            <Text style = {{
              fontSize: 14,
            }}>*Every site also has a scannable QR Code</Text>
          </Stack>
        </Stack>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeBox: {
    width: width * 0.75,
    height: width * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'black'
  },
});

export default JoinSitePage;
