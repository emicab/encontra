"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { track } from "@vercel/analytics/react"
import { logEvent } from "@/lib/actions/analytics"

/**
 * Internal tracker component that monitors URL parameters
 * and logs analytics events for any source parameter
 */
function Tracker() {
    const searchParams = useSearchParams()
    const pathname = usePathname()

    useEffect(() => {
        // Check for source parameter (supports both 'source' and 'ref')
        const source = searchParams.get("source") || searchParams.get("ref")

        // If a source parameter exists, track it
        if (source) {
            // 1. Track in Vercel Analytics
            track("Source Visit", {
                source: source,
                path: pathname,
                timestamp: new Date().toISOString()
            })

            // 2. Track in Internal DB
            logEvent("source_visit", {
                source: source,
                path: pathname,
                device_time: new Date().toISOString()
            })

            console.log(`📊 Analytics tracked: source="${source}" on path="${pathname}"`)
        }
    }, [searchParams, pathname])

    return null
}

/**
 * Global Analytics Tracker Component
 * 
 * This component tracks any URL source parameter across the entire application.
 * It automatically logs visits from any source without requiring code changes.
 * 
 * Usage examples:
 * - /sumate?source=qr
 * - /sumate?source=feria_diciembre
 * - /propuesta?source=paseo_cordoba
 * - /any-route?ref=instagram_ad
 * 
 * Add this component to your root layout to enable global tracking.
 */
export function GlobalTracker() {
    return (
        <Suspense fallback={null}>
            <Tracker />
        </Suspense>
    )
}
