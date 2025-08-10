// components/unit-converter.tsx
"use client"

import * as React from "react"
import { 
  ArrowRightLeft, Copy, Check, Star, Mic, MicOff, Clock, 
  TrendingUp, Zap, Calculator, ChevronDown, Target, 
  Globe, Settings, Heart, Crown, X, Volume2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
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
  accuracy: number
}

interface VoiceState {
  isListening: boolean
  transcript: string
  confidence: number
  isProcessing: boolean
  error?: string
}

// Enhanced conversion functions
const convertLength = (value: number, from: string, to: string): number => {
  const meters: { [key: string]: number } = {
    meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001,
    inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344,
    nautical_mile: 1852, light_year: 9.461e15, micrometer: 0.000001, nanometer: 0.000000001,
  }
  const inMeters = value * (meters[from] || 1)
  return inMeters / (meters[to] || 1)
}

const convertWeight = (value: number, from: string, to: string): number => {
  const kilograms: { [key: string]: number } = {
    kilogram: 1, gram: 0.001, pound: 0.453592, ounce: 0.0283495,
    ton: 1000, stone: 6.35029, carat: 0.0002, troy_ounce: 0.0311035,
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
  
  switch (to) {
    case 'fahrenheit': return (celsius * 9 / 5) + 32
    case 'kelvin': return celsius + 273.15
    case 'rankine': return (celsius * 9 / 5) + 491.67
    default: return celsius
  }
}

const convertVolume = (value: number, from: string, to: string): number => {
  const liters: { [key: string]: number } = {
    liter: 1, milliliter: 0.001, gallon_us: 3.78541, gallon_uk: 4.54609,
    cup_us: 0.236588, fluid_ounce_us: 0.0295735, pint_us: 0.473176, quart_us: 0.946353,
    cubic_meter: 1000, cubic_foot: 28.3168,
  }
  const inLiters = value * (liters[from] || 1)
  return inLiters / (liters[to] || 1)
}

const convertArea = (value: number, from: string, to: string): number => {
  const squareMeters: { [key: string]: number } = {
    square_meter: 1, square_kilometer: 1000000, square_centimeter: 0.0001,
    square_foot: 0.092903, square_inch: 0.00064516, acre: 4046.86, hectare: 10000,
  }
  const inSquareMeters = value * (squareMeters[from] || 1)
  return inSquareMeters / (squareMeters[to] || 1)
}

const convertSpeed = (value: number, from: string, to: string): number => {
  const metersPerSecond: { [key: string]: number } = {
    meter_per_second: 1, kilometer_per_hour: 0.277778, mile_per_hour: 0.44704,
    foot_per_second: 0.3048, knot: 0.514444, mach: 343,
  }
  const inMetersPerSecond = value * (metersPerSecond[from] || 1)
  return inMetersPerSecond / (metersPerSecond[to] || 1)
}

// Clean category definitions
const categories: Category[] = [
  {
    name: "Length", icon: "📏", gradient: "from-blue-600 to-blue-400", accentColor: "blue",
    description: "Distance and dimensional measurements", precision: 8,
    examples: ["Architecture", "Engineering", "Construction"],
    units: [
      { name: "Meter", symbol: "m", key: "meter", popular: true, category: "Metric" },
      { name: "Kilometer", symbol: "km", key: "kilometer", popular: true, category: "Metric" },
      { name: "Centimeter", symbol: "cm", key: "centimeter", popular: true, category: "Metric" },
      { name: "Millimeter", symbol: "mm", key: "millimeter", category: "Metric" },
      { name: "Inch", symbol: "in", key: "inch", popular: true, category: "Imperial" },
      { name: "Foot", symbol: "ft", key: "foot", popular: true, category: "Imperial" },
      { name: "Yard", symbol: "yd", key: "yard", category: "Imperial" },
      { name: "Mile", symbol: "mi", key: "mile", popular: true, category: "Imperial" },
    ],
    converter: convertLength,
  },
  {
    name: "Weight", icon: "⚖️", gradient: "from-green-600 to-green-400", accentColor: "green",
    description: "Mass and weight measurements", precision: 6,
    examples: ["Health", "Shipping", "Cooking"],
    units: [
      { name: "Kilogram", symbol: "kg", key: "kilogram", popular: true, category: "Metric" },
      { name: "Gram", symbol: "g", key: "gram", popular: true, category: "Metric" },
      { name: "Pound", symbol: "lb", key: "pound", popular: true, category: "Imperial" },
      { name: "Ounce", symbol: "oz", key: "ounce", popular: true, category: "Imperial" },
      { name: "Metric Ton", symbol: "t", key: "ton", category: "Metric" },
      { name: "Stone", symbol: "st", key: "stone", category: "Imperial" },
    ],
    converter: convertWeight,
  },
  {
    name: "Temperature", icon: "🌡️", gradient: "from-red-600 to-red-400", accentColor: "red",
    description: "Thermal measurements", precision: 4,
    examples: ["Weather", "Cooking", "Science"],
    units: [
      { name: "Celsius", symbol: "°C", key: "celsius", popular: true, category: "Metric" },
      { name: "Fahrenheit", symbol: "°F", key: "fahrenheit", popular: true, category: "Imperial" },
      { name: "Kelvin", symbol: "K", key: "kelvin", category: "Scientific" },
      { name: "Rankine", symbol: "°R", key: "rankine", category: "Scientific" },
    ],
    converter: convertTemperature,
  },
  {
    name: "Volume", icon: "🥛", gradient: "from-purple-600 to-purple-400", accentColor: "purple",
    description: "Liquid and solid volume", precision: 6,
    examples: ["Cooking", "Chemistry", "Medicine"],
    units: [
      { name: "Liter", symbol: "L", key: "liter", popular: true, category: "Metric" },
      { name: "Milliliter", symbol: "ml", key: "milliliter", popular: true, category: "Metric" },
      { name: "Gallon (US)", symbol: "gal", key: "gallon_us", popular: true, category: "Imperial" },
      { name: "Cup (US)", symbol: "cup", key: "cup_us", popular: true, category: "Cooking" },
      { name: "Fluid Ounce", symbol: "fl oz", key: "fluid_ounce_us", category: "Imperial" },
      { name: "Cubic Meter", symbol: "m³", key: "cubic_meter", category: "Metric" },
    ],
    converter: convertVolume,
  },
  {
    name: "Area", icon: "📐", gradient: "from-indigo-600 to-indigo-400", accentColor: "indigo",
    description: "Surface area measurements", precision: 6,
    examples: ["Real estate", "Construction", "Design"],
    units: [
      { name: "Square Meter", symbol: "m²", key: "square_meter", popular: true, category: "Metric" },
      { name: "Square Foot", symbol: "ft²", key: "square_foot", popular: true, category: "Imperial" },
      { name: "Square Centimeter", symbol: "cm²", key: "square_centimeter", category: "Metric" },
      { name: "Acre", symbol: "acre", key: "acre", popular: true, category: "Land" },
      { name: "Hectare", symbol: "ha", key: "hectare", category: "Metric" },
    ],
    converter: convertArea,
  },
  {
    name: "Speed", icon: "🚗", gradient: "from-orange-600 to-orange-400", accentColor: "orange",
    description: "Velocity measurements", precision: 4,
    examples: ["Vehicle speed", "Physics", "Sports"],
    units: [
      { name: "Km per Hour", symbol: "km/h", key: "kilometer_per_hour", popular: true, category: "Metric" },
      { name: "Mile per Hour", symbol: "mph", key: "mile_per_hour", popular: true, category: "Imperial" },
      { name: "Meter per Second", symbol: "m/s", key: "meter_per_second", category: "Scientific" },
      { name: "Foot per Second", symbol: "ft/s", key: "foot_per_second", category: "Imperial" },
      { name: "Knot", symbol: "kn", key: "knot", category: "Maritime" },
    ],
    converter: convertSpeed,
  }
]

export default function UnitConverter() {
  // Core state
  const [selectedCategory, setSelectedCategory] = React.useState<Category>(categories[0])
  const [fromUnit, setFromUnit] = React.useState<Unit>(selectedCategory.units[0])
  const [toUnit, setToUnit] = React.useState<Unit>(selectedCategory.units[1])
  const [inputValue, setInputValue] = React.useState("")
  const [outputValue, setOutputValue] = React.useState("")
  
  // UI state
  const [copied, setCopied] = React.useState(false)
  const [favorites, setFavorites] = React.useState<string[]>([])
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [showVoiceDialog, setShowVoiceDialog] = React.useState(false)
  
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
              category: selectedCategory.name, timestamp: Date.now(), accuracy: 99.9,
            }
            setRecentActions(prev => [newAction, ...prev.slice(0, 9)])
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
      setShowVoiceDialog(true)
      recognition.start()
    }
  }

  const stopVoiceInput = () => {
    if (recognition && voiceState.isListening) {
      recognition.stop()
      setShowVoiceDialog(false)
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

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen transition-all duration-300",
        isDarkMode 
          ? "bg-gray-950 text-white" 
          : "bg-gray-50 text-gray-900"
      )}>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          
          {/* Clean Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${selectedCategory.gradient} shadow-lg`}>
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Unit Converter Pro</h1>
                <p className={cn(
                  "text-lg mt-1",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Professional unit conversion tool
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={cn(
                      "ml-4",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700" 
                        : "bg-white border-gray-300 hover:bg-gray-100"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className={cn(
                    "w-48",
                    isDarkMode 
                      ? "bg-gray-800 border-gray-700" 
                      : "bg-white border-gray-200"
                  )}
                >
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <Switch 
                      checked={isDarkMode} 
                      onCheckedChange={setIsDarkMode}
                      className="ml-2"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory.name === category.name ? "default" : "outline"}
                className={cn(
                  "h-20 p-4 flex flex-col items-center gap-2 transition-all duration-200",
                  selectedCategory.name === category.name 
                    ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg scale-105 border-0` 
                    : (isDarkMode
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                        : "bg-white border-gray-300 hover:bg-gray-100 text-gray-700")
                )}
                onClick={() => handleCategoryChange(category.name)}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-xs font-medium">{category.name}</span>
              </Button>
            ))}
          </div>

          {/* Main Converter */}
          <Card className={cn(
            "shadow-xl border-0",
            isDarkMode ? "bg-gray-900" : "bg-white"
          )}>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl flex items-center justify-center gap-3">
                <span className="text-3xl">{selectedCategory.icon}</span>
                {selectedCategory.name} Converter
              </CardTitle>
              <p className={cn(
                "text-sm mt-2",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                {selectedCategory.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Conversion Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                
                {/* From Unit */}
                <div className="space-y-4">
                  <label className={cn(
                    "block text-sm font-semibold uppercase tracking-wider",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    From
                  </label>
                  
                  <Input
                    type="number"
                    placeholder="Enter value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={cn(
                      "text-2xl h-14 font-semibold text-center",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500" 
                        : "bg-gray-50 border-gray-300 focus:border-blue-500"
                    )}
                  />
                  
                  <Select value={fromUnit.key} onValueChange={(value) => {
                    const unit = selectedCategory.units.find(u => u.key === value)
                    if (unit) setFromUnit(unit)
                  }}>
                    <SelectTrigger className={cn(
                      "h-12",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 text-white" 
                        : "bg-white border-gray-300"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      className={cn(
                        "max-h-60",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-700" 
                          : "bg-white border-gray-200"
                      )}
                    >
                      {selectedCategory.units.map((unit) => (
                        <SelectItem key={unit.key} value={unit.key} className="py-3">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div>
                              <span className="font-medium">{unit.name}</span>
                              <span className={cn(
                                "ml-2 text-sm",
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                ({unit.symbol})
                              </span>
                            </div>
                            {unit.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Swap Section */}
                <div className="flex flex-col items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapUnits}
                    className={cn(
                      "h-12 w-12 rounded-full border-2 transition-transform hover:scale-110",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700" 
                        : "bg-white border-gray-300 hover:bg-gray-100"
                    )}
                  >
                    <ArrowRightLeft className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant={voiceState.isListening ? "destructive" : "outline"}
                    size="icon"
                    onClick={voiceState.isListening ? stopVoiceInput : startVoiceInput}
                    disabled={!recognition}
                    className={cn(
                      "h-12 w-12 rounded-full",
                      voiceState.isListening && "animate-pulse"
                    )}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>

                {/* To Unit */}
                <div className="space-y-4">
                  <label className={cn(
                    "block text-sm font-semibold uppercase tracking-wider",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    To
                  </label>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Result"
                      value={outputValue}
                      readOnly
                      className={cn(
                        "text-2xl h-14 font-semibold text-center pr-16",
                        isDarkMode 
                          ? "bg-green-900/20 border-green-700 text-green-300" 
                          : "bg-green-50 border-green-300 text-green-800"
                      )}
                    />
                    {outputValue && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={copyResult}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  
                  <Select value={toUnit.key} onValueChange={(value) => {
                    const unit = selectedCategory.units.find(u => u.key === value)
                    if (unit) setToUnit(unit)
                  }}>
                    <SelectTrigger className={cn(
                      "h-12",
                      isDarkMode 
                        ? "bg-gray-800 border-gray-700 text-white" 
                        : "bg-white border-gray-300"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      className={cn(
                        "max-h-60",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-700" 
                          : "bg-white border-gray-200"
                      )}
                    >
                      {selectedCategory.units.map((unit) => (
                        <SelectItem key={unit.key} value={unit.key} className="py-3">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div>
                              <span className="font-medium">{unit.name}</span>
                              <span className={cn(
                                "ml-2 text-sm",
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                ({unit.symbol})
                              </span>
                            </div>
                            {unit.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Result Display */}
              {inputValue && outputValue && outputValue !== "Error" && (
                <Card className={cn(
                  "p-6 text-center border-0",
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                )}>
                  <div className="text-3xl font-bold space-x-4">
                    <span>{inputValue} {fromUnit.symbol}</span>
                    <span className={cn(isDarkMode ? "text-gray-500" : "text-gray-400")}>=</span>
                    <span className="text-green-600">{outputValue} {toUnit.symbol}</span>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Unit Conversions */}
          {unitConversions.length > 0 && (
            <Card className={cn(
              "mt-8 border-0",
              isDarkMode ? "bg-gray-900" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className="text-xl">All Conversions</CardTitle>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  {inputValue} {fromUnit.symbol} converted to all units
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unitConversions.map((conversion) => (
                    <Card 
                      key={conversion.unit.key}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:scale-105",
                        conversion.isMain 
                          ? (isDarkMode ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-300")
                          : (isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-gray-50 border-gray-200 hover:bg-white")
                      )}
                      onClick={() => selectUnitConversion(conversion)}
                    >
                      <div className="text-center space-y-2">
                        <h4 className="font-semibold">{conversion.unit.name}</h4>
                        <div className="text-2xl font-bold">{conversion.value}</div>
                        <div className={cn(
                          "text-sm",
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          {conversion.unit.symbol}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Actions */}
          {recentActions.length > 0 && (
            <Card className={cn(
              "mt-8 border-0",
              isDarkMode ? "bg-gray-900" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Conversions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentActions.slice(0, 6).map((action) => (
                    <Card 
                      key={action.id}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:scale-105",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-700 hover:bg-gray-700" 
                          : "bg-gray-50 border-gray-200 hover:bg-white"
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
                    >
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">{action.category}</Badge>
                        <div className="font-semibold">
                          {action.fromValue} {action.fromUnit.symbol} → {action.toValue} {action.toUnit.symbol}
                        </div>
                        <div className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {new Date(action.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Voice Input Modal */}
        <Dialog open={showVoiceDialog} onOpenChange={setShowVoiceDialog}>
          <DialogContent className={cn(
            "sm:max-w-md",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
          )}>
            <DialogHeader>
              <DialogTitle>Voice Input</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                {voiceState.isListening ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-8 bg-red-500 rounded animate-pulse"></div>
                    <div className="w-3 h-12 bg-red-600 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  <Mic className="h-16 w-16 mx-auto text-gray-400" />
                )}
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-medium">
                  {voiceState.isListening ? "Listening..." : "Click to start"}
                </p>
                <p className="text-sm text-gray-500">
                  Say: "Convert 100 meters to feet"
                </p>
              </div>

              {voiceState.transcript && (
                <div className={cn(
                  "p-3 rounded border text-center",
                  isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                )}>
                  <p className="font-medium">"{voiceState.transcript}"</p>
                  {voiceState.confidence > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(voiceState.confidence * 100)}%
                    </p>
                  )}
                </div>
              )}

              {voiceState.error && (
                <div className="p-3 rounded border border-red-300 bg-red-50 text-red-700 text-center">
                  {voiceState.error}
                </div>
              )}

              <div className="flex justify-center gap-4">
                <Button 
                  onClick={voiceState.isListening ? stopVoiceInput : startVoiceInput}
                  variant={voiceState.isListening ? "destructive" : "default"}
                >
                  {voiceState.isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {voiceState.isListening ? "Stop" : "Start"}
                </Button>
                <Button variant="outline" onClick={() => setShowVoiceDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
