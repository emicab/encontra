"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, ExternalLink, Zap, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

interface BioLinkCardProps {
    slug: string
    baseUrl?: string
}

export function BioLinkCard({ slug, baseUrl }: BioLinkCardProps) {
    const [copied, setCopied] = useState(false)

    // Fallback to window location if baseUrl not provided (client-side)
    const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
    const bioUrl = `${origin}/bio/${slug}`
    // Short display URL (without protocol)
    const displayUrl = bioUrl.replace(/^https?:\/\//, '')

    const handleCopy = () => {
        navigator.clipboard.writeText(bioUrl)
        setCopied(true)
        toast.success("Enlace copiado al portapapeles")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-200 dark:border-indigo-800">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-600 dark:text-indigo-400">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Tu Bio Link</CardTitle>
                        <CardDescription>
                            Un enlace único con toda la información de tu local. ideal para Instagram.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="bio-link">Enlace público</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    id="bio-link"
                                    value={bioUrl}
                                    readOnly
                                    className="pr-10 bg-white/50 dark:bg-background/50 font-medium text-indigo-700 dark:text-indigo-300"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopy}
                                title="Copiar enlace"
                                className={copied ? "text-green-600 border-green-600" : ""}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button variant="default" size="icon" asChild title="Ver página">
                                <a href={`/bio/${slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground bg-white/50 dark:bg-background/50 p-3 rounded-md border border-dashed">
                        <span className="font-semibold text-foreground">Tip:</span> Pegá este enlace en la biografía de tu Instagram para que tus seguidores puedan ver horarios, menú, ubicación y más.
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
