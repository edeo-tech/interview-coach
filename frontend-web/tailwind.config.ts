import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#A855F7',
          secondary: '#8B5CF6',
          tertiary: '#7C3AED',
          quaternary: '#9333EA',
        },
        // Accent colors
        accent: {
          gold: '#F59E0B',
          'gold-alt': '#FCB000',
          blue: '#60A5FA',
          'blue-alt': '#3B82F6',
          'google-blue': '#4285F4',
        },
        // Semantic colors
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F97316',
        info: '#2E78B7',
        // Glass effect colors (using CSS custom properties)
        glass: {
          bg: 'rgba(255, 255, 255, 0.12)',
          'bg-secondary': 'rgba(255, 255, 255, 0.08)',
          'bg-subtle': 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.15)',
          purple: 'rgba(168, 85, 247, 0.15)',
          gold: 'rgba(245, 158, 11, 0.15)',
        },
      },
      fontFamily: {
        'nunito': ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        'inter': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },
  plugins: [],
};
export default config;
