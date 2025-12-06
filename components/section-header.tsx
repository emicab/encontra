"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {actionLabel && onAction && (
        <Button variant="ghost" size="sm" onClick={onAction} className="gap-1 text-primary">
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
