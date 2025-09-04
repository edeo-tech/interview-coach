# NextRound Web App

Web version of the NextRound AI Interview Coach application built with Next.js 14.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

## 🏗️ Architecture

### Project Structure
```
frontend-web/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # Reusable UI components
│   ├── lib/          # API clients and utilities
│   └── hooks/        # Custom React hooks
├── shared/           # Shared code with mobile app
│   ├── api/          # HTTP clients (platform agnostic)
│   ├── interfaces/   # TypeScript types
│   ├── utils/        # Pure utility functions
│   └── constants/    # Design tokens and configs
```

### Design System
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with glassmorphic design
- **Typography**: Nunito (brand) + Inter (utility) fonts
- **State**: TanStack Query for server state
- **Animations**: Framer Motion

### Key Integrations
- **Backend**: FastAPI with JWT authentication
- **Analytics**: PostHog (same key as mobile)
- **Payments**: RevenueCat Web SDK
- **Voice AI**: ElevenLabs React SDK

## 🎨 Design System

The web app mirrors the mobile app's glassmorphic design:
- Dark background with glass effect overlays
- Purple (#A855F7) and gold (#F59E0B) accent colors
- Backdrop blur effects for depth
- Consistent typography hierarchy

## 🔧 Development

### Environment Variables

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Features

### Authentication
- Email/password login and registration
- JWT token-based auth with refresh tokens
- Protected routes with middleware

### Interview Practice  
- Multiple interview types (General, Behavioral, Technical, etc.)
- Real-time AI conversation with ElevenLabs
- Interview feedback and scoring
- Transcript viewing and export

### Job Integration
- Job browsing and search
- Job-specific interview practice
- Company research integration

### User Management
- Profile settings and customization
- Subscription management via RevenueCat
- Usage analytics and progress tracking