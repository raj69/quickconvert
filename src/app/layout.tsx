import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'QuickConvert - Lightning Fast Unit Converter with AI',
    template: '%s | QuickConvert'
  },
  description: 'World\'s fastest unit converter with AI suggestions, voice input, and batch processing. Convert length, weight, temperature & more in <1.5s.',
  keywords: ['unit converter', 'metric converter', 'measurement converter', 'AI converter', 'voice converter'],
  authors: [{ name: 'QuickConvert Team' }],
  creator: 'QuickConvert',
  publisher: 'QuickConvert',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quickconvert.app',
    siteName: 'QuickConvert',
    title: 'QuickConvert - Lightning Fast Unit Converter with AI',
    description: 'World\'s fastest unit converter with AI suggestions, voice input, and batch processing.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'QuickConvert - Fast Unit Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickConvert - Lightning Fast Unit Converter',
    description: 'Convert units instantly with AI suggestions and voice input.',
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.quickconvert.app" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "QuickConvert",
              "description": "Lightning fast unit converter with AI suggestions",
              "url": "https://quickconvert.app",
              "applicationCategory": "Utility",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className="font-inter antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
