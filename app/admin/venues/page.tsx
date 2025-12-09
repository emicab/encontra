"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { venues as mockVenues, type Venue } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { Plus, Pencil, Trash2, MapPin, Loader2, Package } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchVenues()
    }, [])

    async function fetchVenues() {
        try {
            const { data, error } = await supabase
                .from("venues")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error

            if (data) {
                const mappedVenues: Venue[] = data.map((v: any) => ({
                    id: v.id,
                    slug: v.slug,
                    name: typeof v.name === 'object' ? v.name.es || v.name.en || "" : v.name,
                    description: typeof v.description === 'object' ? v.description.es || v.description.en || "" : v.description,
                    category: v.category,
                    image: v.image,
                    rating: v.rating,
                    reviewCount: v.review_count,
                    distance: "", // Placeholder
                    openTime: v.open_time,
                    closeTime: v.close_time,
                    isOpen: v.is_open,
                    isFeatured: v.is_featured,
                    isNew: v.is_new,
                    address: v.address,
                    coordinates: v.coordinates,
                    whatsapp: v.whatsapp,
                    subscriptionPlan: v.subscription_plan,
                    subscriptionStatus: v.subscription_status,
                    venueType: v.venue_type,
                    locationMode: v.location_mode,
                    zone: v.zone,
                    serviceDelivery: v.service_delivery || false,
                    servicePickup: v.service_pickup || false,
                    serviceArrangement: v.service_arrangement || false,
                }))
                setVenues(mappedVenues)
            }
        } catch (error) {
            console.error("Error fetching venues:", error)
            toast({
                title: "Error",
                description: "Error al cargar los locales.",
                variant: "destructive",
            })
            // Fallback to mock data
            setVenues(mockVenues)
        } finally {
            setLoading(false)
        }
    }

    async function deleteVenue(id: string) {
        try {
            const { error } = await supabase.from("venues").delete().eq("id", id)
            if (error) throw error

            setVenues(venues.filter((v) => v.id !== id))
            toast({
                title: "Éxito",
                description: "Local eliminado correctamente.",
            })
        } catch (error) {
            console.error("Error deleting venue:", error)
            toast({
                title: "Error",
                description: "Error al eliminar el local.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Locales</h2>
                    <p className="text-muted-foreground">Administra tus locales y negocios.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/venues/new">
                        <Plus className="mr-2 h-4 w-4" /> Agregar Local
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Todos los Locales</CardTitle>
                    <CardDescription>Una lista de todos los locales registrados en el sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Calificación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {venues.map((venue) => (
                                <TableRow key={venue.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={venue.image || "/placeholder.svg"}
                                                alt={venue.name || "Local"}
                                                className="h-10 w-10 rounded-md object-cover"
                                            />
                                            <div>
                                                <div className="font-bold">{venue.name}</div>
                                                <div className="text-xs text-muted-foreground">{venue.whatsapp}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {venue.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                venue.subscriptionPlan === "premium"
                                                    ? "default"
                                                    : venue.subscriptionPlan === "basic"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                            className="capitalize"
                                        >
                                            {venue.subscriptionPlan === "premium" ? "Premium" : venue.subscriptionPlan === "basic" ? "Básico" : "Gratis"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={venue.subscriptionStatus === "active" ? "default" : "destructive"}>
                                            {venue.subscriptionStatus === "active" ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            {venue.address}
                                        </div>
                                    </TableCell>
                                    <TableCell>{venue.rating} ⭐</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild title="Administrar Productos">
                                                <Link href={`/admin/venues/${venue.id}/products`}>
                                                    <Package className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/venues/${venue.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Se eliminará permanentemente el local y todos sus datos asociados.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteVenue(venue.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
