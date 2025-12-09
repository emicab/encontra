"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Star, Clock } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Venue } from "@/lib/data"
import { useRegion } from "@/components/providers/region-provider"
import { getVenueFeatures } from "@/lib/business-logic"
import { slugify } from "@/lib/utils"
import { t } from "@/lib/i18n"

interface FeaturedCarouselProps {
  venues: Venue[]
}

export function FeaturedCarousel({ venues }: FeaturedCarouselProps) {
  const currentRegion = useRegion()
  const featuredVenues = venues.filter((v) => getVenueFeatures(v).featured)
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredVenues.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredVenues.length) % featuredVenues.length)
  }

  if (featuredVenues.length === 0) return null

  return (
    <section className="relative overflow-hidden rounded-2xl bg-card shadow-lg">
      <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[3/1]">
        {featuredVenues.map((venue, index) => (
          <div
            key={venue.id}
            className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          >
            <Link href={`/${currentRegion || venue.regionCode || ''}/${slugify(venue.zone || 'general')}/${venue.slug}`} className="block h-full w-full cursor-pointer group">
              <img
                src={venue.image || "/placeholder.svg"}
                alt={venue.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </Link>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/20 hover:bg-card/40 text-card rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/20 hover:bg-card/40 text-card rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredVenues.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${index === currentIndex ? "w-6 bg-card" : "w-2 bg-card/50"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  )
}
