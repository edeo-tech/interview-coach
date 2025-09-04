'use client';

import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="font-nunito font-bold text-4xl mb-2">
            Welcome Back
          </h1>
          <p className="text-white/70 text-lg">
            Ready to practice your interview skills?
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Practice Interview Card */}
          <Link href="/interviews/create" className="glass rounded-2xl p-6 hover:glass-purple transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 glass-purple rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="font-nunito font-semibold text-xl mb-2">Start Practice Interview</h3>
              <p className="text-white/70">Practice with AI interviewer</p>
            </div>
          </Link>

          {/* Job Search Card */}
          <Link href="/jobs" className="glass rounded-2xl p-6 hover:glass-gold transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 glass-gold rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-nunito font-semibold text-xl mb-2">Browse Jobs</h3>
              <p className="text-white/70">Find your dream position</p>
            </div>
          </Link>

          {/* Interview History Card */}
          <Link href="/interviews" className="glass rounded-2xl p-6 hover:glass-purple transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 glass-subtle rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-nunito font-semibold text-xl mb-2">Interview History</h3>
              <p className="text-white/70">Review past performance</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <section className="mt-12">
          <h2 className="font-nunito font-semibold text-2xl mb-6">Recent Activity</h2>
          <div className="glass rounded-2xl p-6">
            <p className="text-white/70 text-center py-8">
              No recent activity. Start your first interview practice!
            </p>
          </div>
        </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}