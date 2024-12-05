import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import config from '../config';

dotenv.config();


const s3 = new AWS.S3({
    accessKeyId: config.aws_access_key,
    secretAccessKey: config.aws_secret_access_key,
    region: config.aws_region,
});

// Function to upload image to S3
export const uploadImageToS3 = async (file: Express.Multer.File) => {
    const { buffer, originalname } = file;
    const fileExtension = path.extname(originalname);
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;

    const mimeType = file.mimetype || 'application/octet-stream'; // Fallback MIME type

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `uploads/${uniqueFilename}`,  // S3 path where the file will be saved
        Body: buffer,
        ACL: 'public-read', // Make file publicly accessible
        ContentType: mimeType,
    };

    try {
        // Upload the file to S3
        const data = await s3.upload(params).promise();

        return data.Location;  // Return URL of uploaded file
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Error uploading file to S3');
    }
};
