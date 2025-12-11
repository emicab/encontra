import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { REGIONS } from '@/lib/regions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://encontra.com.ar'

    // Static routes
    const routes = [
        '',
        '/sumate',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Region routes
    const regionRoutes = Object.keys(REGIONS).map((code) => ({
        url: `${baseUrl}/${code}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    // Venue routes
    let venueRoutes: MetadataRoute.Sitemap = []

    try {
        const { data: venues } = await supabase
            .from('venues')
            .select('slug, region_code, updated_at')

        if (venues) {
            venueRoutes = venues.map((venue) => ({
                url: `${baseUrl}/${venue.region_code || 'tdf'}/${venue.slug}`,
                lastModified: venue.updated_at || new Date().toISOString(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }))
        }
    } catch (error) {
        console.error('Error generating venue sitemap:', error)
    }

    // Bio routes
    let bioRoutes: MetadataRoute.Sitemap = []

    try {
        const { data: venues } = await supabase
            .from('venues')
            .select('slug, updated_at')

        if (venues) {
            bioRoutes = venues.map((venue) => ({
                url: `${baseUrl}/bio/${venue.slug}`,
                lastModified: venue.updated_at || new Date().toISOString(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
        }
    } catch (error) {
        console.error('Error generating bio sitemap:', error)
    }

    // Jobs routes
    let jobRoutes: MetadataRoute.Sitemap = []

    try {
        const { data: jobs } = await supabase
            .from('jobs')
            .select('id, created_at')
            .eq('is_active', true)

        if (jobs) {
            jobRoutes = jobs.map((job) => ({
                url: `${baseUrl}/jobs/${job.id}`,
                lastModified: job.created_at || new Date().toISOString(),
                changeFrequency: 'daily' as const,
                priority: 0.9,
            }))
        }
    } catch (error) {
        console.error('Error generating job sitemap:', error)
    }

    // Static jobs list
    const staticJobRoutes = [
        {
            url: `${baseUrl}/jobs`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'hourly' as const,
            priority: 1,
        }
    ]

    return [...routes, ...regionRoutes, ...venueRoutes, ...bioRoutes, ...jobRoutes, ...staticJobRoutes]
}
