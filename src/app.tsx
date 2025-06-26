import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, ArrowRight, Zap, Brain, Cog, FileText, BarChart3, MessageSquare, Bot, Lightbulb, Rocket, Target, TrendingUp, Users, Mail, Calendar, Code, Database, PenTool, Globe } from 'lucide-react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'

interface AIApplication {
  id: string
  title: string
  description: string
  category: string
  icon: React.ReactNode
  prompt?: string
  examples?: string[]
}

interface AICategory {
  name: string
  icon: React.ReactNode
  color: string
  applications: AIApplication[]
}

const searchSuggestions = [
  "Jestem marketingowcem w firmie e-commerce i tworzę kampanie reklamowe",
  "Pracuję jako HR manager i rekrutuję nowych pracowników", 
  "Jestem analitykiem danych i analizuję trendy sprzedażowe",
  "Prowadzę własny biznes online i zarządzam social media",
  "Jestem copywriterem i piszę treści marketingowe",
  "Pracuję w IT jako project manager i koordynuję zespoły",
  "Jestem księgowym i przygotowuję raporty finansowe",
  "Prowadzę sklep internetowy i obsługuję klientów",
  "Jestem consultantem biznesowym i doradzam firmom",
  "Pracuję jako content creator i tworzę materiały wideo"
]

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<AICategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [visibleCounts, setVisibleCounts] = useState<{ [category: string]: number }>({})

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Rotate suggestions
  useEffect(() => {
    if (showSuggestions) {
      const interval = setInterval(() => {
        setCurrentSuggestion(prev => (prev + 1) % searchSuggestions.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [showSuggestions])

  const categoryIcons = {
    'Automatyzacja Procesów': <Cog className="w-5 h-5" />,
    'Analiza i Raporty': <BarChart3 className="w-5 h-5" />,
    'Tworzenie Treści': <FileText className="w-5 h-5" />,
    'Research i Analiza': <Brain className="w-5 h-5" />,
    'Komunikacja': <MessageSquare className="w-5 h-5" />,
    'Asystent Biznesowy': <Bot className="w-5 h-5" />,
    'Marketing i Sprzedaż': <Target className="w-5 h-5" />,
    'Zarządzanie Projektami': <Calendar className="w-5 h-5" />,
    'Rozwój Osobisty': <Lightbulb className="w-5 h-5" />,
    'Technologia': <Code className="w-5 h-5" />
  }

  const generateAIRecommendations = async (jobDescription: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: `Jesteś ekspertem od rozwiązań AI dla biznesu. Na podstawie opisu pracy użytkownika, wygeneruj szczegółową listę konkretnych zastosowań AI assistentów.\n\nZwróć odpowiedź w formacie JSON z następującą strukturą:\n{\n  "categories": [\n    {\n      "name": "Nazwa kategorii",\n      "applications": [\n        {\n          "title": "Konkretny tytuł zastosowania (max 4 słowa)",\n          "description": "Szczegółowy opis 2-3 zdania jak AI może pomóc w tym konkretnym zadaniu",\n          "prompt": "Bardzo dokładny prompt gotowy do użycia (min 100 znaków)",\n          "examples": ["Przykład 1 konkretnego zastosowania", "Przykład 2", "Przykład 3"]\n        }\n      ]\n    }\n  ]\n}\n\nKATEGORIE (wybierz 4-6 najbardziej pasujących):\n- Automatyzacja Procesów - automatyzacja powtarzalnych zadań\n- Analiza i Raporty - analizowanie danych, tworzenie raportów  \n- Tworzenie Treści - pisanie, editing, content marketing\n- Research i Analiza - badanie rynku, konkurencji, trendów\n- Komunikacja - emaile, prezentacje, komunikacja z klientami\n- Asystent Biznesowy - organizacja, planowanie, zarządzanie czasem\n- Marketing i Sprzedaż - kampanie, lead generation, sprzedaż\n- Zarządzanie Projektami - koordynacja, monitoring, planning\n- Rozwój Osobisty - coaching, mentoring, rozwój umiejętności\n- Technologia - programowanie, automatyzacja techniczna\n\nWYMAGANIA:\n- Dla każdej kategorii podaj minimum 6 zastosowań (jeśli możesz, wygeneruj więcej, nie ma limitu)\n- Każdy prompt musi być gotowy do skopiowania i użycia\n- Przykłady muszą być bardzo konkretne i praktyczne\n- Dostosuj wszystko do branży i roli użytkownika\n- Używaj tylko języka polskiego\n- Jeśli użytkownik poprosi o więcej przykładów, możesz generować kolejne zastosowania dla danej kategorii na żądanie.`
          }, {
            role: 'user',
            content: `Opis mojej pracy: ${jobDescription}`
          }],
          max_tokens: 4000,
          temperature: 0.7
        })
      })
      if (!response.ok) {
        throw new Error('API request failed')
      }
      const data = await response.json()
      const aiResponse = JSON.parse(data.choices[0].message.content)
      const transformedResults: AICategory[] = aiResponse.categories.map((category: any) => ({
        name: category.name,
        icon: categoryIcons[category.name as keyof typeof categoryIcons] || <Zap className="w-5 h-5" />,
        color: getCategoryColor(category.name),
        applications: category.applications.map((app: any, index: number) => ({
          id: `${category.name}-${index}`,
          title: app.title,
          description: app.description,
          category: category.name,
          icon: <Sparkles className="w-4 h-4" />,
          prompt: app.prompt,
          examples: app.examples || []
        }))
      }))
      setResults(transformedResults)
      const initialCounts: { [category: string]: number } = {}
      transformedResults.forEach(cat => { initialCounts[cat.name] = 6 })
      setVisibleCounts(initialCounts)
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      setResults(getMockResults(jobDescription))
    }
    setIsLoading(false)
    setHasSearched(true)
  }

  // ...reszta kodu bez zmian...
} 