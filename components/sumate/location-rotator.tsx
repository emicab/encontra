"use client"

import { useState, useEffect } from "react"

const LOCATIONS = [
    'Buenos Aires',
    'CABA',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
]

export function LocationRotator({ initialLocation }: { initialLocation?: string }) {
    const [index, setIndex] = useState(0)
    const [locations, setLocations] = useState(LOCATIONS)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (initialLocation && initialLocation !== "Argentina") {
            const newLocations = [
                initialLocation,
                ...LOCATIONS.filter(l => l !== initialLocation && l !== "Argentina"),
                "Argentina"
            ]
            setLocations(newLocations)
        }
    }, [initialLocation])

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % locations.length)
        }, 3000) // Change every 3 seconds

        return () => clearInterval(interval)
    }, [locations])

    // Render static content on server/first paint to avoid flicker/mismatch
    if (!mounted) {
        return <span className="text-blue-500 font-bold ml-2">{initialLocation || "Argentina"}.</span>
    }

    return (
        <span className="inline-block min-w-[200px] text-left ml-2">
            <span key={index} className="animate-in slide-in-from-bottom-2 fade-in duration-500 text-blue-500 font-bold block">
                {locations[index]}.
            </span>
        </span>
    )
}
