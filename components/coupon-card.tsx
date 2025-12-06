"use client"

import { Ticket, Copy, Check } from "lucide-react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Coupon } from "@/lib/data"
import { t } from "@/lib/i18n"

interface CouponCardProps {
  coupon: Coupon
}

export function CouponCard({ coupon }: CouponCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow border-dashed border-2 border-primary/20">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg p-2 h-12 w-16 shrink-0">
          <span className="font-bold text-lg leading-none">{coupon.discount}</span>
          <span className="text-[10px] uppercase font-bold">OFF</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{coupon.venueName}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{coupon.description}</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <Ticket className="h-3 w-3" />
            <span>{new Date(coupon.validUntil).toLocaleDateString()}</span>
          </div>
        </div>

        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCopy} title="Copiar código">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </CardContent>
    </Card>
  )
}
