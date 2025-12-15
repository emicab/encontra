"use client"

import { useEffect } from "react"
import { incrementJobView } from "@/lib/actions/jobs"

export function ViewCounter({ jobId }: { jobId: string }) {
    useEffect(() => {
        // Simple fire-and-forget
        incrementJobView(jobId).catch(err => console.error("View count error", err));
    }, [jobId])

    return null;
}
