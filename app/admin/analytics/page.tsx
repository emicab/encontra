"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QrCode, Loader2, Calendar, MapPin, Building, Eye } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
    const [events, setEvents] = useState<any[]>([])
    const [stats, setStats] = useState({
        totalQrScans: 0,
        todayQrScans: 0,
        totalPageViews: 0,
        totalSourceVisits: 0,
        todaySourceVisits: 0,
        topSources: [] as { name: string, count: number }[],
        topVenues: [] as { name: string, count: number }[],
        topCities: [] as { name: string, count: number }[],
        topRegions: [] as { name: string, count: number }[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    async function fetchAnalytics() {
        try {
            const { data, error } = await supabase
                .from('analytics_events')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setEvents(data)

                // Calculate Stats
                const qrScans = data.filter(e => e.event_name === 'qr_scan')
                const pageViews = data.filter(e => e.event_name === 'page_view')
                const sourceVisits = data.filter(e => e.event_name === 'source_visit')

                const today = new Date().toISOString().split('T')[0]
                const todayQrScans = qrScans.filter(e => e.created_at.startsWith(today)).length
                const todaySourceVisits = sourceVisits.filter(e => e.created_at.startsWith(today)).length

                // Group Page Views
                const venues: Record<string, number> = {}
                const cities: Record<string, number> = {}
                const regions: Record<string, number> = {}
                const sources: Record<string, number> = {}

                pageViews.forEach(v => {
                    const meta = v.metadata || {}
                    if (meta.type === 'venue' && meta.slug) {
                        venues[meta.slug] = (venues[meta.slug] || 0) + 1
                    }
                    if (meta.type === 'city' && meta.city) {
                        cities[meta.city] = (cities[meta.city] || 0) + 1
                    }
                    if (meta.type === 'region' && meta.region) {
                        regions[meta.region] = (regions[meta.region] || 0) + 1
                    }
                })

                // Group Source Visits
                sourceVisits.forEach(v => {
                    const source = v.source || 'unknown'
                    sources[source] = (sources[source] || 0) + 1
                })

                const topVenues = Object.entries(venues)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                const topCities = Object.entries(cities)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                const topRegions = Object.entries(regions)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                const topSources = Object.entries(sources)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)

                setStats({
                    totalQrScans: qrScans.length,
                    todayQrScans,
                    totalPageViews: pageViews.length,
                    totalSourceVisits: sourceVisits.length,
                    todaySourceVisits,
                    topSources,
                    topVenues,
                    topCities,
                    topRegions
                })
            }

        } catch (error) {
            console.error("Error fetching analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Analíticas</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas con Source</CardTitle>
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSourceVisits}</div>
                        <p className="text-xs text-muted-foreground">Total histórico</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas Hoy</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todaySourceVisits}</div>
                        <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vistas de Página</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPageViews}</div>
                        <p className="text-xs text-muted-foreground">Regiones, Ciudades, Locales</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Escaneos QR (Legacy)</CardTitle>
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQrScans}</div>
                        <p className="text-xs text-muted-foreground">Tracker anterior</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="sources">Fuentes de Tráfico</TabsTrigger>
                    <TabsTrigger value="venues">Top Locales</TabsTrigger>
                    <TabsTrigger value="cities">Top Ciudades</TabsTrigger>
                    <TabsTrigger value="history">Historial Completo</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Fuentes</CardTitle>
                                <CardDescription>Campañas más efectivas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.topSources.slice(0, 5).map((v, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <span className="font-medium truncate max-w-[150px]">{v.name}</span>
                                        <span className="font-bold">{v.count}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Locales</CardTitle>
                                <CardDescription>Más visitados</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.topVenues.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <span className="font-medium truncate max-w-[150px]">{v.name}</span>
                                        <span className="font-bold">{v.count}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Ciudades</CardTitle>
                                <CardDescription>Más visitadas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.topCities.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <span className="font-medium">{normalizeCityName(v.name)}</span>
                                        <span className="font-bold">{v.count}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Regiones</CardTitle>
                                <CardDescription>Más visitadas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.topRegions.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <span className="font-medium">{v.name}</span>
                                        <span className="font-bold">{v.count}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="sources">
                    <Card>
                        <CardHeader><CardTitle>Fuentes de Tráfico</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fuente</TableHead>
                                        <TableHead className="text-right">Visitas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.topSources.map((v, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{v.name}</TableCell>
                                            <TableCell className="text-right">{v.count}</TableCell>
                                        </TableRow>
                                    ))}
                                    {stats.topSources.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                                                No hay visitas con source registradas aún.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="venues">
                    <Card>
                        <CardHeader><CardTitle>Ranking de Locales</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Local (Slug)</TableHead>
                                        <TableHead className="text-right">Vistas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.topVenues.map((v, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{v.name}</TableCell>
                                            <TableCell className="text-right">{v.count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cities">
                    <Card>
                        <CardHeader><CardTitle>Ranking de Ciudades</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ciudad</TableHead>
                                        <TableHead className="text-right">Vistas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.topCities.map((v, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{normalizeCityName(v.name)}</TableCell>
                                            <TableCell className="text-right">{v.count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Eventos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha y Hora</TableHead>
                                        <TableHead>Evento</TableHead>
                                        <TableHead>Detalle</TableHead>
                                        <TableHead>Ruta</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                {format(new Date(event.created_at), "PPP p", { locale: es })}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {event.event_name === 'qr_scan' ? 'Escaneo QR' :
                                                    event.event_name === 'page_view' ? 'Visita' :
                                                        event.event_name === 'source_visit' ? 'Visita con Source' : event.event_name}
                                            </TableCell>
                                            <TableCell>
                                                {getEventDetail(event)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">{event.path}</TableCell>
                                        </TableRow>
                                    ))}
                                    {events.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                                No hay eventos registrados aún.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function getEventDetail(event: any) {
    if (event.event_name === 'qr_scan') return `Fuente: ${event.source}`
    if (event.event_name === 'source_visit') return `Fuente: ${event.source}`
    if (event.event_name === 'page_view') {
        const meta = event.metadata
        if (meta.type === 'venue') return `Local: ${meta.slug}`
        if (meta.type === 'city') return `Ciudad: ${meta.city}`
        if (meta.type === 'region') return `Región: ${meta.region}`
        return meta.identifier || 'General'
    }
    return '-'
}

function normalizeCityName(city: string) {
    return city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')
}
