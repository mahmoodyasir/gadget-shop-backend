import { Worker, Job, WorkerOptions } from 'bullmq';
import AWS from 'aws-sdk';
import fs from 'fs';
import mime from 'mime-types';
import Redis from 'ioredis'; // Import ioredis for the connection

// Initialize Redis connection
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',  // Replace with your Redis host if not local
    port: Number(process.env.REDIS_PORT) || 6379, // Default Redis port
    password: process.env.REDIS_PASSWORD || '',   // Optional password if your Redis requires one
});

// Initialize AWS S3 client with credentials and region
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,  // Ensure the region is included here
});

interface IImageUploadJob {
    tempFilePath: string;
    uniqueFilename: string;
}

const uploadWorker = new Worker<IImageUploadJob>('image-uploads', async (job: Job<IImageUploadJob>) => {
    const { tempFilePath, uniqueFilename } = job.data;

    try {
        // Read the file from the temporary path
        const fileData = fs.readFileSync(tempFilePath);

        // Dynamically get the MIME type of the file
        const mimeType = mime.lookup(uniqueFilename) || 'application/octet-stream'; // Default to octet-stream if MIME type cannot be determined

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `products/${uniqueFilename}`,
            Body: fileData,
            ACL: 'public-read',
            ContentType: mimeType,  // Dynamically set the content type
        };

        // Upload the file to S3
        await s3.upload(params).promise();

        // Delete the temporary file after upload
        fs.unlinkSync(tempFilePath);

        // Return the image URL
        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${uniqueFilename}`;
    } catch (error: any) {
        throw new Error(`Failed to upload: ${error.message}`);
    }
}, {
    connection: redis, // Pass the Redis connection object
    limiter: {
        max: 10,  // Max 10 jobs per 1000ms (1 second)
        duration: 1000,  // Time window for the rate limiter
    },
});

export default uploadWorker;
