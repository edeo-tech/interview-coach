'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useCheckAuth, useUpdateProfile, useLogout } from '@/hooks/use-auth';
import { useUserInterviews } from '@/hooks/use-interviews';
import { useCV } from '@/hooks/use-cv';
import { useUserStats } from '@/hooks/use-stats';

export default function ProfilePage() {
  const { data: user } = useCheckAuth();
  const updateProfileMutation = useUpdateProfile();
  const logoutMutation = useLogout();
  const { data: interviewsData } = useUserInterviews(5);
  const { data: currentCV } = useCV();
  const { data: userStats } = useUserStats();
  
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const interviews = interviewsData?.pages[0]?.interviews || [];

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleUpdateName = () => {
    if (name.trim() !== user?.name) {
      updateProfileMutation.mutate({ name: name.trim() });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logoutMutation.mutate();
    }
  };

  const getLikelihoodColor = (likelihood: number | null | undefined) => {
    if (!likelihood) return 'text-gray-500';
    if (likelihood < 40) return 'text-red-400';
    if (likelihood < 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const statsData = {
    totalInterviews: userStats?.total_attempts || 0,
    averageScore: userStats?.average_score || 0,
    streak: user?.streak || 0,
  };

  const hasCV = !!currentCV;

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* User Info Section */}
          <div className="glass rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 glass-subtle rounded-lg border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none font-nunito font-semibold text-2xl"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateName}
                        disabled={updateProfileMutation.isPending}
                        className="glass-purple font-nunito font-medium px-4 py-2 rounded-lg hover:bg-brand-primary/20 transition-colors disabled:opacity-50"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setName(user?.name || '');
                        }}
                        className="glass-subtle font-nunito font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="font-nunito font-bold text-3xl text-white">{user?.name || 'User'}</h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-brand-primary hover:text-brand-primary/80 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-white/70 text-lg">{user?.email}</p>
                    {user?.industry && (
                      <p className="text-brand-primary text-sm mt-1">{user.industry}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CV Status Section */}
          <div className="glass rounded-2xl p-6">
            <Link
              href="/cv-upload"
              className="flex items-center justify-between glass-subtle rounded-full px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 glass-subtle rounded-full flex items-center justify-center">
                  <svg className={`w-4 h-4 ${hasCV ? 'text-green-400' : 'text-brand-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-white">{hasCV ? 'View Your CV' : 'Upload Your CV'}</span>
              </div>
              <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* User Stats */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-nunito font-semibold text-xl mb-4 text-white">Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between glass-subtle rounded-full px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 glass-subtle rounded-full flex items-center justify-center">
                    <span className="text-lg">🎤</span>
                  </div>
                  <span className="text-white">Total Interviews</span>
                </div>
                <span className="font-semibold text-white">{statsData.totalInterviews}</span>
              </div>
              
              <div className="flex items-center justify-between glass-subtle rounded-full px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 glass-subtle rounded-full flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                  <span className="text-white">Average Score</span>
                </div>
                <span className={`font-semibold ${getLikelihoodColor(statsData.averageScore)}`}>
                  {statsData.averageScore ? Math.round(statsData.averageScore) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between glass-subtle rounded-full px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 glass-subtle rounded-full flex items-center justify-center">
                    <span className="text-lg">🔥</span>
                  </div>
                  <span className="text-white">Day Streak</span>
                </div>
                <span className="font-semibold text-white">{statsData.streak}</span>
              </div>
            </div>
          </div>

          {/* Recent Interviews */}
          <div className="glass rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-nunito font-semibold text-xl text-white">Recent Interviews</h2>
              {/* <Link href="/dashboard" className="text-brand-primary hover:underline text-sm">
                View all
              </Link> */}
            </div>
            <div className="space-y-3">
              {!interviews || interviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 glass-subtle rounded-2xl mx-auto mb-3 flex items-center justify-center">
                    <span className="text-xl">💼</span>
                  </div>
                  <p className="text-white/70 text-sm">No interviews yet</p>
                  <p className="text-white/50 text-xs">Create your first interview to start practicing</p>
                </div>
              ) : (
                interviews.slice(0, 5).map((interview) => (
                  <Link
                    key={interview._id}
                    href={`/interviews/${interview._id}/results`}
                    className="flex items-center justify-between glass-subtle rounded-full px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 glass-subtle rounded-full flex items-center justify-center">
                        <span className="text-sm">💼</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{interview.role_title}</p>
                        <p className="text-white/70 text-xs">{interview.company}</p>
                      </div>
                    </div>
                    <span className={`font-medium text-xs ${getLikelihoodColor(interview.average_score)}`}>
                      {interview.average_score ? `${Math.round(interview.average_score)}%` : 'New'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Settings Link */}
          <div className="glass rounded-2xl p-6">
            <Link
              href="/settings"
              className="flex items-center justify-between glass-subtle rounded-full px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 glass-subtle rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-white">Settings</span>
              </div>
              <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full glass border border-red-500/30 rounded-2xl p-4 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-nunito font-semibold text-red-400">
              {logoutMutation.isPending ? 'Logging Out...' : 'Log Out'}
            </span>
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}