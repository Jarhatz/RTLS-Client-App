import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

export const dbClient = new DynamoDB({
  region: "us-west-2",
  credentials: {},
});
