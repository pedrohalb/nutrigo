export interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ImageChoiceQuestion {
  type: 'image-choice';
  question: string;
  options: { label: string; emoji: string }[];
  correctIndex: number;
  explanation: string;
}

export interface FillBlankQuestion {
  type: 'fill-blank';
  question: string;
  chips: string[];
  correctChip: string;
  explanation: string;
}

export type Question = MultipleChoiceQuestion | ImageChoiceQuestion | FillBlankQuestion;
