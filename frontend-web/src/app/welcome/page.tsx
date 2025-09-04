'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCheckAuth } from '@/hooks/use-auth';

export default function WelcomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: user } = useCheckAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('WELCOME');
    if (user) {
      router.push('/dashboard');
    }
  }, [user]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-accent-gold/10"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-gold/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-lg w-full mx-auto text-center">
        {/* Logo with animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto glass-purple rounded-3xl flex items-center justify-center mb-6">
            <span className="text-5xl">🎤</span>
          </div>
        </motion.div>

        {/* Message with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <h1 className="font-nunito text-5xl mb-2 text-white">
            Get to the
          </h1>
          <h2 className="font-nunito font-bold text-6xl bg-gradient-to-r from-brand-primary to-accent-gold bg-clip-text text-transparent">
            nextround
          </h2>
        </motion.div>

        {/* CTA Button with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-4"
        >
          <Link
            href="/register"
            className="glass-purple font-nunito font-semibold px-8 py-4 rounded-2xl hover:bg-brand-primary/30 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <span>Start practicing now</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <Link
            href="/login"
            className="text-white/70 hover:text-white transition-colors"
          >
            Already have an account?
          </Link>
        </motion.div>
      </div>
    </div>
  );
}