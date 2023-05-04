import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { S3 } from "aws-sdk";

export const S3Client = new S3({
  region: "us-west-2",
  credentials: {
    accessKeyId: "AKIAXPVEIVP4SS6GYIOD",
    secretAccessKey: "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",
  },
});
