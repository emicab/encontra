"use client"

import { VenueForm } from "@/components/admin/venue-form"
import { venues as mockVenues, type Venue } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function EditVenuePage() {
    const params = useParams()
    const [venue, setVenue] = useState<Venue | null>(null)
    const [loading, setLoading] = useState(true)

    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        async function fetchVenue() {
            try {
                // Check admin status
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("is_admin")
                        .eq("id", user.id)
                        .single()
                    if (profile?.is_admin) setIsAdmin(true)
                }

                const { data, error } = await supabase
                    .from("venues")
                    .select("*")
                    .eq("id", params.id)
                    .single()

                if (error) throw error

                if (data) {
                    const mappedVenue: Venue = {
                        id: data.id,
                        slug: data.slug,
                        name: data.name,
                        description: data.description,
                        category: data.category,
                        image: data.image,
                        rating: data.rating,
                        reviewCount: data.review_count,
                        distance: "", // Placeholder
                        openTime: data.open_time,
                        closeTime: data.close_time,
                        isOpen: data.is_open,
                        isFeatured: data.is_featured,
                        isNew: data.is_new,
                        address: data.address,
                        coordinates: data.coordinates,
                        whatsapp: data.whatsapp,
                        subscriptionPlan: data.subscription_plan,
                        subscriptionStatus: data.subscription_status,
                        venueType: data.venue_type,
                        locationMode: data.location_mode,
                        zone: data.zone,
                        serviceDelivery: data.service_delivery || false,
                        servicePickup: data.service_pickup || false,
                        serviceArrangement: data.service_arrangement || false,
                        schedule: data.schedule,
                    }
                    setVenue(mappedVenue)
                }
            } catch (error) {
                console.error("Error fetching venue:", error)
                // Fallback to mock data
                const mock = mockVenues.find((v) => v.id === params.id)
                if (mock) setVenue(mock)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchVenue()
        }
    }, [params.id])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!venue) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Editar Local</h2>
                <p className="text-muted-foreground">Actualizar información del local.</p>
            </div>
            <VenueForm initialData={venue} />
        </div>
    )
}
