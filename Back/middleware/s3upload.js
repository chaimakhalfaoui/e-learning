import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, PutObjectAclCommand } from "@aws-sdk/client-s3";
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
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  });

  const upload = multer({ storage, limits });

  // Wrap to set public-read ACL after upload
  return {
    single: (fieldName) => (req, res, next) => {
      upload.single(fieldName)(req, res, async (err) => {
        if (err) return next(err);
        if (req.file && req.file.key) {
          try {
            await s3.send(new PutObjectAclCommand({
              Bucket: BUCKET,
              Key: req.file.key,
              ACL: "public-read"
            }));
          } catch (e) {
            console.error("ACL error:", e.message);
          }
        }
        next();
      });
    }
  };
};

export const getFileUrl = (file) => file ? file.location : null;
