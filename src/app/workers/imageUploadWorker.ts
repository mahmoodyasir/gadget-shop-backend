import { Worker } from 'bullmq';
import { uploadImageToS3 } from '../utils/uploadImageToS3';
import config from '../config';

const imageUploadWorker = new Worker(
    'imageUploadQueue',
    async (job) => {
        const file = job.data.file;
        console.log(`Uploading file: ${file.originalname}`);
        const url = await uploadImageToS3(file);
        console.log(`File uploaded: ${url}`);
        return url; // You can optionally return the URL for monitoring or logging purposes.
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
