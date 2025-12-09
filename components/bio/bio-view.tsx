"use client"

import { Venue, Product } from "@/lib/data"
import { checkIsOpen } from "@/lib/business-logic"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, MapPin, Globe, Phone, Clock, Share2, Instagram, Facebook } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BioViewProps {
    venue: Venue
    products: Product[]
    region: string
    city: string
}

export function BioView({ venue, products, region, city }: BioViewProps) {
    const isOpen = checkIsOpen(venue)

    // Helper to format currency
    const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden min-h-[100dvh]">
            {/* 1. Header with Cover & Profile */}
            <div className="relative">
                {/* Cover Image */}
                <div className="h-32 bg-gray-200 overflow-hidden">
                    {venue.image ? (
                        <img src={venue.image} alt="Cover" className="w-full h-full object-cover opacity-80" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900" />
                    )}
                </div>

                {/* Profile Info Card - Overlapping Cover */}
                <div className="px-6 -mt-12 relative z-10 text-center">
                    <div className="inline-block p-1 bg-white rounded-full shadow-md mb-3">
                        <img
                            src={venue.logo || venue.image || "/placeholder.svg"}
                            alt={venue.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white bg-gray-100"
                        />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                        {venue.name}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-3">
                        {venue.category}
                    </p>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100 mb-6">
                        <span className={cn("w-2 h-2 rounded-full animate-pulse", isOpen ? "bg-green-500" : "bg-red-500")} />
                        <span className={cn("text-xs font-semibold", isOpen ? "text-green-700" : "text-red-700")}>
                            {isOpen ? "Abierto Ahora" : "Cerrado"}
                        </span>
                        {!isOpen && venue.openTime && (
                            <span className="text-xs text-gray-400 border-l pl-1.5 ml-0.5">
                                Abre {venue.openTime}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Main Actions (The "Linktree" Buttons) */}
            <div className="px-6 space-y-3 flex-1">
                {venue.whatsapp && (
                    <a
                        href={`https://wa.me/${venue.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full group"
                    >
                        <Button className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl shadow-lg shadow-green-200/50 flex items-center justify-between px-6 text-lg font-bold transition-all transform group-active:scale-[0.98]">
                            <span className="flex items-center gap-3">
                                <MessageCircle size={24} />
                                Enviar WhatsApp
                            </span>
                            <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                        </Button>
                    </a>
                )}

                {venue.locationMode === 'address' && venue.coordinates && (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${venue.coordinates.lat},${venue.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                    >
                        <Button variant="outline" className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 border-gray-200 rounded-xl flex items-center justify-center gap-2 text-base font-medium">
                            <MapPin size={18} className="text-red-500" />
                            Cómo Llegar
                        </Button>
                    </a>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {venue.website && (
                        <a href={venue.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary" className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl gap-2 font-medium">
                                <Globe size={18} />
                                Web
                            </Button>
                        </a>
                    )}
                    {venue.phone && (
                        <a href={`tel:${venue.phone}`}>
                            <Button variant="secondary" className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl gap-2 font-medium">
                                <Phone size={18} />
                                Llamar
                            </Button>
                        </a>
                    )}
                </div>

                {/* Social Row */}
                <div className="flex items-center justify-center gap-4 py-2">
                    {venue.instagram && (
                        <a href={`https://instagram.com/${venue.instagram}`} target="_blank" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-pink-600 hover:bg-pink-50 transition-colors">
                            <Instagram size={24} />
                        </a>
                    )}
                    {venue.facebook && (
                        <a href={`https://facebook.com/${venue.facebook}`} target="_blank" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-blue-600 hover:bg-blue-50 transition-colors">
                            <Facebook size={24} />
                        </a>
                    )}
                    <button className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors" onClick={() => navigator.share({ title: venue.name, url: window.location.href })}>
                        <Share2 size={24} />
                    </button>
                </div>
            </div>

            {/* 3. Highlights (Featured Products) */}
            {products.length > 0 && (
                <div className="mt-6 px-6 pb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                        Destacados
                        <span className="text-xs font-normal text-gray-400">Ver todo →</span>
                    </h3>
                    <div className="space-y-3">
                        {products.slice(0, 3).map(product => (
                            <div key={product.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                                {product.image ? (
                                    <img src={product.image} className="w-16 h-16 rounded-lg object-cover bg-gray-100" alt={product.name} />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin foto</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                                    {product.price && <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(product.price)}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Footer */}
            <footer className="py-6 text-center border-t border-gray-100 bg-white mt-auto">
                <Link href="/" className="inline-flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-gray-900">Encontrá</span>
                    <span className="text-[10px] text-gray-500">Bio Link</span>
                </Link>
            </footer>
        </div>
    )
}
