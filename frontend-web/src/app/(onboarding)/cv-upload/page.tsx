'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function CVUpload() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCV = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('cv', file);
      return api.post('/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      await uploadCV.mutateAsync(file);
      setUploadStatus('success');
      setTimeout(() => {
        router.push('/onboarding/job-upload');
      }, 1500);
    } catch (error) {
      console.error('CV upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = () => {
    router.push('/onboarding/job-upload');
  };

  const handleBack = () => {
    router.back();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <button onClick={handleBack} className="text-gray-400 hover:text-white">
              ← Back
            </button>
            <span className="text-gray-400 text-sm">Step 3 of 7</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Upload your CV</h1>
          <p className="text-gray-300">Help us understand your experience for better interview practice</p>
        </div>

        <div className="space-y-6">
          {uploadStatus === 'success' ? (
            <div className="text-center p-6 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="text-green-400 text-2xl mb-2">✓</div>
              <p className="text-green-300">CV uploaded successfully!</p>
            </div>
          ) : (
            <div
              onClick={handleUploadClick}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-brand-primary transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-gray-400 text-4xl mb-4">📄</div>
              {isUploading ? (
                <div>
                  <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-300">Uploading...</p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium mb-2">Click to upload your CV</p>
                  <p className="text-gray-400 text-sm">PDF, DOC, or DOCX files only</p>
                </div>
              )}
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="text-center p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-300">Upload failed. Please try again.</p>
            </div>
          )}

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>Optional:</strong> You can skip this step, but uploading your CV helps us provide more personalized feedback.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleContinue}
            className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleContinue}
            disabled={uploadStatus !== 'success'}
            className="flex-1 py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}