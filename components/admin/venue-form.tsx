"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Wand2, MapPin, Crown } from "lucide-react"
import type { Venue } from "@/lib/data"
import ImageUpload from "@/components/ui/image-upload"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"
import { ScheduleEditor } from "@/components/admin/schedule-editor"
import { WeeklySchedule } from "@/lib/data"
import { REGIONS } from "@/lib/regions"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const Map = dynamic(() => import("@/components/map"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" />,
})

const formSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    slug: z.string().min(2, "El slug es obligatorio").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Formato de slug inválido (solo minúsculas, números y guiones)"),
    description: z.string().min(1, "La descripción es obligatoria"),
    category: z.string().min(1, "La categoría es obligatoria"),
    customCategory: z.string().optional(),
    venueType: z.enum(["physical", "entrepreneur", "service"]),
    locationMode: z.enum(["address", "zone"]),
    street: z.string().optional(),
    city: z.string().min(1, "La ciudad es obligatoria"),
    country: z.string().default("Argentina"),
    regionCode: z.string().min(1, "La provincia es obligatoria"),
    zone: z.string().optional(),
    coordinates: z.object({
        lat: z.coerce.number(),
        lng: z.coerce.number(),
    }),
    whatsapp: z.string().optional(),
    website: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    phone: z.string().optional(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    image: z.string().optional(),
    logo: z.string().optional(),
    rating: z.coerce.number().min(0).max(5),
    reviewCount: z.coerce.number().min(0),
    subscriptionPlan: z.enum(["free", "basic", "premium"]),
    subscriptionStatus: z.enum(["active", "inactive"]),
    serviceDelivery: z.boolean().default(false),
    servicePickup: z.boolean().default(false),
    serviceArrangement: z.boolean().default(false),
    schedule: z.any(),
}).superRefine((data, ctx) => {
    if (data.locationMode === "address" && !data.street) {
        console.error("Validation failed: Address mode requires street")
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La calle es obligatoria para ubicación exacta",
            path: ["street"]
        })
    }
    if (data.locationMode === "zone" && !data.zone) {
        console.error("Validation failed: Zone mode requires zone")
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La zona/barrio es obligatoria",
            path: ["zone"]
        })
    }
})

const defaultSchedule: WeeklySchedule = {
    monday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
    tuesday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
    wednesday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
    thursday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
    friday: { isOpen: true, ranges: [{ start: "09:00", end: "17:00" }] },
    saturday: { isOpen: true, ranges: [{ start: "10:00", end: "14:00" }] },
    sunday: { isOpen: false, ranges: [] },
}

interface VenueFormProps {
    initialData?: Venue
    isAdmin?: boolean
}

export function VenueForm({ initialData, isAdmin = false }: VenueFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, setIsPending] = useState(false)
    const [categories, setCategories] = useState<string[]>([
        "restaurant", "cafe", "shop", "entertainment", "service", "health", "home", "market"
    ])

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from("venues").select("category")
            if (data) {
                const distinct = Array.from(new Set(data.map((d: any) => d.category))).filter(Boolean) as string[]
                setCategories(prev => Array.from(new Set([...prev, ...distinct])).sort())
            }
        }
        fetchCategories()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                slug: initialData.slug || "",
                // Handle JSONB fields for name and description
                name: typeof initialData.name === 'object' ? (initialData.name as any).es || (initialData.name as any).en || "" : initialData.name,
                description: typeof initialData.description === 'object' ? (initialData.description as any).es || (initialData.description as any).en || "" : initialData.description,
                schedule: initialData.schedule || defaultSchedule,
                // Fix enum mismatch: DB 'exact_address' -> Schema 'address'
                locationMode: ((initialData.locationMode as string) === 'exact_address' ? 'address' : initialData.locationMode) as "address" | "zone",
                // Fix coordinates being null
                coordinates: initialData.coordinates || { lat: 0, lng: 0 },
                street: initialData.address || "", // Fallback address to street if not parsed
                city: initialData.city || "",
                country: "Argentina",
                regionCode: initialData.regionCode || "tdf",
                zone: initialData.zone || "",
                whatsapp: initialData.whatsapp || "",
                website: initialData.website || "",
                instagram: initialData.instagram || "",
                facebook: initialData.facebook || "",
                phone: initialData.phone || "",
                logo: initialData.logo || "",
                image: initialData.image || "",
                openTime: initialData.openTime || "",
                closeTime: initialData.closeTime || "",
            }
            : {
                name: "",
                slug: "",
                description: "",
                category: "restaurant",
                venueType: "physical",
                locationMode: "address",
                street: "",
                city: "",
                country: "Argentina",
                regionCode: "tdf",
                zone: "",
                coordinates: { lat: 0, lng: 0 },
                whatsapp: "",
                website: "",
                instagram: "",
                facebook: "",
                phone: "",
                openTime: "",
                closeTime: "",
                image: "",
                logo: "",
                rating: 5.0,
                reviewCount: 0,
                subscriptionPlan: "free",
                subscriptionStatus: "active",
                serviceDelivery: false,
                servicePickup: false,
                serviceArrangement: false,
                schedule: defaultSchedule,
            },
    })

    // Initialize form with split address if initialData exists
    if (initialData && !form.getValues("street")) {
        const parts = initialData.address ? initialData.address.split(",").map(s => s.trim()) : []
        if (parts.length >= 3) {
            form.setValue("street", parts[0])
            form.setValue("city", parts[1])
            form.setValue("country", parts.slice(2).join(", "))
        } else if (initialData.address) {
            form.setValue("street", initialData.address)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (values.category === "new_custom" && !values.customCategory) {
            toast({ title: "Error", description: "Por favor escriba el nombre de la nueva categoría.", variant: "destructive" })
            return
        }
        setIsPending(true)
        try {
            const fullAddress = values.locationMode === 'address'
                ? `${values.street || ''}, ${values.city}, Argentina`
                : `${values.zone || ''}, ${values.city}, Argentina`

            if (fullAddress) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&addressdetails=1&limit=1`)
                    const results = await response.json()
                    if (results && results.length > 0) {
                        const address = results[0].address

                        // Auto-detect zone if not manually specified
                        if (!values.zone) {
                            const detectedZone = address.city || address.town || address.village || address.suburb || address.municipality
                            if (detectedZone) {
                                // We update the variable that will be used to construct venueData
                                // Note: we can't easily update 'values' here without re-parsing, but we can update the object we send
                                values.zone = detectedZone
                            }
                        }
                    }
                } catch (e) {
                    console.error("Region detection failed", e)
                }
            }

            // Fallback Logic: If image is empty, try to use logo
            const finalImage = values.image || values.logo || null;

            const venueData = {
                region_code: values.regionCode,
                name: { es: values.name }, // Wrap in JSONB
                slug: values.slug,
                description: { es: values.description }, // Wrap in JSONB
                category: values.category === "new_custom" ? values.customCategory : values.category,
                venue_type: values.venueType,
                location_mode: values.locationMode === 'address' ? 'exact_address' : values.locationMode,
                // Ensure zone matches city in address mode so it appears in the city listing
                zone: values.locationMode === 'address' ? values.city : values.zone,
                city: values.city,
                address: values.locationMode === 'address'
                    ? `${values.street || ''}, ${values.city}, Argentina`
                    : `${values.zone || ''}, ${values.city}, Argentina`,
                coordinates: values.coordinates,
                whatsapp: values.whatsapp.replace(/\D/g, ''), // Keep only numbers
                website: values.website,
                instagram: values.instagram ? values.instagram.replace(/^@/, '').replace(/.*\//, '') : '', // Extract handle
                facebook: values.facebook ? values.facebook.replace(/.*\//, '') : '', // Extract handle/page id
                phone: values.phone,
                open_time: values.openTime,
                close_time: values.closeTime,
                image: finalImage,
                logo: values.logo,
                rating: values.rating,
                review_count: values.reviewCount,
                subscription_plan: values.subscriptionPlan,
                subscription_status: values.subscriptionStatus,
                service_delivery: values.serviceDelivery,
                service_pickup: values.servicePickup,
                service_arrangement: values.serviceArrangement,
                schedule: values.schedule,
                is_open: true, // Default
                is_featured: values.subscriptionPlan === "premium", // Auto-set based on plan
                is_new: true // Default
            }



            if (initialData) {
                const { error } = await supabase
                    .from("venues")
                    .update(venueData)
                    .eq("id", initialData.id)

                if (error) {
                    console.error("Supabase Update Error:", error)
                    throw error
                }

                toast({
                    title: "Éxito",
                    description: "Local actualizado correctamente.",
                })
            } else {
                const { error } = await supabase
                    .from("venues")
                    .insert([venueData])

                if (error) {
                    console.error("Supabase Insert Error:", error)
                    throw error
                }

                toast({
                    title: "Éxito",
                    description: "Local creado correctamente.",
                })
            }


            if (isAdmin) {
                router.push("/admin/venues")
            } else {
                router.push("/admin/my-venue")
            }
            router.refresh()
        } catch (error: any) {
            console.error("Error saving venue full object:", error)
            console.error("Error saving venue message:", error?.message)
            console.error("Error saving venue details:", error?.details)
            console.error("Error saving venue hint:", error?.hint)

            let errorMessage = "Ocurrió un error al guardar el local."

            // Check for Postgres unique violation (duplicate key)
            if (error?.code === '23505') {
                if (error?.message?.includes('slug')) {
                    errorMessage = "El slug ya existe. Por favor elija otro URL amigable."
                } else if (error?.message?.includes('name')) {
                    errorMessage = "Ya existe un local con este nombre."
                } else {
                    errorMessage = "Ya existe un registro con estos datos únicos."
                }
            } else if (error?.message) {
                errorMessage = error.message
            } else if (typeof error === 'string') {
                errorMessage = error
            }

            toast({
                title: "Error al guardar",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsPending(false)
        }
    }

    const checkLocation = async () => {
        const mode = form.getValues("locationMode")
        const street = form.getValues("street")
        const zone = form.getValues("zone")
        const city = form.getValues("city")
        const country = "Argentina"

        if (!street || !city) {
            toast({
                title: "Dirección incompleta",
                description: "Por favor ingrese calle y ciudad.",
                variant: "destructive",
            })
            return
        }

        setIsPending(true)
        try {
            // Use 'q' parameter for better free-form search including numbers
            let fullAddress = ""
            if (mode === 'address') {
                if (!street || !city) {
                    toast({ title: "Dirección incompleta", description: "Por favor ingrese calle y ciudad.", variant: "destructive" })
                    return
                }
                fullAddress = `${street}, ${city}, Argentina`
            } else {
                if (!zone || !city) {
                    toast({ title: "Zona incompleta", description: "Por favor ingrese zona y ciudad.", variant: "destructive" })
                    return
                }
                fullAddress = `${zone}, ${city}, Argentina`
            }

            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&addressdetails=1`)
            const data = await response.json()

            if (data && data.length > 0) {
                const { lat, lon, address } = data[0]
                form.setValue("coordinates.lat", parseFloat(lat))
                form.setValue("coordinates.lng", parseFloat(lon))

                // Auto-fill zone if present in response
                if (address) {
                    const detectedZone = address.city || address.town || address.village || address.suburb || address.municipality
                    if (detectedZone) {
                        form.setValue("zone", detectedZone)
                    }
                }

                toast({
                    title: "Ubicación encontrada",
                    description: `Coordenadas establecidas en ${lat}, ${lon}`,
                })
            } else {
                toast({
                    title: "Ubicación no encontrada",
                    description: "No se pudieron encontrar las coordenadas. Verifique los detalles de la dirección.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Error al buscar la ubicación.",
                variant: "destructive",
            })
        } finally {
            setIsPending(false)
        }
    }

    const generateSlug = () => {
        const name = form.getValues("name")
        if (name) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "")
            form.setValue("slug", slug)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error("Form Validation Errors:", errors)
                toast({
                    title: "Error de validación",
                    description: "Por favor revise los campos en rojo.",
                    variant: "destructive",
                })
            })} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Local</CardTitle>
                                <CardDescription>Detalles básicos sobre el negocio.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoría</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione una categoría" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((c) => (
                                                        <SelectItem key={c} value={c}>
                                                            {c === "restaurant" ? "Gastronomía" :
                                                                c === "cafe" ? "Cafetería" :
                                                                    c === "shop" ? "Tienda" :
                                                                        c === "entertainment" ? "Entretenimiento" :
                                                                            c === "service" ? "Servicios" :
                                                                                c === "health" ? "Salud" :
                                                                                    c === "home" ? "Hogar" :
                                                                                        c === "market" ? "Mercado" :
                                                                                            c}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="new_custom" className="font-semibold text-primary">
                                                        + Crear nueva categoría...
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.watch("category") === "new_custom" && (
                                    <FormField
                                        control={form.control}
                                        name="customCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre de la nueva categoría</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: Farmacia" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="venueType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Negocio</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="physical">Local Físico</SelectItem>
                                                        <SelectItem value="entrepreneur">Emprendimiento (Sin Local)</SelectItem>
                                                        <SelectItem value="service">Servicio</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="locationMode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visualización de Ubicación</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="address">Dirección Exacta</SelectItem>
                                                        <SelectItem value="zone">Solo Zona</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre del local" {...field} />
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
                                                <Textarea placeholder="Descripción del negocio" className="min-h-[100px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-2 items-end">
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Slug (URL Amigable)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="mi-nombre-de-local" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="secondary" onClick={generateSlug} title="Generar Slug desde Nombre">
                                        <Wand2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ubicación y Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="street"
                                        render={({ field }) => (
                                            <FormItem className={form.watch("locationMode") === "zone" ? "hidden" : ""}>
                                                <FormLabel>Calle y Altura</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Av. Principal 123" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="zone"
                                        render={({ field }) => (
                                            <FormItem className={form.watch("locationMode") === "address" ? "hidden" : ""}>
                                                <FormLabel>Zona / Barrio</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ej: Centro, Palermo Soho" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ciudad</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Buenos Aires" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="regionCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Provincia</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccione provincia" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {Object.entries(REGIONS).map(([code, name]) => (
                                                                <SelectItem key={code} value={code}>
                                                                    {name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="button" variant="secondary" className="w-full" onClick={checkLocation} disabled={isPending}>
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Obtener Coordenadas
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="coordinates.lat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Latitud</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="any" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="coordinates.lng"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Longitud</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="any" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="h-[300px] w-full rounded-xl overflow-hidden border">
                                    <Map
                                        center={[form.watch("coordinates.lat") || 0, form.watch("coordinates.lng") || 0]}
                                        zoom={15}
                                        onLocationSelect={(lat, lng) => {
                                            form.setValue("coordinates.lat", lat)
                                            form.setValue("coordinates.lng", lng)
                                            toast({
                                                title: "Ubicación actualizada",
                                                description: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                                            })
                                        }}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="whatsapp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de WhatsApp (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="549..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Fijo u otro" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sitio Web (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="instagram"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Usuario Instagram (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="usuario (sin @)" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="facebook"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL Facebook (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://facebook.com/..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Separator className="my-4" />
                                <div className="space-y-4">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="schedule">
                                            <AccordionTrigger>Horarios de Atención</AccordionTrigger>
                                            <AccordionContent>
                                                <FormField
                                                    control={form.control}
                                                    name="schedule"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <ScheduleEditor
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Suscripción</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isAdmin ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="subscriptionPlan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Plan</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="free">Gratis ($0)</SelectItem>
                                                            <SelectItem value="basic">Básico ($29)</SelectItem>
                                                            <SelectItem value="premium">Premium ($99)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="subscriptionStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estado</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="active">Activo</SelectItem>
                                                            <SelectItem value="inactive">Inactivo</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Plan Actual</div>
                                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                {form.getValues("subscriptionPlan") === 'free' ? 'Vecino (Gratis)' :
                                                    form.getValues("subscriptionPlan") === 'basic' ? 'Emprendedor' :
                                                        form.getValues("subscriptionPlan") === 'premium' ? 'Negocio Full' :
                                                            form.getValues("subscriptionPlan")}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Estado</div>
                                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                {form.getValues("subscriptionStatus") === 'active' ? 'Activo' : 'Inactivo'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!isAdmin && initialData && initialData.slug && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full gap-2 border-amber-200 hover:bg-amber-50 hover:text-amber-900"
                                        onClick={() => window.open(`/${initialData.regionCode || 'tdf'}/${initialData.slug}/planes`, '_blank')}
                                    >
                                        <Crown className="h-4 w-4 text-amber-500" />
                                        Ver Planes y Mejoras
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Detalles y Servicios</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <FormLabel>Opciones de Servicio</FormLabel>
                                    <div className="flex flex-col gap-2">
                                        <FormField
                                            control={form.control}
                                            name="serviceDelivery"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Delivery Disponible
                                                        </FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="servicePickup"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Retiro en Tienda
                                                        </FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="serviceArrangement"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            A Convenir
                                                        </FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calificación Inicial</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" min="0" max="5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reviewCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cantidad de Reseñas</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Imágenes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Imagen de Portada</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value ? [field.value] : []}
                                                    disabled={isPending}
                                                    onChange={(url) => field.onChange(url)}
                                                    onRemove={() => field.onChange("")}
                                                />
                                            </FormControl>
                                            <FormDescription>Formato recomendado: 16:9 (Horizontal), mín. 1280x720px.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="logo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo</FormLabel>
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
                                <FormField
                                    control={form.control}
                                    name="logo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value ? [field.value] : []}
                                                    disabled={isPending}
                                                    onChange={(url) => field.onChange(url)}
                                                    onRemove={() => field.onChange("")}
                                                />
                                            </FormControl>
                                            <FormDescription>Formato recomendado: 1:1 (Cuadrado), mín. 200x200px.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>

                        </Card>
                    </div>
                </div>

                {/* Floating Save Button */}
                <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:left-64 z-50 shadow-lg">
                    <div className="container mx-auto flex justify-end gap-4 max-w-4xl">
                        <Button type="button" variant="outline" onClick={() => isAdmin ? router.back() : router.push("/admin/my-venue")}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Guardar Cambios" : "Crear Local"}
                        </Button>
                    </div>
                </div>
                <div className="h-20" /> {/* Spacer for floating button */}
            </form>
        </Form >
    )
}
