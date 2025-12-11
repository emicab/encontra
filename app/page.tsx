"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FeaturedCarousel } from "@/components/featured-carousel"
import { CouponCard } from "@/components/coupon-card"
import { VenueCard } from "@/components/venue-card"
import { FilterBar } from "@/components/filter-bar"
import { SectionHeader } from "@/components/section-header"
import { t } from "@/lib/i18n"
import { venues as mockVenues, coupons as mockCoupons, type Venue, type Coupon } from "@/lib/data"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const lastRegion = localStorage.getItem("lastRegion")
    if (lastRegion) {
      router.push(`/${lastRegion}`)
    }
  }, [])

  const regionCode = null // Global home has no specific region filter
  const [searchQuery, setSearchQuery] = useState("")
  const [showOpenOnly, setShowOpenOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from("venues").select("*")
        // No region filter for global home

        const { data: venuesData, error: venuesError } = await query
        const { data: couponsData, error: couponsError } = await supabase.from("coupons").select("*")

        if (venuesError) throw venuesError
        if (couponsError) throw couponsError

        if (venuesData && venuesData.length > 0) {
          const mappedVenues: Venue[] = venuesData.map((v: any) => ({
            id: v.id,
            slug: v.slug,
            name: typeof v.name === 'object' ? v.name.es || v.name.en || "" : v.name,
            description: typeof v.description === 'object' ? v.description.es || v.description.en || "" : v.description,
            category: v.category,
            image: v.image,
            logo: v.logo,
            rating: v.rating,
            reviewCount: v.review_count,
            distance: "",
            openTime: v.open_time,
            closeTime: v.close_time,
            isOpen: v.is_open,
            isFeatured: v.is_featured,
            isNew: v.is_new,
            address: v.address,
            coordinates: v.coordinates,
            whatsapp: v.whatsapp,
            subscriptionPlan: v.subscription_plan as any,
            subscriptionStatus: v.subscription_status,
            venueType: v.venue_type,
            locationMode: v.location_mode,
            zone: v.zone,
            schedule: v.schedule,
            serviceDelivery: v.service_delivery,
            servicePickup: v.service_pickup,
            serviceArrangement: v.service_arrangement,
            regionCode: v.region_code,
          }))

          // Sort by subscription plan priority: premium > basic > others
          mappedVenues.sort((a, b) => {
            const getPriority = (plan?: string) => {
              if (plan === 'premium') return 3
              if (plan === 'basic') return 2
              return 1
            }
            return getPriority(b.subscriptionPlan) - getPriority(a.subscriptionPlan)
          })

          setVenues(mappedVenues)
        } else {
          // Show all mock venues
          setVenues(mockVenues.sort((a, b) => {
            const getPriority = (plan?: string) => {
              if (plan === 'premium') return 3
              if (plan === 'basic') return 2
              return 1
            }
            return getPriority(b.subscriptionPlan) - getPriority(a.subscriptionPlan)
          }))
        }

        if (couponsData && couponsData.length > 0) {
          const venuesMap = new Map(venuesData?.map((v: any) => [v.id, v.name]) || [])

          let joinedCoupons: Coupon[] = couponsData.map((c: any) => ({
            id: c.id,
            venueId: c.venue_id,
            venueName: venuesMap.get(c.venue_id) || "Desconocido",
            code: c.code,
            discount: c.discount,
            type: c.type,
            description: c.description,
            validUntil: c.valid_until,
            image: c.image,
          }))
          setCoupons(joinedCoupons)
        } else {
          setCoupons(mockCoupons)
        }

      } catch (error) {
        console.error("Error fetching data:", error)
        // Fallback to mock data on error
        setVenues(mockVenues)
        setCoupons(mockCoupons)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

      const matchesOpen = !showOpenOnly || venue.isOpen
      const matchesCategory = !selectedCategory || venue.category === selectedCategory

      return matchesSearch && matchesOpen && matchesCategory
    })
  }, [venues, searchQuery, showOpenOnly, selectedCategory])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Featured Venues Carousel */}
        <section>
          <FeaturedCarousel venues={featuredVenues} />
        </section>

        {/* All Venues with Filters */}
        <section>
          <SectionHeader title={t.allVenues} />
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
        <section>
          <SectionHeader title={t.coupons} actionLabel={t.seeAll} onAction={() => { }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
