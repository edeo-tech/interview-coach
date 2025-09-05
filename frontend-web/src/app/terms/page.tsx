'use client';

import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function TermsPage() {
  const router = useRouter();

  const termsContent = [
    { type: 'p', text: 'Our iOS app, Interview Guide AI, is designed to help you prepare for job interviews through AI-powered mock interviews and personalized feedback. By accessing and using Interview Guide AI, you agree to the following terms and conditions, which we ask you to read carefully.' },
    
    { type: 'h2', text: 'Services Offered' },
    { type: 'p', text: 'Interview Guide AI provides an AI-powered interview preparation platform that allows users to:' },
    { type: 'bullet', text: '• Create and manage professional profiles with CV uploads' },
    { type: 'bullet', text: '• Create job interview sessions by providing job listing links or uploading job descriptions' },
    { type: 'bullet', text: '• Participate in realistic mock interviews with AI voice agents' },
    { type: 'bullet', text: '• Receive detailed transcripts, performance grades, and personalized feedback on interview performance' },
    
    { type: 'h2', text: 'Collection and Use of Personal Information' },
    { type: 'p', text: 'To provide you with personalized interview preparation services, users are required to register and submit certain personal details, including but not limited to your name, email address, CV/resume, and job descriptions. This information enables us to customize your mock interview experience and provide relevant feedback based on your specific job applications.' },
    
    { type: 'h2', text: 'Data Protection' },
    { type: 'p', text: 'We prioritize the security of your personal information, storing all user data within the secure confines of a MongoDB Atlas cloud database. This, along with axios, the HTTP request provider, are the sole third-party services with access to your information, underlining our commitment to data privacy and protection.' },
    
    { type: 'h2', text: 'Content and User Conduct' },
    { type: 'p', text: 'Interview Guide AI is a platform built on respect and integrity. Sharing of accounts is strictly forbidden, as are any forms of harassment, cheating, or abuse. Users are expected to engage with the AI interview system honestly and authentically to receive meaningful feedback.' },
    
    { type: 'h2', text: 'Intellectual Property' },
    { type: 'p', text: 'The interview content, AI-generated responses, and feedback provided by Interview Guide AI are designed exclusively for the personal and educational use of our registered users. Your CV and job descriptions remain your intellectual property.' },
    
    { type: 'h2', text: 'Disclaimer and Liability' },
    { type: 'p', text: 'Although we strive for accuracy, Interview Guide AI cannot guarantee the completeness, reliability, or up-to-dateness of the interview feedback or AI-generated content provided. Therefore, we shall not be held liable for any damages or losses incurred from your use of our app, including but not limited to interview outcomes, within the limits of applicable law.' },
    
    { type: 'h2', text: 'Contact Us' },
    { type: 'p', text: 'Should you have any inquiries or concerns regarding these Terms and Conditions, please reach out to us at matthew@interviewguideai.cc.' },
    
    { type: 'h2', text: 'Acceptance of Terms' },
    { type: 'p', text: 'By registering and engaging with Interview Guide AI, you affirm that you have thoroughly read, understood, and consented to be bound by these Terms and Conditions. We thank you for choosing Interview Guide AI as your interview preparation ally and look forward to supporting you on your path to career success.' },
  ];

  const renderContent = (item: any, index: number) => {
    switch (item.type) {
      case 'h1':
        return (
          <h1 key={index} className="text-3xl font-bold text-white mb-4 text-center">
            {item.text}
          </h1>
        );
      case 'h2':
        return (
          <h2 key={index} className="text-xl font-semibold text-brand-primary mt-8 mb-4">
            {item.text}
          </h2>
        );
      case 'bullet':
        return (
          <p key={index} className="text-base text-white/70 mb-2 ml-4">
            {item.text}
          </p>
        );
      default:
        return (
          <p key={index} className="text-base leading-relaxed text-white/70 mb-6">
            {item.text}
          </p>
        );
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-nunito font-bold text-3xl text-white">Terms and Conditions</h1>
          </header>

          {/* Content */}
          <div className="glass rounded-2xl p-8">
            {termsContent.map((item, index) => renderContent(item, index))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}