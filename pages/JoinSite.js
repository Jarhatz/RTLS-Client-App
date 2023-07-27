import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, TextInput } from "@react-native-material/core";
import { Text, IconButton, Dialog, Portal } from "react-native-paper";
import { Stack } from "react-native-flex-layout";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BarCodeScanner } from "expo-barcode-scanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DBClient } from "../comps/DBClient";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

const JoinSitePage = () => {
  const navigation = useNavigation();
  const [cameraPermission, setCameraPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [siteCodeInput, setSiteCodeInput] = useState("");
  const [visibleDialog1, setVisibleDialog1] = useState(false);
  const [visibleDialog2, setVisibleDialog2] = useState(false);
  const [visibleDialog3, setVisibleDialog3] = useState(false);

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
          ":value": { S: code },
        },
      };
    } else {
      params = {
        TableName: "sites",
        FilterExpression: "site_code = :value",
        ExpressionAttributeValues: {
          ":value": { S: code },
        },
      };
    }
    try {
      const response = await DBClient.scan(params);
      return response.Items;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const showDialog = (dialogType) => {
    if (dialogType === 1) {
      setVisibleDialog1(true);
    } else if (dialogType === 2) {
      setVisibleDialog2(true);
    } else {
      setVisibleDialog3(true);
    }
  };

  const hideDialog = (dialogType) => {
    if (dialogType === 1) {
      setVisibleDialog1(false);
    } else if (dialogType === 2) {
      setVisibleDialog2(false);
    } else {
      setVisibleDialog3(false);
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
        showDialog(1);
      }
    } else {
      showDialog(2);
    }
  };

  // Handle QR Code Scan
  const handleQRCodeScanned = async ({ type, data }) => {
    setScanned(true);
    if (data.length !== 64) {
      showDialog(3);
    } else {
      const items = await checkCode(data, 1);
      if (items.length) {
        setSiteCodeInput("");
        AsyncStorage.setItem("site_id", items[0]["site_id"].S);
        navigation.navigate("HomePage");
      } else {
        showDialog(3);
      }
      siteCode = data.substring(10);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Stack
          style={styles.centeredStack}
          direction="column"
          spacing={height * 0.03}
        >
          <Stack
            style={styles.centeredStack}
            direction="column"
            spacing={height * 0.015}
          >
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
              1. Type Code
            </Text>
            <TextInput
              style={{ width: width * 0.75 }}
              variant="outlined"
              label="Site Code"
              color="royalblue"
              value={siteCodeInput}
              keyboardType="number-pad"
              leading={(props) => (
                <MaterialCommunityIcons
                  name="office-building-cog-outline"
                  size={24}
                  color="black"
                />
              )}
              onChangeText={(text) => setSiteCodeInput(text)}
            />
            <Button
              style={{ width: width * 0.5 }}
              title="Submit"
              color="royalblue"
              onPress={handleSubmitBtn}
            />
            <Text
              style={{
                fontSize: 14,
              }}
            >
              *Every site has a unique code
            </Text>
          </Stack>
          <Text style={{ fontSize: 20, fontStyle: "italic" }}>OR</Text>
          <Stack
            style={styles.centeredStack}
            direction="column"
            spacing={height * 0.015}
          >
            {cameraPermission ? (
              <Text style={{ fontSize: 30, fontWeight: "bold" }}>
                2. Scan QR Code
              </Text>
            ) : (
              <Stack
                style={styles.centeredStack}
                direction="row"
                spacing={width * 0.05}
              >
                <Text style={{ fontSize: 30, fontWeight: "bold" }}>
                  2. Scan QR Code
                </Text>
                <IconButton
                  icon="camera-off"
                  iconColor="white"
                  size={24}
                  containerColor="black"
                  onPress={getCameraPermission}
                />
              </Stack>
            )}
            <View style={styles.qrCodeBox}>
              <BarCodeScanner
                style={{ width: width * 0.75, height: width * 0.75 }}
                onBarCodeScanned={scanned ? undefined : handleQRCodeScanned}
              />
            </View>
            <Button
              style={{ width: width * 0.5 }}
              title="Scan"
              color="royalblue"
              onPress={() => setScanned(false)}
            />
            <Text
              style={{
                fontSize: 14,
              }}
            >
              *Every site has a scannable QR Code
            </Text>
          </Stack>
          <Portal>
            <Dialog
              style={{ backgroundColor: "whitesmoke" }}
              visible={visibleDialog1}
              onDismiss={() => hideDialog(1)}
            >
              <Dialog.Title style={{ color: "royalblue", fontWeight: "bold" }}>
                Code Failed
              </Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">
                  Invalid site code. Please make sure the site code is correct.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  title="OK"
                  color="royalblue"
                  onPress={() => hideDialog(1)}
                />
              </Dialog.Actions>
            </Dialog>
            <Dialog
              style={{ backgroundColor: "whitesmoke" }}
              visible={visibleDialog2}
              onDismiss={() => hideDialog(2)}
            >
              <Dialog.Title style={{ color: "royalblue", fontWeight: "bold" }}>
                Code Failed
              </Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">
                  Invalid site code length. Please make sure the site code
                  length is greater than 3 digits.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  title="OK"
                  color="royalblue"
                  onPress={() => hideDialog(2)}
                />
              </Dialog.Actions>
            </Dialog>
            <Dialog
              style={{ backgroundColor: "whitesmoke" }}
              visible={visibleDialog3}
              onDismiss={() => hideDialog(3)}
            >
              <Dialog.Title style={{ color: "royalblue", fontWeight: "bold" }}>
                Scan Failed
              </Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">
                  Invalid QR code. Please make sure the site's QR code is in the
                  camera's view box.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  title="OK"
                  color="royalblue"
                  onPress={() => hideDialog(3)}
                />
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </Stack>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
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
    backgroundColor: "black",
  },
});

export default JoinSitePage;
