'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function TranscriptPage() {
  const params = useParams();
  const interviewId = params?.id as string;

  // Mock transcript data
  const mockTranscript = [
    {
      role: 'agent',
      message: "Hello! I'm excited to interview you today. Let's start with you telling me a bit about yourself and your background.",
      timestamp: '00:00'
    },
    {
      role: 'user', 
      message: "Hi there! I'm a software engineer with about 5 years of experience, primarily working with React and Node.js. I've been working at a fintech startup where I've helped build user-facing applications.",
      timestamp: '00:15'
    },
    {
      role: 'agent',
      message: "That's great! Can you tell me about a challenging project you worked on recently and how you approached solving it?",
      timestamp: '00:45'
    },
    {
      role: 'user',
      message: "Sure! One of the most challenging projects was implementing a real-time trading dashboard. We had to handle thousands of price updates per second while keeping the UI responsive. I used React with optimized rendering and WebSocket connections with proper error handling.",
      timestamp: '01:00'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href={`/interviews/${interviewId}/results`} className="text-brand-primary hover:underline mb-4 inline-block">
            ← Back to Results
          </Link>
          <h1 className="font-nunito font-bold text-3xl mb-2">Interview Transcript</h1>
          <p className="text-white/70">Full conversation history</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="space-y-6">
            {mockTranscript.map((message, index) => (
              <div key={index} className="border-l-2 border-white/10 pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-brand-primary rounded-full"></div>
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`font-nunito font-semibold ${
                      message.role === 'user' ? 'text-brand-primary' : 'text-accent-gold'
                    }`}>
                      {message.role === 'user' ? 'You' : 'AI Interviewer'}
                    </span>
                    <span className="text-white/50 text-sm">{message.timestamp}</span>
                  </div>
                </div>
                
                <p className="text-white/90 leading-relaxed">
                  {message.message}
                </p>
              </div>
            ))}
          </div>

          {/* Export Options */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex gap-4 justify-center">
              <button className="glass font-nunito font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                Download PDF
              </button>
              <button className="glass font-nunito font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}