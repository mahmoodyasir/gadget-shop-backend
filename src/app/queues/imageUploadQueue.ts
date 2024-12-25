import { Queue } from 'bullmq';
import config from '../config';

const imageUploadQueue = new Queue('imageUploadQueue', {
    connection: {
        host: config.redis_host,
        port: Number(config.redis_port),
    },
});

export default imageUploadQueue;
