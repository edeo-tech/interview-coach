from fastapi import Request, HTTPException
from typing import Optional, Dict, List, Any
import re
import json
from datetime import datetime, timezone
from bson import ObjectId

from crud._generic._db_actions import createDocument, getDocument, getMultipleDocuments, updateDocument, SortDirection
from models.interviews.interviews import Interview
from models.interviews.interview_types import InterviewType
from services.job_processing_service import JobProcessingService
from crud._generic.model_mappings import get_db_for_model
from utils.mongo_helpers import serialize_mongo_document

async def create_interview_from_url(
    req: Request,
    user_id: str,
    job_url: str,
    interview_type: str = "technical"
) -> Interview:
    """Create interview from job URL"""
    job_service = JobProcessingService()
    
    try:
        # Process job URL
        job_data = await job_service.process_job_url(job_url)
        
        # Convert to Interview model
        interview = await _create_interview_from_job_data(
            req, user_id, job_data, 
            source_type="url", 
            source_url=job_url,
            interview_type=interview_type
        )
        
        return interview
        
    finally:
        await job_service.close()

async def create_interview_from_file(
    req: Request,
    user_id: str,
    file_content: bytes,
    content_type: str,
    filename: str,
    interview_type: str = "technical"
) -> Interview:
    """Create interview from uploaded job description file"""
    job_service = JobProcessingService()
    
    try:
        # Process job file
        job_data = await job_service.process_job_file(file_content, content_type, filename)
        
        # Convert to Interview model
        interview = await _create_interview_from_job_data(
            req, user_id, job_data,
            source_type="file",
            source_url=None,
            interview_type=interview_type
        )
        
        return interview
        
    finally:
        await job_service.close()

async def _create_interview_from_job_data(
    req: Request,
    user_id: str,
    job_data: Dict[str, Any],
    source_type: str,
    source_url: Optional[str],
    interview_type: str
) -> Interview:
    """Create interview from processed job data"""
    
    # Map experience level to difficulty
    experience_to_difficulty = {
        'junior': 'junior',
        'mid': 'mid',
        'senior': 'senior',
        'lead': 'senior',
        'principal': 'senior'
    }
    
    difficulty = experience_to_difficulty.get(
        job_data.get('experience_level', 'mid'), 
        'mid'
    )
    
    # Extract focus areas from tech stack and job description
    tech_stack = job_data.get('job_description', {}).get('tech_stack', [])
    focus_areas = _compute_focus_areas(tech_stack, job_data.get('role_title', ''), interview_type)
    
    # Extract raw text for legacy compatibility
    jd_raw = _convert_job_data_to_text(job_data)
    
    interview_data = Interview(
        user_id=user_id,
        company=job_data.get('company', 'Unknown Company'),
        role_title=job_data.get('role_title', 'Unknown Position'),
        company_logo_url=job_data.get('company_logo_url', None),
        location=job_data.get('location', ''),
        employment_type=job_data.get('employment_type', 'full-time'),
        experience_level=job_data.get('experience_level', 'mid'),
        salary_range=job_data.get('salary_range', ''),
        jd_raw=jd_raw,
        job_description=job_data.get('job_description', {}),
        difficulty=difficulty,
        interview_type=interview_type,
        focus_areas=focus_areas,
        source_type=source_type,
        source_url=source_url,
        jd_structured=job_data.get('job_description', {})  # Legacy field
    )
    
    return await createDocument(req, "interviews", Interview, interview_data)

async def get_interview(req: Request, interview_id: str) -> Optional[Interview]:
    """Get a specific interview by ID"""
    return await getDocument(req, "interviews", Interview, _id=interview_id)

async def get_user_interviews(req: Request, user_id: str, limit: int = 10) -> List[Interview]:
    """Get all interviews for a user"""
    return await getMultipleDocuments(
        req, "interviews", Interview,
        user_id=user_id,
        order_by="created_at",
        limit=limit
    )

async def get_interviews_by_company(req: Request, user_id: str, company: str) -> List[Interview]:
    """Get interviews for a specific company"""
    return await getMultipleDocuments(
        req, "interviews", Interview,
        user_id=user_id,
        company=company
    )

def parse_job_description(jd_raw: str) -> Dict:
    """Parse job description and extract key information"""
    structured_data = {}
    
    # Extract key sections
    sections = {
        'responsibilities': r'(?i)(responsibilities|duties|role|what you.ll do)[\s\S]*?(?=\n[A-Z].*:|$)',
        'requirements': r'(?i)(requirements|qualifications|what we.re looking for|must have)[\s\S]*?(?=\n[A-Z].*:|$)',
        'nice_to_have': r'(?i)(nice to have|preferred|bonus|plus)[\s\S]*?(?=\n[A-Z].*:|$)',
        'benefits': r'(?i)(benefits|perks|what we offer)[\s\S]*?(?=\n[A-Z].*:|$)',
        'company_info': r'(?i)(about us|company|who we are)[\s\S]*?(?=\n[A-Z].*:|$)'
    }
    
    for section, pattern in sections.items():
        match = re.search(pattern, jd_raw)
        if match:
            structured_data[section] = match.group(0).strip()
    
    # Extract technical skills mentioned
    structured_data['mentioned_technologies'] = extract_technologies(jd_raw)
    
    # Extract experience requirements
    structured_data['experience_required'] = extract_experience_requirement(jd_raw)
    
    return structured_data

def extract_focus_areas(jd_structured: Dict) -> List[str]:
    """Extract key focus areas from job description"""
    focus_areas = []
    
    # Common technical focus areas
    technical_areas = {
        'frontend': ['react', 'vue', 'angular', 'javascript', 'html', 'css', 'ui', 'frontend'],
        'backend': ['api', 'backend', 'server', 'microservices', 'database', 'sql'],
        'fullstack': ['fullstack', 'full stack', 'end-to-end', 'full-stack'],
        'devops': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'devops'],
        'mobile': ['mobile', 'ios', 'android', 'react native', 'flutter'],
        'data': ['data', 'analytics', 'ml', 'machine learning', 'ai', 'python'],
        'leadership': ['lead', 'senior', 'architect', 'principal', 'staff'],
        'system_design': ['architecture', 'design', 'scalability', 'distributed']
    }
    
    jd_text = ' '.join(jd_structured.values()).lower()
    
    for area, keywords in technical_areas.items():
        if any(keyword in jd_text for keyword in keywords):
            focus_areas.append(area)
    
    return focus_areas

def extract_technologies(jd_text: str) -> List[str]:
    """Extract mentioned technologies from job description"""
    technologies = []
    
    # Common technologies to look for
    tech_list = [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust',
        'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'fastapi',
        'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
        'git', 'jenkins', 'gitlab', 'github actions'
    ]
    
    jd_lower = jd_text.lower()
    
    for tech in tech_list:
        if tech in jd_lower:
            technologies.append(tech)
    
    return list(set(technologies))  # Remove duplicates

def extract_experience_requirement(jd_text: str) -> str:
    """Extract experience requirements from job description"""
    # Look for experience patterns
    exp_patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)',
        r'(?:minimum|min|at least)\s*(\d+)\s*(?:years?|yrs?)',
        r'(\d+)-(\d+)\s*(?:years?|yrs?)'
    ]
    
    jd_lower = jd_text.lower()
    
    for pattern in exp_patterns:
        matches = re.findall(pattern, jd_lower)
        if matches:
            if isinstance(matches[0], tuple):
                return f"{matches[0][0]}-{matches[0][1]} years"
            else:
                return f"{matches[0]}+ years"
    
    # Look for seniority levels
    if any(level in jd_lower for level in ['senior', 'sr.', 'principal', 'staff', 'lead']):
        return "Senior level (5+ years)"
    elif any(level in jd_lower for level in ['junior', 'jr.', 'entry', 'graduate']):
        return "Junior level (0-2 years)"
    elif any(level in jd_lower for level in ['mid', 'intermediate']):
        return "Mid level (2-5 years)"
    
    return "Not specified"

def _compute_focus_areas(tech_stack: List[str], role_title: str, interview_type: str = "technical") -> List[str]:
    """Compute focus areas from tech stack, role, and interview type"""
    focus_areas = []
    
    # For sales interviews, use sales-specific focus areas
    if interview_type == "sales":
        # Join all tech for analysis
        tech_text = ' '.join(tech_stack).lower() + ' ' + role_title.lower()
        
        # Sales focus areas mapping
        sales_area_keywords = {
            'prospecting': ['prospecting', 'lead generation', 'outbound', 'cold calling', 'email campaigns'],
            'discovery': ['discovery', 'needs assessment', 'qualification', 'questioning'],
            'presentation': ['demo', 'presentation', 'pitch', 'product knowledge'],
            'objection_handling': ['objection handling', 'overcoming objections', 'negotiation'],
            'closing': ['closing', 'deal closing', 'sales closure', 'conversion'],
            'relationship_building': ['relationship building', 'rapport', 'customer relationships'],
            'crm': ['crm', 'salesforce', 'hubspot', 'pipedrive', 'sales tools'],
            'industry_knowledge': ['saas', 'b2b', 'enterprise', 'smb', 'technology'],
            'metrics': ['quota', 'targets', 'kpi', 'sales metrics', 'pipeline management']
        }
        
        for area, keywords in sales_area_keywords.items():
            if any(keyword in tech_text for keyword in keywords):
                focus_areas.append(area)
        
        # Default sales focus areas if none detected
        if not focus_areas:
            focus_areas = ['prospecting', 'discovery', 'presentation', 'objection_handling', 'closing']
            
        return focus_areas
    
    # Technical focus areas for non-sales interviews
    tech_text = ' '.join(tech_stack).lower() + ' ' + role_title.lower()
    
    # Technical focus areas mapping
    area_keywords = {
        'frontend': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'ui', 'frontend', 'web'],
        'backend': ['api', 'backend', 'server', 'microservices', 'rest', 'graphql', 'grpc'],
        'fullstack': ['fullstack', 'full stack', 'full-stack'],
        'devops': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'devops', 'terraform', 'ansible'],
        'mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
        'data': ['data', 'analytics', 'ml', 'machine learning', 'ai', 'pandas', 'numpy', 'spark', 'etl'],
        'database': ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'database', 'dba'],
        'security': ['security', 'pentesting', 'vulnerability', 'owasp', 'encryption', 'cryptography'],
        'cloud': ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda'],
        'system_design': ['architecture', 'design', 'scalability', 'distributed', 'microservices']
    }
    
    for area, keywords in area_keywords.items():
        if any(keyword in tech_text for keyword in keywords):
            focus_areas.append(area)
    
    # Add leadership if senior role
    if any(term in role_title.lower() for term in ['lead', 'senior', 'principal', 'architect', 'manager']):
        focus_areas.append('leadership')
    
    return list(set(focus_areas))  # Remove duplicates

def _convert_job_data_to_text(job_data: Dict[str, Any]) -> str:
    """Convert structured job data back to text format"""
    sections = []
    
    # Company and role
    sections.append(f"{job_data.get('company', '')} - {job_data.get('role_title', '')}")
    sections.append(f"Location: {job_data.get('location', '')}")
    sections.append(f"Type: {job_data.get('employment_type', '')}")
    
    if job_data.get('salary_range'):
        sections.append(f"Salary: {job_data['salary_range']}")
    
    sections.append("")
    
    # Job description sections
    jd = job_data.get('job_description', {})
    
    if jd.get('summary'):
        sections.append("Summary:")
        sections.append(jd['summary'])
        sections.append("")
    
    if jd.get('responsibilities'):
        sections.append("Responsibilities:")
        for resp in jd['responsibilities']:
            sections.append(f"• {resp}")
        sections.append("")
    
    if jd.get('requirements'):
        sections.append("Requirements:")
        for req in jd['requirements']:
            sections.append(f"• {req}")
        sections.append("")
    
    if jd.get('nice_to_have'):
        sections.append("Nice to Have:")
        for nice in jd['nice_to_have']:
            sections.append(f"• {nice}")
        sections.append("")
    
    if jd.get('tech_stack'):
        sections.append(f"Technologies: {', '.join(jd['tech_stack'])}")
        sections.append("")
    
    if jd.get('benefits'):
        sections.append("Benefits:")
        for benefit in jd['benefits']:
            sections.append(f"• {benefit}")
    
    return '\n'.join(sections)


async def create_interview_for_job(
    req: Request,
    job_id: str,
    user_id: str,
    interview_type: InterviewType,
    stage_order: int,
    difficulty: str = "mid",
    focus_areas: List[str] = None
) -> Interview:
    """Create an interview linked to a job"""
    
    print(f"Creating interview for job {job_id}: type={interview_type.value}, stage={stage_order}, difficulty={difficulty}")
    
    try:
        interview = Interview(
            job_id=job_id,
            user_id=user_id,
            interview_type=interview_type,
            stage_order=stage_order,
            status="pending",
            difficulty=difficulty,
            focus_areas=focus_areas or [],
            created_at=datetime.now(timezone.utc)
        )
        
        print(f"Interview object created with focus areas: {focus_areas or []}")
        
        # Save the interview using generic CRUD
        print("Saving interview to database")
        created_interview = await createDocument(req, "interviews", Interview, interview)
        
        print(f"Successfully created interview with ID: {created_interview.id}")
        return created_interview
        
    except Exception as e:
        print(f"Failed to create interview for job {job_id}: {str(e)}")
        raise


async def get_job_interviews(req: Request, job_id: str) -> List[Interview]:
    """Get all interviews for a job"""
    return await getMultipleDocuments(
        req, 
        "interviews", 
        Interview, 
        job_id=job_id,
        order_by="stage_order",
        order_direction=SortDirection.ASCENDING
    )


async def update_interview_status(req: Request, interview_id: str, status: str) -> Optional[Interview]:
    """Update interview status"""
    return await updateDocument(req, "interviews", Interview, interview_id, status=status)

async def update_interview(req: Request, interview_id: str, **kwargs) -> Optional[Interview]:
    """Update interview with any fields"""
    return await updateDocument(req, "interviews", Interview, interview_id, **kwargs)