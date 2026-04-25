"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Language } from "@/lib/translations"

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

const languages = [
  { code: 'tr' as Language, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
]

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const currentLang = languages.find(lang => lang.code === currentLanguage)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Languages className="h-4 w-4" />
        <span className="text-sm">{currentLang?.flag}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-popover p-1 shadow-md z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLanguageChange(language.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground ${
                currentLanguage === language.code ? 'bg-accent text-accent-foreground' : ''
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}