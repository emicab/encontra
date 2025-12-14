"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { logEvent } from "@/lib/actions/analytics"

interface PageViewTrackerProps {
    type: "region" | "city" | "venue"
    identifier: string // slug or name
    metadata?: Record<string, any>
}

export function PageViewTracker({ type, identifier, metadata = {} }: PageViewTrackerProps) {
    const pathname = usePathname()
    const loggedRef = useRef(false)

    useEffect(() => {
        // Prevent double logging in Strict Mode (Dev) or on re-renders
        if (loggedRef.current) return

        loggedRef.current = true

        // Log the page view
        logEvent("page_view", {
            type,
            identifier,
            path: pathname,
            ...metadata
        })
    }, [type, identifier, pathname, metadata])

    return null
}
