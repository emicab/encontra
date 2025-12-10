"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { FeaturedCarousel } from "@/components/featured-carousel"
import { CouponCard } from "@/components/coupon-card"
import { VenueCard } from "@/components/venue-card"
import { FilterBar } from "@/components/filter-bar"
import { SectionHeader } from "@/components/section-header"
import { t } from "@/lib/i18n"
import { checkIsOpen } from "@/lib/business-logic"
import { Venue, Coupon } from "@/lib/data"

interface VenueListProps {
    venues: Venue[]
    coupons: Coupon[]
    regionCode: string
    cityName?: string
}

export function VenueList({ venues, coupons, regionCode, cityName }: VenueListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [showOpenOnly, setShowOpenOnly] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const featuredVenues = useMemo(() => venues.filter((v) => v.isFeatured), [venues])

    const categories = useMemo(() => {
        const cats = new Set(venues.map(v => v.category).filter(Boolean))
        return Array.from(cats).sort()
    }, [venues])

    const filteredVenues = useMemo(() => {
        return venues.filter((venue) => {
            // Handle potential JSON structure
            const name = typeof venue.name === 'object' ? (venue.name as any)['es'] || '' : venue.name
            const description = typeof venue.description === 'object' ? (venue.description as any)['es'] || '' : venue.description

            const matchesSearch =
                searchQuery === "" ||
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                description.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesOpen = !showOpenOnly || checkIsOpen(venue)
            const matchesCategory = !selectedCategory || venue.category === selectedCategory

            return matchesSearch && matchesOpen && matchesCategory
        })
    }, [venues, searchQuery, showOpenOnly, selectedCategory])

    return (
        <div className="min-h-screen bg-background">
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <main className="container mx-auto px-4 py-6 space-y-8">
                {/* Featured Venues Carousel */}
                {featuredVenues.length > 0 && (
                    <section>
                        <FeaturedCarousel venues={featuredVenues} />
                    </section>
                )}

                {/* All Venues with Filters */}
                <section>
                    <SectionHeader title={cityName ? `Locales en ${cityName}` : t.allVenues} />
                    <FilterBar
                        showOpenOnly={showOpenOnly}
                        onToggleOpenOnly={() => setShowOpenOnly(!showOpenOnly)}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        categories={categories}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredVenues.map((venue) => (
                            <VenueCard key={venue.id} venue={venue} />
                        ))}
                    </div>
                    {filteredVenues.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">No se encontraron locales que coincidan con tu búsqueda</div>
                    )}
                </section>

                {/* Coupons Section */}
                {coupons.length > 0 && (
                    <section>
                        <SectionHeader title={t.coupons} actionLabel={t.seeAll} onAction={() => { }} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {coupons.map((coupon) => (
                                <CouponCard key={coupon.id} coupon={coupon} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="border-t border-border mt-12 py-8 bg-gray-50">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        © 2025 {t.appName}. {t.tagline}
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="/sumate" className="text-sm font-medium text-primary hover:underline">
                            Sumá tu Negocio
                        </a>
                        <a href="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                            Ingreso Socios
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
