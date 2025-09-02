import { protectedApi } from '../axiosConfig';

export interface CVProfile {
  _id: string;
  user_id: string;
  raw_text: string;
  
  // Enhanced structured data from OpenAI
  personal_info: Record<string, any>;
  professional_summary: string;
  
  // Skills breakdown
  technical_skills: string[];
  programming_languages: string[];
  frameworks: string[];
  tools: string[];
  soft_skills: string[];
  spoken_languages: string[];
  
  // Experience and education
  experience: Array<Record<string, any>>;
  education: Array<Record<string, any>>;
  certifications: Array<Record<string, any>>;
  projects: Array<Record<string, any>>;
  
  // Additional information
  additional_info: Record<string, any>;
  
  // Metadata and computed fields
  total_experience_years: number;
  current_level: string; // junior/mid/senior
  primary_field: string;
  confidence_score: number;
  
  // Legacy fields for backward compatibility
  skills: string[]; // Combined technical skills
  experience_years: number; // Alias for total_experience_years
  
  // Processing metadata
  parsed_at: string;
  processing_method: string; // openai/legacy
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