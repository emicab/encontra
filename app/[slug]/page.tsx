import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { VenueDetailView } from "@/components/venue-detail-view"
import { venues as mockVenues, coupons as mockCoupons, type Venue, type Coupon, type Product } from "@/lib/data"

// Create a single supabase client for interaction with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use anon key for public data
const supabase = createClient(supabaseUrl, supabaseKey)

type Props = {
    params: Promise<{ slug: string }>
}

async function getVenue(slug: string): Promise<{ venue: Venue | null, products: Product[], coupons: Coupon[] }> {
    // Try fetch from Supabase
    try {
        const { data: venueData, error } = await supabase
            .from("venues")
            .select("*")
            .eq("slug", slug)
            .single()

        if (venueData) {
            const mappedVenue: Venue = {
                id: venueData.id,
                slug: venueData.slug,
                name: typeof venueData.name === 'object' ? venueData.name.es || venueData.name.en || "" : venueData.name,
                description: typeof venueData.description === 'object' ? venueData.description.es || venueData.description.en || "" : venueData.description,
                category: venueData.category,
                image: venueData.image,
                logo: venueData.logo,
                rating: venueData.rating,
                reviewCount: venueData.review_count,
                openTime: venueData.open_time,
                closeTime: venueData.close_time,
                isOpen: venueData.is_open,
                isFeatured: venueData.is_featured,
                isNew: venueData.is_new,
                address: venueData.address,
                coordinates: venueData.coordinates,
                whatsapp: venueData.whatsapp,
                website: venueData.website,
                instagram: venueData.instagram,
                facebook: venueData.facebook,
                phone: venueData.phone,
                subscriptionPlan: venueData.subscription_plan,
                subscriptionStatus: venueData.subscription_status,
                venueType: venueData.venue_type,
                locationMode: venueData.location_mode,
                zone: venueData.zone,
                serviceDelivery: venueData.service_delivery,
                servicePickup: venueData.service_pickup,
                serviceArrangement: venueData.service_arrangement,
                schedule: venueData.schedule,
                distance: "",
                ownerId: venueData.owner_id,
                gallery: venueData.gallery,
            }

            // Fetch products
            const { data: productsData } = await supabase
                .from("products")
                .select("*")
                .eq("venue_id", venueData.id)
                .eq("is_active", true)

            const mappedProducts = productsData ? productsData.map((p: any) => ({
                id: p.id,
                venueId: p.venue_id,
                name: typeof p.name === 'object' ? p.name.es || p.name.en || "" : p.name,
                description: typeof p.description === 'object' ? p.description.es || p.description.en || "" : p.description,
                price: p.price,
                image: p.image,
                isActive: p.is_active,
            })) : []

            // Fetch coupons
            const { data: couponsData } = await supabase
                .from("coupons")
                .select("*")
                .eq("venue_id", venueData.id)

            const mappedCoupons = couponsData ? couponsData.map((c: any) => ({
                id: c.id,
                venueId: c.venue_id,
                venueName: mappedVenue.name,
                code: c.code,
                discount: c.discount,
                type: c.type,
                description: c.description,
                validUntil: c.valid_until,
                image: c.image,
            })) : []

            return { venue: mappedVenue, products: mappedProducts, coupons: mappedCoupons }
        }
    } catch (e) {
        console.error("Error fetching venue", e)
    }

    // Fallback to mock
    const mockVenue = mockVenues.find((v) => v.slug === slug)
    if (mockVenue) {
        return {
            venue: mockVenue,
            products: [],
            coupons: mockCoupons.filter((c) => c.venueId === mockVenue.id)
        }
    }

    return { venue: null, products: [], coupons: [] }
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { slug } = await params
    const { venue } = await getVenue(slug)

    if (!venue) {
        return {
            title: "Local no encontrado",
        }
    }

    return {
        title: `${venue.name} - Encontrá`,
        description: venue.description.substring(0, 160),
        openGraph: {
            title: venue.name,
            description: venue.description.substring(0, 160),
            images: [venue.image || venue.logo || '/placeholder.svg'],
        },
    }
}

export default async function VenuePage({ params }: Props) {
    const { slug } = await params
    const { venue, products, coupons } = await getVenue(slug)

    if (!venue) {
        notFound()
    }

    return <VenueDetailView venue={venue} products={products} coupons={coupons} />
}
