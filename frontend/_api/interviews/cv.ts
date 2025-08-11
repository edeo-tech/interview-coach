import { protectedApi } from '../axiosConfig';

export interface CVProfile {
  _id: string;
  user_id: string;
  raw_text: string;
  structured_data: Record<string, any>;
  skills: string[];
  experience_years: number;
  education: Array<Record<string, any>>;
  certifications: string[];
  parsed_at: string;
  created_at: string;
  updated_at: string;
}

export const cvApi = {
  upload: (file: FormData) => 
    protectedApi.post<CVProfile>('/app/interviews/cv/', file, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  get: () => 
    protectedApi.get<CVProfile>('/app/interviews/cv/'),

  delete: () =>
    protectedApi.delete('/app/interviews/cv/')
};