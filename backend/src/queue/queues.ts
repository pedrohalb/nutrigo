import { Queue } from 'bullmq';
import { redisConnection } from './connection';

export const generateUnitQueue = new Queue('generate-unit', {
  connection: redisConnection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
});

export const generateLessonQueue = new Queue('generate-lesson', {
  connection: redisConnection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
});

export const generateSummaryQueue = new Queue('generate-summary', {
  connection: redisConnection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
});
