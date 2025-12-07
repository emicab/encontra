import { Metadata } from "next"
import { notFound } from "next/navigation"
import { VenueDetailView } from "@/components/venue-detail-view"
import { getVenue } from "@/lib/services"

export const dynamic = 'force-dynamic'

// Create a single supabase client for interaction with your database

type Props = {
    params: Promise<{ region: string; slug: string }>
}


export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { region, slug } = await params
    const { venue } = await getVenue(region, slug)

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
    const { region, slug } = await params
    const { venue, products, coupons } = await getVenue(region, slug)

    if (!venue) {
        notFound()
    }

    return <VenueDetailView venue={venue} products={products} coupons={coupons} />
}
