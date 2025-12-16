"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Pencil, Package } from "lucide-react"
import Link from "next/link"
import { Venue } from "@/lib/data"
import { BioLinkCard } from "@/components/admin/bio-link-card"

export default function MyVenuePage() {
    const [venue, setVenue] = useState<Venue | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchMyVenue() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from("venues")
                .select("*")
                .eq("owner_id", user.id)
                .single()

            if (data) {
                // Map data similar to other pages
                setVenue({
                    id: data.id,
                    name: typeof data.name === 'object' ? data.name.es || data.name.en || "" : data.name,
                    description: typeof data.description === 'object' ? data.description.es || data.description.en || "" : data.description,
                    image: data.image,
                    address: data.address,
                    rating: data.rating,
                    whatsapp: data.whatsapp,
                    category: data.category,
                    // ... other fields as needed for display
                } as Venue)
            }
            setLoading(false)
        }
        fetchMyVenue()
    }, [])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!venue) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">No tenés ningún local asociado.</h2>
                <p className="text-muted-foreground">Si sos dueño de un local, reclamalo ahora.</p>
                <Button asChild>
                    <Link href="/admin/claim">Reclamar Local</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Mi Negocio</h2>
                <p className="text-muted-foreground">Administra la información de tu local.</p>
            </div>

            {venue.slug && <BioLinkCard slug={venue.slug} />}

            <Card>
                <CardHeader>
                    <CardTitle>{venue.name}</CardTitle>
                    <CardDescription>{venue.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="aspect-video w-full max-w-md overflow-hidden rounded-lg">
                        <img
                            src={venue.image || "/placeholder.svg"}
                            alt={venue.name}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button asChild>
                            <Link href={`/admin/venues/${venue.id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar Información
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/venues/${venue.id}/products`}>
                                <Package className="mr-2 h-4 w-4" /> Gestionar Productos
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
