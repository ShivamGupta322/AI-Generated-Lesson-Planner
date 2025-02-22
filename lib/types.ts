export interface User {
  email: string;
  name: string;
}

export interface LessonPlan {
  id: string;
  topic: string;
  gradeLevel: string;
  mainConcept: string;
  subTopics: string[];
  materials: string[];
  objectives: string[];
  outline: LessonOutline;
  aiContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonOutline {
  introduction: string;
  development: string;
  practice: string;
  assessment: string;
  closure: string;
}