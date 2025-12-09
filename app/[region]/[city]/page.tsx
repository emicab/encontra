"use client"

import { useState, useEffect } from "react"
import { venues as mockVenues, coupons as mockCoupons, type Venue, type Coupon } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { useRegion } from "@/components/providers/region-provider"
import { VenueList } from "@/components/venue-list"
import { notFound } from "next/navigation"

// Helper to normalize strings for comparison (remove accents, lowercase)
function normalize(str: string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

type Props = {
    params: Promise<{ region: string; city: string }>
}

export default function CityPage({ params }: Props) {
    const [resolvedParams, setResolvedParams] = useState<{ region: string; city: string } | null>(null)
    const regionCode = useRegion()
    const [venues, setVenues] = useState<Venue[]>([])
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        params.then(setResolvedParams)
    }, [params])

    useEffect(() => {
        if (!resolvedParams || !regionCode) return

        async function fetchData() {
            setLoading(true)
            const citySlug = resolvedParams!.city

            try {
                // Fetch venues for the region
                let query = supabase.from("venues").select("*").eq("region_code", regionCode)
                const { data: venuesData, error: venuesError } = await query

                const { data: couponsData, error: couponsError } = await supabase.from("coupons").select("*")

                if (venuesError) throw venuesError
                if (couponsError) throw couponsError

                let mappedVenues: Venue[] = []

                if (venuesData && venuesData.length > 0) {
                    const allVenues = venuesData.map((v: any) => ({
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
                        subscriptionPlan: v.subscription_plan,
                        subscriptionStatus: v.subscription_status,
                        venueType: v.venue_type,
                        locationMode: v.location_mode,
                        zone: v.zone,
                        schedule: v.schedule,
                        serviceDelivery: v.service_delivery,
                        servicePickup: v.service_pickup,
                        serviceArrangement: v.service_arrangement,
                        regionCode: v.region_code,
                    })) as Venue[]

                    // Filter by city/zone
                    mappedVenues = allVenues.filter(v =>
                        v.zone && normalize(v.zone) === normalize(citySlug)
                    )

                } else {
                    // Filter mock venues
                    mappedVenues = mockVenues.filter(v =>
                        v.regionCode === regionCode &&
                        v.zone && normalize(v.zone) === normalize(citySlug)
                    )
                }

                setVenues(mappedVenues)

                // Filter coupons for these venues
                if (couponsData && couponsData.length > 0) {
                    const venuesMap = new Map(venuesData?.map((v: any) => [v.id, v.name]) || [])
                    const visibleVenueIds = new Set(mappedVenues.map(v => v.id))

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

                    setCoupons(joinedCoupons.filter(c => visibleVenueIds.has(c.venueId)))
                } else {
                    const visibleIds = new Set(mappedVenues.map(v => v.id))
                    setCoupons(mockCoupons.filter(c => visibleIds.has(c.venueId)))
                }

            } catch (error) {
                console.error("Error fetching city data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [resolvedParams, regionCode])

    if (!resolvedParams) return null // or loading
    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

    // If no venues found (and we assume city must exist if venues exist), maybe 404? 
    // Or just show empty list with "Locales en [City]"
    // Ideally we would validate if 'city' is a valid zone in the DB, but for now we trust the filter.

    return (
        <VenueList
            venues={venues}
            coupons={coupons}
            regionCode={regionCode || ""}
            cityName={resolvedParams.city} // We might want to pretty print this (title case)
        />
    )
}
