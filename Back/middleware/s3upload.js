import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET = "isetso-uploads-378174569462";

export const createS3Upload = (folder = "uploads", limits = { fileSize: 500 * 1024 * 1024 }) => {
  const storage = multerS3({
    s3,
    bucket: BUCKET,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + uuidv4();
      cb(null, `${folder}/${uniqueSuffix}-${file.originalname}`);
    }
  });
  return multer({ storage, limits });
};

export const getFileUrl = (file) => file ? file.location : null;
