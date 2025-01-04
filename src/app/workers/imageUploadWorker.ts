import { Worker } from 'bullmq';
import { uploadImageToS3 } from '../utils/uploadImageToS3';
import config from '../config';
import { deleteImageFromS3 } from '../utils/deleteImageFromS3';

const imageUploadWorker = new Worker(
    'imageUploadQueue',
    async (job) => {
        if (job?.name === 'uploadImage') {
            const { file, fileName, folderName } = job.data;
            const fileBuffer = Buffer.from(file.buffer, 'base64');

            const reconstructedFile = {
                ...file,
                buffer: fileBuffer,
            };

            console.log(`Uploading file: ${file.originalname}`);
            const url = await uploadImageToS3(reconstructedFile, fileName, folderName);
            console.log(`File uploaded: ${url}`);
            return url; // Returning the URL for monitoring or logging purposes.
        }
        else if (job?.name === 'deleteImage') {
            const { imageUrl } = job.data;
            console.log(`Deleting image with url ${imageUrl}`)
            const result = await deleteImageFromS3(imageUrl);
            console.log(`Deleted image with URL: ${imageUrl}`)
            return result;
        }
    },
    {
        connection: {
            host: config.redis_host,
            port: Number(config.redis_port),
        },
    }
);

imageUploadWorker.on('completed', (job) => {
    console.log(`Job ${job?.id} completed successfully`);
});

imageUploadWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

export default imageUploadWorker;
