// components/UnitConverter.tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, ArrowRightLeftIcon } from 'lucide-react'

interface Unit {
  name: string
  symbol: string
  factor: number
}

interface Category {
  name: string
  units: Unit[]
}

const categories: Category[] = [
  {
    name: 'Length',
    units: [
      { name: 'Meter', symbol: 'm', factor: 1 },
      { name: 'Kilometer', symbol: 'km', factor: 1000 },
      { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { name: 'Inch', symbol: 'in', factor: 0.0254 },
      { name: 'Foot', symbol: 'ft', factor: 0.3048 },
      { name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { name: 'Mile', symbol: 'mi', factor: 1609.344 },
    ]
  },
  {
    name: 'Weight',
    units: [
      { name: 'Kilogram', symbol: 'kg', factor: 1 },
      { name: 'Gram', symbol: 'g', factor: 0.001 },
      { name: 'Pound', symbol: 'lb', factor: 0.453592 },
      { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
      { name: 'Ton', symbol: 't', factor: 1000 },
    ]
  },
  {
    name: 'Temperature',
    units: [
      { name: 'Celsius', symbol: '°C', factor: 1 },
      { name: 'Fahrenheit', symbol: '°F', factor: 1 },
      { name: 'Kelvin', symbol: 'K', factor: 1 },
    ]
  }
]

export default function UnitConverter() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [fromUnit, setFromUnit] = useState(selectedCategory.units[0])
  const [toUnit, setToUnit] = useState(selectedCategory.units[1])
  const [inputValue, setInputValue] = useState('')
  const [outputValue, setOutputValue] = useState('')

  const convertValue = (value: string, from: Unit, to: Unit, category: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return ''

    let result: number

    if (category === 'Temperature') {
      // Special handling for temperature conversions
      if (from.symbol === '°C' && to.symbol === '°F') {
        result = (numValue * 9/5) + 32
      } else if (from.symbol === '°F' && to.symbol === '°C') {
        result = (numValue - 32) * 5/9
      } else if (from.symbol === '°C' && to.symbol === 'K') {
        result = numValue + 273.15
      } else if (from.symbol === 'K' && to.symbol === '°C') {
        result = numValue - 273.15
      } else if (from.symbol === '°F' && to.symbol === 'K') {
        result = ((numValue - 32) * 5/9) + 273.15
      } else if (from.symbol === 'K' && to.symbol === '°F') {
        result = ((numValue - 273.15) * 9/5) + 32
      } else {
        result = numValue // Same unit
      }
    } else {
      // Standard factor-based conversion
      const baseValue = numValue * from.factor
      result = baseValue / to.factor
    }

    return result.toFixed(6).replace(/\.?0+$/, '')
  }

  useEffect(() => {
    if (inputValue) {
      const converted = convertValue(inputValue, fromUnit, toUnit, selectedCategory.name)
      setOutputValue(converted)
    } else {
      setOutputValue('')
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory])

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
    setFromUnit(category.units[0])
    setToUnit(category.units[1])
    setInputValue('')
    setOutputValue('')
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setInputValue(outputValue)
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                selectedCategory.name === category.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* From Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="space-y-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-lg"
            />
            <select
              value={fromUnit.name}
              onChange={(e) => {
                const unit = selectedCategory.units.find(u => u.name === e.target.value)
                if (unit) setFromUnit(unit)
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              {selectedCategory.units.map((unit) => (
                <option key={unit.name} value={unit.name}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapUnits}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Swap units"
          >
            <ArrowRightLeftIcon className="w-5 h-5" />
          </button>
        </div>

        {/* To Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={outputValue}
              readOnly
              placeholder="Result"
              className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-lg font-medium"
            />
            <select
              value={toUnit.name}
              onChange={(e) => {
                const unit = selectedCategory.units.find(u => u.name === e.target.value)
                if (unit) setToUnit(unit)
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              {selectedCategory.units.map((unit) => (
                <option key={unit.name} value={unit.name}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Convert Buttons */}
      {inputValue && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Results:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {selectedCategory.units.slice(0, 4).map((unit) => {
              if (unit.name === fromUnit.name) return null
              const converted = convertValue(inputValue, fromUnit, unit, selectedCategory.name)
              return (
                <div key={unit.name} className="text-center p-2 bg-white rounded border">
                  <div className="font-medium">{converted}</div>
                  <div className="text-gray-600">{unit.symbol}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
