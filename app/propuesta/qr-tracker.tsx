"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { track } from "@vercel/analytics/react"
import { logEvent } from "@/lib/actions/analytics"

function Tracker() {
    const searchParams = useSearchParams()
    const pathname = usePathname()

    useEffect(() => {
        const source = searchParams.get("source") || searchParams.get("ref")

        if (source === "qr" || source === "qr-card") {
            // 1. Track in Vercel Analytics
            track("QR Scan", {
                source: source,
                location: "propuesta_landing",
                timestamp: new Date().toISOString()
            })

            // 2. Track in Internal DB
            logEvent("qr_scan", {
                source: source,
                path: pathname,
                device_time: new Date().toISOString()
            })

            console.log("Tracking QR Scan (Internal & Vercel):", source)
        }
    }, [searchParams, pathname])

    return null
}

export function QrTracker() {
    return (
        <Suspense fallback={null}>
            <Tracker />
        </Suspense>
    )
}
