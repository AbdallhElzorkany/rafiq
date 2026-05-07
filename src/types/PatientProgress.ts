export interface PatientCategoryProgress {
  categoryId: number;
  categoryName: string;
  gamesPlayed: number;
  totalPoints: number;
}

export interface PatientCategoryProgressApiItem {
  score: number;
  questionsEarnedPoints: number;
  questionsMaxPoints: number;
  questionsNumber: number;
  currentQuestion: number;
  assessmentId: number;
  categoryId: number;
  categoryName: string;
}

export interface PatientProgressData {
  patientId: number;
  totalGamesPlayed: number;
  totalEarnedPoints: number;
  byCategory: PatientCategoryProgress[];
}

export interface PatientProgressApiResponse {
  value: PatientCategoryProgressApiItem[] | null;
  isSuccess: boolean;
  statusCode: number;
  message: string;
}
