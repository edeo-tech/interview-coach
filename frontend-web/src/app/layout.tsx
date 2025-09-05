import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: "NextRound - AI Interview Coach",
  description: "Practice interviews with AI and get personalized feedback to land your dream job",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${nunito.variable} antialiased bg-black text-white font-inter`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
