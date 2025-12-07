"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"



interface MapProps {
    center: [number, number]
    zoom?: number
    markers?: Array<{
        id: string
        position: [number, number]
        title: string
    }>
    onLocationSelect?: (lat: number, lng: number) => void
}

function LocationMarker({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect?.(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

export default function Map({ center, zoom = 13, markers = [], onLocationSelect }: MapProps) {
    const [isMounted, setIsMounted] = useState(false)

    const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                Loading Map...
            </div>
        )
    }

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full rounded-xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center} icon={icon}>
                {markers.length === 0 && <Popup>Location</Popup>}
            </Marker>
            {markers.map((marker) => (
                <Marker key={marker.id} position={marker.position} icon={icon}>
                    <Popup>{marker.title}</Popup>
                </Marker>
            ))}
            <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
    )
}
