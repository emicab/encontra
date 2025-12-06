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
import { Loader2, Eye } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

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
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<VenueRequest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRequests()
    }, [])

    async function fetchRequests() {
        try {
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

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Ingreso</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leads Recientes</CardTitle>
                </CardHeader>
                <CardContent>
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
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No hay solicitudes aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>{format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                                        <TableCell className="font-medium">{request.name}</TableCell>
                                        <TableCell>{request.category}</TableCell>
                                        <TableCell>{request.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                                                {request.status === "pending" ? "Pendiente" : request.status === "approved" ? "Aprobado" : "Rechazado"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Detalle de Solicitud</DialogTitle>
                                                        <DialogDescription>
                                                            Enviado el {format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid grid-cols-2 gap-4 py-4">
                                                        <div className="space-y-1">
                                                            <h4 className="font-semibold">Negocio</h4>
                                                            <p className="text-sm">{request.name}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-semibold">Rubro</h4>
                                                            <p className="text-sm">{request.category}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-semibold">Teléfono</h4>
                                                            <p className="text-sm">{request.phone}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-semibold">Ubicación</h4>
                                                            <p className="text-sm">{request.location || "No especificada"}</p>
                                                        </div>
                                                        <div className="col-span-2 space-y-1">
                                                            <h4 className="font-semibold">Descripción</h4>
                                                            <p className="text-sm text-muted-foreground">{request.description}</p>
                                                        </div>

                                                        <div className="col-span-2 border-t pt-4 mt-2">
                                                            <h4 className="font-semibold mb-2">Diagnóstico</h4>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="p-3 bg-muted rounded-lg">
                                                                    <span className="text-xs font-medium text-muted-foreground block mb-1">Visibilidad</span>
                                                                    <span className="text-sm font-semibold">{request.visibility}</span>
                                                                </div>
                                                                <div className="p-3 bg-muted rounded-lg">
                                                                    <span className="text-xs font-medium text-muted-foreground block mb-1">Fricción</span>
                                                                    <span className="text-sm font-semibold">{request.friction}</span>
                                                                </div>
                                                                <div className="p-3 bg-muted rounded-lg">
                                                                    <span className="text-xs font-medium text-muted-foreground block mb-1">Seguridad</span>
                                                                    <span className="text-sm font-semibold">{request.security}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
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
