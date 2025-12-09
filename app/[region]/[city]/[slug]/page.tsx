import { Metadata } from "next"
import { notFound } from "next/navigation"
import { VenueDetailView } from "@/components/venue-detail-view"
import { getVenue } from "@/lib/services"

export const dynamic = 'force-dynamic'

// Create a single supabase client for interaction with your database

type Props = {
    params: Promise<{ region: string; city: string; slug: string }>
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

    const generateJsonLd = () => {
        const schema: any = {
            "@context": "https://schema.org",
            "@type": venue.category === 'restaurant' || venue.category === 'cafe' ? "Restaurant" : "LocalBusiness",
            "name": typeof venue.name === 'object' ? venue.name.es || venue.name.en : venue.name,
            "description": typeof venue.description === 'object' ? venue.description.es || venue.description.en : venue.description,
            "image": [venue.image || venue.logo || 'https://encontra.com.ar/placeholder.svg'],
            "url": `https://encontra.com.ar/${region}/${venue.zone ? venue.zone.toLowerCase().replace(/ /g, '-') : 'general'}/${slug}`,
            "telephone": venue.whatsapp || venue.phone,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": venue.address,
                "addressLocality": venue.city || venue.zone,
                "addressRegion": region, // Ideally "Tierra del Fuego" but region code works for now
                "addressCountry": "AR"
            }
        }

        if (venue.coordinates && venue.coordinates.lat) {
            schema.geo = {
                "@type": "GeoCoordinates",
                "latitude": venue.coordinates.lat,
                "longitude": venue.coordinates.lng
            }
        }

        if (venue.priceRange) {
            schema.priceRange = venue.priceRange
        } else {
            schema.priceRange = "$$"
        }

        // Schedule Mapping
        if (venue.schedule) {
            const daysMap: Record<string, string> = {
                "monday": "Monday",
                "tuesday": "Tuesday",
                "wednesday": "Wednesday",
                "thursday": "Thursday",
                "friday": "Friday",
                "saturday": "Saturday",
                "sunday": "Sunday"
            }

            const openingHours: any[] = []
            Object.entries(venue.schedule).forEach(([day, data]: [string, any]) => {
                if (data.isOpen && data.ranges && data.ranges.length > 0) {
                    data.ranges.forEach((range: any) => {
                        openingHours.push({
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": daysMap[day],
                            "opens": range.start,
                            "closes": range.end
                        })
                    })
                }
            })

            if (openingHours.length > 0) {
                schema.openingHoursSpecification = openingHours
            }
        }

        return schema
    }

    const jsonLd = generateJsonLd()

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <VenueDetailView venue={venue} products={products} coupons={coupons} />
        </>
    )
}
