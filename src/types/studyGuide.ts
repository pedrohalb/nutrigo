export interface StudyGuideQuestionEntry {
  id: number;
  text: string;
  correct: boolean;
  fullQuestion: string;
  userAnswer: string;
  explanation: string;
}

export type StudyGuideQuestion = StudyGuideQuestionEntry & { lessonTitle: string };

export interface LessonData {
  title: string;
  questionsCount: number;
  progress: number;
  questions: StudyGuideQuestionEntry[];
}
