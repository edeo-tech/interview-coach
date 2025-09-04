export interface OnboardingAnswers {
  _id: string;
  user_id: string;
  industry: string;
  has_failed: boolean;
  preparation_rating: number;
  communication_rating: number;
  nerves_rating: number;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingAnswersSubmission {
  industry: string;
  has_failed: boolean;
  preparation_rating: number;
  communication_rating: number;
  nerves_rating: number;
}