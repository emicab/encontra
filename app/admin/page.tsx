import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { venues, coupons } from "@/lib/data"
import { Store, Ticket, Users, Star } from "lucide-react"

export default function AdminDashboard() {
    const totalVenues = venues.length
    const totalCoupons = coupons.length
    const totalReviews = venues.reduce((acc, venue) => acc + venue.reviewCount, 0)
    const avgRating = (venues.reduce((acc, venue) => acc + venue.rating, 0) / totalVenues).toFixed(1)

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Locales</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalVenues}</div>
                    <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cupones Activos</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCoupons}</div>
                    <p className="text-xs text-muted-foreground">+1 nuevo esta semana</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Reseñas</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalReviews}</div>
                    <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgRating}</div>
                    <p className="text-xs text-muted-foreground">Basado en {totalReviews} reseñas</p>
                </CardContent>
            </Card>
        </div>
    )
}
