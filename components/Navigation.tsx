// components/navigation.tsx
"use client"

import * as React from "react"
import { Calculator, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">QuickConvert</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Button
            variant="ghost"
            onClick={() => scrollToSection('features')}
          >
            Features
          </Button>
          <Button
            variant="ghost"
            onClick={() => scrollToSection('categories')}
          >
            Categories
          </Button>
          <ThemeToggle />
          <Button>Go Pro</Button>
        </nav>

        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container py-4 space-y-4">
            <Button
              variant="ghost"
              onClick={() => scrollToSection('features')}
              className="w-full justify-start"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              onClick={() => scrollToSection('categories')}
              className="w-full justify-start"
            >
              Categories
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
