import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import config from '../config';

dotenv.config();


const s3 = new AWS.S3({
    accessKeyId: config.aws_access_key,
    secretAccessKey: config.aws_secret_access_key,
    region: config.aws_region,
});


export const deleteImageFromS3 = async (imageUrl: string) => {
    try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME!;
        const urlParts = new URL(imageUrl);
        const key = decodeURIComponent(urlParts.pathname.substring(1)); // Removing leading "/"

        const params = {
            Bucket: bucketName,
            Key: key,
        };

        await s3.deleteObject(params).promise();

        console.log(`File deleted successfully: ${key}`);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Error deleting file from S3');
    }
};