'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function JobsPage() {
  // Mock job data
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      type: 'Full-time'
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$100k - $140k',
      type: 'Full-time'
    }
  ];

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="font-nunito font-bold text-3xl mb-2">Job Opportunities</h1>
            <p className="text-white/70">Find your next opportunity and practice for it</p>
          </header>

          <div className="grid gap-6">
            {mockJobs.map((job) => (
              <div key={job.id} className="glass rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-nunito font-semibold text-xl mb-2">{job.title}</h3>
                    <p className="text-brand-primary font-medium mb-2">{job.company}</p>
                    <div className="flex gap-4 text-white/70 text-sm">
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salary}</span>
                      <span>⏰ {job.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="glass-purple font-nunito font-medium px-4 py-2 rounded-lg hover:bg-brand-primary/20 transition-colors">
                      Practice Interview
                    </button>
                    <button className="glass font-nunito font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}