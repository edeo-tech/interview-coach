'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useCreateInterviewFromURL, useCreateInterviewFromFile } from '@/hooks/use-interviews';
import { useCV, useUploadCV } from '@/hooks/use-cv';

export default function CreateInterviewPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jobFileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<'cv' | 'job'>('cv');
  const [jobUrl, setJobUrl] = useState('');
  const [selectedCVFile, setSelectedCVFile] = useState<File | null>(null);
  const [selectedJobFile, setSelectedJobFile] = useState<File | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  
  const { data: currentCV, isLoading: cvLoading } = useCV();
  const uploadCV = useUploadCV();
  const createFromURL = useCreateInterviewFromURL();
  const createFromFile = useCreateInterviewFromFile();
  
  const isLoading = createFromURL.isPending || uploadCV.isPending || createFromFile.isPending;

  // If user already has CV, skip to job step
  useEffect(() => {
    if (currentCV && currentStep === 'cv') {
      setCurrentStep('job');
    }
  }, [currentCV, currentStep]);

  // Auto-focus URL input when job step loads
  useEffect(() => {
    if (currentStep === 'job' && urlInputRef.current) {
      setTimeout(() => {
        urlInputRef.current?.focus();
      }, 500);
    }
  }, [currentStep]);

  const handleCVFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedCVFile(file);
  };

  const handleCVUpload = async () => {
    if (!selectedCVFile) {
      alert('Please select your CV file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedCVFile);
      
      await uploadCV.mutateAsync(formData);
      alert('CV uploaded successfully');
      setCurrentStep('job');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Problem uploading CV. Please try again.');
    }
  };

  const handleJobFileSelect = () => {
    jobFileInputRef.current?.click();
  };

  const handleJobFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please select a file smaller than 5MB.');
      return;
    }

    setSelectedJobFile(file);
    setJobUrl(''); // Clear URL when file is selected
  };

  const extractUrlFromText = (text: string): string => {
    // Simple URL extraction - you can enhance this
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : text;
  };

  const handleSubmit = async () => {
    setShowProgress(true);

    try {
      if (selectedJobFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedJobFile);
        
        const result = await createFromFile.mutateAsync(formData);
        console.log('Interview created from file:', result);
        
        // Navigate to interview details
        router.push(`/interviews/${result.data._id}/results`);
        
      } else if (jobUrl.trim()) {
        // Handle URL input
        const cleanedUrl = extractUrlFromText(jobUrl);
        
        const result = await createFromURL.mutateAsync({
          job_url: cleanedUrl,
        });
        
        console.log('Interview created from URL:', result);
        
        // Navigate to interview details
        router.push(`/interviews/${result.data._id}/results`);
        
      } else {
        alert('Please enter a job URL or select a job description file');
        setShowProgress(false);
        return;
      }
      
    } catch (error: any) {
      console.error('Creation error:', error);
      alert('Unable to create interview. Please try again.');
      setShowProgress(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (currentStep === 'job' && !currentCV) {
                    setCurrentStep('cv');
                  } else {
                    router.back();
                  }
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-nunito font-bold text-3xl text-white">
                {currentStep === 'cv' ? 'Upload Your CV' : 'Create Interview'}
              </h1>
            </div>
          </header>

          {/* CV Upload Step */}
          {currentStep === 'cv' && (
            <>
              <div className="mb-6">
                <button
                  onClick={handleCVFileSelect}
                  className="w-full glass-subtle border-2 border-dashed border-brand-primary/50 rounded-2xl p-8 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
                >
                  {selectedCVFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-left">
                          <p className="text-white font-medium">{selectedCVFile.name}</p>
                          <p className="text-white/60 text-sm">{(selectedCVFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCVFile(null);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 mx-auto mb-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-white font-medium mb-2">Select your CV</p>
                      <p className="text-white/60 text-sm">PDF, DOC, DOCX, TXT • Max 5MB</p>
                    </div>
                  )}
                </button>
              </div>

              <button
                onClick={handleCVUpload}
                disabled={!selectedCVFile || uploadCV.isPending}
                className="w-full glass-purple font-nunito font-semibold px-8 py-4 rounded-xl hover:bg-brand-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {uploadCV.isPending ? (
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
                <span>{uploadCV.isPending ? 'Uploading...' : 'Continue'}</span>
              </button>
            </>
          )}

          {/* Job Details Step */}
          {currentStep === 'job' && (
            <>
              {/* Instructions */}
              <div className="mb-6">
                <p className="text-white/70 text-center">
                  Please provide the job details by either pasting a URL or uploading a job description document.
                </p>
              </div>

              {/* URL Input */}
              <div className="mb-6">
                <input
                  ref={urlInputRef}
                  type="url"
                  value={jobUrl}
                  onChange={(e) => {
                    const text = e.target.value;
                    const extractedUrl = extractUrlFromText(text);
                    setJobUrl(extractedUrl);
                    if (selectedJobFile) {
                      setSelectedJobFile(null);
                    }
                  }}
                  placeholder="Paste job posting URL (LinkedIn, Indeed, etc.)"
                  className="w-full px-6 py-4 glass-subtle rounded-full border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none text-white placeholder-white/50"
                />
              </div>

              {/* OR Separator */}
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="px-4 text-white/60 text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* File Upload Option */}
              <div className="mb-8">
                <button
                  onClick={handleJobFileSelect}
                  className="w-full glass-subtle rounded-xl p-6 hover:bg-white/10 transition-colors border border-white/15"
                >
                  {selectedJobFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-left">
                          <p className="text-white font-medium">{selectedJobFile.name}</p>
                          <p className="text-white/60 text-sm">{(selectedJobFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJobFile(null);
                          setJobUrl('');
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 mx-auto mb-3 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-white font-medium mb-1">Upload job description</p>
                      <p className="text-white/60 text-sm">PDF, DOC, DOCX, TXT • Max 5MB</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || (!jobUrl.trim() && !selectedJobFile)}
                className="w-full glass-purple font-nunito font-semibold px-8 py-4 rounded-xl hover:bg-brand-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                <span>{isLoading ? 'Creating Interview...' : 'Create Interview'}</span>
              </button>
            </>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleCVFileChange}
            className="hidden"
          />
          
          <input
            ref={jobFileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleJobFileChange}
            className="hidden"
          />

          {/* Progress Modal */}
          {showProgress && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="font-nunito font-semibold text-xl mb-2 text-white">Creating your interview</h3>
                <p className="text-white/70 text-sm">
                  We're processing your job details and generating personalized questions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}