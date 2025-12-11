"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Ticket, Users, Star, ClipboardList, Loader2 } from "lucide-react"

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalVenues: 0,
        totalCoupons: 0,
        pendingRequests: 0,
        totalReviews: 0,
        avgRating: "0.0"
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                // 1. Total Venues & Reviews Stats
                const { data: venuesData, error: venuesError } = await supabase
                    .from('venues')
                    .select('review_count, rating')

                if (venuesError) throw venuesError

                const totalVenues = venuesData?.length || 0
                const totalReviews = venuesData?.reduce((acc, v) => acc + (v.review_count || 0), 0) || 0
                const avgRating = totalVenues > 0
                    ? (venuesData?.reduce((acc, v) => acc + (v.rating || 0), 0) / totalVenues).toFixed(1)
                    : "0.0"

                // 2. Active Coupons
                const { count: couponsCount, error: couponsError } = await supabase
                    .from('coupons')
                    .select('*', { count: 'exact', head: true })

                if (couponsError) throw couponsError

                // 3. Pending Requests
                const { count: requestsCount, error: requestsError } = await supabase
                    .from('venue_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending')

                if (requestsError) throw requestsError

                setStats({
                    totalVenues,
                    totalCoupons: couponsCount || 0,
                    pendingRequests: requestsCount || 0,
                    totalReviews,
                    avgRating
                })

            } catch (error) {
                console.error("Error fetching admin stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Locales</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalVenues}</div>
                    <p className="text-xs text-muted-foreground">Registros activos</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                    <p className="text-xs text-muted-foreground">Requieren aprobación</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cupones Activos</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCoupons}</div>
                    <p className="text-xs text-muted-foreground">Ofertas disponibles</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.avgRating}</div>
                    <p className="text-xs text-muted-foreground">Basado en {stats.totalReviews} reseñas</p>
                </CardContent>
            </Card>
        </div>
    )
}
