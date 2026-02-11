import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { TRPCReactProvider } from '@/lib/trpc/client';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Clue: Interactive Mystery Game',
  description: 'A modern recreation of the classic 2002 video game Sleuth. Solve mysteries, collect clues, and catch culprits.',
  keywords: ['mystery', 'game', 'detective', 'clue', 'interactive', 'entertainment'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <TRPCReactProvider>
              {children}
              <Toaster richColors position="top-right" />
            </TRPCReactProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
