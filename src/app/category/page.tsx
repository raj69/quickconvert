// app/[category]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryConverter from '@/components/CategoryConverter'

const categories = [
  { slug: 'length', name: 'Length', description: 'Convert meters, feet, inches, kilometers and more' },
  { slug: 'weight', name: 'Weight', description: 'Convert kilograms, pounds, ounces, grams and more' },
  { slug: 'temperature', name: 'Temperature', description: 'Convert Celsius, Fahrenheit, Kelvin and more' },
  { slug: 'volume', name: 'Volume', description: 'Convert liters, gallons, cups, milliliters and more' },
  { slug: 'area', name: 'Area', description: 'Convert square meters, acres, hectares and more' },
  { slug: 'speed', name: 'Speed', description: 'Convert mph, km/h, m/s, knots and more' },
  { slug: 'pressure', name: 'Pressure', description: 'Convert PSI, bar, pascal, atm and more' },
  { slug: 'energy', name: 'Energy', description: 'Convert joules, calories, BTU, watts and more' },
  { slug: 'time', name: 'Time', description: 'Convert seconds, minutes, hours, days and more' },
  { slug: 'data', name: 'Data Storage', description: 'Convert bytes, KB, MB, GB, TB and more' },
  { slug: 'cooking', name: 'Cooking', description: 'Convert cups, tablespoons, teaspoons and more' },
  { slug: 'currency', name: 'Currency', description: 'Convert USD, EUR, GBP, JPY and more' },
]

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const category = categories.find(c => c.slug === params.category)
  
  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} Converter - Convert ${category.name} Units | QuickConvert`,
    description: `Free ${category.name.toLowerCase()} converter. ${category.description}. Fast, accurate, and easy to use.`,
    alternates: {
      canonical: `https://quickconvert.app/${category.slug}`,
    },
  }
}

export default function CategoryPage({
  params,
}: {
  params: { category: string }
}) {
  const category = categories.find(c => c.slug === params.category)
  
  if (!category) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${category.name} Converter`,
    description: category.description,
    url: `https://quickconvert.app/${category.slug}`,
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: `${category.name} Unit Converter`,
      applicationCategory: 'Utility',
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="min-h-screen py-16">
        <div className="converter-container">
          <h1 className="text-4xl font-bold text-center mb-6">
            {category.name} Converter
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            {category.description}
          </p>
          
          {/* Category-specific converter component */}
          <CategoryConverter category={category.slug} />
          
          {/* SEO content section */}
          <section className="mt-16 prose max-w-4xl mx-auto">
            <h2>About {category.name} Conversions</h2>
            <p>
              {/* Add category-specific educational content here */}
              Our {category.name.toLowerCase()} converter provides instant, accurate conversions
              between all major {category.name.toLowerCase()} units. Whether you're a student,
              professional, or just need quick conversions, our tool delivers results in under 1.5 seconds.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
