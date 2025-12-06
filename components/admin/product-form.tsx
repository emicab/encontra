"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Product } from "@/lib/data"
import ImageUpload from "@/components/ui/image-upload"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
    venueId: z.string().min(1, "El local es requerido"),
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional(),
    price: z.coerce.number().optional(),
    image: z.string().optional(),
    isActive: z.boolean().default(true),
})

interface ProductFormProps {
    initialData?: Product
    venueId: string
}

export function ProductForm({ initialData, venueId }: ProductFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, setIsPending] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                venueId: initialData.venueId,
                name: initialData.name,
                description: initialData.description,
            }
            : {
                venueId: venueId,
                name: "",
                description: "",
                price: 0,
                image: "",
                isActive: true,
            },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true)
        try {
            const productData = {
                venue_id: values.venueId,
                name: values.name,
                description: values.description,
                price: values.price,
                image: values.image,
                is_active: values.isActive,
            }

            if (initialData) {
                const { error } = await supabase
                    .from("products")
                    .update(productData)
                    .eq("id", initialData.id)

                if (error) throw error

                toast({
                    title: "Éxito",
                    description: "Producto actualizado correctamente.",
                })
            } else {
                const { error } = await supabase
                    .from("products")
                    .insert([productData])

                if (error) throw error

                toast({
                    title: "Éxito",
                    description: "Producto creado correctamente.",
                })
            }

            router.push(`/admin/venues/${venueId}/products`)
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast({
                title: "Error",
                description: error.message || "Algo salió mal.",
                variant: "destructive",
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-[1fr_300px]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalles del Producto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre del producto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Descripción" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Multimedia</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Imagen del Producto</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value ? [field.value] : []}
                                                    disabled={isPending}
                                                    onChange={(url) => field.onChange(url)}
                                                    onRemove={() => field.onChange("")}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Actualizar Producto" : "Crear Producto"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
