"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Globe, Share2, Instagram, Facebook, Store, UserPlus, Briefcase } from "lucide-react"
import Link from "next/link"

export function EncontraBioView() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden min-h-[100dvh]">
            {/* 1. Header with Cover & Profile */}
            <div className="relative">
                {/* Cover Image - Using a gradient for Encontrá */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
                </div>

                {/* Profile Info Card - Overlapping Cover */}
                <div className="px-6 -mt-12 relative z-10 text-center">
                    <div className="inline-block p-1 bg-white rounded-full shadow-md mb-3">
                        <img
                            src="/logo.png" // Assuming there is a logo asset, or we use a placeholder/icon
                            alt="Encontrá"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white bg-gray-100 p-2"
                        />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                        Encontrá
                    </h1>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-6">
                        La guía para locales, emprendedores y servicios
                    </p>
                </div>
            </div>

            {/* 2. Main Actions */}
            <div className="px-6 space-y-3 flex-1">

                {/* Main CTA */}
                <Button asChild className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg flex items-center justify-between px-6 text-lg font-bold transition-all transform group-active:scale-[0.98]">
                    <Link href="/" className="group w-full flex items-center justify-between">
                        <span className="flex items-center gap-3">
                            <Globe size={24} />
                            Ir al Sitio Web
                        </span>
                        <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </Button>

                <div className="grid grid-cols-1 gap-3">
                    <Button asChild variant="secondary" className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl gap-2 font-medium justify-start px-6">
                        <Link href="/sumate">
                            <Store size={18} />
                            Sumá tu Negocio
                        </Link>
                    </Button>


                    <Button asChild variant="secondary" className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl gap-2 font-medium justify-start px-6">
                        <Link href="/admin">
                            <UserPlus size={18} />
                            Ingreso Socios / Admin
                        </Link>
                    </Button>

                    <Button asChild variant="secondary" className="w-full h-12 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl gap-2 font-medium justify-start px-6 border border-blue-100">
                        <Link href="/publicar-empleo">
                            <Briefcase size={18} />
                            ¿Querés publicar un empleo?
                        </Link>
                    </Button>
                </div>

                {/* Social Row */}
                <div className="flex items-center justify-center gap-4 py-6">
                    <a href="https://instagram.com/encontra.guia" target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-pink-600 hover:bg-pink-50 transition-colors">
                        <Instagram size={24} />
                    </a>
                    <a href="https://facebook.com/encontra.guia" target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-blue-600 hover:bg-blue-50 transition-colors">
                        <Facebook size={24} />
                    </a>
                    {/* Placeholder for WhatsApp if needed, commented out for now 
                    <a href="https://wa.me/..." target="_blank" className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-green-600 hover:bg-green-50 transition-colors">
                        <MessageCircle size={24} />
                    </a>
                    */}
                    <button className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors" onClick={() => {
                        if (navigator.share) {
                            navigator.share({ title: "Encontrá", url: window.location.href });
                        }
                    }}>
                        <Share2 size={24} />
                    </button>
                </div>
            </div>

            {/* 3. Footer */}
            <footer className="py-6 text-center border-t border-gray-100 bg-white mt-auto">
                <Link href="/" className="inline-flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-gray-900">Encontrá</span>
                    <span className="text-[10px] text-gray-500">Bio Link</span>
                </Link>
            </footer>
        </div>
    )
}
