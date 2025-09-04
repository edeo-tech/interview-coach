'use client';

import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function InterviewsPage() {
  return (
    <AuthenticatedLayout>
      <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-nunito font-bold text-3xl">Interview Practice</h1>
          <Link 
            href="/interviews/create"
            className="glass-purple font-nunito font-semibold px-6 py-3 rounded-xl hover:bg-brand-primary/20 transition-colors"
          >
            Start New Interview
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Recent Interviews */}
          <section>
            <h2 className="font-nunito font-semibold text-xl mb-4">Recent Interviews</h2>
            <div className="glass rounded-2xl p-6">
              <p className="text-white/70 text-center py-8">
                No interviews yet. Start your first practice session!
              </p>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="font-nunito font-semibold text-xl mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/interviews/create?type=general" className="glass rounded-xl p-4 hover:glass-purple transition-all">
                <h3 className="font-nunito font-semibold mb-2">General Interview</h3>
                <p className="text-white/70 text-sm">Standard interview questions</p>
              </Link>
              
              <Link href="/interviews/create?type=behavioral" className="glass rounded-xl p-4 hover:glass-purple transition-all">
                <h3 className="font-nunito font-semibold mb-2">Behavioral Interview</h3>
                <p className="text-white/70 text-sm">STAR method practice</p>
              </Link>
            </div>
          </section>
        </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}