import { InterviewType } from '../interviews/interview-types';

export interface Job {
  _id: string;
  user_id: string;
  company: string;
  role_title: string;
  company_logo_url?: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range: string;
  jd_raw: string;
  job_description: any;
  source_type: string;
  source_url?: string;
  interview_stages: InterviewType[];
  stages_completed: number;
  status: 'in_progress' | 'completed';
  total_attempts: number;
  last_attempt_date?: string;
  created_at: string;
}

export interface JobInterview {
  _id: string;
  job_id: string;
  user_id: string;
  interview_type: InterviewType;
  stage_order: number;
  status: 'pending' | 'active' | 'completed';
  difficulty: string;
  focus_areas: string[];
  total_attempts: number;
  best_score: number;
  last_attempt_date?: string;
  created_at: string;
}

export interface JobWithInterviews {
  job: Job;
  interviews: JobInterview[];
}