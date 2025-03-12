import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/')
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed'), false);
    }
};

export const upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter,
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `${file.mimetype.startsWith('image/') ? 'images' : 'videos'}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
            cb(null, fileName);
        }
    })
}); 