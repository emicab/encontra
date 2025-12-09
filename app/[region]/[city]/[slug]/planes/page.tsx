
import { notFound } from "next/navigation"
import { getVenue } from "@/lib/services"
import { PLANS } from "@/lib/business-logic"
import { Check, X, Star, Crown, Store } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ region: string; city: string; slug: string }>
}

export default async function VenuePlansPage({ params }: Props) {
    const { region, slug } = await params
    const { venue } = await getVenue(region, slug)

    if (!venue) {
        notFound()
    }

    // Security check: Only visible if venue has an assigned owner
    // if (!venue.ownerId) {
    //    notFound()
    // }

    const currentPlanKey = venue.subscriptionPlan

    const plansList = Object.entries(PLANS).map(([key, plan]) => ({
        key,
        ...plan
    }))

    // Sort: free, basic, premium (assuming insertion order in PLANS object, or enforce it)
    // PLANS is defined as free, basic, premium in business-logic.ts, so existing order is fine.

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href={`/${region}/${slug}`} className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                        ← Volver al local
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 truncate flex-1">
                        Planes para {venue.name}
                    </h1>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4">
                        Potenciá tu {venue.category === 'service' ? 'servicio' : 'negocio'}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Elegí el plan que mejor se adapte a tus necesidades y empezá a destacar en Encontrá.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plansList.map(({ key, name, price, features }) => {
                        const isCurrent = currentPlanKey === key
                        const isPremium = key === 'premium'

                        return (
                            <div
                                key={key}
                                className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${isCurrent ? 'ring-2 ring-black shadow-xl scale-[1.02] bg-white' : 'bg-white border border-gray-200 hover:shadow-lg'}`}
                            >
                                {isCurrent && (
                                    <div className="bg-black text-white text-xs font-bold uppercase tracking-wider py-1.5 text-center">
                                        Tu Plan Actual
                                    </div>
                                )}
                                {isPremium && !isCurrent && (
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 text-center">
                                        Más Popular
                                    </div>
                                )}

                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${key === 'free' ? 'bg-gray-100 text-gray-600' : key === 'basic' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {key === 'free' && <Store size={24} />}
                                            {key === 'basic' && <Star size={24} />}
                                            {key === 'premium' && <Crown size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{name}</h3>
                                            <div className="flex items-baseline gap-1">
                                                {price === 0 ? (
                                                    <span className="text-2xl font-bold text-gray-900">Gratis</span>
                                                ) : (
                                                    <>
                                                        <span className="text-2xl font-bold text-gray-900">${price.toLocaleString('es-AR')}</span>
                                                        <span className="text-sm text-gray-500">/mes</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100 my-6" />

                                    <ul className="space-y-4 mb-8 flex-1">
                                        <PlanFeature label="Perfil Básico en Directorio" included={true} />

                                        <PlanFeature
                                            label="Botón de WhatsApp Directo"
                                            included={features.whatsapp}
                                        />
                                        <PlanFeature
                                            label="Redes Sociales (Link)"
                                            included={features.socials}
                                        />
                                        <PlanFeature
                                            label={
                                                features.productsLimit === 0 ? "Sin catálogo de productos" :
                                                    features.productsLimit === -1 ? "Catálogo Ilimitado" : // Assuming -1 or large number in business logic for "unlimited", logic here handles 50 as large
                                                        features.productsLimit > 20 ? "Catálogo Ilimitado" : // Adjust display logic based on feature.md
                                                            `Catálogo hasta ${features.productsLimit} productos`
                                            }
                                            included={features.productsLimit > 0}
                                        />
                                        <PlanFeature
                                            label="Insignia de Verificado"
                                            included={features.verified}
                                        />
                                        <PlanFeature
                                            label="Cupones de Descuento"
                                            included={features.coupons}
                                        />
                                        <PlanFeature
                                            label="Aparecer en Destacados"
                                            included={features.featured}
                                            highlight={true}
                                        />
                                        <PlanFeature
                                            label="Galería de Fotos"
                                            included={true}
                                            subLabel={`Hasta ${features.galleryLimit} fotos`}
                                        />
                                    </ul>

                                    <div className="mt-auto">
                                        {isCurrent ? (
                                            <button disabled className="w-full py-3 px-4 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-not-allowed">
                                                Plan Activo
                                            </button>
                                        ) : (
                                            <a
                                                href={`https://wa.me/5492901602434?text=Hola,%20quiero%20mejorar%20mi%20plan%20para%20${venue.name}%20a%20${name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block w-full text-center py-3 px-4 rounded-xl font-medium transition-colors ${isPremium ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                                            >
                                                {price === 0 ? 'Cambiar a este plan' : 'Mejorar Plan'}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}

function PlanFeature({ label, included, highlight = false, subLabel }: { label: string, included: boolean, highlight?: boolean, subLabel?: string }) {
    return (
        <li className="flex items-start gap-3">
            <div className={`mt-0.5 min-w-[20px] ${included ? (highlight ? 'text-amber-500' : 'text-green-500') : 'text-gray-300'}`}>
                {included ? <Check size={20} strokeWidth={2.5} /> : <X size={20} />}
            </div>
            <div className="flex-1">
                <span className={`text-sm ${included ? 'text-gray-700 font-medium' : 'text-gray-400 decoration-slate-400'}`}>
                    {label}
                </span>
                {subLabel && <p className="text-xs text-gray-500 mt-0.5">{subLabel}</p>}
            </div>
        </li>
    )
}
