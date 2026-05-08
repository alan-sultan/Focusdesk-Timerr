import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TimerProvider } from '@/lib/timer-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'FocusDesk | Focus Timer',
  description: 'A clean and professional focus timer for deep work sessions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-[var(--background)] text-[var(--foreground)] min-h-screen selection:bg-[#e11d48] selection:text-white transition-colors duration-300`}
        suppressHydrationWarning
      >
        <TimerProvider>
          {children}
        </TimerProvider>
      </body>
    </html>
  );
}
