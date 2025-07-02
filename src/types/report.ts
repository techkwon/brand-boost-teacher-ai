
export interface Question {
  id: string;
  type: 'objective' | 'subjective';
  text: string;
  options?: Array<{
    text: string;
    value: string;
  }>;
  placeholder?: string;
}

export interface UserAnswers {
  [key: string]: string;
}

export interface TeacherCharacter {
  name: string;
  description: string;
}

export interface GrowthPoint {
  title: string;
  description: string;
}

export interface TeacherReport {
  id?: string;
  character: TeacherCharacter;
  slogan: string;
  strengths: string[];
  growth_point: GrowthPoint;
  imageUrl: string;
  createdAt?: string;
}

export interface AIAnalysisResult {
  character: TeacherCharacter;
  slogan: string;
  strengths: string[];
  growth_point: GrowthPoint;
  image_prompt: string;
}
