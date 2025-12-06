"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { coupons as mockCoupons, type Coupon } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { Plus, Pencil, Trash2, Calendar, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchCoupons()
    }, [])

    async function fetchCoupons() {
        try {
            const { data: couponsData, error: couponsError } = await supabase
                .from("coupons")
                .select("*")
                .order("created_at", { ascending: false })

            if (couponsError) throw couponsError

            // Fetch venues to map names
            const { data: venuesData, error: venuesError } = await supabase
                .from("venues")
                .select("id, name")

            if (venuesError) throw venuesError

            const venuesMap = new Map(venuesData.map((v: any) => [v.id, v.name]))

            if (couponsData) {
                const mappedCoupons: Coupon[] = couponsData.map((c: any) => ({
                    id: c.id,
                    venueId: c.venue_id,
                    venueName: (() => {
                        const name = venuesMap.get(c.venue_id);
                        return typeof name === 'object' ? name.es || name.en || "Unknown" : name || "Unknown";
                    })(),
                    code: c.code,
                    discount: c.discount,
                    type: c.type,
                    description: c.description,
                    validUntil: c.valid_until,
                    image: c.image,
                }))
                setCoupons(mappedCoupons)
            }
        } catch (error) {
            console.error("Error fetching coupons:", error)
            toast({
                title: "Error",
                description: "Error al cargar los cupones.",
                variant: "destructive",
            })
            // Fallback to mock data
            setCoupons(mockCoupons)
        } finally {
            setLoading(false)
        }
    }

    async function deleteCoupon(id: string) {
        if (!confirm("¿Estás seguro de que deseas eliminar este cupón?")) return

        try {
            const { error } = await supabase.from("coupons").delete().eq("id", id)
            if (error) throw error

            setCoupons(coupons.filter((c) => c.id !== id))
            toast({
                title: "Éxito",
                description: "Cupón eliminado correctamente.",
            })
        } catch (error) {
            console.error("Error deleting coupon:", error)
            toast({
                title: "Error",
                description: "Error al eliminar el cupón.",
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
                    <h2 className="text-3xl font-bold tracking-tight">Cupones</h2>
                    <p className="text-muted-foreground">Administra cupones de descuento y ofertas.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/coupons/new">
                        <Plus className="mr-2 h-4 w-4" /> Agregar Cupón
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Cupones Activos</CardTitle>
                    <CardDescription>Lista de todos los cupones disponibles para turistas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Local</TableHead>
                                <TableHead>Descuento</TableHead>
                                <TableHead>Válido Hasta</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="font-mono font-bold bg-muted px-2 py-1 rounded">{coupon.code}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{coupon.venueName}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{coupon.discount}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {coupon.validUntil}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/coupons/${coupon.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => deleteCoupon(coupon.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
