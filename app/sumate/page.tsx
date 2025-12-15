import Link from "next/link"
import { Check, ArrowRight, Store, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { headers } from "next/headers"
import { LocationRotator } from "@/components/sumate/location-rotator"

export default async function SumateLandingPage() {
    const headersList = await headers()
    const city = headersList.get("x-vercel-ip-city")
    const region = headersList.get("x-vercel-ip-country-region")

    // Logic: City -> Region -> Country
    // decoding URI component to handle special characters if any
    let locationName = "Argentina"
    if (city) {
        try {
            locationName = decodeURIComponent(city)
        } catch (e) {
            locationName = city
        }
    } else if (region) {
        try {
            locationName = decodeURIComponent(region)
        } catch (e) {
            locationName = region
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30">
            {/* Navbar Placeholder/Back Button could go here if needed, but keeping it clean for conversion */}

            <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">Oferta de Lanzamiento</span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 flex flex-col md:block items-center">
                    Sumá tu negocio a la guía digital de <LocationRotator initialLocation={locationName} />
                </h1>

                {/* Subheadline / Hook */}
                <div className="max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <p className="text-xl text-slate-300 leading-relaxed mb-6">
                        Al registrarte hoy, te regalamos <strong className="text-white">30 días del Plan Comercio (Full)</strong> para que pruebes todo el potencial sin compromiso.
                    </p>

                    <ul className="inline-block text-left space-y-3 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                        <li className="flex items-center gap-3 text-slate-200">
                            <div className="p-1 bg-green-500/20 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                            <span>WhatsApp Directo en tu perfil.</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-200">
                            <div className="p-1 bg-green-500/20 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                            <span>Catálogo de Productos ilimitado.</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-200">
                            <div className="p-1 bg-green-500/20 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                            <span>Publicación de Búsquedas Laborales.</span>
                        </li>
                    </ul>
                </div>

                {/* CTA */}
                <div className="animate-in fade-in zoom-in duration-700 delay-300">
                    <Button asChild size="lg" className="text-lg px-8 py-8 rounded-full bg-white text-slate-950 hover:bg-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1">
                        <Link href="/sumate/nuevo" className="flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            Crear Cuenta y Perfil
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </Link>
                    </Button>
                    <p className="mt-4 text-sm text-slate-500">
                        No requiere tarjeta de crédito.
                    </p>
                </div>

            </div>
        </div>
    )
}
