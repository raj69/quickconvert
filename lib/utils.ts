// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Conversion utilities with high accuracy
export function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value
  
  // Convert to Celsius first
  let celsius = value
  if (from === 'fahrenheit') {
    celsius = (value - 32) * 5 / 9
  } else if (from === 'kelvin') {
    celsius = value - 273.15
  }
  
  // Convert from Celsius to target
  switch (to) {
    case 'fahrenheit':
      return (celsius * 9 / 5) + 32
    case 'kelvin':
      return celsius + 273.15
    case 'celsius':
    default:
      return celsius
  }
}

export function convertLength(value: number, from: string, to: string): number {
  const meters: { [key: string]: number } = {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    inch: 0.0254,
    foot: 0.3048,
    yard: 0.9144,
    mile: 1609.344,
    micrometer: 0.000001,
    nanometer: 0.000000001,
    lightyear: 9.461e15,
    nautical_mile: 1852,
  }
  
  const inMeters = value * (meters[from] || 1)
  return inMeters / (meters[to] || 1)
}

export function convertWeight(value: number, from: string, to: string): number {
  const kilograms: { [key: string]: number } = {
    kilogram: 1,
    gram: 0.001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000,
    stone: 6.35029,
    carat: 0.0002,
    long_ton: 1016.05,
    short_ton: 907.185,
    troy_ounce: 0.0311035,
  }
  
  const inKilograms = value * (kilograms[from] || 1)
  return inKilograms / (kilograms[to] || 1)
}

export function convertVolume(value: number, from: string, to: string): number {
  const liters: { [key: string]: number } = {
    liter: 1,
    milliliter: 0.001,
    gallon_us: 3.78541,
    gallon_uk: 4.54609,
    quart_us: 0.946353,
    pint_us: 0.473176,
    cup_us: 0.236588,
    fluid_ounce_us: 0.0295735,
    tablespoon_us: 0.0147868,
    teaspoon_us: 0.00492892,
    cubic_meter: 1000,
    cubic_centimeter: 0.001,
    cubic_inch: 0.0163871,
    cubic_foot: 28.3168,
  }
  
  const inLiters = value * (liters[from] || 1)
  return inLiters / (liters[to] || 1)
}

export function convertArea(value: number, from: string, to: string): number {
  const squareMeters: { [key: string]: number } = {
    square_meter: 1,
    square_kilometer: 1000000,
    square_centimeter: 0.0001,
    square_millimeter: 0.000001,
    square_inch: 0.00064516,
    square_foot: 0.092903,
    square_yard: 0.836127,
    square_mile: 2590000,
    acre: 4046.86,
    hectare: 10000,
  }
  
  const inSquareMeters = value * (squareMeters[from] || 1)
  return inSquareMeters / (squareMeters[to] || 1)
}

export function convertSpeed(value: number, from: string, to: string): number {
  const metersPerSecond: { [key: string]: number } = {
    meter_per_second: 1,
    kilometer_per_hour: 0.277778,
    mile_per_hour: 0.44704,
    foot_per_second: 0.3048,
    knot: 0.514444,
    mach: 343, // Speed of sound at sea level
  }
  
  const inMetersPerSecond = value * (metersPerSecond[from] || 1)
  return inMetersPerSecond / (metersPerSecond[to] || 1)
}

export function convertFrequency(value: number, from: string, to: string): number {
  const hertz: { [key: string]: number } = {
    hertz: 1,
    kilohertz: 1000,
    megahertz: 1000000,
    gigahertz: 1000000000,
    rpm: 1/60, // revolutions per minute to Hz
  }
  
  const inHertz = value * (hertz[from] || 1)
  return inHertz / (hertz[to] || 1)
}

// Format number for display with appropriate precision
export function formatNumber(value: number, precision: number = 6): string {
  if (isNaN(value) || !isFinite(value)) return "0"
  
  // Handle very large and very small numbers with scientific notation
  if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
    return value.toExponential(3)
  }
  
  // For normal numbers, use fixed precision and remove trailing zeros
  return parseFloat(value.toFixed(precision)).toString()
}

// Format number for display with smart precision based on value size
export function formatNumberSmart(value: number): string {
  if (isNaN(value) || !isFinite(value)) return "0"
  
  const absValue = Math.abs(value)
  
  if (absValue === 0) return "0"
  if (absValue >= 1e6 || absValue < 1e-4) return value.toExponential(3)
  if (absValue >= 1000) return Math.round(value).toString()
  if (absValue >= 1) return value.toFixed(3).replace(/\.?0+$/, '')
  if (absValue >= 0.01) return value.toFixed(4).replace(/\.?0+$/, '')
  
  return value.toFixed(6).replace(/\.?0+$/, '')
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Check if a number is valid for conversion
export function isValidNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && isFinite(num)
}

// Round to significant figures
export function toSignificantFigures(value: number, figures: number): number {
  if (value === 0) return 0
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  const factor = Math.pow(10, figures - magnitude - 1)
  return Math.round(value * factor) / factor
}

// Convert between different number bases (for data/computer science conversions)
export function convertBase(value: string, fromBase: number, toBase: number): string {
  const decimal = parseInt(value, fromBase)
  if (isNaN(decimal)) return "Invalid"
  return decimal.toString(toBase).toUpperCase()
}

// Temperature conversion with proper handling of absolute zero
export function convertTemperatureWithValidation(value: number, from: string, to: string): number {
  // Check for absolute zero violations
  if (from === 'celsius' && value < -273.15) throw new Error("Below absolute zero")
  if (from === 'fahrenheit' && value < -459.67) throw new Error("Below absolute zero")
  if (from === 'kelvin' && value < 0) throw new Error("Below absolute zero")
  
  return convertTemperature(value, from, to)
}

// Get appropriate decimal places based on conversion type and values
export function getOptimalPrecision(value: number, category: string): number {
  const absValue = Math.abs(value)
  
  switch (category) {
    case 'Temperature':
      return absValue > 1000 ? 1 : 2
    case 'Length':
      if (absValue >= 1000) return 2
      if (absValue >= 1) return 4
      return 6
    case 'Weight':
      if (absValue >= 1000) return 2
      if (absValue >= 1) return 3
      return 5
    case 'Volume':
      if (absValue >= 1000) return 2
      if (absValue >= 1) return 3
      return 4
    case 'Data':
      return absValue >= 1 ? 2 : 6
    default:
      return 4
  }
}

// Theme-related utilities
export function getThemeColors(theme: 'light' | 'dark') {
  return {
    light: {
      primary: 'hsl(240, 5.9%, 10%)',
      secondary: 'hsl(240, 4.8%, 95.9%)',
      accent: 'hsl(240, 4.8%, 95.9%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(240, 10%, 3.9%)',
    },
    dark: {
      primary: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(240, 3.7%, 15.9%)',
      accent: 'hsl(240, 3.7%, 15.9%)',
      background: 'hsl(240, 10%, 3.9%)',
      foreground: 'hsl(0, 0%, 98%)',
    }
  }[theme]
}

// Performance monitoring utility
export function measurePerformance<T>(
  operation: () => T,
  label: string = 'Operation'
): T {
  const start = performance.now()
  const result = operation()
  const end = performance.now()
  console.log(`${label} took ${(end - start).toFixed(2)}ms`)
  return result
}

// Error boundary utility for conversion functions
export function safeConvert(
  converter: (value: number, from: string, to: string) => number,
  value: number,
  from: string,
  to: string
): { result: number | null; error: string | null } {
  try {
    if (!isValidNumber(value)) {
      return { result: null, error: "Invalid input value" }
    }
    
    const result = converter(value, from, to)
    
    if (!isValidNumber(result)) {
      return { result: null, error: "Conversion resulted in invalid number" }
    }
    
    return { result, error: null }
  } catch (error) {
    return { 
      result: null, 
      error: error instanceof Error ? error.message : "Unknown conversion error"
    }
  }
}

// lib/utils.ts - Add these additional conversion functions
// ... (keep existing functions and add these)

export function convertPressure(value: number, from: string, to: string): number {
  const pascals: { [key: string]: number } = {
    pascal: 1,
    kilopascal: 1000,
    bar: 100000,
    atmosphere: 101325,
    psi: 6894.76,
    torr: 133.322,
    mmhg: 133.322,
  }
  
  const inPascals = value * (pascals[from] || 1)
  return inPascals / (pascals[to] || 1)
}

export function convertEnergy(value: number, from: string, to: string): number {
  const joules: { [key: string]: number } = {
    joule: 1,
    kilojoule: 1000,
    calorie: 4.184,
    kilocalorie: 4184,
    watt_hour: 3600,
    kilowatt_hour: 3600000,
    btu: 1055.06,
    foot_pound: 1.35582,
  }
  
  const inJoules = value * (joules[from] || 1)
  return inJoules / (joules[to] || 1)
}

export function convertPower(value: number, from: string, to: string): number {
  const watts: { [key: string]: number } = {
    watt: 1,
    kilowatt: 1000,
    horsepower: 745.7,
    btu_per_hour: 0.293071,
  }
  
  const inWatts = value * (watts[from] || 1)
  return inWatts / (watts[to] || 1)
}

export function convertTime(value: number, from: string, to: string): number {
  const seconds: { [key: string]: number } = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2629746,
    year: 31556952,
    millisecond: 0.001,
  }
  
  const inSeconds = value * (seconds[from] || 1)
  return inSeconds / (seconds[to] || 1)
}

export function convertData(value: number, from: string, to: string): number {
  const bytes: { [key: string]: number } = {
    byte: 1,
    kilobyte: 1024,
    megabyte: 1024 * 1024,
    gigabyte: 1024 * 1024 * 1024,
    terabyte: 1024 * 1024 * 1024 * 1024,
    bit: 0.125,
    kilobit: 128,
    megabit: 131072,
    gigabit: 134217728,
  }
  
  const inBytes = value * (bytes[from] || 1)
  return inBytes / (bytes[to] || 1)
}

export function convertCurrency(value: number, from: string, to: string): number {
  // Mock rates - in production, use real API
  const usdRates: { [key: string]: number } = {
    usd: 1,
    eur: 0.85,
    gbp: 0.73,
    jpy: 110,
    aud: 1.35,
    cad: 1.25,
    chf: 0.92,
    cny: 6.45,
    inr: 74.5,
  }
  
  const inUsd = value / (usdRates[from] || 1)
  return inUsd * (usdRates[to] || 1)
}

export function convertAngle(value: number, from: string, to: string): number {
  const degrees: { [key: string]: number } = {
    degree: 1,
    radian: 57.2958,
    gradian: 0.9,
    turn: 360,
  }
  
  const inDegrees = value * (degrees[from] || 1)
  return inDegrees / (degrees[to] || 1)
}

export function convertCooking(value: number, from: string, to: string): number {
  const milliliters: { [key: string]: number } = {
    cup: 236.588,
    tablespoon: 14.7868,
    teaspoon: 4.92892,
    fluid_ounce: 29.5735,
    pint: 473.176,
    quart: 946.353,
    gallon: 3785.41,
    milliliter: 1,
    liter: 1000,
  }
  
  const inMl = value * (milliliters[from] || 1)
  return inMl / (milliliters[to] || 1)
}

// AI Suggestion Engine
export function getAISuggestions(category: string, fromUnit: string, toUnit: string, value: number) {
  const suggestions = {
    Temperature: {
      common: ['celsius', 'fahrenheit'],
      context: value > 100 ? 'High temperature - consider Fahrenheit for cooking' : 'Room temperature - Celsius is common',
    },
    Length: {
      common: ['meter', 'foot', 'inch'],
      context: value > 1000 ? 'Large distance - consider kilometers or miles' : 'Small measurement - millimeters or inches',
    },
    Weight: {
      common: ['kilogram', 'pound'],
      context: value > 1000 ? 'Heavy object - consider tons' : 'Light object - grams or ounces',
    },
    Volume: {
      common: ['liter', 'gallon_us', 'cup_us'],
      context: value > 10 ? 'Large volume - gallons or liters' : 'Small volume - cups or milliliters',
    },
  }
  
  return suggestions[category as keyof typeof suggestions] || { common: [], context: '' }
}

