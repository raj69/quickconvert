// app/page.tsx
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Regular dynamic import for UnitConverter (works in Server Components)
const UnitConverter = dynamic(() => import('@/components/UnitConverter'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
})

// Import the Client Component wrapper instead
const ClientVoiceInput = dynamic(() => import('@/components/ClientVoiceInput'), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />,
})

export const metadata: Metadata = {
  title: 'Unit Converter - Convert Length, Weight, Temperature & More | QuickConvert',
  description: 'Free online unit converter with AI suggestions. Convert between metric and imperial units instantly. Length, weight, temperature, volume, and 8+ categories.',
  alternates: {
    canonical: 'https://quickconvert.app',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'QuickConvert Unit Converter',
  description: 'Lightning fast unit converter with AI suggestions and voice input',
  url: 'https://quickconvert.app',
  applicationCategory: 'Utility',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  softwareVersion: '2.0',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'AI-powered unit suggestions',
    'Voice input and audio results',
    'Batch conversion processing',
    'Offline PWA functionality',
    '12+ conversion categories',
    'Sub-1.5s loading speed'
  ]
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="min-h-screen">
        {/* Hero Section - Critical Above-the-fold */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 text-center">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Lightning Fast Unit Converter
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Convert units instantly with AI suggestions and voice input
            </p>
            
            {/* Critical converter interface */}
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl mx-auto">
              <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded" />}>
                <UnitConverter />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose QuickConvert?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="⚡ Lightning Fast"
                description="Sub-1.5s loading time, 2x faster than competitors"
              />
              <FeatureCard
                title="🤖 AI-Powered"
                description="Smart suggestions based on context and usage patterns"
              />
              <FeatureCard
                title="🎤 Voice Input"
                description="Convert units hands-free with voice commands"
              />
            </div>
          </div>
        </section>

        {/* Voice Input Section - Client Component */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Try Voice Conversion</h2>
            <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded" />}>
              <ClientVoiceInput />
            </Suspense>
          </div>
        </section>
      </main>
    </>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
