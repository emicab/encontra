"use client"

import Link from "next/link"
import { Star, Clock, MapPin, MessageCircle, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Venue } from "@/lib/data"
import { getVenueFeatures, checkIsOpen } from "@/lib/business-logic"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"

interface VenueCardProps {
  venue: Venue
}

export function VenueCard({ venue }: VenueCardProps) {
  const features = getVenueFeatures(venue)
  const isPremium = venue.subscriptionPlan === "premium"
  const isOpen = checkIsOpen(venue)

  return (
    <Card className={cn(
      "overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1 h-full",
      isPremium && "border-2 border-yellow-400 shadow-md"
    )}>
      <Link href={`/${venue.slug}`} className="block h-full">
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={venue.logo || venue.image || "/placeholder.svg"}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {venue.isNew && <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0">{t.new}</Badge>}
            {isPremium && (
              <Badge className="bg-yellow-400 text-yellow-950 text-xs gap-1 px-1.5 py-0">
                <Crown className="h-3 w-3" />
                Destacado
              </Badge>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge
              variant={isOpen ? "default" : "secondary"}
              className={cn(
                "px-1.5 py-0 text-xs",
                isOpen ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {isOpen ? t.open : t.closed}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span>{venue.rating}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-xs line-clamp-1 mb-2">{venue.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{venue.locationMode === 'zone' ? venue.zone : venue.address}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                {venue.openTime} - {venue.closeTime}
              </span>
            </div>
          </div>

          {/* WhatsApp Button for Basic/Premium Plans */}
          {features.whatsapp && venue.whatsapp && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 h-8 text-xs gap-2 text-green-600 border-green-600 hover:bg-green-50"
              onClick={(e) => {
                e.preventDefault() // Prevent card click
                window.open(`https://wa.me/${venue.whatsapp}`, "_blank")
              }}
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </Button>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}