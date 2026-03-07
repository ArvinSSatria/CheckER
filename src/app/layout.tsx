import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navbar } from '@/components/Navbar'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono'
})

export const metadata: Metadata = {
  title: {
    default: 'Social Media Engagement Calculator',
    template: '%s | Engagement Calculator',
  },
  description: 'Free tool to calculate Instagram and TikTok engagement rate instantly. Analyze followers, likes, comments, and more for any public profile.',
  keywords: ['engagement rate calculator', 'instagram engagement', 'tiktok engagement', 'social media analytics', 'influencer marketing tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Engagement Calculator',
    title: 'Social Media Engagement Calculator',
    description: 'Free tool to calculate Instagram and TikTok engagement rate instantly. Analyze any public profile with professional precision.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Engagement Calculator',
    description: 'Free tool to calculate Instagram and TikTok engagement rate instantly.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Social Media Engagement Calculator",
    "description": "Free tool to calculate Instagram and TikTok engagement rate. Analyze followers, likes, comments, views and shares for any public profile.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Instagram Engagement Rate Calculator",
      "TikTok Engagement Rate Calculator",
      "Export analytics as PNG",
      "Engagement Grade Rating (A+ to D)",
      "Estimated Post Value",
      "Like-to-View Ratio",
      "Comment-to-Like Ratio",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
