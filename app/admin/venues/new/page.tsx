"use client"

import { VenueForm } from "@/components/admin/venue-form"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function NewVenuePage() {
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single()
                if (profile?.is_admin) setIsAdmin(true)
            }
        }
        checkAdmin()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Local</h2>
                <p className="text-muted-foreground">Agregar un nuevo local al directorio.</p>
            </div>
            <VenueForm isAdmin={isAdmin} />
        </div>
    )
}
