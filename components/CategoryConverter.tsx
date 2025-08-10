// components/CategoryConverter.tsx
'use client'

import { useState } from 'react'
import UnitConverter from './UnitConverter'

interface CategoryConverterProps {
  category: string
}

export default function CategoryConverter({ category }: CategoryConverterProps) {
  // This component can be customized per category
  // For now, we'll use the main UnitConverter but you can extend it
  
  return (
    <div className="space-y-8">
      <UnitConverter />
      
      {/* Category-specific features can be added here */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Popular {category.charAt(0).toUpperCase() + category.slice(1)} Conversions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {getPopularConversions(category).map((conversion, index) => (
            <div key={index} className="bg-white p-3 rounded border">
              {conversion}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getPopularConversions(category: string): string[] {
  const conversions: Record<string, string[]> = {
    length: [
      '1 meter = 3.28084 feet',
      '1 kilometer = 0.621371 miles',
      '1 inch = 2.54 centimeters',
      '1 yard = 0.9144 meters'
    ],
    weight: [
      '1 kilogram = 2.20462 pounds',
      '1 pound = 16 ounces',
      '1 gram = 0.035274 ounces',
      '1 ton = 1000 kilograms'
    ],
    temperature: [
      '0°C = 32°F',
      '100°C = 212°F',
      '0°C = 273.15K',
      'Room temp: 20°C = 68°F'
    ]
  }
  
  return conversions[category] || ['Popular conversions will be shown here']
}
