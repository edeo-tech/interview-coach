'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useCV, useUploadCV, useDeleteCV } from '@/hooks/use-cv';

export default function CVUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProgress, setShowProgress] = useState(false);
  
  const { data: currentCV, isLoading: cvLoading } = useCV();
  const uploadMutation = useUploadCV();
  const deleteMutation = useDeleteCV();

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please select a file smaller than 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    setShowProgress(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await uploadMutation.mutateAsync(formData);
      
      // Navigate to create interview after successful upload
      router.push('/interviews/create');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Problem uploading CV. Please try again.');
    } finally {
      setShowProgress(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your CV? This will remove it from all future interviews.')) {
      try {
        await deleteMutation.mutateAsync();
        alert('CV deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Problem deleting CV. Please try again.');
      }
    }
  };

  const renderPersonalInfo = (personalInfo: any) => {
    if (!personalInfo || Object.keys(personalInfo).length === 0) return null;
    
    return (
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-nunito font-semibold text-lg mb-4 text-white">Personal Information</h3>
        <div className="space-y-3">
          {personalInfo.name && (
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-white">{personalInfo.name}</span>
            </div>
          )}
          {personalInfo.email && (
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-white">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-white">{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white">{personalInfo.location}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSkillsSection = (cv: any) => {
    const hasSkills = cv?.technical_skills?.length || 
                     cv?.programming_languages?.length ||
                     cv?.frameworks?.length ||
                     cv?.tools?.length ||
                     cv?.soft_skills?.length ||
                     cv?.spoken_languages?.length;
    
    if (!hasSkills) return null;

    const skillCategories = [
      { title: 'Programming Languages', skills: cv.programming_languages },
      { title: 'Frameworks & Libraries', skills: cv.frameworks },
      { title: 'Tools & Platforms', skills: cv.tools },
      { title: 'Technical Skills', skills: cv.technical_skills },
      { title: 'Soft Skills', skills: cv.soft_skills },
      { title: 'Languages', skills: cv.spoken_languages },
    ];

    return (
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-nunito font-semibold text-lg mb-4 text-white">Skills & Technologies</h3>
        <div className="space-y-4">
          {skillCategories.map((category) => 
            category.skills?.length > 0 && (
              <div key={category.title}>
                <h4 className="font-medium text-white/70 mb-2 text-sm">{category.title}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill: string, index: number) => (
                    <span key={index} className="glass-subtle px-3 py-1 rounded-full text-sm text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const renderExperience = (experience: any[]) => {
    if (!experience?.length) return null;
    
    return (
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-nunito font-semibold text-lg mb-4 text-white">Work Experience</h3>
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-brand-primary/30 pl-4">
              <h4 className="font-semibold text-white text-lg">{exp.title || exp.position}</h4>
              <p className="text-white/70 font-medium">{exp.company}</p>
              <div className="flex flex-wrap gap-4 mt-2 mb-3">
                {exp.duration && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white/60 text-sm">{exp.duration}</span>
                  </div>
                )}
                {exp.location && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-white/60 text-sm">{exp.location}</span>
                  </div>
                )}
              </div>
              {exp.description && (
                <p className="text-white/80 text-sm leading-relaxed">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = (education: any[]) => {
    if (!education?.length) return null;
    
    return (
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-nunito font-semibold text-lg mb-4 text-white">Education</h3>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white">{edu.degree || edu.qualification}</h4>
              <p className="text-white/70">{edu.institution || edu.school}</p>
              <div className="flex gap-4 mt-1">
                {edu.year && (
                  <span className="text-white/60 text-sm">{edu.year}</span>
                )}
                {edu.gpa && (
                  <span className="text-white/60 text-sm">GPA: {edu.gpa}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-nunito font-bold text-3xl text-white">Your CV</h1>
            </div>
          </header>

          {cvLoading ? (
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70">Loading CV information...</p>
            </div>
          ) : currentCV ? (
            <div className="space-y-6">
              {/* CV Overview */}
              <div className="glass rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-nunito font-semibold text-xl text-white mb-2">Your CV Overview</h2>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-400 font-medium">Active</span>
                    </div>
                  </div>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="glass border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                      <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span className="text-red-400 text-sm">
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete CV'}
                    </span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0H8m8 0l2 8H6l2-8" />
                    </svg>
                    <span className="text-white/70 text-sm">
                      {currentCV.experience_years || 0} years experience
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white/70 text-sm">
                      Uploaded {new Date(currentCV.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {currentCV.current_level && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-white/70 text-sm">
                        {currentCV.current_level.charAt(0).toUpperCase() + currentCV.current_level.slice(1)} level
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CV Sections */}
              {renderPersonalInfo(currentCV.personal_info)}
              
              {currentCV.professional_summary && (
                <div className="glass rounded-2xl p-6 mb-6">
                  <h3 className="font-nunito font-semibold text-lg mb-4 text-white">Professional Summary</h3>
                  <p className="text-white/80 leading-relaxed">{currentCV.professional_summary}</p>
                </div>
              )}
              
              {renderSkillsSection(currentCV)}
              {renderExperience(currentCV.experience)}
              {renderEducation(currentCV.education)}
              
              {currentCV.certifications?.length > 0 && (
                <div className="glass rounded-2xl p-6 mb-6">
                  <h3 className="font-nunito font-semibold text-lg mb-4 text-white">Certifications</h3>
                  <div className="space-y-3">
                    {currentCV.certifications.map((cert: any, index: number) => (
                      <div key={index} className="border-l-2 border-brand-primary/30 pl-4">
                        <h4 className="font-semibold text-white">{cert.name || cert.title}</h4>
                        {cert.issuer && <p className="text-white/70">{cert.issuer}</p>}
                        {cert.date && <p className="text-white/60 text-sm">{cert.date}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentCV.projects?.length > 0 && (
                <div className="glass rounded-2xl p-6 mb-6">
                  <h3 className="font-nunito font-semibold text-lg mb-4 text-white">Projects</h3>
                  <div className="space-y-4">
                    {currentCV.projects.map((project: any, index: number) => (
                      <div key={index} className="border-l-2 border-brand-primary/30 pl-4">
                        <h4 className="font-semibold text-white">{project.name || project.title}</h4>
                        {project.technologies && (
                          <div className="flex flex-wrap gap-2 mt-2 mb-2">
                            {project.technologies.map((tech: string, techIndex: number) => (
                              <span key={techIndex} className="glass-subtle px-2 py-1 rounded-full text-xs text-white">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.description && (
                          <p className="text-white/80 text-sm leading-relaxed">{project.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Upload Area */}
          <div className={currentCV ? "mt-8" : ""}>
            <div 
              onClick={uploadMutation.isPending ? undefined : handleUpload}
              className={`
                glass-subtle border-2 border-dashed border-brand-primary/50 rounded-2xl p-12 text-center cursor-pointer
                hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-300
                ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                ${currentCV ? 'py-8' : 'py-16'}
              `}
            >
              <div className="mb-6">
                <svg className={`mx-auto text-brand-primary ${currentCV ? 'w-12 h-12' : 'w-16 h-16'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <h2 className={`font-nunito font-semibold mb-3 text-white ${currentCV ? 'text-xl' : 'text-2xl'}`}>
                {currentCV ? 'Replace your CV' : 'Upload your CV'}
              </h2>
              
              <p className={`text-white/70 mb-6 max-w-md mx-auto ${currentCV ? 'text-sm' : ''}`}>
                {currentCV ? 
                  'Upload a new CV to replace the current one' :
                  'Get personalized interview questions based on your experience'
                }
              </p>
              
              <div className="glass-purple font-nunito font-semibold px-6 py-3 rounded-xl hover:bg-brand-primary/30 transition-colors inline-block">
                Choose file
              </div>
              
              <p className="text-white/50 text-xs mt-4">
                PDF, DOC, DOCX, or TXT • Max 5MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Progress Modal */}
          {showProgress && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="font-nunito font-semibold text-xl mb-2 text-white">Processing your CV</h3>
                <p className="text-white/70 text-sm">
                  We're analyzing your CV and extracting key information to personalize your interviews.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}