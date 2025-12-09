
import { notFound } from "next/navigation"
import { getVenue } from "@/lib/services"
import { BioLocked } from "@/components/bio/bio-locked"
import { BioView } from "@/components/bio/bio-view"
import { Metadata } from "next"
import { slugify } from "@/lib/utils"

export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    // Fetch with empty region to do global lookup
    const { venue } = await getVenue("", slug)

    if (!venue) return {}

    return {
        title: `${venue.name} | Bio`,
        description: `Contacta con ${venue.name} y mirá sus productos en Encontrá.`,
        robots: {
            index: false,
            follow: true
        }
    }
}

export default async function ShortBioPage({ params }: Props) {
    const { slug } = await params
    // Global lookup by slug
    const { venue, products } = await getVenue("", slug)

    if (!venue) {
        notFound()
    }

    const region = venue.regionCode || 'tdf'
    const city = slugify(venue.zone || 'general')

    const isPremium = venue.subscriptionPlan === 'premium'

    if (!isPremium) {
        return <BioLocked venueName={venue.name} region={region} city={city} slug={venue.slug} />
    }

    return (
        <BioView
            venue={venue}
            products={products}
            region={region}
            city={city}
        />
    )
}
