import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, PutObjectAclCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET = "isetso-uploads-378174569462";

// Fonction pour déterminer le Content-Type en fonction du fichier
const getContentType = (filename, mimetype) => {
    const ext = filename.split('.').pop().toLowerCase();
    const contentTypes = {
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'webm': 'video/webm',
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
    // Utiliser le mimetype original si disponible, sinon l'extension
    if (mimetype && mimetype !== 'application/octet-stream') {
        return mimetype;
    }
    return contentTypes[ext] || 'application/octet-stream';
};

export const createS3Upload = (folder = "uploads", limits = { fileSize: 500 * 1024 * 1024 }) => {
  const storage = multerS3({
    s3,
    bucket: BUCKET,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + uuidv4();
      cb(null, `${folder}/${uniqueSuffix}-${file.originalname}`);
    },
    contentType: function (req, file, cb) {
      // Définir explicitement le Content-Type
      const contentType = getContentType(file.originalname, file.mimetype);
      cb(null, contentType);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname, originalName: file.originalname });
    }
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
            console.log(`Fichier uploadé avec succès: ${req.file.key}, Content-Type: ${req.file.contentType}`);
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
