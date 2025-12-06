"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ProductForm } from "@/components/admin/product-form"
import { Product } from "@/lib/data"

export default function EditProductPage() {
    const params = useParams()
    const venueId = params.id as string
    const productId = params.productId as string
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProduct() {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", productId)
                .single()

            if (data) {
                setProduct({
                    id: data.id,
                    venueId: data.venue_id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    image: data.image,
                    isActive: data.is_active,
                })
            }
            setLoading(false)
        }
        fetchProduct()
    }, [productId])

    if (loading) return <div>Cargando...</div>
    if (!product) return <div>Producto no encontrado</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Editar Producto</h1>
            <ProductForm initialData={product} venueId={venueId} />
        </div>
    )
}
