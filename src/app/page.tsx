// components/home.tsx
"use client"

import * as React from "react"
import { 
  Calculator, Zap, Target, Globe, Crown, Star, ArrowRight, Sun, Moon,
  ArrowRightLeft, Copy, Check, Mic, MicOff, Clock, TrendingUp, Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, formatNumber } from "@/lib/utils"

interface Unit {
  name: string
  symbol: string
  key: string
  popular?: boolean
  category?: string
  description?: string
}

interface Category {
  name: string
  icon: string
  units: Unit[]
  converter: (value: number, from: string, to: string) => number
  gradient: string
  accentColor: string
  description: string
  examples: string[]
  precision: number
}

interface UnitConversion {
  unit: Unit
  value: string
  isMain?: boolean
}

interface RecentAction {
  id: string
  fromValue: string
  fromUnit: Unit
  toValue: string
  toUnit: Unit
  category: string
  timestamp: number
}

interface VoiceState {
  isListening: boolean
  transcript: string
  confidence: number
  isProcessing: boolean
  error?: string
}

// 100% Accurate Conversion Functions
const convertLength = (value: number, from: string, to: string): number => {
  const meters: { [key: string]: number } = {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    micrometer: 0.000001,
    nanometer: 0.000000001,
    inch: 0.0254,
    foot: 0.3048,
    yard: 0.9144,
    mile: 1609.344,
    nautical_mile: 1852,
    light_year: 9.460730472580800e15,
    parsec: 3.0857e16,
    angstrom: 1e-10,
    furlong: 201.168,
    chain: 20.1168,
    rod: 5.0292,
    fathom: 1.8288,
  }
  const inMeters = value * (meters[from] || 1)
  return inMeters / (meters[to] || 1)
}

const convertWeight = (value: number, from: string, to: string): number => {
  const kilograms: { [key: string]: number } = {
    kilogram: 1,
    gram: 0.001,
    milligram: 0.000001,
    pound: 0.45359237,
    ounce: 0.028349523125,
    ton: 1000,
    metric_ton: 1000,
    stone: 6.35029318,
    carat: 0.0002,
    troy_ounce: 0.0311034768,
    troy_pound: 0.3732417216,
    grain: 0.00006479891,
    short_ton: 907.18474,
    long_ton: 1016.0469088,
    hundredweight_us: 45.359237,
    hundredweight_uk: 50.80234544,
  }
  const inKilograms = value * (kilograms[from] || 1)
  return inKilograms / (kilograms[to] || 1)
}

const convertTemperature = (value: number, from: string, to: string): number => {
  if (from === to) return value
  
  let celsius = value
  if (from === 'fahrenheit') celsius = (value - 32) * 5 / 9
  else if (from === 'kelvin') celsius = value - 273.15
  else if (from === 'rankine') celsius = (value - 491.67) * 5 / 9
  else if (from === 'reaumur') celsius = value * 5 / 4
  else if (from === 'newton') celsius = value * 100 / 33
  
  switch (to) {
    case 'fahrenheit': return (celsius * 9 / 5) + 32
    case 'kelvin': return celsius + 273.15
    case 'rankine': return (celsius + 273.15) * 9 / 5
    case 'reaumur': return celsius * 4 / 5
    case 'newton': return celsius * 33 / 100
    default: return celsius
  }
}

const convertVolume = (value: number, from: string, to: string): number => {
  const liters: { [key: string]: number } = {
    liter: 1,
    milliliter: 0.001,
    cubic_meter: 1000,
    cubic_centimeter: 0.001,
    cubic_millimeter: 0.000001,
    cubic_inch: 0.016387064,
    cubic_foot: 28.316846592,
    cubic_yard: 764.554857984,
    gallon_us: 3.785411784,
    gallon_uk: 4.54609,
    quart_us: 0.946352946,
    quart_uk: 1.1365225,
    pint_us: 0.473176473,
    pint_uk: 0.56826125,
    cup_us: 0.2365882365,
    cup_uk: 0.284130625,
    fluid_ounce_us: 0.0295735296875,
    fluid_ounce_uk: 0.0284130625,
    tablespoon_us: 0.01478676478125,
    tablespoon_uk: 0.01420653125,
    teaspoon_us: 0.00492892159375,
    teaspoon_uk: 0.00473551041666667,
    barrel_oil: 158.987294928,
    barrel_us: 119.240471196,
  }
  const inLiters = value * (liters[from] || 1)
  return inLiters / (liters[to] || 1)
}

const convertArea = (value: number, from: string, to: string): number => {
  const squareMeters: { [key: string]: number } = {
    square_meter: 1,
    square_kilometer: 1000000,
    square_centimeter: 0.0001,
    square_millimeter: 0.000001,
    square_inch: 0.00064516,
    square_foot: 0.09290304,
    square_yard: 0.83612736,
    square_mile: 2589988.110336,
    acre: 4046.8564224,
    hectare: 10000,
    are: 100,
    barn: 1e-28,
    rood: 1011.7141056,
    square_perch: 25.29285264,
    square_rod: 25.29285264,
    square_chain: 404.68564224,
  }
  const inSquareMeters = value * (squareMeters[from] || 1)
  return inSquareMeters / (squareMeters[to] || 1)
}

const convertSpeed = (value: number, from: string, to: string): number => {
  const metersPerSecond: { [key: string]: number } = {
    meter_per_second: 1,
    kilometer_per_hour: 0.277777777777778,
    mile_per_hour: 0.44704,
    foot_per_second: 0.3048,
    knot: 0.514444444444444,
    mach: 343,
    speed_of_light: 299792458,
    kilometer_per_second: 1000,
    mile_per_second: 1609.344,
    foot_per_minute: 0.00508,
    inch_per_second: 0.0254,
    millimeter_per_second: 0.001,
  }
  const inMetersPerSecond = value * (metersPerSecond[from] || 1)
  return inMetersPerSecond / (metersPerSecond[to] || 1)
}

const convertPressure = (value: number, from: string, to: string): number => {
  const pascals: { [key: string]: number } = {
    pascal: 1,
    kilopascal: 1000,
    megapascal: 1000000,
    gigapascal: 1000000000,
    bar: 100000,
    millibar: 100,
    atmosphere: 101325,
    torr: 133.322387415,
    mmhg: 133.322387415,
    inhg: 3386.38815789474,
    psi: 6894.75729316836,
    ksi: 6894757.29316836,
    psf: 47.8802589803358,
  }
  const inPascals = value * (pascals[from] || 1)
  return inPascals / (pascals[to] || 1)
}

const convertEnergy = (value: number, from: string, to: string): number => {
  const joules: { [key: string]: number } = {
    joule: 1,
    kilojoule: 1000,
    megajoule: 1000000,
    gigajoule: 1000000000,
    calorie: 4.184,
    kilocalorie: 4184,
    watt_hour: 3600,
    kilowatt_hour: 3600000,
    megawatt_hour: 3600000000,
    btu: 1055.05585262,
    therm: 105505585.262,
    foot_pound: 1.3558179483314,
    electron_volt: 1.602176634e-19,
    erg: 1e-7,
    quad: 1.05505585262e18,
  }
  const inJoules = value * (joules[from] || 1)
  return inJoules / (joules[to] || 1)
}

const convertPower = (value: number, from: string, to: string): number => {
  const watts: { [key: string]: number } = {
    watt: 1,
    kilowatt: 1000,
    megawatt: 1000000,
    gigawatt: 1000000000,
    horsepower: 745.699871582270,
    metric_horsepower: 735.49875,
    boiler_horsepower: 9809.5,
    electric_horsepower: 746,
    btu_per_hour: 0.293071070172222,
    btu_per_minute: 17.5842642103333,
    btu_per_second: 1055.05585262,
    calorie_per_second: 4.184,
    foot_pound_per_second: 1.3558179483314,
    ton_refrigeration: 3516.85284206667,
  }
  const inWatts = value * (watts[from] || 1)
  return inWatts / (watts[to] || 1)
}

const convertTime = (value: number, from: string, to: string): number => {
  const seconds: { [key: string]: number } = {
    second: 1,
    millisecond: 0.001,
    microsecond: 0.000001,
    nanosecond: 0.000000001,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2629746,
    year: 31556952,
    decade: 315569520,
    century: 3155695200,
    millennium: 31556952000,
    fortnight: 1209600,
    jiffy: 0.01,
  }
  const inSeconds = value * (seconds[from] || 1)
  return inSeconds / (seconds[to] || 1)
}

const convertData = (value: number, from: string, to: string): number => {
  const bits: { [key: string]: number } = {
    bit: 1,
    byte: 8,
    kilobit: 1000,
    kilobyte: 8000,
    megabit: 1000000,
    megabyte: 8000000,
    gigabit: 1000000000,
    gigabyte: 8000000000,
    terabit: 1000000000000,
    terabyte: 8000000000000,
    petabit: 1000000000000000,
    petabyte: 8000000000000000,
    exabit: 1000000000000000000,
    exabyte: 8000000000000000000,
    kibibit: 1024,
    kibibyte: 8192,
    mebibit: 1048576,
    mebibyte: 8388608,
    gibibit: 1073741824,
    gibibyte: 8589934592,
    tebibit: 1099511627776,
    tebibyte: 8796093022208,
  }
  const inBits = value * (bits[from] || 1)
  return inBits / (bits[to] || 1)
}

const convertAngle = (value: number, from: string, to: string): number => {
  const radians: { [key: string]: number } = {
    radian: 1,
    degree: Math.PI / 180,
    gradian: Math.PI / 200,
    turn: 2 * Math.PI,
    arcminute: Math.PI / 10800,
    arcsecond: Math.PI / 648000,
    milliradian: 0.001,
    minute_of_arc: Math.PI / 10800,
    second_of_arc: Math.PI / 648000,
  }
  const inRadians = value * (radians[from] || 1)
  return inRadians / (radians[to] || 1)
}

// 12+ Categories with extensive units
const categories: Category[] = [
  {
    name: "Length", icon: "📏", gradient: "from-blue-600 to-blue-400", accentColor: "blue",
    description: "Distance and dimensional measurements", precision: 10,
    examples: ["Architecture", "Engineering", "Construction"],
    units: [
      { name: "Meter", symbol: "m", key: "meter", popular: true, category: "Metric", description: "SI base unit of length" },
      { name: "Kilometer", symbol: "km", key: "kilometer", popular: true, category: "Metric", description: "1000 meters" },
      { name: "Centimeter", symbol: "cm", key: "centimeter", popular: true, category: "Metric", description: "1/100 meter" },
      { name: "Millimeter", symbol: "mm", key: "millimeter", popular: true, category: "Metric", description: "1/1000 meter" },
      { name: "Micrometer", symbol: "μm", key: "micrometer", category: "Metric", description: "1/1,000,000 meter" },
      { name: "Nanometer", symbol: "nm", key: "nanometer", category: "Scientific", description: "1/1,000,000,000 meter" },
      { name: "Inch", symbol: "in", key: "inch", popular: true, category: "Imperial", description: "1/12 of a foot" },
      { name: "Foot", symbol: "ft", key: "foot", popular: true, category: "Imperial", description: "12 inches" },
      { name: "Yard", symbol: "yd", key: "yard", category: "Imperial", description: "3 feet" },
      { name: "Mile", symbol: "mi", key: "mile", popular: true, category: "Imperial", description: "5280 feet" },
      { name: "Nautical Mile", symbol: "nmi", key: "nautical_mile", category: "Maritime", description: "1852 meters exactly" },
      { name: "Light Year", symbol: "ly", key: "light_year", category: "Astronomical", description: "Distance light travels in a year" },
      { name: "Parsec", symbol: "pc", key: "parsec", category: "Astronomical", description: "Astronomical distance unit" },
      { name: "Angstrom", symbol: "Å", key: "angstrom", category: "Scientific", description: "10^-10 meters" },
      { name: "Furlong", symbol: "fur", key: "furlong", category: "Imperial", description: "1/8 mile" },
      { name: "Chain", symbol: "ch", key: "chain", category: "Surveying", description: "66 feet" },
      { name: "Rod", symbol: "rd", key: "rod", category: "Surveying", description: "16.5 feet" },
      { name: "Fathom", symbol: "ftm", key: "fathom", category: "Maritime", description: "6 feet" },
    ],
    converter: convertLength,
  },
  {
    name: "Weight", icon: "⚖️", gradient: "from-green-600 to-green-400", accentColor: "green",
    description: "Mass and weight measurements", precision: 8,
    examples: ["Health", "Shipping", "Cooking", "Science"],
    units: [
      { name: "Kilogram", symbol: "kg", key: "kilogram", popular: true, category: "Metric", description: "SI base unit of mass" },
      { name: "Gram", symbol: "g", key: "gram", popular: true, category: "Metric", description: "1/1000 kilogram" },
      { name: "Milligram", symbol: "mg", key: "milligram", category: "Metric", description: "1/1,000,000 kilogram" },
      { name: "Pound", symbol: "lb", key: "pound", popular: true, category: "Imperial", description: "16 ounces" },
      { name: "Ounce", symbol: "oz", key: "ounce", popular: true, category: "Imperial", description: "1/16 pound" },
      { name: "Metric Ton", symbol: "t", key: "metric_ton", category: "Metric", description: "1000 kilograms" },
      { name: "Ton", symbol: "ton", key: "ton", category: "Metric", description: "1000 kilograms" },
      { name: "Stone", symbol: "st", key: "stone", category: "Imperial", description: "14 pounds (UK)" },
      { name: "Carat", symbol: "ct", key: "carat", category: "Jewelry", description: "0.2 grams" },
      { name: "Troy Ounce", symbol: "oz t", key: "troy_ounce", category: "Precious", description: "31.1 grams" },
      { name: "Troy Pound", symbol: "lb t", key: "troy_pound", category: "Precious", description: "12 troy ounces" },
      { name: "Grain", symbol: "gr", key: "grain", category: "Pharmacy", description: "1/7000 pound" },
      { name: "Short Ton", symbol: "ton", key: "short_ton", category: "Imperial", description: "2000 pounds (US)" },
      { name: "Long Ton", symbol: "ton", key: "long_ton", category: "Imperial", description: "2240 pounds (UK)" },
      { name: "Hundredweight (US)", symbol: "cwt", key: "hundredweight_us", category: "Imperial", description: "100 pounds (US)" },
      { name: "Hundredweight (UK)", symbol: "cwt", key: "hundredweight_uk", category: "Imperial", description: "112 pounds (UK)" },
    ],
    converter: convertWeight,
  },
  {
    name: "Temperature", icon: "🌡️", gradient: "from-red-600 to-red-400", accentColor: "red",
    description: "Thermal measurements", precision: 6,
    examples: ["Weather", "Cooking", "Science", "Industry"],
    units: [
      { name: "Celsius", symbol: "°C", key: "celsius", popular: true, category: "Metric", description: "Water freezes at 0°C" },
      { name: "Fahrenheit", symbol: "°F", key: "fahrenheit", popular: true, category: "Imperial", description: "Water freezes at 32°F" },
      { name: "Kelvin", symbol: "K", key: "kelvin", category: "Scientific", description: "Absolute temperature scale" },
      { name: "Rankine", symbol: "°R", key: "rankine", category: "Scientific", description: "Fahrenheit absolute scale" },
      { name: "Réaumur", symbol: "°Ré", key: "reaumur", category: "Historical", description: "Water freezes at 0°Ré" },
      { name: "Newton", symbol: "°N", key: "newton", category: "Historical", description: "Water freezes at 0°N" },
    ],
    converter: convertTemperature,
  },
  {
    name: "Volume", icon: "🥛", gradient: "from-purple-600 to-purple-400", accentColor: "purple",
    description: "Liquid and solid volume", precision: 8,
    examples: ["Cooking", "Chemistry", "Medicine", "Fuel"],
    units: [
      { name: "Liter", symbol: "L", key: "liter", popular: true, category: "Metric", description: "Basic metric volume unit" },
      { name: "Milliliter", symbol: "ml", key: "milliliter", popular: true, category: "Metric", description: "1/1000 liter" },
      { name: "Cubic Meter", symbol: "m³", key: "cubic_meter", category: "Metric", description: "1000 liters" },
      { name: "Cubic Centimeter", symbol: "cm³", key: "cubic_centimeter", category: "Metric", description: "1 milliliter" },
      { name: "Cubic Millimeter", symbol: "mm³", key: "cubic_millimeter", category: "Metric", description: "0.001 ml" },
      { name: "Cubic Inch", symbol: "in³", key: "cubic_inch", category: "Imperial", description: "16.387 ml" },
      { name: "Cubic Foot", symbol: "ft³", key: "cubic_foot", category: "Imperial", description: "28.317 liters" },
      { name: "Cubic Yard", symbol: "yd³", key: "cubic_yard", category: "Imperial", description: "764.555 liters" },
      { name: "Gallon (US)", symbol: "gal", key: "gallon_us", popular: true, category: "Imperial", description: "US liquid gallon" },
      { name: "Gallon (UK)", symbol: "gal", key: "gallon_uk", category: "Imperial", description: "Imperial gallon" },
      { name: "Quart (US)", symbol: "qt", key: "quart_us", category: "Imperial", description: "1/4 US gallon" },
      { name: "Quart (UK)", symbol: "qt", key: "quart_uk", category: "Imperial", description: "1/4 UK gallon" },
      { name: "Pint (US)", symbol: "pt", key: "pint_us", category: "Imperial", description: "1/8 US gallon" },
      { name: "Pint (UK)", symbol: "pt", key: "pint_uk", category: "Imperial", description: "1/8 UK gallon" },
      { name: "Cup (US)", symbol: "cup", key: "cup_us", popular: true, category: "Cooking", description: "US cooking cup" },
      { name: "Cup (UK)", symbol: "cup", key: "cup_uk", category: "Cooking", description: "UK cooking cup" },
      { name: "Fluid Ounce (US)", symbol: "fl oz", key: "fluid_ounce_us", category: "Imperial", description: "US fluid ounce" },
      { name: "Fluid Ounce (UK)", symbol: "fl oz", key: "fluid_ounce_uk", category: "Imperial", description: "UK fluid ounce" },
      { name: "Tablespoon (US)", symbol: "tbsp", key: "tablespoon_us", category: "Cooking", description: "US tablespoon" },
      { name: "Tablespoon (UK)", symbol: "tbsp", key: "tablespoon_uk", category: "Cooking", description: "UK tablespoon" },
      { name: "Teaspoon (US)", symbol: "tsp", key: "teaspoon_us", category: "Cooking", description: "US teaspoon" },
      { name: "Teaspoon (UK)", symbol: "tsp", key: "teaspoon_uk", category: "Cooking", description: "UK teaspoon" },
      { name: "Barrel (Oil)", symbol: "bbl", key: "barrel_oil", category: "Oil", description: "42 US gallons" },
      { name: "Barrel (US)", symbol: "bbl", key: "barrel_us", category: "Imperial", description: "31.5 US gallons" },
    ],
    converter: convertVolume,
  },
  {
    name: "Area", icon: "📐", gradient: "from-indigo-600 to-indigo-400", accentColor: "indigo",
    description: "Surface area measurements", precision: 8,
    examples: ["Real estate", "Construction", "Agriculture"],
    units: [
      { name: "Square Meter", symbol: "m²", key: "square_meter", popular: true, category: "Metric", description: "SI unit of area" },
      { name: "Square Kilometer", symbol: "km²", key: "square_kilometer", category: "Metric", description: "1,000,000 m²" },
      { name: "Square Centimeter", symbol: "cm²", key: "square_centimeter", category: "Metric", description: "0.0001 m²" },
      { name: "Square Millimeter", symbol: "mm²", key: "square_millimeter", category: "Metric", description: "0.000001 m²" },
      { name: "Square Inch", symbol: "in²", key: "square_inch", category: "Imperial", description: "6.4516 cm²" },
      { name: "Square Foot", symbol: "ft²", key: "square_foot", popular: true, category: "Imperial", description: "144 in²" },
      { name: "Square Yard", symbol: "yd²", key: "square_yard", category: "Imperial", description: "9 ft²" },
      { name: "Square Mile", symbol: "mi²", key: "square_mile", category: "Imperial", description: "640 acres" },
      { name: "Acre", symbol: "acre", key: "acre", popular: true, category: "Land", description: "4047 m²" },
      { name: "Hectare", symbol: "ha", key: "hectare", popular: true, category: "Metric", description: "10,000 m²" },
      { name: "Are", symbol: "a", key: "are", category: "Metric", description: "100 m²" },
      { name: "Barn", symbol: "b", key: "barn", category: "Nuclear", description: "10^-28 m²" },
      { name: "Rood", symbol: "ro", key: "rood", category: "Land", description: "1/4 acre" },
      { name: "Square Perch", symbol: "per²", key: "square_perch", category: "Land", description: "25.29 m²" },
      { name: "Square Rod", symbol: "rd²", key: "square_rod", category: "Land", description: "25.29 m²" },
      { name: "Square Chain", symbol: "ch²", key: "square_chain", category: "Surveying", description: "404.69 m²" },
    ],
    converter: convertArea,
  },
  {
    name: "Speed", icon: "🚗", gradient: "from-orange-600 to-orange-400", accentColor: "orange",
    description: "Velocity measurements", precision: 8,
    examples: ["Vehicle speed", "Physics", "Sports"],
    units: [
      { name: "Meter per Second", symbol: "m/s", key: "meter_per_second", category: "Scientific", description: "SI unit of speed" },
      { name: "Km per Hour", symbol: "km/h", key: "kilometer_per_hour", popular: true, category: "Metric", description: "Common speed unit" },
      { name: "Mile per Hour", symbol: "mph", key: "mile_per_hour", popular: true, category: "Imperial", description: "US speed unit" },
      { name: "Foot per Second", symbol: "ft/s", key: "foot_per_second", category: "Imperial", description: "Engineering speed unit" },
      { name: "Knot", symbol: "kn", key: "knot", category: "Maritime", description: "1 nautical mile per hour" },
      { name: "Mach", symbol: "M", key: "mach", category: "Aerospace", description: "Speed of sound" },
      { name: "Speed of Light", symbol: "c", key: "speed_of_light", category: "Physics", description: "299,792,458 m/s" },
      { name: "Km per Second", symbol: "km/s", key: "kilometer_per_second", category: "Scientific", description: "1000 m/s" },
      { name: "Mile per Second", symbol: "mi/s", key: "mile_per_second", category: "Scientific", description: "1609.344 m/s" },
      { name: "Foot per Minute", symbol: "ft/min", key: "foot_per_minute", category: "Engineering", description: "0.00508 m/s" },
      { name: "Inch per Second", symbol: "in/s", key: "inch_per_second", category: "Engineering", description: "0.0254 m/s" },
      { name: "mm per Second", symbol: "mm/s", key: "millimeter_per_second", category: "Scientific", description: "0.001 m/s" },
    ],
    converter: convertSpeed,
  },
  {
    name: "Pressure", icon: "🔧", gradient: "from-gray-600 to-gray-400", accentColor: "gray",
    description: "Force per unit area", precision: 8,
    examples: ["Weather", "Engineering", "Automotive"],
    units: [
      { name: "Pascal", symbol: "Pa", key: "pascal", category: "Metric", description: "SI unit of pressure" },
      { name: "Kilopascal", symbol: "kPa", key: "kilopascal", popular: true, category: "Metric", description: "1000 pascals" },
      { name: "Megapascal", symbol: "MPa", key: "megapascal", category: "Metric", description: "1,000,000 pascals" },
      { name: "Gigapascal", symbol: "GPa", key: "gigapascal", category: "Metric", description: "1,000,000,000 pascals" },
      { name: "Bar", symbol: "bar", key: "bar", popular: true, category: "Metric", description: "100,000 pascals" },
      { name: "Millibar", symbol: "mbar", key: "millibar", category: "Meteorology", description: "100 pascals" },
      { name: "Atmosphere", symbol: "atm", key: "atmosphere", category: "Standard", description: "101,325 pascals" },
      { name: "Torr", symbol: "Torr", key: "torr", category: "Scientific", description: "1/760 atmosphere" },
      { name: "mmHg", symbol: "mmHg", key: "mmhg", category: "Medical", description: "Millimeters of mercury" },
      { name: "inHg", symbol: "inHg", key: "inhg", category: "Weather", description: "Inches of mercury" },
      { name: "PSI", symbol: "psi", key: "psi", popular: true, category: "Imperial", description: "Pounds per square inch" },
      { name: "KSI", symbol: "ksi", key: "ksi", category: "Engineering", description: "1000 PSI" },
      { name: "PSF", symbol: "psf", key: "psf", category: "Imperial", description: "Pounds per square foot" },
    ],
    converter: convertPressure,
  },
  {
    name: "Energy", icon: "⚡", gradient: "from-yellow-600 to-yellow-400", accentColor: "yellow",
    description: "Energy and work measurements", precision: 8,
    examples: ["Physics", "Electricity", "Food", "Engineering"],
    units: [
      { name: "Joule", symbol: "J", key: "joule", popular: true, category: "Metric", description: "SI unit of energy" },
      { name: "Kilojoule", symbol: "kJ", key: "kilojoule", popular: true, category: "Metric", description: "1000 joules" },
      { name: "Megajoule", symbol: "MJ", key: "megajoule", category: "Metric", description: "1,000,000 joules" },
      { name: "Gigajoule", symbol: "GJ", key: "gigajoule", category: "Metric", description: "1,000,000,000 joules" },
      { name: "Calorie", symbol: "cal", key: "calorie", category: "Food", description: "4.184 joules" },
      { name: "Kilocalorie", symbol: "kcal", key: "kilocalorie", popular: true, category: "Food", description: "1000 calories" },
      { name: "Watt Hour", symbol: "Wh", key: "watt_hour", category: "Electrical", description: "3600 joules" },
      { name: "Kilowatt Hour", symbol: "kWh", key: "kilowatt_hour", popular: true, category: "Electrical", description: "3,600,000 joules" },
      { name: "Megawatt Hour", symbol: "MWh", key: "megawatt_hour", category: "Electrical", description: "3,600,000,000 joules" },
      { name: "BTU", symbol: "BTU", key: "btu", category: "Imperial", description: "British thermal unit" },
      { name: "Therm", symbol: "thm", key: "therm", category: "Gas", description: "100,000 BTU" },
      { name: "Foot-Pound", symbol: "ft⋅lbf", key: "foot_pound", category: "Imperial", description: "Imperial energy unit" },
      { name: "Electron Volt", symbol: "eV", key: "electron_volt", category: "Physics", description: "Atomic scale energy" },
      { name: "Erg", symbol: "erg", key: "erg", category: "CGS", description: "10^-7 joules" },
      { name: "Quad", symbol: "quad", key: "quad", category: "Large", description: "10^15 BTU" },
    ],
    converter: convertEnergy,
  },
  {
    name: "Power", icon: "🔋", gradient: "from-teal-600 to-teal-400", accentColor: "teal",
    description: "Rate of energy transfer", precision: 8,
    examples: ["Electrical", "Mechanical", "Solar", "Motors"],
    units: [
      { name: "Watt", symbol: "W", key: "watt", popular: true, category: "Metric", description: "SI unit of power" },
      { name: "Kilowatt", symbol: "kW", key: "kilowatt", popular: true, category: "Metric", description: "1000 watts" },
      { name: "Megawatt", symbol: "MW", key: "megawatt", category: "Industrial", description: "1,000,000 watts" },
      { name: "Gigawatt", symbol: "GW", key: "gigawatt", category: "Industrial", description: "1,000,000,000 watts" },
      { name: "Horsepower", symbol: "hp", key: "horsepower", popular: true, category: "Mechanical", description: "745.7 watts" },
      { name: "Metric Horsepower", symbol: "PS", key: "metric_horsepower", category: "Automotive", description: "735.5 watts" },
      { name: "Boiler Horsepower", symbol: "bhp", key: "boiler_horsepower", category: "Steam", description: "9809.5 watts" },
      { name: "Electric Horsepower", symbol: "ehp", key: "electric_horsepower", category: "Electrical", description: "746 watts" },
      { name: "BTU per Hour", symbol: "BTU/h", key: "btu_per_hour", category: "HVAC", description: "Heating/cooling power" },
      { name: "BTU per Minute", symbol: "BTU/min", key: "btu_per_minute", category: "HVAC", description: "60 BTU/h" },
      { name: "BTU per Second", symbol: "BTU/s", key: "btu_per_second", category: "HVAC", description: "3600 BTU/h" },
      { name: "Calorie per Second", symbol: "cal/s", key: "calorie_per_second", category: "Thermal", description: "4.184 watts" },
      { name: "Foot-Pound per Second", symbol: "ft⋅lbf/s", key: "foot_pound_per_second", category: "Imperial", description: "1.356 watts" },
      { name: "Ton of Refrigeration", symbol: "TR", key: "ton_refrigeration", category: "HVAC", description: "3516.9 watts" },
    ],
    converter: convertPower,
  },
  {
    name: "Time", icon: "⏰", gradient: "from-rose-600 to-rose-400", accentColor: "rose",
    description: "Temporal measurements", precision: 8,
    examples: ["Scheduling", "Physics", "Computing", "History"],
    units: [
      { name: "Second", symbol: "s", key: "second", popular: true, category: "SI", description: "SI base unit of time" },
      { name: "Millisecond", symbol: "ms", key: "millisecond", category: "Precise", description: "1/1000 second" },
      { name: "Microsecond", symbol: "μs", key: "microsecond", category: "Precise", description: "1/1,000,000 second" },
      { name: "Nanosecond", symbol: "ns", key: "nanosecond", category: "Precise", description: "1/1,000,000,000 second" },
      { name: "Minute", symbol: "min", key: "minute", popular: true, category: "Common", description: "60 seconds" },
      { name: "Hour", symbol: "h", key: "hour", popular: true, category: "Common", description: "3600 seconds" },
      { name: "Day", symbol: "d", key: "day", popular: true, category: "Common", description: "86,400 seconds" },
      { name: "Week", symbol: "wk", key: "week", category: "Common", description: "604,800 seconds" },
      { name: "Month", symbol: "mo", key: "month", category: "Calendar", description: "~2,629,746 seconds" },
      { name: "Year", symbol: "yr", key: "year", category: "Calendar", description: "31,556,952 seconds" },
      { name: "Decade", symbol: "dec", key: "decade", category: "Historical", description: "10 years" },
      { name: "Century", symbol: "c", key: "century", category: "Historical", description: "100 years" },
      { name: "Millennium", symbol: "ka", key: "millennium", category: "Historical", description: "1000 years" },
      { name: "Fortnight", symbol: "fn", key: "fortnight", category: "Traditional", description: "14 days" },
      { name: "Jiffy", symbol: "jiffy", key: "jiffy", category: "Informal", description: "0.01 seconds" },
    ],
    converter: convertTime,
  },
  {
    name: "Data", icon: "💾", gradient: "from-violet-600 to-violet-400", accentColor: "violet",
    description: "Digital storage and data", precision: 8,
    examples: ["Computing", "Storage", "Internet", "Files"],
    units: [
      { name: "Bit", symbol: "bit", key: "bit", category: "Basic", description: "Basic unit of information" },
      { name: "Byte", symbol: "B", key: "byte", popular: true, category: "Basic", description: "8 bits" },
      { name: "Kilobit", symbol: "Kb", key: "kilobit", category: "Decimal", description: "1000 bits" },
      { name: "Kilobyte", symbol: "KB", key: "kilobyte", popular: true, category: "Decimal", description: "1000 bytes" },
      { name: "Megabit", symbol: "Mb", key: "megabit", category: "Decimal", description: "1,000,000 bits" },
      { name: "Megabyte", symbol: "MB", key: "megabyte", popular: true, category: "Decimal", description: "1,000,000 bytes" },
      { name: "Gigabit", symbol: "Gb", key: "gigabit", category: "Decimal", description: "1,000,000,000 bits" },
      { name: "Gigabyte", symbol: "GB", key: "gigabyte", popular: true, category: "Decimal", description: "1,000,000,000 bytes" },
      { name: "Terabit", symbol: "Tb", key: "terabit", category: "Decimal", description: "10^12 bits" },
      { name: "Terabyte", symbol: "TB", key: "terabyte", popular: true, category: "Decimal", description: "10^12 bytes" },
      { name: "Petabit", symbol: "Pb", key: "petabit", category: "Decimal", description: "10^15 bits" },
      { name: "Petabyte", symbol: "PB", key: "petabyte", category: "Decimal", description: "10^15 bytes" },
      { name: "Exabit", symbol: "Eb", key: "exabit", category: "Decimal", description: "10^18 bits" },
      { name: "Exabyte", symbol: "EB", key: "exabyte", category: "Decimal", description: "10^18 bytes" },
      { name: "Kibibit", symbol: "Kibit", key: "kibibit", category: "Binary", description: "1024 bits" },
      { name: "Kibibyte", symbol: "KiB", key: "kibibyte", category: "Binary", description: "1024 bytes" },
      { name: "Mebibit", symbol: "Mibit", key: "mebibit", category: "Binary", description: "1024 kibibits" },
      { name: "Mebibyte", symbol: "MiB", key: "mebibyte", category: "Binary", description: "1024 kibibytes" },
      { name: "Gibibit", symbol: "Gibit", key: "gibibit", category: "Binary", description: "1024 mebibits" },
      { name: "Gibibyte", symbol: "GiB", key: "gibibyte", category: "Binary", description: "1024 mebibytes" },
      { name: "Tebibit", symbol: "Tibit", key: "tebibit", category: "Binary", description: "1024 gibibits" },
      { name: "Tebibyte", symbol: "TiB", key: "tebibyte", category: "Binary", description: "1024 gibibytes" },
    ],
    converter: convertData,
  },
  {
    name: "Angle", icon: "📐", gradient: "from-cyan-600 to-cyan-400", accentColor: "cyan",
    description: "Angular measurements", precision: 8,
    examples: ["Navigation", "Engineering", "Astronomy", "Geometry"],
    units: [
      { name: "Degree", symbol: "°", key: "degree", popular: true, category: "Common", description: "1/360 of a circle" },
      { name: "Radian", symbol: "rad", key: "radian", popular: true, category: "Mathematical", description: "SI unit of angle" },
      { name: "Gradian", symbol: "grad", key: "gradian", category: "Surveying", description: "1/400 of a circle" },
      { name: "Turn", symbol: "tr", key: "turn", category: "Full", description: "Complete rotation" },
      { name: "Arcminute", symbol: "'", key: "arcminute", category: "Precise", description: "1/60 degree" },
      { name: "Arcsecond", symbol: '"', key: "arcsecond", category: "Precise", description: "1/3600 degree" },
      { name: "Milliradian", symbol: "mrad", key: "milliradian", category: "Military", description: "0.001 radian" },
      { name: "Minute of Arc", symbol: "arcmin", key: "minute_of_arc", category: "Astronomy", description: "1/60 degree" },
      { name: "Second of Arc", symbol: "arcsec", key: "second_of_arc", category: "Astronomy", description: "1/3600 degree" },
    ],
    converter: convertAngle,
  }
]

export default function Home() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  
  // Core converter state
  const [selectedCategory, setSelectedCategory] = React.useState<Category>(categories[0])
  const [fromUnit, setFromUnit] = React.useState<Unit>(selectedCategory.units[0])
  const [toUnit, setToUnit] = React.useState<Unit>(selectedCategory.units[1])
  const [inputValue, setInputValue] = React.useState("")
  const [outputValue, setOutputValue] = React.useState("")
  
  // UI state
  const [copied, setCopied] = React.useState(false)
  const [favorites, setFavorites] = React.useState<string[]>([])
  
  // Unit suggestions state
  const [unitConversions, setUnitConversions] = React.useState<UnitConversion[]>([])
  const [recentActions, setRecentActions] = React.useState<RecentAction[]>([])
  
  // Voice state
  const [voiceState, setVoiceState] = React.useState<VoiceState>({
    isListening: false, transcript: "", confidence: 0, isProcessing: false
  })
  const [recognition, setRecognition] = React.useState<any>(null)

  // Dark mode with proper implementation
  React.useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [isDarkMode])

  // Voice recognition setup
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, transcript: "", error: undefined }))
      }
      
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
            setVoiceState(prev => ({ ...prev, confidence: event.results[i][0].confidence }))
          } else {
            setVoiceState(prev => ({ ...prev, transcript: event.results[i][0].transcript }))
          }
        }
        if (finalTranscript) {
          processVoiceInput(finalTranscript)
          setVoiceState(prev => ({ ...prev, transcript: finalTranscript }))
        }
      }
      
      recognitionInstance.onerror = (event: any) => {
        setVoiceState(prev => ({ ...prev, isListening: false, error: `Error: ${event.error}` }))
      }
      
      recognitionInstance.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }))
      }
      
      setRecognition(recognitionInstance)
    }
  }, [])

  // Voice processing
  const processVoiceInput = React.useCallback((transcript: string) => {
    const patterns = [
      /convert\s+(\d+(?:\.\d+)?)\s+([\w\s]+)\s+to\s+([\w\s]+)/i,
      /(\d+(?:\.\d+)?)\s+([\w\s]+)\s+(?:in|to)\s+([\w\s]+)/i,
    ]
    
    for (const pattern of patterns) {
      const match = transcript.match(pattern)
      if (match) {
        const [, value, fromUnitName, toUnitName] = match
        setInputValue(value)
        
        const findUnit = (name: string) => {
          return selectedCategory.units.find(u => 
            u.name.toLowerCase().includes(name.toLowerCase()) || 
            u.symbol.toLowerCase() === name.toLowerCase()
          )
        }
        
        const foundFrom = findUnit(fromUnitName)
        const foundTo = findUnit(toUnitName)
        
        if (foundFrom && foundTo) {
          setFromUnit(foundFrom)
          setToUnit(foundTo)
        }
        break
      }
    }
  }, [selectedCategory])

  // Conversion logic
  React.useEffect(() => {
    if (inputValue && !isNaN(parseFloat(inputValue))) {
      const timer = setTimeout(() => {
        try {
          const numValue = parseFloat(inputValue)
          const result = selectedCategory.converter(numValue, fromUnit.key, toUnit.key)
          const formattedResult = formatNumber(result, selectedCategory.precision)
          setOutputValue(formattedResult)
          
          // Generate unit conversions
          const conversions: UnitConversion[] = selectedCategory.units
            .filter(unit => unit.key !== fromUnit.key)
            .map(unit => {
              const convertedValue = selectedCategory.converter(numValue, fromUnit.key, unit.key)
              return {
                unit,
                value: formatNumber(convertedValue, selectedCategory.precision),
                isMain: unit.key === toUnit.key
              }
            })
            .sort((a, b) => {
              if (a.isMain) return -1
              if (b.isMain) return 1
              if (a.unit.popular && !b.unit.popular) return -1
              if (!a.unit.popular && b.unit.popular) return 1
              return 0
            })
          
          setUnitConversions(conversions)
          
          // Add to recent actions
          if (result && formattedResult !== "0" && numValue > 0) {
            const newAction: RecentAction = {
              id: Date.now().toString(),
              fromValue: inputValue, fromUnit, toValue: formattedResult, toUnit,
              category: selectedCategory.name, timestamp: Date.now(),
            }
            setRecentActions(prev => [newAction, ...prev.slice(0, 11)])
          }
        } catch (error) {
          setOutputValue("Error")
          setUnitConversions([])
        }
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      setOutputValue("")
      setUnitConversions([])
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory])

  const handleCategoryChange = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    if (category) {
      setSelectedCategory(category)
      setFromUnit(category.units.find(u => u.popular) || category.units[0])
      setToUnit(category.units.find(u => u.popular && u !== fromUnit) || category.units[1])
      setInputValue("")
      setOutputValue("")
      setUnitConversions([])
    }
  }

  const startVoiceInput = () => {
    if (recognition && !voiceState.isListening) {
      recognition.start()
    }
  }

  const stopVoiceInput = () => {
    if (recognition && voiceState.isListening) {
      recognition.stop()
    }
  }

  const swapUnits = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
    setInputValue(outputValue || "")
  }

  const copyResult = async () => {
    if (outputValue && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(outputValue)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error("Copy failed:", error)
      }
    }
  }

  const selectUnitConversion = (conversion: UnitConversion) => {
    setToUnit(conversion.unit)
    setOutputValue(conversion.value)
  }

  const isFavorite = favorites.includes(`${selectedCategory.name}-${fromUnit.key}-${toUnit.key}`)

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Instant conversions with real-time calculations"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "100% Accurate",
      description: "Precise calculations with scientific precision"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Universal",
      description: "Supports all major unit systems worldwide"
    }
  ]

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen transition-all duration-700",
        isDarkMode 
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white" 
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-gray-900"
      )}>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          
          {/* Enhanced Header with Theme Toggle */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${selectedCategory.gradient} shadow-xl transform hover:scale-105 transition-all duration-300`}>
                <Calculator className="h-12 w-12 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  <h1 className={cn(
                    "text-6xl font-black bg-clip-text text-transparent leading-tight",
                    isDarkMode 
                      ? "bg-gradient-to-r from-white via-blue-200 to-purple-200" 
                      : "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600"
                  )}>
                    Unit Converter Pro
                  </h1>
                </div>
                <p className={cn(
                  "text-2xl mt-2",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  Professional Grade Unit Conversion Tool
                </p>
              </div>
              
              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                      "ml-4 h-12 w-12 rounded-full border-2 transition-all duration-300 hover:scale-110",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white" 
                        : "bg-white border-gray-300 hover:bg-gray-100 text-gray-900"
                    )}
                  >
                    {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {isDarkMode ? 'Light' : 'Dark'} Mode</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex items-center justify-center gap-8 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg",
                    isDarkMode && "shadow-emerald-500/25"
                  )}>
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <div className={cn(
                      "font-semibold text-lg",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>{feature.title}</div>
                    <div className={cn(
                      "text-sm",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {categories.map((category, index) => (
              <Tooltip key={category.name}>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedCategory.name === category.name ? "default" : "outline"}
                    className={cn(
                      "h-24 p-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105",
                      selectedCategory.name === category.name 
                        ? `bg-gradient-to-r ${category.gradient} text-white shadow-xl scale-105 border-0` 
                        : (isDarkMode
                            ? "bg-gray-800/80 border-gray-700 hover:bg-gray-700 text-gray-300 backdrop-blur-sm"
                            : "bg-white/80 border-gray-300 hover:bg-white text-gray-700 backdrop-blur-sm")
                    )}
                    onClick={() => handleCategoryChange(category.name)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.units.length} units
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center space-y-1">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs">{category.description}</p>
                    <p className="text-xs text-gray-500">{category.units.length} units available</p>
                    <div className="flex gap-1 justify-center mt-2">
                      {category.examples.slice(0, 2).map((example, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Main Converter */}
          <Card className={cn(
            "shadow-2xl border-0 backdrop-blur-xl",
            isDarkMode ? "bg-gray-900/90" : "bg-white/90"
          )}>
            <CardHeader className="text-center pb-6">
              <CardTitle className={cn(
                "text-3xl font-bold flex items-center justify-center gap-3",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                <span className="text-4xl">{selectedCategory.icon}</span>
                {selectedCategory.name} Converter
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-full transition-all duration-300",
                        isFavorite 
                          ? "text-yellow-500 hover:text-yellow-600" 
                          : (isDarkMode ? "text-gray-400 hover:text-yellow-500" : "text-gray-400 hover:text-yellow-500")
                      )}
                      onClick={() => {
                        const key = `${selectedCategory.name}-${fromUnit.key}-${toUnit.key}`
                        setFavorites(prev => 
                          prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
                        )
                      }}
                    >
                      {isFavorite ? <Heart className="h-5 w-5 fill-current" /> : <Star className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <p className={cn(
                "text-lg mt-2",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                {selectedCategory.description} • {selectedCategory.units.length} units available
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Conversion Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                
                {/* From Unit */}
                <div className="space-y-4">
                  <label className={cn(
                    "block text-sm font-semibold uppercase tracking-wider flex items-center gap-2",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                    From
                  </label>
                  
                  <Input
                    type="number"
                    placeholder="Enter value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={cn(
                      "text-3xl h-16 font-bold text-center border-2 shadow-lg transition-all duration-300",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" 
                        : "bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    )}
                  />
                  
                  <Select value={fromUnit.key} onValueChange={(value) => {
                    const unit = selectedCategory.units.find(u => u.key === value)
                    if (unit) setFromUnit(unit)
                  }}>
                    <SelectTrigger className={cn(
                      "h-14 border-2 text-lg font-semibold shadow-lg",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 text-white" 
                        : "bg-white border-gray-300"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      "max-h-80 backdrop-blur-xl",
                      isDarkMode 
                        ? "bg-gray-800/95 border-gray-700" 
                        : "bg-white/95 border-gray-200"
                    )}>
                      {selectedCategory.units.map((unit) => (
                        <SelectItem key={unit.key} value={unit.key} className="py-3">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div>
                              <span className="font-semibold">{unit.name}</span>
                              <span className={cn(
                                "ml-2 text-sm",
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                ({unit.symbol})
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {unit.popular && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                              {unit.category && (
                                <Badge variant="outline" className="text-xs">{unit.category}</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Swap & Voice Section */}
                <div className="flex flex-col items-center gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={swapUnits}
                        className={cn(
                          "h-16 w-16 rounded-full border-4 transition-all duration-500 hover:scale-110 hover:rotate-180 shadow-xl",
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white hover:shadow-blue-500/25" 
                            : "bg-white border-gray-300 hover:bg-gray-100 text-gray-900 hover:shadow-blue-500/25"
                        )}
                      >
                        <ArrowRightLeft className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Swap units (Ctrl+S)</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={voiceState.isListening ? "destructive" : "outline"}
                          size="icon"
                          onClick={voiceState.isListening ? stopVoiceInput : startVoiceInput}
                          disabled={!recognition}
                          className={cn(
                            "h-14 w-14 rounded-full transition-all duration-300 shadow-lg",
                            voiceState.isListening && "animate-pulse scale-110 shadow-red-500/50"
                          )}
                        >
                          {voiceState.isListening ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                              <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          ) : (
                            <Mic className="h-6 w-6" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center space-y-1">
                          <p className="font-semibold">Voice Input</p>
                          <p className="text-xs">Say: "Convert 100 meters to feet"</p>
                          <p className="text-xs text-gray-500">Supports natural language</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Voice Input Display - Below Mic */}
                    {(voiceState.isListening || voiceState.transcript || voiceState.error) && (
                      <div className="text-center max-w-xs mt-2">
                        {voiceState.isListening && (
                          <div className={cn(
                            "flex items-center gap-2 text-sm font-medium",
                            isDarkMode ? "text-red-400" : "text-red-600"
                          )}>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Listening...
                          </div>
                        )}
                        
                        {voiceState.transcript && (
                          <div className={cn(
                            "text-xs mt-2 p-3 rounded-lg border",
                            isDarkMode 
                              ? "bg-gray-800 border-gray-700 text-gray-300" 
                              : "bg-gray-100 border-gray-300 text-gray-700"
                          )}>
                            <div className="font-medium">"{voiceState.transcript}"</div>
                            {voiceState.confidence > 0 && (
                              <div className={cn(
                                "text-xs mt-1",
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                              )}>
                                Confidence: {Math.round(voiceState.confidence * 100)}%
                              </div>
                            )}
                          </div>
                        )}
                        
                        {voiceState.error && (
                          <div className={cn(
                            "text-xs mt-2 p-2 rounded border",
                            isDarkMode 
                              ? "text-red-400 bg-red-900/20 border-red-800" 
                              : "text-red-600 bg-red-50 border-red-200"
                          )}>
                            {voiceState.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* To Unit */}
                <div className="space-y-4">
                  <label className={cn(
                    "block text-sm font-semibold uppercase tracking-wider flex items-center gap-2",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                    To
                    {outputValue && (
                      <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 animate-pulse text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Calculated
                      </Badge>
                    )}
                  </label>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Result appears here"
                      value={outputValue}
                      readOnly
                      className={cn(
                        "text-3xl h-16 font-bold text-center pr-20 border-2 shadow-lg cursor-pointer transition-all duration-300",
                        isDarkMode 
                          ? "bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-700 text-emerald-300" 
                          : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-800"
                      )}
                    />
                    {outputValue && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2 h-12 px-4 shadow-md hover:shadow-lg transition-all duration-300 border font-semibold",
                              isDarkMode 
                                ? "bg-gray-800/90 border-gray-700 text-gray-200 hover:bg-gray-700/90" 
                                : "bg-white/90 border-white/50 hover:bg-white/95"
                            )}
                            onClick={copyResult}
                          >
                            {copied ? (
                              <>
                                <Check className={cn(
                                  "mr-2 h-4 w-4",
                                  isDarkMode ? "text-green-400" : "text-green-600"
                                )} />
                                <span className={cn(
                                  "font-semibold",
                                  isDarkMode ? "text-green-400" : "text-green-600"
                                )}>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                <span className="font-semibold">Copy</span>
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? "Copied to clipboard!" : "Copy result"}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  
                  <Select value={toUnit.key} onValueChange={(value) => {
                    const unit = selectedCategory.units.find(u => u.key === value)
                    if (unit) setToUnit(unit)
                  }}>
                    <SelectTrigger className={cn(
                      "h-14 border-2 text-lg font-semibold shadow-lg",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 text-white" 
                        : "bg-white border-gray-300"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      "max-h-80 backdrop-blur-xl",
                      isDarkMode 
                        ? "bg-gray-800/95 border-gray-700" 
                        : "bg-white/95 border-gray-200"
                    )}>
                      {selectedCategory.units.map((unit) => (
                        <SelectItem key={unit.key} value={unit.key} className="py-3">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div>
                              <span className="font-semibold">{unit.name}</span>
                              <span className={cn(
                                "ml-2 text-sm",
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                ({unit.symbol})
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {unit.popular && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                              {unit.category && (
                                <Badge variant="outline" className="text-xs">{unit.category}</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Result Display */}
              {inputValue && outputValue && outputValue !== "Error" && (
                <Card className={cn(
                  "relative overflow-hidden border-0 shadow-xl",
                  isDarkMode ? "bg-gray-800/80" : "bg-white/80"
                )}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${selectedCategory.gradient} opacity-10`}></div>
                  <CardContent className="relative pt-8">
                    <div className="text-center space-y-6">
                      <div className="text-5xl font-black tracking-tight">
                        <span className={cn(
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        )}>{inputValue}</span>
                        <span className={cn(
                          "mx-3 text-3xl",
                          isDarkMode ? "text-gray-500" : "text-gray-500"
                        )}>{fromUnit.symbol}</span>
                        <span className={cn(
                          "text-3xl animate-pulse",
                          isDarkMode ? "text-gray-600" : "text-gray-400"
                        )}>=</span>
                        <span className="mx-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          {outputValue}
                        </span>
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-3xl">
                          {toUnit.symbol}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-base">
                        <div className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl backdrop-blur-sm",
                          isDarkMode ? "bg-gray-800/50" : "bg-white/50"
                        )}>
                          <Target className="h-6 w-6 text-green-600" />
                          <span className={cn(
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          )}>Accuracy</span>
                          <span className="font-black text-xl text-green-600">100%</span>
                        </div>
                        <div className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl backdrop-blur-sm",
                          isDarkMode ? "bg-gray-800/50" : "bg-white/50"
                        )}>
                          <Zap className="h-6 w-6 text-blue-600" />
                          <span className={cn(
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          )}>Category</span>
                          <span className="font-black text-xl text-blue-600">{selectedCategory.name}</span>
                        </div>
                        <div className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl backdrop-blur-sm",
                          isDarkMode ? "bg-gray-800/50" : "bg-white/50"
                        )}>
                          <Clock className="h-6 w-6 text-purple-600" />
                          <span className={cn(
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          )}>Speed</span>
                          <span className="font-black text-xl text-purple-600">Instant</span>
                        </div>
                        <div className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl backdrop-blur-sm",
                          isDarkMode ? "bg-gray-800/50" : "bg-white/50"
                        )}>
                          <Globe className="h-6 w-6 text-orange-600" />
                          <span className={cn(
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          )}>Standard</span>
                          <span className="font-black text-xl text-orange-600">Universal</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* All Unit Conversions */}
          {unitConversions.length > 0 && (
            <Card className={cn(
              "mt-8 backdrop-blur-xl border-0 shadow-2xl overflow-hidden",
              isDarkMode ? "bg-gray-900/90" : "bg-white/90"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-4 text-2xl",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      All Unit Conversions
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-3 py-1">
                        {unitConversions.length} units
                      </Badge>
                    </div>
                    <p className={cn(
                      "text-base font-normal mt-1",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      {inputValue} {fromUnit.symbol} converted to all available {selectedCategory.name.toLowerCase()} units
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unitConversions.map((conversion, index) => (
                    <Tooltip key={conversion.unit.key}>
                      <TooltipTrigger asChild>
                        <Card 
                          className={cn(
                            "p-4 cursor-pointer transition-all duration-300 hover:scale-105 border-2 overflow-hidden relative",
                            conversion.isMain 
                              ? (isDarkMode
                                  ? "bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-600 shadow-emerald-500/20 ring-2 ring-emerald-500/30"
                                  : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-emerald-500/20 ring-2 ring-emerald-500/30")
                              : (isDarkMode
                                  ? "bg-gray-800/80 border-gray-700 hover:bg-gray-700/80 hover:border-gray-600"
                                  : "bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300")
                          )}
                          onClick={() => selectUnitConversion(conversion)}
                          style={{ animationDelay: `${index * 0.02}s` }}
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-2xl"></div>
                          <div className="relative z-10 text-center space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className={cn(
                                "font-bold text-base truncate flex-1",
                                conversion.isMain 
                                  ? (isDarkMode ? "text-emerald-300" : "text-emerald-700")
                                  : (isDarkMode ? "text-gray-200" : "text-gray-800")
                              )}>
                                {conversion.unit.name}
                              </h4>
                              {conversion.isMain && (
                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xs ml-2">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className={cn(
                                "text-2xl font-black",
                                conversion.isMain 
                                  ? (isDarkMode ? "text-emerald-300" : "text-emerald-700")
                                  : (isDarkMode ? "text-gray-200" : "text-gray-800")
                              )}>
                                {conversion.value}
                              </div>
                              <div className={cn(
                                "text-lg font-semibold",
                                conversion.isMain 
                                  ? (isDarkMode ? "text-emerald-400" : "text-emerald-600")
                                  : (isDarkMode ? "text-gray-400" : "text-gray-600")
                              )}>
                                {conversion.unit.symbol}
                              </div>
                            </div>
                            
                            {conversion.unit.description && (
                              <p className={cn(
                                "text-xs text-center line-clamp-2",
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                              )}>
                                {conversion.unit.description}
                              </p>
                            )}
                            
                            <div className="flex justify-center gap-1">
                              {conversion.unit.popular && !conversion.isMain && (
                                <Badge variant="outline" className="text-xs">Popular</Badge>
                              )}
                              {conversion.unit.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {conversion.unit.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center space-y-1">
                          <p className="font-semibold">{conversion.unit.name}</p>
                          <p className="text-xs">{conversion.unit.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click to select as target unit
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Actions */}
          {recentActions.length > 0 && (
            <Card className={cn(
              "mt-8 backdrop-blur-xl border-0 shadow-xl",
              isDarkMode ? "bg-gray-900/90" : "bg-white/90"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-xl flex items-center gap-3",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  <div className={cn(
                    "p-2 rounded-lg",
                    isDarkMode ? "bg-gradient-to-r from-gray-600 to-gray-700" : "bg-gradient-to-r from-gray-600 to-gray-700"
                  )}>
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Recent Conversions
                  <Badge variant="outline">
                    {recentActions.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentActions.slice(0, 12).map((action, index) => (
                    <Tooltip key={action.id}>
                      <TooltipTrigger asChild>
                        <Card 
                          className={cn(
                            "p-4 cursor-pointer transition-all duration-300 hover:scale-105 border",
                            isDarkMode 
                              ? "bg-gray-800/80 border-gray-700 hover:bg-gray-700/80 hover:border-blue-600"
                              : "bg-gray-50/80 border-gray-200 hover:bg-white hover:border-blue-300"
                          )}
                          onClick={() => {
                            const category = categories.find(c => c.name === action.category)
                            if (category) {
                              setSelectedCategory(category)
                              setFromUnit(action.fromUnit)
                              setToUnit(action.toUnit)
                              setInputValue(action.fromValue)
                            }
                          }}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {action.category}
                              </Badge>
                              <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                                100%
                              </Badge>
                            </div>
                            <div className={cn(
                              "font-bold text-lg transition-colors",
                              isDarkMode 
                                ? "text-gray-200 group-hover:text-blue-300" 
                                : "text-gray-800 group-hover:text-blue-700"
                            )}>
                              {action.fromValue} {action.fromUnit.symbol} = {action.toValue} {action.toUnit.symbol}
                            </div>
                            <div className={cn(
                              "text-sm",
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            )}>
                              {action.fromUnit.name} to {action.toUnit.name}
                            </div>
                            <div className={cn(
                              "text-xs flex items-center justify-between",
                              isDarkMode ? "text-gray-500" : "text-gray-500"
                            )}>
                              <span>{new Date(action.timestamp).toLocaleString()}</span>
                              <ArrowRightLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center space-y-1">
                          <p className="font-semibold">Click to reload this conversion</p>
                          <p className="text-xs">{action.fromUnit.name} to {action.toUnit.name}</p>
                          <p className="text-xs text-gray-500">From {action.category}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
