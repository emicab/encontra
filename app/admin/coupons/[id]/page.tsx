"use client"

import { CouponForm } from "@/components/admin/coupon-form"
import { coupons as mockCoupons, type Coupon } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function EditCouponPage() {
    const params = useParams()
    const [coupon, setCoupon] = useState<Coupon | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCoupon() {
            try {
                const { data, error } = await supabase
                    .from("coupons")
                    .select("*")
                    .eq("id", params.id)
                    .single()

                if (error) throw error

                if (data) {
                    // We need venue name for the coupon object, but for editing form we mainly need IDs and raw data.
                    // However, the Coupon type expects venueName.
                    // Let's fetch the venue name too.
                    const { data: venueData } = await supabase
                        .from("venues")
                        .select("name")
                        .eq("id", data.venue_id)
                        .single()

                    const mappedCoupon: Coupon = {
                        id: data.id,
                        venueId: data.venue_id,
                        venueName: (() => {
                            const name = venueData?.name;
                            return typeof name === 'object' ? name.es || name.en || "Unknown" : name || "Unknown";
                        })(),
                        code: data.code,
                        discount: data.discount,
                        type: data.type,
                        description: data.description,
                        validUntil: data.valid_until,
                        image: data.image,
                    }
                    setCoupon(mappedCoupon)
                }
            } catch (error) {
                console.error("Error fetching coupon:", error)
                // Fallback to mock data
                const mock = mockCoupons.find((c) => c.id === params.id)
                if (mock) setCoupon(mock)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchCoupon()
        }
    }, [params.id])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!coupon) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Editar Cupón</h2>
                <p className="text-muted-foreground">Actualizar detalles del cupón.</p>
            </div>
            <CouponForm initialData={coupon} />
        </div>
    )
}
