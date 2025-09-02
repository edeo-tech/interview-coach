from typing import Dict, List, Any
from dataclasses import dataclass
from models.interviews.interview_types import InterviewType


@dataclass
class RubricCriteria:
    name: str
    key: str
    description: str
    weight: float = 1.0


@dataclass
class InterviewTypeConfig:
    type: InterviewType
    display_name: str
    description: str
    rubric_criteria: List[RubricCriteria]
    prompt_template: str
    scoring_guidelines: Dict[str, str]
    improvement_focus: List[str]
    icon: str  # Icon name for frontend
    color_scheme: Dict[str, str]  # Primary and secondary colors


# Define rubric criteria for each interview type
INTERVIEW_CONFIGS: Dict[InterviewType, InterviewTypeConfig] = {
    InterviewType.PHONE_SCREEN: InterviewTypeConfig(
        type=InterviewType.PHONE_SCREEN,
        display_name="Phone Screen",
        description="Initial screening to assess basic fit and communication skills",
        rubric_criteria=[
            RubricCriteria("communication_clarity", "communication_clarity", "Clear and concise communication"),
            RubricCriteria("enthusiasm", "enthusiasm", "Interest and enthusiasm for the role"),
            RubricCriteria("basic_qualifications", "basic_qualifications", "Meets fundamental job requirements"),
            RubricCriteria("professionalism", "professionalism", "Professional demeanor and etiquette")
        ],
        prompt_template="""You are an expert recruiter evaluating a phone screening interview for a {role} position at {company}.

This is an INITIAL PHONE SCREEN - evaluate the candidate's basic communication, enthusiasm, and general fit.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to engage: Score below 10%
- Minimal participation, one-word answers, or early termination: Score 0-10%
- Brief answers without elaboration throughout: Score 10-25%
- Full engagement with detailed responses is the minimum expectation

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

INTERVIEW TRANSCRIPT:
{transcript}

Evaluate the candidate's phone screen performance focusing on:
1. Communication clarity and articulation
2. Genuine enthusiasm for the role and company
3. Basic alignment with job requirements
4. Professional phone etiquette and demeanor

BE HARSH: This is a competitive process. Short answers, lack of enthusiasm, or minimal engagement should result in very low scores. If the candidate ended the interview early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific strengths>],
    "improvement_areas": [<3-5 areas to improve>],
    "detailed_feedback": "<paragraph analyzing their phone screen performance>",
    "rubric_scores": {{
        "communication_clarity": <0-100>,
        "enthusiasm": <0-100>,
        "basic_qualifications": <0-100>,
        "professionalism": <0-100>
    }}
}}""",
        scoring_guidelines={
            "communication_clarity": "Assess clarity, pace, articulation, and ability to express thoughts",
            "enthusiasm": "Evaluate genuine interest, energy, and motivation for the role",
            "basic_qualifications": "Check if they meet fundamental requirements and have relevant background",
            "professionalism": "Rate phone etiquette, courtesy, and professional demeanor"
        },
        improvement_focus=["communication", "enthusiasm", "preparation", "questions"],
        icon="phone",
        color_scheme={"primary": "#3b82f6", "secondary": "#60a5fa"}
    ),

    InterviewType.INITIAL_HR_INTERVIEW: InterviewTypeConfig(
        type=InterviewType.INITIAL_HR_INTERVIEW,
        display_name="Initial HR Interview",
        description="HR assessment of cultural fit and basic qualifications",
        rubric_criteria=[
            RubricCriteria("cultural_alignment", "cultural_alignment", "Alignment with company values and culture"),
            RubricCriteria("career_goals", "career_goals", "Clear career objectives and growth mindset"),
            RubricCriteria("work_experience", "work_experience", "Relevant experience and achievements"),
            RubricCriteria("soft_skills", "soft_skills", "Interpersonal and collaborative abilities")
        ],
        prompt_template="""You are an experienced HR professional evaluating an initial HR interview for a {role} position at {company}.

Focus on assessing cultural fit, career alignment, and soft skills rather than deep technical abilities.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to engage: Score below 10%
- Minimal participation, one-word answers, or early termination: Score 0-10%
- Brief answers without elaboration throughout: Score 10-25%
- Full engagement with detailed responses is the minimum expectation

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

INTERVIEW TRANSCRIPT:
{transcript}

Evaluate the candidate's HR interview performance focusing on:
1. Cultural fit and values alignment
2. Career goals and growth mindset
3. Relevant work experience and achievements
4. Soft skills and team collaboration

BE HARSH: HR interviews require thoughtful, detailed responses about values and experiences. Short answers or minimal engagement demonstrates lack of preparation and interest. If the candidate ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific strengths>],
    "improvement_areas": [<3-5 areas to improve>],
    "detailed_feedback": "<paragraph analyzing their HR interview performance>",
    "rubric_scores": {{
        "cultural_alignment": <0-100>,
        "career_goals": <0-100>,
        "work_experience": <0-100>,
        "soft_skills": <0-100>
    }}
}}""",
        scoring_guidelines={
            "cultural_alignment": "How well they align with company values and culture",
            "career_goals": "Clarity and alignment of career objectives with the role",
            "work_experience": "Relevance and impact of past experiences",
            "soft_skills": "Communication, teamwork, and interpersonal abilities"
        },
        improvement_focus=["cultural fit", "career clarity", "storytelling", "team collaboration"],
        icon="users",
        color_scheme={"primary": "#10b981", "secondary": "#34d399"}
    ),

    InterviewType.MOCK_SALES_CALL: InterviewTypeConfig(
        type=InterviewType.MOCK_SALES_CALL,
        display_name="Mock Sales Call",
        description="Simulated sales call to assess selling skills",
        rubric_criteria=[
            RubricCriteria("discovery_questioning", "discovery_questioning", "Quality of discovery and needs analysis"),
            RubricCriteria("objection_handling", "objection_handling", "Handling concerns and objections"),
            RubricCriteria("rapport_building", "rapport_building", "Building trust and connection"),
            RubricCriteria("closing_technique", "closing_technique", "Moving the deal forward effectively")
        ],
        prompt_template="""You are an expert sales manager evaluating a mock sales call for a {role} position at {company}.

IMPORTANT: This was a SALES CALL SIMULATION where the candidate acted as the salesperson and the AI acted as a prospect.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short responses or fail to engage: Score below 10%
- Minimal participation, giving up quickly, or early termination: Score 0-10%
- Brief answers without attempting discovery or objection handling: Score 10-25%
- Sales requires persistence and engagement - anything less is failure

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

SALES CALL TRANSCRIPT:
{transcript}

Evaluate the candidate's sales performance focusing on:
1. Discovery questioning and needs analysis
2. Objection handling and concern resolution
3. Rapport building and trust creation
4. Closing techniques and next steps

SALES-SPECIFIC EVALUATION:
- Did they lead the conversation as a salesperson should?
- Quality of questions to uncover pain points
- How they handled "we already have a solution" or budget objections
- Professional persistence without being pushy

BE EXTREMELY HARSH: Sales roles require exceptional persistence and engagement. A salesperson who gives up after 1-2 attempts or provides short answers has failed completely. If they ended early or showed minimal effort, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific sales strengths>],
    "improvement_areas": [<3-5 sales improvement areas>],
    "detailed_feedback": "<paragraph analyzing sales performance and techniques>",
    "rubric_scores": {{
        "discovery_questioning": <0-100>,
        "objection_handling": <0-100>,
        "rapport_building": <0-100>,
        "closing_technique": <0-100>
    }}
}}""",
        scoring_guidelines={
            "discovery_questioning": "Open-ended questions, uncovering pain points, qualifying prospects",
            "objection_handling": "Addressing concerns with empathy and value-based responses",
            "rapport_building": "Active listening, trust building, professional connection",
            "closing_technique": "Clear next steps, creating urgency, asking for commitment"
        },
        improvement_focus=["discovery", "objection handling", "value selling", "closing"],
        icon="phone-outgoing",
        color_scheme={"primary": "#f59e0b", "secondary": "#fbbf24"}
    ),

    InterviewType.PRESENTATION_PITCH: InterviewTypeConfig(
        type=InterviewType.PRESENTATION_PITCH,
        display_name="Presentation/Pitch",
        description="Presenting ideas or solutions to stakeholders",
        rubric_criteria=[
            RubricCriteria("presentation_structure", "presentation_structure", "Clear structure and flow"),
            RubricCriteria("content_quality", "content_quality", "Depth and relevance of content"),
            RubricCriteria("delivery_skills", "delivery_skills", "Speaking skills and engagement"),
            RubricCriteria("visual_communication", "visual_communication", "Use of visuals and examples")
        ],
        prompt_template="""You are evaluating a presentation/pitch interview for a {role} position at {company}.

The candidate needs to demonstrate strong presentation and communication skills.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short statements or fail to present: Score below 10%
- Minimal presentation, no structure, or early termination: Score 0-10%
- Brief, unstructured responses without proper presentation flow: Score 10-25%
- Full presentations with clear structure are the minimum expectation

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

PRESENTATION TRANSCRIPT:
{transcript}

Evaluate the candidate's presentation performance focusing on:
1. Structure and logical flow of ideas
2. Quality and depth of content
3. Delivery skills and audience engagement
4. Use of examples and visual communication

BE HARSH: Presentations require preparation and engagement. A candidate who gives minimal effort, provides only brief statements, or fails to structure their presentation has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific presentation strengths>],
    "improvement_areas": [<3-5 presentation improvement areas>],
    "detailed_feedback": "<paragraph analyzing presentation effectiveness>",
    "rubric_scores": {{
        "presentation_structure": <0-100>,
        "content_quality": <0-100>,
        "delivery_skills": <0-100>,
        "visual_communication": <0-100>
    }}
}}""",
        scoring_guidelines={
            "presentation_structure": "Clear introduction, body, conclusion; logical flow",
            "content_quality": "Relevant, accurate, and compelling content",
            "delivery_skills": "Confidence, pace, engagement, handling questions",
            "visual_communication": "Effective use of examples, analogies, or visual aids"
        },
        improvement_focus=["structure", "storytelling", "engagement", "visual communication"],
        icon="presentation",
        color_scheme={"primary": "#8b5cf6", "secondary": "#a78bfa"}
    ),

    InterviewType.TECHNICAL_SCREENING_CALL: InterviewTypeConfig(
        type=InterviewType.TECHNICAL_SCREENING_CALL,
        display_name="Technical Screening",
        description="Initial technical assessment of skills and knowledge",
        rubric_criteria=[
            RubricCriteria("technical_accuracy", "technical_accuracy", "Correctness of technical responses"),
            RubricCriteria("problem_approach", "problem_approach", "Approach to technical problems"),
            RubricCriteria("coding_fundamentals", "coding_fundamentals", "Understanding of core concepts"),
            RubricCriteria("technical_communication", "technical_communication", "Explaining technical concepts")
        ],
        prompt_template="""You are a senior engineer evaluating a technical screening interview for a {role} position at {company}.

Focus on assessing technical fundamentals and problem-solving approach.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to engage: Score below 10%
- Minimal participation, "I don't know" without attempts, or early termination: Score 0-10%
- Brief answers without technical depth or problem-solving effort: Score 10-25%
- Technical interviews require detailed explanations and problem-solving attempts

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

TECHNICAL INTERVIEW TRANSCRIPT:
{transcript}

Evaluate the candidate's technical screening performance focusing on:
1. Technical accuracy and knowledge depth
2. Problem-solving approach and methodology
3. Understanding of coding fundamentals
4. Ability to communicate technical concepts

BE HARSH: Technical roles demand expertise and engagement. A candidate who gives up quickly, provides minimal technical detail, or shows no problem-solving effort has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific technical strengths>],
    "improvement_areas": [<3-5 technical improvement areas>],
    "detailed_feedback": "<paragraph analyzing technical capabilities>",
    "rubric_scores": {{
        "technical_accuracy": <0-100>,
        "problem_approach": <0-100>,
        "coding_fundamentals": <0-100>,
        "technical_communication": <0-100>
    }}
}}""",
        scoring_guidelines={
            "technical_accuracy": "Correctness of technical answers and solutions",
            "problem_approach": "Logical thinking, debugging skills, methodology",
            "coding_fundamentals": "Understanding of data structures, algorithms, best practices",
            "technical_communication": "Clarity in explaining technical concepts"
        },
        improvement_focus=["algorithms", "data structures", "problem solving", "code quality"],
        icon="code",
        color_scheme={"primary": "#ef4444", "secondary": "#f87171"}
    ),

    InterviewType.SYSTEM_DESIGN_INTERVIEW: InterviewTypeConfig(
        type=InterviewType.SYSTEM_DESIGN_INTERVIEW,
        display_name="System Design",
        description="Designing scalable systems and architectures",
        rubric_criteria=[
            RubricCriteria("architecture_design", "architecture_design", "Overall system architecture"),
            RubricCriteria("scalability_thinking", "scalability_thinking", "Handling scale and performance"),
            RubricCriteria("trade_off_analysis", "trade_off_analysis", "Analyzing design trade-offs"),
            RubricCriteria("component_design", "component_design", "Detailed component design")
        ],
        prompt_template="""You are a principal engineer evaluating a system design interview for a {role} position at {company}.

Focus on assessing their ability to design large-scale distributed systems.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to design: Score below 10%
- Minimal participation, no architecture discussion, or early termination: Score 0-10%
- Brief answers without system thinking or scalability considerations: Score 10-25%
- System design requires comprehensive thinking and detailed explanations

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

SYSTEM DESIGN DISCUSSION:
{transcript}

Evaluate the candidate's system design performance focusing on:
1. Overall architecture and system design
2. Scalability and performance considerations
3. Trade-off analysis and decision making
4. Component design and integration

BE HARSH: System design interviews test senior-level thinking. A candidate who provides minimal design details, avoids complexity, or shows no distributed systems knowledge has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific design strengths>],
    "improvement_areas": [<3-5 design improvement areas>],
    "detailed_feedback": "<paragraph analyzing system design skills>",
    "rubric_scores": {{
        "architecture_design": <0-100>,
        "scalability_thinking": <0-100>,
        "trade_off_analysis": <0-100>,
        "component_design": <0-100>
    }}
}}""",
        scoring_guidelines={
            "architecture_design": "High-level design, component interaction, data flow",
            "scalability_thinking": "Handling millions of users, performance optimization",
            "trade_off_analysis": "Considering alternatives, explaining design decisions",
            "component_design": "Detailed design of key components, APIs, databases"
        },
        improvement_focus=["distributed systems", "scalability", "databases", "system architecture"],
        icon="server",
        color_scheme={"primary": "#06b6d4", "secondary": "#22d3ee"}
    ),

    InterviewType.PORTFOLIO_REVIEW: InterviewTypeConfig(
        type=InterviewType.PORTFOLIO_REVIEW,
        display_name="Portfolio Review",
        description="Reviewing past projects and technical decisions",
        rubric_criteria=[
            RubricCriteria("project_complexity", "project_complexity", "Complexity and scope of projects"),
            RubricCriteria("technical_depth", "technical_depth", "Deep technical understanding"),
            RubricCriteria("business_impact", "business_impact", "Business value delivered"),
            RubricCriteria("innovation", "innovation", "Creative solutions and innovation")
        ],
        prompt_template="""You are evaluating a portfolio review interview for a {role} position at {company}.

The candidate is presenting their past projects and technical achievements.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short project mentions or fail to engage: Score below 10%
- Minimal participation, no project details, or early termination: Score 0-10%
- Brief descriptions without technical depth or impact metrics: Score 10-25%
- Portfolio reviews require detailed project explanations and ownership demonstration

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

PORTFOLIO DISCUSSION:
{transcript}

Evaluate the candidate's portfolio review performance focusing on:
1. Complexity and technical sophistication of projects
2. Depth of technical understanding and ownership
3. Business impact and value delivered
4. Innovation and creative problem solving

BE HARSH: Portfolio reviews test technical depth and ownership. A candidate who provides superficial project descriptions, avoids technical details, or shows minimal ownership has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific portfolio strengths>],
    "improvement_areas": [<3-5 portfolio improvement areas>],
    "detailed_feedback": "<paragraph analyzing portfolio and project experience>",
    "rubric_scores": {{
        "project_complexity": <0-100>,
        "technical_depth": <0-100>,
        "business_impact": <0-100>,
        "innovation": <0-100>
    }}
}}""",
        scoring_guidelines={
            "project_complexity": "Scale, technical challenges, architectural decisions",
            "technical_depth": "Understanding of implementation details and choices",
            "business_impact": "Measurable outcomes, user value, business metrics",
            "innovation": "Novel approaches, creative solutions, technical leadership"
        },
        improvement_focus=["project depth", "impact metrics", "technical decisions", "innovation"],
        icon="folder-open",
        color_scheme={"primary": "#ec4899", "secondary": "#f472b6"}
    ),

    InterviewType.CASE_STUDY: InterviewTypeConfig(
        type=InterviewType.CASE_STUDY,
        display_name="Case Study",
        description="Analyzing business cases and proposing solutions",
        rubric_criteria=[
            RubricCriteria("problem_analysis", "problem_analysis", "Understanding the core problem"),
            RubricCriteria("solution_approach", "solution_approach", "Structured solution development"),
            RubricCriteria("business_acumen", "business_acumen", "Business understanding"),
            RubricCriteria("data_analysis", "data_analysis", "Use of data and metrics")
        ],
        prompt_template="""You are evaluating a case study interview for a {role} position at {company}.

The candidate is analyzing a business case and proposing solutions.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to analyse: Score below 10%
- Minimal participation, no structured thinking, or early termination: Score 0-10%
- Brief answers without problem analysis or solution development: Score 10-25%
- Case studies require comprehensive analysis and structured problem-solving

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

CASE STUDY DISCUSSION:
{transcript}

Evaluate the candidate's case study performance focusing on:
1. Problem identification and analysis
2. Structured approach to solution development
3. Business acumen and commercial awareness
4. Data-driven analysis and metrics

BE HARSH: Case studies test analytical thinking and business acumen. A candidate who provides superficial analysis, lacks structure, or shows no business understanding has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific case study strengths>],
    "improvement_areas": [<3-5 case study improvement areas>],
    "detailed_feedback": "<paragraph analyzing case study approach>",
    "rubric_scores": {{
        "problem_analysis": <0-100>,
        "solution_approach": <0-100>,
        "business_acumen": <0-100>,
        "data_analysis": <0-100>
    }}
}}""",
        scoring_guidelines={
            "problem_analysis": "Identifying root causes, asking clarifying questions",
            "solution_approach": "Structured thinking, considering alternatives",
            "business_acumen": "Understanding business implications, ROI, feasibility",
            "data_analysis": "Using data to support decisions, quantifying impact"
        },
        improvement_focus=["analytical thinking", "business sense", "data analysis", "structured approach"],
        icon="chart-bar",
        color_scheme={"primary": "#84cc16", "secondary": "#a3e635"}
    ),

    InterviewType.BEHAVIORAL_INTERVIEW: InterviewTypeConfig(
        type=InterviewType.BEHAVIORAL_INTERVIEW,
        display_name="Behavioral Interview",
        description="Assessing past behaviors and situational responses",
        rubric_criteria=[
            RubricCriteria("star_method", "star_method", "Using STAR method effectively"),
            RubricCriteria("self_awareness", "self_awareness", "Self-reflection and growth mindset"),
            RubricCriteria("leadership_examples", "leadership_examples", "Demonstrating leadership"),
            RubricCriteria("conflict_resolution", "conflict_resolution", "Handling difficult situations")
        ],
        prompt_template="""You are evaluating a behavioral interview for a {role} position at {company}.

Focus on assessing past behaviors, leadership, and interpersonal skills through their examples.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to give examples: Score below 10%
- Minimal participation, no STAR examples, or early termination: Score 0-10%
- Brief answers without detailed behavioral examples or results: Score 10-25%
- Behavioral interviews require specific, detailed examples with clear outcomes

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

BEHAVIORAL INTERVIEW TRANSCRIPT:
{transcript}

Evaluate the candidate's behavioral interview performance focusing on:
1. Use of STAR method (Situation, Task, Action, Result)
2. Self-awareness and growth mindset
3. Leadership and influence examples
4. Conflict resolution and difficult situations

BE HARSH: Behavioral interviews test experience and leadership through detailed examples. A candidate who provides vague answers, lacks specific examples, or shows no measurable results has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific behavioral strengths>],
    "improvement_areas": [<3-5 behavioral improvement areas>],
    "detailed_feedback": "<paragraph analyzing behavioral responses>",
    "rubric_scores": {{
        "star_method": <0-100>,
        "self_awareness": <0-100>,
        "leadership_examples": <0-100>,
        "conflict_resolution": <0-100>
    }}
}}""",
        scoring_guidelines={
            "star_method": "Clear situation, task, action, and measurable results",
            "self_awareness": "Acknowledging mistakes, learning from experiences",
            "leadership_examples": "Influencing others, driving initiatives, mentoring",
            "conflict_resolution": "Handling disagreements professionally, finding solutions"
        },
        improvement_focus=["STAR method", "leadership stories", "self-reflection", "conflict handling"],
        icon="users-cog",
        color_scheme={"primary": "#2563eb", "secondary": "#3b82f6"}
    ),

    InterviewType.VALUES_INTERVIEW: InterviewTypeConfig(
        type=InterviewType.VALUES_INTERVIEW,
        display_name="Values Interview",
        description="Assessing alignment with company values and principles",
        rubric_criteria=[
            RubricCriteria("values_alignment", "values_alignment", "Alignment with company values"),
            RubricCriteria("ethical_reasoning", "ethical_reasoning", "Ethical decision making"),
            RubricCriteria("cultural_contribution", "cultural_contribution", "Contributing to culture"),
            RubricCriteria("authenticity", "authenticity", "Genuine responses and beliefs")
        ],
        prompt_template="""You are evaluating a values-based interview for a {role} position at {company}.

Focus on assessing alignment with company values and ethical principles.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to engage: Score below 10%
- Minimal participation, no values examples, or early termination: Score 0-10%
- Brief answers without ethical reasoning or values demonstration: Score 10-25%
- Values interviews require thoughtful reflection and specific examples

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}
- Company Values: {company_values}

VALUES INTERVIEW TRANSCRIPT:
{transcript}

Evaluate the candidate's values interview performance focusing on:
1. Alignment with stated company values
2. Ethical reasoning and integrity
3. Potential cultural contribution
4. Authenticity and genuine beliefs

BE HARSH: Values interviews test cultural fit and ethical foundation. A candidate who provides shallow responses, avoids ethical discussions, or shows no alignment with company values has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific values-based strengths>],
    "improvement_areas": [<3-5 values improvement areas>],
    "detailed_feedback": "<paragraph analyzing values alignment>",
    "rubric_scores": {{
        "values_alignment": <0-100>,
        "ethical_reasoning": <0-100>,
        "cultural_contribution": <0-100>,
        "authenticity": <0-100>
    }}
}}""",
        scoring_guidelines={
            "values_alignment": "Examples demonstrating company values in action",
            "ethical_reasoning": "Thoughtful approach to ethical dilemmas",
            "cultural_contribution": "Ideas for strengthening company culture",
            "authenticity": "Genuine, consistent responses reflecting true beliefs"
        },
        improvement_focus=["values examples", "ethical thinking", "cultural fit", "authenticity"],
        icon="heart",
        color_scheme={"primary": "#dc2626", "secondary": "#ef4444"}
    ),

    InterviewType.TEAM_FIT_INTERVIEW: InterviewTypeConfig(
        type=InterviewType.TEAM_FIT_INTERVIEW,
        display_name="Team Fit Interview",
        description="Assessing collaboration and team dynamics fit",
        rubric_criteria=[
            RubricCriteria("collaboration_style", "collaboration_style", "Working with others effectively"),
            RubricCriteria("communication_skills", "communication_skills", "Team communication abilities"),
            RubricCriteria("adaptability", "adaptability", "Flexibility in team settings"),
            RubricCriteria("contribution_examples", "contribution_examples", "Past team contributions")
        ],
        prompt_template="""You are evaluating a team fit interview for a {role} position at {company}.

Focus on assessing how well the candidate would work within the existing team.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to engage: Score below 10%
- Minimal participation, no team examples, or early termination: Score 0-10%
- Brief answers without collaboration examples or team impact: Score 10-25%
- Team fit requires detailed examples of successful collaboration

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

TEAM FIT INTERVIEW TRANSCRIPT:
{transcript}

Evaluate the candidate's team fit performance focusing on:
1. Collaboration style and teamwork approach
2. Communication within team contexts
3. Adaptability to different team dynamics
4. Examples of team contributions and impact

BE HARSH: Team fit interviews test collaboration and interpersonal skills. A candidate who provides generic answers, lacks team examples, or shows poor communication skills has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific team fit strengths>],
    "improvement_areas": [<3-5 team fit improvement areas>],
    "detailed_feedback": "<paragraph analyzing team fit>",
    "rubric_scores": {{
        "collaboration_style": <0-100>,
        "communication_skills": <0-100>,
        "adaptability": <0-100>,
        "contribution_examples": <0-100>
    }}
}}""",
        scoring_guidelines={
            "collaboration_style": "Preference for collaboration, helping teammates",
            "communication_skills": "Clear communication, active listening, feedback",
            "adaptability": "Working with different personalities and styles",
            "contribution_examples": "Specific examples of team success and support"
        },
        improvement_focus=["collaboration", "communication", "flexibility", "team impact"],
        icon="user-group",
        color_scheme={"primary": "#059669", "secondary": "#10b981"}
    ),

    InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER: InterviewTypeConfig(
        type=InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER,
        display_name="Stakeholder Interview",
        description="Meeting with business partners, clients, or key stakeholders",
        rubric_criteria=[
            RubricCriteria("stakeholder_communication", "stakeholder_communication", "Communicating with non-technical audiences"),
            RubricCriteria("business_understanding", "business_understanding", "Understanding business needs"),
            RubricCriteria("relationship_building", "relationship_building", "Building stakeholder trust"),
            RubricCriteria("requirements_gathering", "requirements_gathering", "Eliciting requirements effectively")
        ],
        prompt_template="""You are evaluating a stakeholder interview for a {role} position at {company}.

The candidate is meeting with business partners/clients to assess stakeholder management skills.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to engage: Score below 10%
- Minimal participation, no stakeholder questions, or early termination: Score 0-10%
- Brief answers without business understanding or relationship building: Score 10-25%
- Stakeholder management requires active engagement and business acumen

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

STAKEHOLDER INTERVIEW TRANSCRIPT:
{transcript}

Evaluate the candidate's stakeholder interaction performance focusing on:
1. Communication with non-technical stakeholders
2. Understanding and addressing business needs
3. Building trust and credibility
4. Gathering and clarifying requirements

BE HARSH: Stakeholder interviews test business communication and relationship skills. A candidate who provides technical jargon without clarity, fails to ask business questions, or shows no relationship-building skills has failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific stakeholder management strengths>],
    "improvement_areas": [<3-5 stakeholder improvement areas>],
    "detailed_feedback": "<paragraph analyzing stakeholder management skills>",
    "rubric_scores": {{
        "stakeholder_communication": <0-100>,
        "business_understanding": <0-100>,
        "relationship_building": <0-100>,
        "requirements_gathering": <0-100>
    }}
}}""",
        scoring_guidelines={
            "stakeholder_communication": "Clear, jargon-free communication; active listening",
            "business_understanding": "Grasping business context and priorities",
            "relationship_building": "Professional rapport, trust, credibility",
            "requirements_gathering": "Asking right questions, clarifying needs"
        },
        improvement_focus=["stakeholder communication", "business acumen", "relationship skills", "requirements analysis"],
        icon="briefcase",
        color_scheme={"primary": "#7c3aed", "secondary": "#8b5cf6"}
    ),

    InterviewType.EXECUTIVE_LEADERSHIP_ROUND: InterviewTypeConfig(
        type=InterviewType.EXECUTIVE_LEADERSHIP_ROUND,
        display_name="Executive/Leadership Round",
        description="Senior leadership assessment for strategic thinking",
        rubric_criteria=[
            RubricCriteria("strategic_thinking", "strategic_thinking", "Strategic vision and planning"),
            RubricCriteria("leadership_presence", "leadership_presence", "Executive presence and influence"),
            RubricCriteria("business_judgment", "business_judgment", "Sound business decisions"),
            RubricCriteria("organizational_impact", "organizational_impact", "Driving organizational change")
        ],
        prompt_template="""You are evaluating an executive/leadership interview for a {role} position at {company}.

This is a senior-level assessment focusing on leadership and strategic capabilities.

CRITICAL SCORING GUIDELINES:
- Candidates who provide only 1-2 short answers or fail to engage: Score below 10%
- Minimal participation, no strategic thinking, or early termination: Score 0-10%
- Brief answers without leadership examples or business judgment: Score 10-25%
- Executive interviews require comprehensive strategic thinking and leadership demonstration

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

EXECUTIVE INTERVIEW TRANSCRIPT:
{transcript}

Evaluate the candidate's executive interview performance focusing on:
1. Strategic thinking and vision
2. Leadership presence and influence
3. Business judgment and decision making
4. Ability to drive organizational impact

BE EXTREMELY HARSH: Executive interviews test senior leadership capabilities. A candidate who provides superficial answers, lacks strategic vision, or shows no leadership presence has completely failed. If they ended early or gave only 1-2 responses, their overall score MUST be below 10%.

Return your response as valid JSON with these exact fields:
{{
    "overall_score": <integer 0-100>,
    "strengths": [<3-5 specific leadership strengths>],
    "improvement_areas": [<3-5 leadership improvement areas>],
    "detailed_feedback": "<paragraph analyzing executive capabilities>",
    "rubric_scores": {{
        "strategic_thinking": <0-100>,
        "leadership_presence": <0-100>,
        "business_judgment": <0-100>,
        "organizational_impact": <0-100>
    }}
}}""",
        scoring_guidelines={
            "strategic_thinking": "Long-term vision, strategic planning, market awareness",
            "leadership_presence": "Confidence, communication, inspiring others",
            "business_judgment": "Decision quality, risk assessment, prioritization",
            "organizational_impact": "Change management, scaling teams, culture building"
        },
        improvement_focus=["strategic vision", "executive presence", "decision making", "organizational leadership"],
        icon="crown",
        color_scheme={"primary": "#ea580c", "secondary": "#f97316"}
    )
}


def get_interview_config(interview_type: InterviewType) -> InterviewTypeConfig:
    """Get configuration for a specific interview type"""
    return INTERVIEW_CONFIGS.get(
        interview_type,
        # Fallback to technical screening if type not found
        INTERVIEW_CONFIGS[InterviewType.TECHNICAL_SCREENING_CALL]
    )


def get_rubric_keys(interview_type: InterviewType) -> List[str]:
    """Get rubric score keys for a specific interview type"""
    config = get_interview_config(interview_type)
    return [criteria.key for criteria in config.rubric_criteria]