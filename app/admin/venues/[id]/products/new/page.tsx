"use client"

import { useParams } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"

export default function NewProductPage() {
    const params = useParams()
    const venueId = params.id as string

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Agregar Nuevo Producto</h1>
            <ProductForm venueId={venueId} />
        </div>
    )
}
