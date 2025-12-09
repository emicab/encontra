
import { notFound } from "next/navigation"
import { getVenue } from "@/lib/services"
import { BioLocked } from "@/components/bio/bio-locked"
import { BioView } from "@/components/bio/bio-view"
import { Metadata } from "next"

export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ region: string; city: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { region, slug } = await params
    const { venue } = await getVenue(region, slug)

    if (!venue) return {}

    return {
        title: `${venue.name} | Bio`,
        description: `Contacta con ${venue.name} y mirá sus productos en Encontrá.`,
        robots: {
            index: false, // Don't index bio pages to avoid cannibalizing main page SEO
            follow: true
        }
    }
}

export default async function VenueBioPage({ params }: Props) {
    const { region, city, slug } = await params
    const { venue, products } = await getVenue(region, slug)

    if (!venue) {
        notFound()
    }

    // Access Control: Only 'premium' plan can access the Bio View
    const isPremium = venue.subscriptionPlan === 'premium'

    if (!isPremium) {
        return <BioLocked venueName={venue.name} region={region} city={city} slug={slug} />
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
