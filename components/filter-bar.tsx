"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"

interface FilterBarProps {
  showOpenOnly: boolean
  onToggleOpenOnly: () => void
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  categories: string[]
}

export function FilterBar({ showOpenOnly, onToggleOpenOnly, selectedCategory, onSelectCategory, categories }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <Button variant={showOpenOnly ? "default" : "outline"} size="sm" onClick={onToggleOpenOnly} className="gap-1">
        <Filter className="h-3 w-3" />
        {t.openNow}
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory(null)}
      >
        {t.showAll}
      </Button>

      {categories.map((cat) => (
        <Button
          key={cat}
          variant={selectedCategory === cat ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(cat)}
        >
          {t[cat as keyof typeof t] || cat.charAt(0).toUpperCase() + cat.slice(1)}
        </Button>
      ))}
    </div>
  )
}
