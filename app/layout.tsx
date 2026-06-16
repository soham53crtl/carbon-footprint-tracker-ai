import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoSphere — Carbon Footprint Tracker',
  description:
    'Track, analyse, and reduce your personal carbon footprint with AI-powered insights, gamification, and a green rewards marketplace.',
  keywords: [
    'carbon footprint',
    'climate change',
    'sustainability',
    'eco tracker',
    'green living',
  ],
  authors: [{ name: 'EcoSphere Team' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'EcoSphere — Carbon Footprint Tracker',
    description: 'Track, analyse, and reduce your personal carbon footprint.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('ecosphere-theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
