import { InterviewCard } from '@/_interfaces/interviews/interview';

export const mockInterviewCards: InterviewCard[] = [
    {
        id: '1',
        companyName: 'Google',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png',
        role: 'Senior Software Engineer',
        attempts: 3,
        averageScore: 85,
        lastAttemptDate: new Date('2025-01-08'),
        difficulty: 'Hard',
        duration: 45,
        topics: ['System Design', 'Algorithms', 'Behavioral']
    },
    {
        id: '2',
        companyName: 'Meta',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png',
        role: 'Product Manager',
        attempts: 2,
        averageScore: 78,
        lastAttemptDate: new Date('2025-01-05'),
        difficulty: 'Medium',
        duration: 30,
        topics: ['Product Strategy', 'Analytics', 'Leadership']
    },
    {
        id: '3',
        companyName: 'Amazon',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png',
        role: 'Cloud Architect',
        attempts: 5,
        averageScore: 92,
        lastAttemptDate: new Date('2025-01-09'),
        difficulty: 'Hard',
        duration: 60,
        topics: ['AWS', 'System Design', 'Leadership Principles']
    },
    {
        id: '4',
        companyName: 'Microsoft',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png',
        role: 'Data Scientist',
        attempts: 1,
        averageScore: 70,
        lastAttemptDate: new Date('2025-01-03'),
        difficulty: 'Medium',
        duration: 40,
        topics: ['Machine Learning', 'Statistics', 'Python']
    },
    {
        id: '5',
        companyName: 'Apple',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png',
        role: 'iOS Developer',
        attempts: 4,
        averageScore: 88,
        lastAttemptDate: new Date('2025-01-07'),
        difficulty: 'Medium',
        duration: 35,
        topics: ['Swift', 'UIKit', 'Design Patterns']
    },
    {
        id: '6',
        companyName: 'Netflix',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/512px-Netflix_2015_logo.svg.png',
        role: 'Backend Engineer',
        attempts: 0,
        averageScore: 0,
        difficulty: 'Easy',
        duration: 25,
        topics: ['Microservices', 'Java', 'Distributed Systems']
    }
];