"use client"

import { useState } from "react"
import { MapPin, Navigation, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { REGIONS } from "@/lib/regions"
import { useToast } from "@/components/ui/use-toast"
import { t } from "@/lib/i18n"
import { useRouter } from "next/navigation"

export function RegionGateway() {
    const [isLocating, setIsLocating] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const handleManualSelect = (code: string) => {
        router.push(`/${code}`)
    }

    const handleGeolocation = () => {
        setIsLocating(true)
        if (!navigator.geolocation) {
            toast({
                title: "Error",
                description: "Tu navegador no soporta geolocalización.",
                variant: "destructive"
            })
            setIsLocating(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords
                    // Reverse geocoding with OpenStreetMap Nominatim (Free, no key required for low volume)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    )
                    const data = await response.json()

                    if (data && data.address) {
                        const state = data.address.state || data.address.province || ""
                        console.log("Detected State:", state)

                        // Simple matching logic
                        // We need to match "Tierra del Fuego, Antártida..." to "tdf"
                        // or "Córdoba" to "cba"
                        const foundCode = Object.keys(REGIONS).find(key => {
                            const name = REGIONS[key].toLowerCase()
                            return state.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(state.toLowerCase())
                        })

                        if (foundCode) {
                            toast({
                                title: "¡Te encontramos!",
                                description: `Redirigiendo a ${REGIONS[foundCode]}...`,
                            })
                            handleManualSelect(foundCode)
                        } else {
                            throw new Error("Provincia no soportada aún o no detectada correctamente.")
                        }
                    } else {
                        throw new Error("No pudimos determinar tu provincia.")
                    }
                } catch (error) {
                    console.error(error)
                    toast({
                        title: "No pudimos ubicarte automáticamente",
                        description: "Por favor seleccioná tu provincia de la lista.",
                        variant: "destructive"
                    })
                } finally {
                    setIsLocating(false)
                }
            },
            (error) => {
                console.error(error)
                let msg = "No pudimos acceder a tu ubicación."
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Permiso de ubicación denegado. Por favor elegí manualmente."
                }
                toast({
                    title: "Ubicación no disponible",
                    description: msg,
                    variant: "destructive"
                })
                setIsLocating(false)
            }
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
            <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t.appName}</CardTitle>
                    <CardDescription className="text-base">
                        Elegí tu ubicación para ver los mejores locales cerca de vos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button
                        size="lg"
                        className="w-full text-lg h-14 relative overflow-hidden group"
                        onClick={handleGeolocation}
                        disabled={isLocating}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                        {isLocating ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Navigation className="mr-2 h-5 w-5" />
                        )}
                        {isLocating ? "Detectando..." : "Usar mi ubicación actual"}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                O elegí manualmente
                            </span>
                        </div>
                    </div>

                    <Select onValueChange={handleManualSelect}>
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Seleccioná tu provincia..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {Object.entries(REGIONS).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                                <SelectItem key={code} value={code}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="text-center text-sm text-muted-foreground pt-4">
                        <p>¿Querés sumar tu negocio?</p>
                        <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => window.location.href = '/sumate'}>
                            Hacé click acá <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
