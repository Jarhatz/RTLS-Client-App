import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { S3 } from "aws-sdk";

export const S3Client = new S3({
  region: "us-west-2",
  credentials: {
    accessKeyId: "AKIAXPVEIVP46HIEYMF6",
    secretAccessKey: "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",
  },
});
