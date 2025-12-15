"use client"
// Force recompile

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Product } from "@/lib/data"

export default function VenueProductsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const venueId = params.id as string

    useEffect(() => {
        checkUserRole()
        fetchProducts()
    }, [venueId])

    async function checkUserRole() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single()
            if (profile?.is_admin) setIsAdmin(true)
        }
    }

    async function fetchProducts() {
        setLoading(true)
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("venue_id", venueId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching products:", error)
            toast({
                title: "Error",
                description: "Error al cargar los productos.",
                variant: "destructive",
            })
        } else {
            // Map Supabase data to Product interface
            const mappedProducts: Product[] = data.map((item: any) => ({
                id: item.id,
                venueId: item.venue_id,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                isActive: item.is_active,
            }))
            setProducts(mappedProducts)
        }
        setLoading(false)
    }

    async function deleteProduct(id: string) {
        if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id)

        if (error) {
            toast({
                title: "Error",
                description: "Error al eliminar el producto.",
                variant: "destructive",
            })
        } else {
            toast({
                title: "Éxito",
                description: "Producto eliminado correctamente.",
            })
            fetchProducts()
        }
    }

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "price",
            header: "Precio",
            cell: ({ row }) => {
                const price = row.getValue("price") as number
                return price ? `$${price.toFixed(2)}` : "-"
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/venues/${venueId}/products/${product.id}`)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => isAdmin ? router.push("/admin/venues") : router.push("/admin/my-venue")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Productos</h1>
                </div>
                <Button onClick={() => router.push(`/admin/venues/${venueId}/products/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Producto
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-10">Cargando productos...</div>
            ) : (
                <DataTable columns={columns} data={products} searchKey="name" />
            )}
        </div>
    )
}
