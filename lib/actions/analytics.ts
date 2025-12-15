"use server"

import { supabase } from "@/lib/supabase"

export async function logEvent(eventName: string, data: { source?: string; path?: string;[key: string]: any }) {
    try {
        const { source, path, ...metadata } = data

        const { error } = await supabase.from("analytics_events").insert({
            event_name: eventName,
            source: source || "unknown",
            path: path || "/",
            metadata: metadata
        })

        if (error) {
            console.error("Error logging analytics event:", error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error("Unexpected error logging event:", error)
        return { success: false, error: "Internal Server Error" }
    }
}
