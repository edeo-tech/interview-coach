import { Ionicons } from '@expo/vector-icons';
import { InterviewType } from '../_api/interviews/feedback';

export interface InterviewTypeDisplayConfig {
  type: InterviewType;
  displayName: string;
  icon: keyof typeof Ionicons.glyphMap;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  rubricCategories: {
    key: string;
    displayName: string;
    description: string;
  }[];
}

export const INTERVIEW_TYPE_CONFIGS: Record<InterviewType, InterviewTypeDisplayConfig> = {
  [InterviewType.PHONE_SCREEN]: {
    type: InterviewType.PHONE_SCREEN,
    displayName: 'Phone Screen',
    icon: 'call',
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    description: 'Initial screening to assess basic fit and communication skills',
    rubricCategories: [
      { key: 'communication_clarity', displayName: 'Communication Clarity', description: 'Clear and concise communication' },
      { key: 'enthusiasm', displayName: 'Enthusiasm', description: 'Interest and enthusiasm for the role' },
      { key: 'basic_qualifications', displayName: 'Basic Qualifications', description: 'Meets fundamental job requirements' },
      { key: 'professionalism', displayName: 'Professionalism', description: 'Professional demeanor and etiquette' }
    ]
  },

  [InterviewType.INITIAL_HR_INTERVIEW]: {
    type: InterviewType.INITIAL_HR_INTERVIEW,
    displayName: 'HR Interview',
    icon: 'people',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    description: 'HR assessment of cultural fit and basic qualifications',
    rubricCategories: [
      { key: 'cultural_alignment', displayName: 'Cultural Alignment', description: 'Alignment with company values and culture' },
      { key: 'career_goals', displayName: 'Career Goals', description: 'Clear career objectives and growth mindset' },
      { key: 'work_experience', displayName: 'Work Experience', description: 'Relevant experience and achievements' },
      { key: 'soft_skills', displayName: 'Soft Skills', description: 'Interpersonal and collaborative abilities' }
    ]
  },

  [InterviewType.MOCK_SALES_CALL]: {
    type: InterviewType.MOCK_SALES_CALL,
    displayName: 'Sales Call',
    icon: 'megaphone',
    primaryColor: '#f59e0b',
    secondaryColor: '#fbbf24',
    description: 'Simulated sales call to assess selling skills',
    rubricCategories: [
      { key: 'discovery_questioning', displayName: 'Discovery', description: 'Quality of discovery and needs analysis' },
      { key: 'objection_handling', displayName: 'Objection Handling', description: 'Handling concerns and objections' },
      { key: 'rapport_building', displayName: 'Rapport Building', description: 'Building trust and connection' },
      { key: 'closing_technique', displayName: 'Closing', description: 'Moving the deal forward effectively' }
    ]
  },

  [InterviewType.PRESENTATION_PITCH]: {
    type: InterviewType.PRESENTATION_PITCH,
    displayName: 'Presentation',
    icon: 'easel',
    primaryColor: '#8b5cf6',
    secondaryColor: '#a78bfa',
    description: 'Presenting ideas or solutions to stakeholders',
    rubricCategories: [
      { key: 'presentation_structure', displayName: 'Structure', description: 'Clear structure and flow' },
      { key: 'content_quality', displayName: 'Content Quality', description: 'Depth and relevance of content' },
      { key: 'delivery_skills', displayName: 'Delivery', description: 'Speaking skills and engagement' },
      { key: 'visual_communication', displayName: 'Visuals', description: 'Use of visuals and examples' }
    ]
  },

  [InterviewType.TECHNICAL_SCREENING_CALL]: {
    type: InterviewType.TECHNICAL_SCREENING_CALL,
    displayName: 'Technical Screen',
    icon: 'code-slash',
    primaryColor: '#ef4444',
    secondaryColor: '#f87171',
    description: 'Initial technical assessment of skills and knowledge',
    rubricCategories: [
      { key: 'technical_accuracy', displayName: 'Technical Accuracy', description: 'Correctness of technical responses' },
      { key: 'problem_approach', displayName: 'Problem Approach', description: 'Approach to technical problems' },
      { key: 'coding_fundamentals', displayName: 'Coding Fundamentals', description: 'Understanding of core concepts' },
      { key: 'technical_communication', displayName: 'Communication', description: 'Explaining technical concepts' }
    ]
  },

  [InterviewType.SYSTEM_DESIGN_INTERVIEW]: {
    type: InterviewType.SYSTEM_DESIGN_INTERVIEW,
    displayName: 'System Design',
    icon: 'server',
    primaryColor: '#06b6d4',
    secondaryColor: '#22d3ee',
    description: 'Designing scalable systems and architectures',
    rubricCategories: [
      { key: 'architecture_design', displayName: 'Architecture', description: 'Overall system architecture' },
      { key: 'scalability_thinking', displayName: 'Scalability', description: 'Handling scale and performance' },
      { key: 'trade_off_analysis', displayName: 'Trade-offs', description: 'Analyzing design trade-offs' },
      { key: 'component_design', displayName: 'Components', description: 'Detailed component design' }
    ]
  },

  [InterviewType.PORTFOLIO_REVIEW]: {
    type: InterviewType.PORTFOLIO_REVIEW,
    displayName: 'Portfolio Review',
    icon: 'folder-open',
    primaryColor: '#ec4899',
    secondaryColor: '#f472b6',
    description: 'Reviewing past projects and technical decisions',
    rubricCategories: [
      { key: 'project_complexity', displayName: 'Complexity', description: 'Complexity and scope of projects' },
      { key: 'technical_depth', displayName: 'Technical Depth', description: 'Deep technical understanding' },
      { key: 'business_impact', displayName: 'Business Impact', description: 'Business value delivered' },
      { key: 'innovation', displayName: 'Innovation', description: 'Creative solutions and innovation' }
    ]
  },

  [InterviewType.CASE_STUDY]: {
    type: InterviewType.CASE_STUDY,
    displayName: 'Case Study',
    icon: 'analytics',
    primaryColor: '#84cc16',
    secondaryColor: '#a3e635',
    description: 'Analyzing business cases and proposing solutions',
    rubricCategories: [
      { key: 'problem_analysis', displayName: 'Problem Analysis', description: 'Understanding the core problem' },
      { key: 'solution_approach', displayName: 'Solution Approach', description: 'Structured solution development' },
      { key: 'business_acumen', displayName: 'Business Acumen', description: 'Business understanding' },
      { key: 'data_analysis', displayName: 'Data Analysis', description: 'Use of data and metrics' }
    ]
  },

  [InterviewType.BEHAVIORAL_INTERVIEW]: {
    type: InterviewType.BEHAVIORAL_INTERVIEW,
    displayName: 'Behavioral',
    icon: 'person-circle',
    primaryColor: '#2563eb',
    secondaryColor: '#3b82f6',
    description: 'Assessing past behaviors and situational responses',
    rubricCategories: [
      { key: 'star_method', displayName: 'STAR Method', description: 'Using STAR method effectively' },
      { key: 'self_awareness', displayName: 'Self-Awareness', description: 'Self-reflection and growth mindset' },
      { key: 'leadership_examples', displayName: 'Leadership', description: 'Demonstrating leadership' },
      { key: 'conflict_resolution', displayName: 'Conflict Resolution', description: 'Handling difficult situations' }
    ]
  },

  [InterviewType.VALUES_INTERVIEW]: {
    type: InterviewType.VALUES_INTERVIEW,
    displayName: 'Values Interview',
    icon: 'heart',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    description: 'Assessing alignment with company values and principles',
    rubricCategories: [
      { key: 'values_alignment', displayName: 'Values Alignment', description: 'Alignment with company values' },
      { key: 'ethical_reasoning', displayName: 'Ethics', description: 'Ethical decision making' },
      { key: 'cultural_contribution', displayName: 'Culture Contribution', description: 'Contributing to culture' },
      { key: 'authenticity', displayName: 'Authenticity', description: 'Genuine responses and beliefs' }
    ]
  },

  [InterviewType.TEAM_FIT_INTERVIEW]: {
    type: InterviewType.TEAM_FIT_INTERVIEW,
    displayName: 'Team Fit',
    icon: 'people-circle',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    description: 'Assessing collaboration and team dynamics fit',
    rubricCategories: [
      { key: 'collaboration_style', displayName: 'Collaboration', description: 'Working with others effectively' },
      { key: 'communication_skills', displayName: 'Communication', description: 'Team communication abilities' },
      { key: 'adaptability', displayName: 'Adaptability', description: 'Flexibility in team settings' },
      { key: 'contribution_examples', displayName: 'Contributions', description: 'Past team contributions' }
    ]
  },

  [InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER]: {
    type: InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER,
    displayName: 'Stakeholder',
    icon: 'briefcase',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    description: 'Meeting with business partners, clients, or key stakeholders',
    rubricCategories: [
      { key: 'stakeholder_communication', displayName: 'Communication', description: 'Communicating with non-technical audiences' },
      { key: 'business_understanding', displayName: 'Business Understanding', description: 'Understanding business needs' },
      { key: 'relationship_building', displayName: 'Relationships', description: 'Building stakeholder trust' },
      { key: 'requirements_gathering', displayName: 'Requirements', description: 'Eliciting requirements effectively' }
    ]
  },

  [InterviewType.EXECUTIVE_LEADERSHIP_ROUND]: {
    type: InterviewType.EXECUTIVE_LEADERSHIP_ROUND,
    displayName: 'Executive Round',
    icon: 'ribbon',
    primaryColor: '#ea580c',
    secondaryColor: '#f97316',
    description: 'Senior leadership assessment for strategic thinking',
    rubricCategories: [
      { key: 'strategic_thinking', displayName: 'Strategic Thinking', description: 'Strategic vision and planning' },
      { key: 'leadership_presence', displayName: 'Leadership', description: 'Executive presence and influence' },
      { key: 'business_judgment', displayName: 'Business Judgment', description: 'Sound business decisions' },
      { key: 'organizational_impact', displayName: 'Org Impact', description: 'Driving organizational change' }
    ]
  }
};

export function getInterviewTypeConfig(interviewType: InterviewType): InterviewTypeDisplayConfig {
  return INTERVIEW_TYPE_CONFIGS[interviewType] || INTERVIEW_TYPE_CONFIGS[InterviewType.TECHNICAL_SCREENING_CALL];
}