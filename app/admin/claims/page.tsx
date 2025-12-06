"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, Store, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ClaimRequest {
    id: string
    created_at: string
    status: 'pending' | 'approved' | 'rejected'
    user_id: string
    venue_id: string
    user_email?: string
    venue_name?: string
}

export default function ClaimsPage() {
    const [requests, setRequests] = useState<ClaimRequest[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchRequests()
    }, [])

    async function fetchRequests() {
        try {
            // Fetch requests
            const { data: requestsData, error } = await supabase
                .from("claim_requests")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error

            if (requestsData) {
                // Enrich with user and venue data
                // Note: In a real app, we would use a join query if relations are set up correctly in Supabase
                // Or fetch separately. For simplicity, we'll fetch details for each request.
                const enrichedRequests = await Promise.all(requestsData.map(async (req) => {
                    const { data: userData } = await supabase.from("profiles").select("email").eq("id", req.user_id).single()
                    const { data: venueData } = await supabase.from("venues").select("name").eq("id", req.venue_id).single()

                    return {
                        ...req,
                        user_email: userData?.email || "Email desconocido",
                        venue_name: venueData?.name || "Local desconocido"
                    }
                }))
                setRequests(enrichedRequests)
            }
        } catch (error) {
            console.error("Error fetching claims:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar las solicitudes.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleAction(id: string, action: 'approved' | 'rejected', venueId: string, userId: string) {
        try {
            // 1. Update request status
            const { error: updateError } = await supabase
                .from("claim_requests")
                .update({ status: action })
                .eq("id", id)

            if (updateError) throw updateError

            // 2. If approved, update venue owner
            if (action === 'approved') {
                const { error: venueError } = await supabase
                    .from("venues")
                    .update({ owner_id: userId })
                    .eq("id", venueId)

                if (venueError) throw venueError
            }

            // Update local state
            setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r))

            toast({
                title: action === 'approved' ? "Solicitud Aprobada" : "Solicitud Rechazada",
                description: action === 'approved' ? "El usuario ahora es dueño del local." : "La solicitud ha sido rechazada.",
            })

        } catch (error) {
            console.error("Error updating claim:", error)
            toast({
                title: "Error",
                description: "No se pudo actualizar la solicitud.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Solicitudes de Reclamo</h2>
                <p className="text-muted-foreground">Gestiona las solicitudes de dueños para reclamar sus locales.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes Pendientes</CardTitle>
                    <CardDescription>Revisa y aprueba las solicitudes de propiedad.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Local</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No hay solicitudes pendientes.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            {format(new Date(request.created_at), "d MMM yyyy", { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {request.user_email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Store className="h-4 w-4 text-muted-foreground" />
                                                {typeof request.venue_name === 'object' ? (request.venue_name as any).es : request.venue_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                request.status === 'approved' ? 'default' :
                                                    request.status === 'rejected' ? 'destructive' : 'secondary'
                                            }>
                                                {request.status === 'approved' ? 'Aprobado' :
                                                    request.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {request.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleAction(request.id, 'approved', request.venue_id, request.user_id)}
                                                        title="Aprobar"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleAction(request.id, 'rejected', request.venue_id, request.user_id)}
                                                        title="Rechazar"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
