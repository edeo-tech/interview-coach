'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { protectedApi } from '@/lib/api';

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

// CV API functions using web protectedApi
const cvApi = {
  upload: (file: FormData) => 
    protectedApi.post<CVProfile>('/app/interviews/cv/', file, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  get: () => 
    protectedApi.get<CVProfile>('/app/interviews/cv/'),

  delete: () =>
    protectedApi.delete('/app/interviews/cv/')
};

// Query keys
export const cvKeys = {
  all: ['cv'] as const,
  profile: () => [...cvKeys.all, 'profile'] as const,
};

// Hooks
export const useCV = () => {
  return useQuery({
    queryKey: cvKeys.profile(),
    queryFn: async () => {
      try {
        const response = await cvApi.get();
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // No CV uploaded yet
        }
        throw error;
      }
    },
  });
};

export const useUploadCV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: FormData) => cvApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.profile() });
    },
  });
};

export const useDeleteCV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cvApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.profile() });
    },
  });
};