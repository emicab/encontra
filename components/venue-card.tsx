"use client"

import Link from "next/link"
import { Star, Clock, MapPin, MessageCircle, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Venue } from "@/lib/data"
import { getVenueFeatures, checkIsOpen } from "@/lib/business-logic"
import { cn, slugify } from "@/lib/utils"
import { t } from "@/lib/i18n"
import { useRegion } from "@/components/providers/region-provider"

interface VenueCardProps {
  venue: Venue
}

export function VenueCard({ venue }: VenueCardProps) {
  const regionCode = useRegion()
  const features = getVenueFeatures(venue)
  const isPremium = venue.subscriptionPlan === "premium"
  const isOpen = checkIsOpen(venue)

  // Use current region context if available, otherwise use venue's region
  const regionLink = regionCode || venue.regionCode || 'tdf' // Default fallback if data is bad

  // Clean zone/city slug
  const citySlug = slugify(venue.zone || 'general')

  // Helper to get localized string
  const getName = (name: any) => {
    if (typeof name === 'object' && name !== null) {
      return name.es || name.en || ""
    }
    return name
  }

  const getDescription = (desc: any) => {
    if (typeof desc === 'object' && desc !== null) {
      return desc.es || desc.en || ""
    }
    return desc
  }

  const venueName = getName(venue.name)
  const venueDescription = getDescription(venue.description)

  return (
    <Card className={cn(
      "overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1 h-full",
      isPremium && "border-2 border-yellow-400 shadow-md"
    )}>
      <Link href={`/${regionLink}/${citySlug}/${venue.slug}`} className="block h-full">
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
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-none tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
              {venueName}
            </h3>
            {venue.rating > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                <Star className="h-3 w-3 fill-primary" />
                <span>{venue.rating}</span>
              </div>
            )}
          </div>
          {/* Add zone/city display */}
          {(venue.zone || venue.city) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">
                {[venue.zone, venue.city].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          <p className="line-clamp-2 text-sm text-muted-foreground mt-1">
            {venueDescription}
          </p>
        </div>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                {(() => {
                  if (venue.schedule) {
                    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
                    const now = new Date()
                    const dayName = days[now.getDay()]
                    const daySchedule = venue.schedule[dayName]

                    if (!daySchedule || !daySchedule.isOpen) return "Cerrado hoy"
                    if (daySchedule.ranges && daySchedule.ranges.length > 0) {
                      return `${daySchedule.ranges[0].start} - ${daySchedule.ranges[0].end}`
                    }
                  }
                  // Fallback for venues without schedule object
                  return venue.openTime && venue.closeTime ? `${venue.openTime} - ${venue.closeTime}` : "Consultar horario"
                })()}
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