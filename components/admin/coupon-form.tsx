"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Coupon } from "@/lib/data"
import ImageUpload from "@/components/ui/image-upload"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
    venueId: z.string().min(1, "El local es requerido"),
    code: z.string().min(1, "El código es requerido"),
    type: z.enum(["percent", "fixed"]),
    discount: z.string().min(1, "El valor del descuento es requerido"),
    validUntil: z.string().min(1, "La fecha de vencimiento es requerida"),
    image: z.string().min(1, "La imagen es requerida"),
    description: z.string().min(1, "La descripción es requerida"),
})

interface CouponFormProps {
    initialData?: Coupon
}

export function CouponForm({ initialData }: CouponFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, setIsPending] = useState(false)
    const [venues, setVenues] = useState<any[]>([])

    useEffect(() => {
        async function fetchVenues() {
            const { data, error } = await supabase
                .from("venues")
                .select("id, name")
                .order("name")

            if (error) {
                console.error("Error fetching venues:", error)
                toast({
                    title: "Error",
                    description: "Error al cargar los locales.",
                    variant: "destructive",
                })
            } else {
                const mappedVenues = (data || []).map((v: any) => ({
                    id: v.id,
                    name: typeof v.name === 'object' ? v.name.es || v.name.en || "Desconocido" : v.name,
                }))
                setVenues(mappedVenues)
            }
        }
        fetchVenues()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                description: initialData.description,
            }
            : {
                venueId: "",
                code: "",
                type: "percent",
                discount: "",
                validUntil: "",
                image: "",
                description: "",
            },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true)
        try {
            const couponData = {
                venue_id: values.venueId,
                code: values.code,
                type: values.type,
                discount: values.discount,
                valid_until: values.validUntil,
                image: values.image,
                description: values.description,
            }

            if (initialData) {
                const { error } = await supabase
                    .from("coupons")
                    .update(couponData)
                    .eq("id", initialData.id)

                if (error) throw error

                toast({
                    title: "Éxito",
                    description: "Cupón actualizado correctamente.",
                })
            } else {
                const { error } = await supabase
                    .from("coupons")
                    .insert([couponData])

                if (error) throw error

                toast({
                    title: "Éxito",
                    description: "Cupón creado correctamente.",
                })
            }

            router.push("/admin/coupons")
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
                                <CardTitle>Detalles del Cupón</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="venueId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Local</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un local" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {venues.map((venue) => (
                                                        <SelectItem key={venue.id} value={venue.id}>
                                                            {venue.name || "Local Desconocido"}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Código</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VERANO2025" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="validUntil"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Válido Hasta</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="percent">Porcentaje (%)</SelectItem>
                                                        <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="discount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Valor</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="20% o $10" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Descripción del cupón" {...field} />
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
                                            <FormLabel>Imagen del Cupón</FormLabel>
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
                            {initialData ? "Actualizar Cupón" : "Crear Cupón"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
