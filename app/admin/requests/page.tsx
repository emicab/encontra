"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Loader2, Eye, Ban } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
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

interface VenueRequest {
    id: string
    created_at: string
    name: string
    category: string
    description: string
    phone: string
    status: string
    visibility: string
    friction: string
    security: string
    location: string
    region_code: string
    zone?: string
    // Expanded fields
    slug?: string
    image?: string
    logo?: string
    website?: string
    instagram?: string
    facebook?: string
    whatsapp?: string
    open_time?: string
    close_time?: string
    days_open?: any
    coordinates?: any
    venue_type?: string
    subscription_plan?: string
    service_delivery?: boolean
    service_pickup?: boolean
    service_arrangement?: boolean
    street?: string
    house_number?: string
    city?: string
    location_type?: string
    hours?: string
    owner_name?: string
    owner_email?: string
    custom_category?: string
}

import { slugify } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { useRouter } from "next/navigation"

export default function RequestsPage() {
    const router = useRouter()
    const [requests, setRequests] = useState<VenueRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchRequests()
    }, [])

    async function fetchRequests() {
        try {
            // Check Admin Status
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single()

                if (!profile?.is_admin) {
                    router.push("/admin/my-venue")
                    return
                }
            }

            const { data, error } = await supabase
                .from("venue_requests")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setRequests(data || [])
        } catch (error) {
            console.error("Error fetching requests:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleReject(request: VenueRequest) {
        setProcessingId(request.id)
        try {
            const { error } = await supabase
                .from("venue_requests")
                .update({ status: 'rejected' })
                .eq('id', request.id)

            if (error) throw error

            toast({
                title: "Solicitud rechazada",
                description: `La solicitud de ${request.name} ha sido rechazada.`
            })

            fetchRequests()
        } catch (error) {
            console.error("Error rejecting request:", error)
            toast({
                variant: "destructive",
                title: "Error al rechazar",
                description: "No se pudo rechazar la solicitud."
            })
        } finally {
            setProcessingId(null)
        }
    }

    async function handleApprove(request: VenueRequest) {
        setProcessingId(request.id)
        try {
            // 1. Prepare Venue Data
            // Ensure slug is unique
            let baseSlug = request.slug || slugify(request.name)
            let uniqueSlug = baseSlug
            let counter = 1

            // Loop until we find a unique slug
            while (true) {
                const { data } = await supabase
                    .from('venues')
                    .select('id')
                    .eq('slug', uniqueSlug)
                    .maybeSingle()

                if (!data) break // Slug is unique

                uniqueSlug = `${baseSlug}-${counter}`
                counter++
            }

            const venueData = {
                name: { es: request.name }, // Schema requires JSONB
                slug: uniqueSlug, // Use the verified unique slug
                description: { es: request.description }, // Schema requires JSONB
                category: request.category,
                custom_category: request.custom_category,
                phone: request.whatsapp || request.phone,
                whatsapp: request.whatsapp,
                instagram: request.instagram,
                website: request.website,
                facebook: request.facebook,
                image: request.image,
                logo: request.logo,
                address: request.location || '', // Explicitly mapping to address column from schema
                location_mode: request.location_type === 'zone' ? 'zone' : 'exact_address',
                city: request.city || request.zone || '',
                zone: request.zone || '',
                region_code: request.region_code || 'tdf', // Fallback to 'tdf' to satisfy FK if missing
                coordinates: request.coordinates,
                venue_type: request.venue_type || 'physical',
                subscription_plan: request.subscription_plan || 'free',
                service_delivery: request.service_delivery,
                service_pickup: request.service_pickup,
                service_arrangement: request.service_arrangement,
                hours: request.hours || '',
                schedule: request.days_open || {
                    monday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
                    tuesday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
                    wednesday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
                    thursday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
                    friday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
                    saturday: { isOpen: true, ranges: [{ start: "10:00", end: "14:00" }] },
                    sunday: { isOpen: false, ranges: [] },
                },
                rating: 0,
                review_count: 0,
                is_open: true // Default to open
            }

            // 2. Insert into Venues
            const { error: insertError } = await supabase
                .from("venues")
                .insert([venueData])

            if (insertError) throw insertError

            // 3. Update Request Status to Approved
            const { error: updateError } = await supabase
                .from("venue_requests")
                .update({ status: 'approved' })
                .eq('id', request.id)

            if (updateError) throw updateError

            toast({
                title: "Local creado exitosamente",
                description: `Se ha creado el local ${request.name
                    } y aprobado la solicitud.`
            })

            fetchRequests()

        } catch (error: any) {
            console.error("Error approving request:", JSON.stringify(error, null, 2))

            let errorMessage = "Ocurrió un error al crear el local."
            if (error?.code === '23505') {
                errorMessage = "Ya existe un registro con información duplicada (ej. nombre o slug)."
            } else if (error?.message) {
                errorMessage = error.message
            }

            toast({
                variant: "destructive",
                title: "Error al aprobar",
                description: errorMessage
            })
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    const pendingRequests = requests.filter(r => r.status === 'pending')
    const historyRequests = requests.filter(r => r.status !== 'pending')

    const RequestsTable = ({ data }: { data: VenueRequest[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rubro</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No hay solicitudes en esta sección.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell>{format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell>{request.category}</TableCell>
                            <TableCell>{request.phone}</TableCell>
                            <TableCell>
                                <Badge variant={request.status === "pending" ? "secondary" : request.status === "approved" ? "default" : "destructive"}>
                                    {request.status === "pending" ? "Pendiente" : request.status === "approved" ? "Aprobado" : "Rechazado"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Detalle de Solicitud</DialogTitle>
                                            <DialogDescription>
                                                Solicitud recibida el {format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid grid-cols-2 gap-6 py-4">
                                            {/* Owner Info */}
                                            <div className="col-span-2 md:col-span-1 space-y-4">
                                                <h3 className="font-semibold text-lg border-b pb-2">Datos del Dueño</h3>
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground block">Nombre</span>
                                                    <p>{request.owner_name || '-'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground block">Email</span>
                                                    <p>{request.owner_email || '-'}</p>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="col-span-2 md:col-span-1 space-y-4">
                                                <h3 className="font-semibold text-lg border-b pb-2">Contacto</h3>
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground block">WhatsApp</span>
                                                    <p>{request.whatsapp || request.phone || '-'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground block">Redes</span>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {request.instagram && <Badge variant="outline">IG: {request.instagram}</Badge>}
                                                        {request.website && <Badge variant="outline">Web</Badge>}
                                                        {request.facebook && <Badge variant="outline">FB</Badge>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Venue Info */}
                                            <div className="col-span-2 space-y-4">
                                                <h3 className="font-semibold text-lg border-b pb-2">Datos del Local</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <span className="text-xs text-muted-foreground block">Nombre</span>
                                                        <p className="font-medium">{request.name}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs text-muted-foreground block">Rubro</span>
                                                        <p>{request.category === 'other' ? request.custom_category : request.category}</p>
                                                    </div>
                                                    <div className="space-y-1 col-span-2">
                                                        <span className="text-xs text-muted-foreground block">Descripción</span>
                                                        <p className="text-sm">{request.description}</p>
                                                    </div>

                                                    {/* Location */}
                                                    <div className="col-span-2 bg-muted/30 p-3 rounded-md">
                                                        <h4 className="font-medium text-sm mb-2">Ubicación</h4>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div><span className="text-xs text-muted-foreground">Dirección:</span> {request.location}</div>
                                                            <div><span className="text-xs text-muted-foreground">Tipo:</span> {request.location_type}</div>
                                                            <div><span className="text-xs text-muted-foreground">Zona:</span> {request.zone}</div>
                                                            <div><span className="text-xs text-muted-foreground">Región:</span> {request.region_code}</div>
                                                            {request.coordinates?.lat && (
                                                                <div className="col-span-2 text-xs font-mono mt-1">
                                                                    Coords: {request.coordinates.lat?.toFixed(5)}, {request.coordinates.lng?.toFixed(5)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Images */}
                                                    {(request.image || request.logo) && (
                                                        <div className="col-span-2 flex gap-4 mt-2">
                                                            {request.logo && (
                                                                <div className="text-center">
                                                                    <span className="text-xs block mb-1">Logo</span>
                                                                    <img src={request.logo} alt="Logo" className="w-16 h-16 rounded-full object-cover border mx-auto" />
                                                                </div>
                                                            )}
                                                            {request.image && (
                                                                <div className="text-center">
                                                                    <span className="text-xs block mb-1">Portada</span>
                                                                    <img src={request.image} alt="Portada" className="w-48 h-24 rounded object-cover border mx-auto" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Diagnostic */}
                                            <div className="col-span-2 pt-2">
                                                <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Diagnóstico</h3>
                                                <div className="flex gap-4 text-xs">
                                                    <Badge variant="secondary">Visibilidad: {request.visibility}</Badge>
                                                    <Badge variant="secondary">Fricción: {request.friction}</Badge>
                                                    <Badge variant="secondary">Seguridad: {request.security}</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                            {request.status === 'pending' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive">Rechazar</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Rechazar solicitud?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción cambiará el estado de la solicitud a "Rechazado". No se creará ningún local.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleReject(request)} className="bg-red-600 text-white hover:bg-red-700 border-red-600">
                                                                Confirmar Rechazo
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}

                                            {request.status === 'pending' && (
                                                <Button
                                                    onClick={() => handleApprove(request)}
                                                    disabled={processingId === request.id}
                                                >
                                                    {processingId === request.id ? (
                                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando</>
                                                    ) : (
                                                        "Aprobar y Crear Local"
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {request.status === "pending" && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                <Ban className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Rechazar solicitud?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción cambiará el estado de la solicitud a "Rechazado".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleReject(request)} className="bg-red-600 text-white hover:bg-red-700 border-red-600">
                                                    Rechazar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Ingreso</h1>
            </div>

            <Accordion type="multiple" defaultValue={["pending"]}>
                <AccordionItem value="pending">
                    <AccordionTrigger className="text-lg font-semibold px-4">
                        Pendientes ({pendingRequests.length})
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                        <Card>
                            <CardContent className="p-0">
                                <RequestsTable data={pendingRequests} />
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="history">
                    <AccordionTrigger className="text-lg font-semibold px-4">
                        Historial ({historyRequests.length})
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                        <Card>
                            <CardContent className="p-0">
                                <RequestsTable data={historyRequests} />
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
