export interface InterviewCard {
    id: string;
    companyName: string;
    companyLogo: string;
    role: string;
    attempts: number;
    averageScore: number;
    lastAttemptDate?: Date;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    duration: number; // in minutes
    topics: string[];
}

export interface MockInterview {
    id: string;
    interviewCardId: string;
    date: Date;
    score: number;
    duration: number; // in minutes
    feedback: string;
    strengths: string[];
    improvements: string[];
}