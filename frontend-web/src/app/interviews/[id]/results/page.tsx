'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function InterviewResultsPage() {
  const params = useParams();
  const interviewId = params?.id as string;

  // Mock data - in real implementation this would come from API
  const mockResults = {
    overall_score: 78,
    duration: '15:30',
    feedback: {
      strengths: [
        'Clear communication style',
        'Good use of specific examples',
        'Professional demeanor'
      ],
      improvements: [
        'Could provide more detailed examples',
        'Consider using the STAR method more consistently',
        'Practice speaking with more confidence'
      ]
    },
    transcript_summary: 'Candidate demonstrated good technical knowledge but could improve on providing more concrete examples when discussing past experiences.'
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/interviews" className="text-brand-primary hover:underline mb-4 inline-block">
            ← Back to Interviews
          </Link>
          <h1 className="font-nunito font-bold text-3xl mb-2">Interview Results</h1>
          <p className="text-white/70">Review your performance and get feedback</p>
        </div>

        <div className="grid gap-6">
          {/* Overall Score */}
          <div className="glass rounded-2xl p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 glass-purple rounded-full mb-4">
                <span className="font-nunito font-bold text-2xl">{mockResults.overall_score}%</span>
              </div>
              <h2 className="font-nunito font-semibold text-2xl mb-2">Overall Performance</h2>
              <p className="text-white/70">Duration: {mockResults.duration}</p>
            </div>
          </div>

          {/* Feedback Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-nunito font-semibold text-xl mb-4 text-success">
                💪 Strengths
              </h3>
              <ul className="space-y-3">
                {mockResults.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-success mt-1">✓</span>
                    <span className="text-white/90">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-nunito font-semibold text-xl mb-4 text-warning">
                📈 Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {mockResults.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-warning mt-1">→</span>
                    <span className="text-white/90">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-nunito font-semibold text-xl mb-4">📝 Detailed Summary</h3>
            <p className="text-white/90 leading-relaxed">
              {mockResults.transcript_summary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/interviews/create"
              className="glass-purple font-nunito font-semibold px-6 py-3 rounded-xl hover:bg-brand-primary/20 transition-colors"
            >
              Practice Again
            </Link>
            
            <Link
              href={`/interviews/${interviewId}/transcript`}
              className="glass font-nunito font-semibold px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              View Transcript
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}