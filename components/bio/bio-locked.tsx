import Link from "next/link"
import { Lock, Crown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BioLockedProps {
    venueName: string
    region: string
    city: string
    slug: string
}

export function BioLocked({ venueName, region, city, slug }: BioLockedProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-6 relative overflow-hidden border border-gray-100">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50" />

                <div className="relative">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                        <Lock className="w-8 h-8 text-gray-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Bio Inteligente
                    </h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        La funcionalidad de enlace inteligente es exclusiva para negocios con <strong>Plan Full</strong>.
                    </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-left space-y-3">
                    <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                        <Crown className="w-4 h-4 fill-amber-600 text-amber-600" />
                        Beneficios Premium:
                    </h3>
                    <ul className="text-xs text-amber-800 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500">✓</span>
                            Enlace único para Instagram/TikTok.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500">✓</span>
                            Muestra horarios en tiempo real.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500">✓</span>
                            Botones directos a WhatsApp y Mapa.
                        </li>
                    </ul>
                </div>

                <div className="space-y-3 pt-2">
                    <Link href={`/${region}/${city}/${slug}/planes`} className="block w-full">
                        <Button className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white shadow-lg h-12 rounded-xl text-sm gap-2">
                            Mejorar mi Plan <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>

                    <Link href={`/${region}/${city}/${slug}`} className="block w-full">
                        <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900 h-12 rounded-xl text-sm">
                            Volver al local
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
