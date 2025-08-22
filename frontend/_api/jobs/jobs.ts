import { protectedApi } from '../axiosConfig';

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
  interview_stages: string[];
  stages_completed: number;
  status: string;
  total_attempts: number;
  last_attempt_date?: string;
  created_at: string;
}

export interface Interview {
  _id: string;
  job_id: string;
  user_id: string;
  interview_type: string;
  stage_order: number;
  status: string;
  difficulty: string;
  focus_areas: string[];
  total_attempts: number;
  last_attempt_date?: string;
  created_at: string;
}

export interface JobWithInterviews {
  job: Job;
  interviews: Interview[];
}

export interface CreateJobFromURLRequest {
  job_url: string;
}

export const createJobFromURL = async (data: CreateJobFromURLRequest): Promise<JobWithInterviews> => {
  const response = await protectedApi.post('/app/jobs/create/url', data);
  return response.data;
};

export const createJobFromFile = async (formData: FormData): Promise<JobWithInterviews> => {
  const response = await protectedApi.post('/app/jobs/create/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUserJobs = async (limit: number = 10): Promise<Job[]> => {
  const response = await protectedApi.get('/app/jobs/', {
    params: { limit },
  });
  return response.data;
};

export const getJobDetails = async (jobId: string): Promise<JobWithInterviews> => {
  const response = await protectedApi.get(`/app/jobs/${jobId}`);
  return response.data;
};

export const startJobInterviewAttempt = async (jobId: string, interviewId: string): Promise<{ attempt_id: string }> => {
  const response = await protectedApi.post(`/app/jobs/${jobId}/interviews/${interviewId}/start`);
  return response.data;
};