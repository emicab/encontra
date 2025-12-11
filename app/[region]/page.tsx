"use client"

import { useState, useEffect } from "react"
import { venues as mockVenues, coupons as mockCoupons, type Venue, type Coupon } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { useRegion } from "@/components/providers/region-provider"
import { VenueList } from "@/components/venue-list"
import { Footer } from "@/components/footer"
import { getRegionName } from "@/lib/regions"

export default function RegionHome() {
    const regionCode = useRegion()
    const [venues, setVenues] = useState<Venue[]>([])
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            // If for some reason regionCode is null (shouldn't happen in this route), wait or skip
            if (!regionCode) return

            try {
                let query = supabase.from("venues").select("*")
                if (regionCode) {
                    query = query.eq("region_code", regionCode)
                }

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

                    // Sort by priority
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
                    // Filter mock venues by region
                    const filteredMock = regionCode
                        ? mockVenues.filter(v => v.regionCode === regionCode)
                        : mockVenues

                    // Sort mock data too
                    filteredMock.sort((a, b) => {
                        const getPriority = (plan?: string) => {
                            if (plan === 'premium') return 3
                            if (plan === 'basic') return 2
                            return 1
                        }
                        return getPriority(b.subscriptionPlan) - getPriority(a.subscriptionPlan)
                    })

                    setVenues(filteredMock)
                }

                if (couponsData && couponsData.length > 0) {
                    const venuesMap = new Map(venuesData?.map((v: any) => [v.id, v.name]) || [])
                    const visibleVenueIds = new Set(venuesData?.map((v: any) => v.id) || [])

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

                    if (regionCode && venuesData) {
                        joinedCoupons = joinedCoupons.filter(c => visibleVenueIds.has(c.venueId))
                    }

                    setCoupons(joinedCoupons)
                } else {
                    // Mock coupons filtering
                    const filteredMockVenues = regionCode
                        ? mockVenues.filter(v => v.regionCode === regionCode)
                        : mockVenues
                    const visibleIds = new Set(filteredMockVenues.map(v => v.id))

                    setCoupons(mockCoupons.filter(c => visibleIds.has(c.venueId)))
                }

            } catch (error) {
                console.error("Error fetching data:", error)
                // Fallback to mock data on error
                const filteredMock = regionCode
                    ? mockVenues.filter(v => v.regionCode === regionCode)
                    : mockVenues
                setVenues(filteredMock)

                const visibleIds = new Set(filteredMock.map(v => v.id))
                setCoupons(mockCoupons.filter(c => visibleIds.has(c.venueId)))
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [regionCode])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
    }

    return (
        <div className="min-h-screen bg-background">
            <VenueList
                venues={venues}
                coupons={coupons}
                regionCode={regionCode || ""}
            />
            <Footer />
        </div>
    )
}
