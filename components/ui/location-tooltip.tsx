"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationTooltipProps {
    onClose: () => void
    targetRef?: React.RefObject<HTMLElement>
}

export function LocationTooltip({ onClose }: LocationTooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show tooltip after a short delay
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 2000)

        // Auto-close after 8 seconds
        const autoCloseTimer = setTimeout(() => {
            handleClose()
        }, 10000)

        return () => {
            clearTimeout(timer)
            clearTimeout(autoCloseTimer)
        }
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => {
            onClose()
        }, 300) // Wait for animation to complete
    }

    if (!isVisible) return null

    return (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-auto sm:top-24 sm:ml-4 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 max-w-sm relative">
                {/* Arrow pointing up */}
                <div className="absolute -top-2 left-8 w-4 h-4 bg-primary rotate-45" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={handleClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="pr-6">
                    <p className="font-semibold text-sm mb-1">💡 ¿Buscás locales cerca tuyo?</p>
                    <p className="text-xs opacity-90">
                        Hacé clic en el selector de ubicación para elegir tu ciudad y ver ofertas cerca de vos
                    </p>
                </div>
            </div>
        </div>
    )
}
