import { generateUnitQueue, generateLessonQueue, generateSummaryQueue } from './queues';

export interface GenerateUnitJobData {
  unitId: string;
  userId: string;
}

export interface GenerateLessonJobData {
  lessonId: string;
  unitId: string;
  userId: string;
  orderIndex: number;
}

export interface GenerateSummaryJobData {
  unitId: string;
  userId: string;
}

export const jobs = {
  enqueueGenerateUnit(data: GenerateUnitJobData) {
    return generateUnitQueue.add('generate-unit', data);
  },

  enqueueGenerateLesson(data: GenerateLessonJobData) {
    return generateLessonQueue.add('generate-lesson', data);
  },

  enqueueGenerateSummary(data: GenerateSummaryJobData) {
    return generateSummaryQueue.add('generate-summary', data);
  },
};
