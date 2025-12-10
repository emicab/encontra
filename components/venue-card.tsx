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
      "group hover:shadow-lg transition-all hover:-translate-y-1 h-full relative",
      isPremium && "border-2 border-yellow-400 shadow-md"
    )}>
      <Link href={`/${regionLink}/${citySlug}/${venue.slug}`} className="block h-full">
        {/* Wrapper for Image + Floating Button */}
        <div className="relative">
          <div className="aspect-[16/9] overflow-hidden relative rounded-t-lg">
            <img
              src={venue.logo || venue.image || "/placeholder.svg"}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute top-2 left-2 flex gap-1">
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

        </div>

        <div className="flex flex-col gap-1 px-3 pt-3 pb-12 text-center items-center relative flex-grow">
          <div className="flex items-center justify-center gap-2 w-full">
            <h3 className="font-semibold text-base leading-none tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
              {venueName}
            </h3>
            {venue.rating > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-[10px] font-medium text-primary shrink-0">
                <Star className="h-2.5 w-2.5 fill-primary" />
                <span>{venue.rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground w-full">
            {/* Location */}
            {(venue.zone || venue.city) && (
              <div className="flex items-center gap-1 shrink-0 max-w-[50%]">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {[venue.zone, venue.city].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

            {/* Separator if both exist */}
            {(venue.zone || venue.city) && (
              <span className="text-muted-foreground/40">•</span>
            )}

            {/* Schedule */}
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[100px]">
                {(() => {
                  const isOpenToday = checkIsOpen(venue)
                  if (!isOpenToday) return "Cerrado"
                  // Simple "Open" text or simplified time could improve fit
                  if (venue.schedule) {
                    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
                    const now = new Date()
                    const dayName = days[now.getDay()]
                    const daySchedule = venue.schedule[dayName]
                    if (daySchedule?.ranges?.[0]) {
                      return `${daySchedule.ranges[0].start} - ${daySchedule.ranges[0].end}`
                    }
                  }
                  return venue.openTime ? `${venue.openTime} - ${venue.closeTime}` : "Consultar"
                })()}
              </span>
            </div>
          </div>

          <p className="line-clamp-1 text-xs text-muted-foreground mt-0.5">
            {venueDescription}
          </p>
        </div>

        {/* WhatsApp Button - Bottom Centered */}
        {features.whatsapp && venue.whatsapp && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-lg border-2 border-background"
              onClick={(e) => {
                e.preventDefault()
                window.open(`https://wa.me/${venue.whatsapp}`, "_blank")
              }}
            >
              {/* Genuine WhatsApp Icon SVG */}
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
            </Button>
          </div>
        )}

      </Link >
    </Card >
  )
}