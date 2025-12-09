"use client"

import { useState } from "react"
import ImageUpload from "@/components/ui/image-upload"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

import { supabase } from "@/lib/supabase"
import { useRegion } from "@/components/providers/region-provider"
import { REGIONS } from "@/lib/regions"

const formSchema = z.object({
    // Step 1: Business Info
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    category: z.string().min(1, "Seleccioná un rubro"),
    customCategory: z.string().optional(),
    description: z.string().min(10, "Contanos un poco más sobre tu negocio (mínimo 10 caracteres)"),

    // Step 2: Contact & Socials
    ownerName: z.string().min(2, "Tu nombre es requerido"),
    ownerEmail: z.string().email("Ingresá un email válido"),
    whatsapp: z.string().min(8, "Ingresá un WhatsApp válido"),
    instagram: z.string().optional(),
    website: z.string().optional(),
    facebook: z.string().optional(),

    // Step 3: Multimedia
    image: z.string().optional(), // Cover image (Full)
    logo: z.string().optional(), // Profile (Basic)

    // Step 4: Location & Schedule
    location: z.string().min(5, "Ingresá una dirección o zona"), // Address input
    locationType: z.enum(["address", "zone"]),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    zone: z.string().optional(),
    hours: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const steps = [
    { id: 1, title: "Tu Negocio" },
    { id: 2, title: "Contacto" },
    { id: 3, title: "Multimedia" },
    { id: 4, title: "Ubicación" },
    { id: 5, title: "Confirmación" },
]

export function SumateForm() {
    const regionCode = useRegion()
    const [step, setStep] = useState(1)
    const [isPending, setIsPending] = useState(false)
    const { toast } = useToast()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            ownerName: "",
            ownerEmail: "",
            category: "",
            customCategory: "",
            description: "",
            whatsapp: "",
            instagram: "",
            website: "",
            facebook: "",
            image: "",
            logo: "",
            location: "",
            locationType: "address",
            hours: "",
        },
        mode: "onChange",
    })

    const category = form.watch("category")

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormData)[] = []
        if (step === 1) {
            fieldsToValidate = ["name", "category", "description"]
            if (category === "other") fieldsToValidate.push("customCategory")
        } else if (step === 2) {
            fieldsToValidate = ["ownerName", "ownerEmail", "whatsapp"]
        } else if (step === 3) {
            // Optional images
            fieldsToValidate = []
        } else if (step === 4) {
            // Should not be called via 'nextStep' button generally, as button is submit, but for consistency
            fieldsToValidate = ["location", "locationType"] // Hours optional
        }

        const isValid = await form.trigger(fieldsToValidate)
        if (isValid) {
            setStep(step + 1)
        }
    }

    const prevStep = () => {
        setStep(step - 1)
    }

    const onSubmit = async (data: FormData) => {
        setIsPending(true)
        try {
            let detectedRegion = regionCode || ""
            let detectedZone = ""
            let lat = 0
            let lng = 0

            // Geocoding logic
            if (data.location) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.location)}&limit=1&addressdetails=1`)
                    const results = await response.json()

                    if (results && results.length > 0) {
                        const result = results[0]
                        lat = parseFloat(result.lat)
                        lng = parseFloat(result.lon)
                        const address = result.address

                        // Extract zone
                        detectedZone = address.city || address.town || address.village || address.suburb || address.municipality || ""

                        // Extract region logic as before
                        const state = address.state || address.province || ""
                        const match = Object.entries(REGIONS).find(([_, name]) => {
                            return state.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(state.toLowerCase())
                        })
                        if (match) detectedRegion = match[0]
                    }
                } catch (e) {
                    console.error("Geocoding failed", e)
                }
            }

            const { error } = await supabase.from("venue_requests").insert({
                name: data.name,
                category: data.category,
                custom_category: data.customCategory,
                description: data.description,
                phone: data.whatsapp, // Using whatsapp as main phone
                whatsapp: data.whatsapp,
                owner_name: data.ownerName, // Make sure these match DB columns
                owner_email: data.ownerEmail,
                instagram: data.instagram,
                website: data.website,
                facebook: data.facebook,
                image: data.image,
                logo: data.logo,
                location: data.location,
                location_type: data.locationType,
                hours: data.hours,
                coordinates: { lat, lng },
                region_code: detectedRegion,
                zone: detectedZone || data.zone, // Fallback to manual zone if added in future
                status: 'pending'
            })

            if (error) throw error

            toast({
                title: "¡Solicitud Recibida!",
                description: "Vamos a revisar tu información y te contactaremos pronto.",
            })

            setStep(5) // Show success step

        } catch (error) {
            console.error(error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un problema al enviar la solicitud.",
            })
        } finally {
            setIsPending(false)
        }
    }



    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {steps.map((s) => (
                        <div
                            key={s.id}
                            className={cn(
                                "text-sm font-medium transition-colors",
                                step >= s.id ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {s.title}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="border-2 shadow-lg mb-10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Step 1: Business Info */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <CardHeader>
                                    <CardTitle>Tu Negocio</CardTitle>
                                    <p className="text-muted-foreground">Contanos lo básico para empezar.</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre del Negocio</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: La Pizzería de Juan" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rubro</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccioná un rubro" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="restaurant">Gastronomía (Restaurante/Bar)</SelectItem>
                                                        <SelectItem value="cafe">Cafetería / Panadería</SelectItem>
                                                        <SelectItem value="shop">Tienda / Local de Ropa</SelectItem>
                                                        <SelectItem value="service">Servicios Profesionales</SelectItem>
                                                        <SelectItem value="entertainment">Entretenimiento</SelectItem>
                                                        <SelectItem value="health">Salud y Belleza</SelectItem>
                                                        <SelectItem value="home">Hogar y Construcción</SelectItem>
                                                        <SelectItem value="market">Mercado / Almacén</SelectItem>
                                                        <SelectItem value="other">Otro (Especificar)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {category === "other" && (
                                        <FormField
                                            control={form.control}
                                            name="customCategory"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>¿Cuál es tu rubro?</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Especificá tu rubro" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descripción Breve</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="¿Qué hacés? ¿Qué vendés? ¿Qué te hace especial?"
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <Button type="button" onClick={nextStep}>
                                        Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </div>
                        )}

                        {/* Step 2: Contact Info */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <CardHeader>
                                    <CardTitle>Contacto</CardTitle>
                                    <p className="text-muted-foreground">¿Cómo te contactamos a vos y a tu negocio?</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="ownerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tu Nombre (Dueño/Encargado)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ej: Juan Pérez" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ownerEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tu Email Personal</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="juan@ejemplo.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp del Negocio</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: 2901 123456" {...field} />
                                                </FormControl>
                                                <FormDescription>Para que los clientes te contacten.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="instagram"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Instagram (Opcional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="@tu.negocio" {...field} />
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
                                                    <FormLabel>Facebook (Opcional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Tu Negocio" {...field} />
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
                                                        <Input placeholder="www.tunegocio.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                                    </Button>
                                    <Button type="button" onClick={nextStep}>
                                        Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </div>
                        )}

                        {/* Step 3: Multimedia / Images */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <CardHeader>
                                    <CardTitle>Multimedia</CardTitle>
                                    <p className="text-muted-foreground">Dale vida a tu perfil (Subí tus imágenes).</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 mb-4">
                                        <strong>⭐ Tip:</strong> La Foto de Portada y Galería son beneficios exclusivos del <strong>Plan Negocio Full</strong>.
                                    </div>

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
                                                <FormDescription>Tu logo cuadrado.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Foto de Portada</FormLabel>
                                                <FormControl>
                                                    <ImageUpload
                                                        value={field.value ? [field.value] : []}
                                                        disabled={isPending}
                                                        onChange={(url) => field.onChange(url)}
                                                        onRemove={() => field.onChange("")}
                                                    />
                                                </FormControl>
                                                <FormDescription>Foto apaisada/horizontal.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                                    </Button>
                                    <Button type="button" onClick={nextStep}>
                                        Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </div>
                        )}

                        {/* Step 4: Location */}
                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <CardHeader>
                                    <CardTitle>Ubicación y Horarios</CardTitle>
                                    <p className="text-muted-foreground">¿Dónde y cuándo te encuentran?</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="hours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Horarios</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: Lun-Vie 9-13 y 16-20hs" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="locationType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Tipo de Ubicación</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="address" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Dirección Exacta (Local a la calle)
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="zone" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Solo Zona (Sin local o privado)
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dirección o Zona</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: San Martin 500, Ushuaia" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Usamos esto para ubicarte en el mapa.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Enviar Solicitud
                                    </Button>
                                </CardFooter>
                            </div>
                        )}

                        {/* Success Message - Technically not a form step but visual feedback */}
                        {step === 5 && (
                            <div className="animate-in zoom-in duration-500 text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <Check className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">¡Gracias por sumarte!</h2>
                                <p className="text-muted-foreground mb-6">
                                    Hemos recibido tu información. Vamos a revisarla y crear tu perfil pronto.
                                </p>
                                <Button type="button" variant="outline" onClick={() => window.location.href = "/"}>
                                    Volver al Inicio
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </Card>
        </div>
    )
}
