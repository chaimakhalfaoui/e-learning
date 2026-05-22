import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuration du client S3
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

const BUCKET = "isetso-uploads-378174569462";

export const presignGetObject = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({ 
      Bucket: BUCKET, 
      Key: key 
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Erreur presign:", error);
    return null;
  }
};
