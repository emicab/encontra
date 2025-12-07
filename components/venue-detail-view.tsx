"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type Venue, type Coupon, type Product } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { t } from "@/lib/i18n"
import { Header } from "@/components/header"
import { CouponCard } from "@/components/coupon-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Clock, Phone, Globe, Share2, Navigation, ArrowLeft, MessageCircle, Instagram, Facebook, Truck, ShoppingBag, Handshake, Flag, Check } from "lucide-react"
import { getVenueFeatures, checkIsOpen } from "@/lib/business-logic"
import { useToast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

const Map = dynamic(() => import("@/components/map"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-xl" />,
})

interface VenueDetailViewProps {
    venue: Venue
    products: Product[]
    coupons: Coupon[]
}

export function VenueDetailView({ venue, products, coupons }: VenueDetailViewProps) {
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [claimStatus, setClaimStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle')
    const { toast } = useToast()

    useEffect(() => {
        checkUser()
    }, [])

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        // Check if user already has a pending request for this venue
        if (user && venue) {
            const { data } = await supabase
                .from("claim_requests")
                .select("status")
                .eq("user_id", user.id)
                .eq("venue_id", venue.id)
                .single()

            if (data) setClaimStatus(data.status as any)
        }
    }

    async function handleClaimRequest() {
        if (!currentUser || !venue) return

        try {
            const { error } = await supabase
                .from("claim_requests")
                .insert([{
                    user_id: currentUser.id,
                    venue_id: venue.id
                }])

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast({
                        title: "Solicitud ya enviada",
                        description: "Ya has solicitado reclamar este local.",
                        variant: "default",
                    })
                    setClaimStatus('pending')
                } else {
                    throw error
                }
            } else {
                toast({
                    title: "Solicitud enviada",
                    description: "El administrador revisará tu solicitud.",
                })
                setClaimStatus('pending')
            }
        } catch (error) {
            console.error("Error claiming venue:", error)
            toast({
                title: "Error",
                description: "No se pudo enviar la solicitud.",
                variant: "destructive",
            })
        }
    }

    const features = getVenueFeatures(venue)
    const isOpenNow = checkIsOpen(venue)

    // Plan Restrictions Logic
    const visibleProducts = products.slice(0, features.productsLimit)
    const showSocials = features.socials
    const showContactActions = features.whatsapp
    const isVerified = features.verified

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header
                searchQuery=""
                onSearchChange={() => { }}
            />

            <main className="container mx-auto px-4 py-6 max-w-4xl">
                <Button variant="ghost" className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    {t.back}
                </Button>

                {/* Hero Image */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-6 shadow-lg">
                    <img
                        src={venue.image || "/placeholder.svg"}
                        alt={venue.name}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Button size="icon" variant="secondary" className="rounded-full shadow-md">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Header Info */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            {venue.logo && (
                                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-background shadow-sm shrink-0">
                                    <img
                                        src={venue.logo}
                                        alt={`${venue.name} Logo`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge>
                                        {t[venue.category as keyof typeof t] || venue.category.charAt(0).toUpperCase() + venue.category.slice(1)}
                                    </Badge>
                                    <Badge variant={isOpenNow ? "default" : "secondary"} className={isOpenNow ? "bg-green-500 text-white hover:bg-green-600" : "bg-muted text-muted-foreground"}>
                                        {isOpenNow ? t.open : t.closed}
                                    </Badge>
                                    {isVerified && (
                                        <Badge variant="outline" className="border-blue-500 text-blue-500 gap-1">
                                            <Check className="h-3 w-3" /> Verificado
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold">{venue.name}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                            <MapPin className="h-4 w-4" />
                            <span>{venue.locationMode === 'zone' ? `Zona: ${venue.zone}` : venue.address}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 bg-warning/10 px-3 py-1 rounded-full">
                            <Star className="h-5 w-5 fill-warning text-warning" />
                            <span className="font-bold text-lg">{venue.rating}</span>
                            <span className="text-muted-foreground text-sm">({venue.reviewCount} {t.reviews})</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {venue.serviceDelivery && (
                                <Badge variant="outline" className="gap-1">
                                    <Truck className="h-3 w-3" /> Delivery
                                </Badge>
                            )}
                            {venue.servicePickup && (
                                <Badge variant="outline" className="gap-1">
                                    <ShoppingBag className="h-3 w-3" /> Pickup
                                </Badge>
                            )}
                            {venue.serviceArrangement && (
                                <Badge variant="outline" className="gap-1">
                                    <Handshake className="h-3 w-3" /> {t.toAgree}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-[2fr_1fr] gap-8">
                    {/* Main Content */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">{t.about}</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {venue.description}
                            </p>
                        </section>

                        {/* Products Section */}
                        {visibleProducts.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-3">{t.menu}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {visibleProducts.map((product) => (
                                        <Card key={product.id} className="overflow-hidden">
                                            <div className="flex h-full">
                                                {product.image && (
                                                    <div className="w-1/3 relative">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name || "Product"}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className={`p-4 flex flex-col justify-between ${product.image ? 'w-2/3' : 'w-full'}`}>
                                                    <div>
                                                        <h3 className="font-semibold">{product.name}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                            {product.description}
                                                        </p>
                                                    </div>
                                                    {product.price && (
                                                        <div className="mt-2 font-bold text-primary">
                                                            ${product.price.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Active Coupons */}
                        {features.coupons && coupons.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-3">{t.coupons}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {coupons.map((coupon) => (
                                        <CouponCard key={coupon.id} coupon={coupon} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Gallery */}
                        {venue.gallery && venue.gallery.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-3">{t.gallery}</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {venue.gallery.slice(0, features.galleryLimit).map((image, i) => (
                                        <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                            <img
                                                src={image}
                                                alt={`Gallery ${i + 1}`}
                                                className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex justify-between w-full">
                                        <span>{t.today}</span>
                                        <span className="font-medium">
                                            {venue.schedule ? (
                                                (() => {
                                                    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
                                                    const today = days[new Date().getDay()]
                                                    const schedule = venue.schedule[today]
                                                    if (!schedule?.isOpen) return <span className="text-red-500">{t.closed}</span>
                                                    return schedule.ranges.map(r => `${r.start} - ${r.end}`).join(", ")
                                                })()
                                            ) : (
                                                `${venue.openTime} - ${venue.closeTime}`
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <Separator />

                                {venue.locationMode === 'address' && (
                                    <Button className="w-full gap-2" size="lg" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${venue.coordinates.lat},${venue.coordinates.lng}`, '_blank')}>
                                        <Navigation className="h-4 w-4" />
                                        {t.getDirections}
                                    </Button>
                                )}

                                {showContactActions && features.whatsapp && venue.whatsapp && (
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 text-green-600 border-green-600 hover:bg-green-50"
                                        onClick={() => window.open(`https://wa.me/${venue.whatsapp}`, "_blank")}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </Button>
                                )}

                                {/* Socials Row */}
                                {showSocials && (
                                    <div className="flex justify-center gap-2">
                                        {venue.website && (
                                            <Button variant="ghost" size="icon" onClick={() => window.open(`https://${venue.website}`, "_blank")} title="Website">
                                                <Globe className="h-5 w-5" />
                                            </Button>
                                        )}
                                        {venue.instagram && (
                                            <Button variant="ghost" size="icon" onClick={() => window.open(`https://instagram.com/${venue.instagram}`, "_blank")} title="Instagram">
                                                <Instagram className="h-5 w-5" />
                                            </Button>
                                        )}
                                        {venue.facebook && (
                                            <Button variant="ghost" size="icon" onClick={() => window.open(`https://facebook.com/${venue.facebook}`, "_blank")} title="Facebook">
                                                <Facebook className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {showContactActions && (venue.phone || venue.whatsapp) ? (
                                    <Button variant="ghost" className="w-full gap-2" onClick={() => window.open(`tel:${venue.phone || venue.whatsapp}`)}>
                                        <Phone className="h-4 w-4" />
                                        {t.callNow || "Call Now"}
                                    </Button>
                                ) : (
                                    (venue.phone || venue.whatsapp) && (
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground py-2 bg-muted/20 rounded-md">
                                            <Phone className="h-4 w-4" />
                                            <span className="font-medium select-all">{venue.phone || venue.whatsapp}</span>
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>

                        {/* Map - Only show if exact address */}
                        {venue.locationMode === 'address' && (
                            <div className="aspect-square rounded-xl bg-muted relative overflow-hidden shadow-sm border">
                                <Map center={[venue.coordinates.lat, venue.coordinates.lng]} zoom={15} />
                            </div>
                        )}

                        {/* Claim Venue Card */}
                        {currentUser && venue && !venue.ownerId && (
                            <Card className="border-primary/50 bg-primary/5">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <Flag className="h-4 w-4" />
                                        ¿Sos el dueño?
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Reclamá este local para administrar su información y promociones.
                                    </p>
                                    <Button
                                        className="w-full"
                                        onClick={handleClaimRequest}
                                        disabled={claimStatus === 'pending' || claimStatus === 'approved'}
                                    >
                                        {claimStatus === 'pending' ? "Solicitud Pendiente" :
                                            claimStatus === 'approved' ? "Solicitud Aprobada" :
                                                "Reclamar este local"}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
