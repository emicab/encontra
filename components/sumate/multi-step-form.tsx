"use client"

import { useState } from "react"
import ImageUpload from "@/components/ui/image-upload"
import { MarkdownToolbar } from "@/components/ui/markdown-toolbar"
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
import { Check, ChevronRight, ChevronLeft, Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

import { useRegion } from "@/components/providers/region-provider"
import { REGIONS } from "@/lib/regions"
import { registerVenue } from "@/lib/actions/onboarding"

const formSchema = z.object({
    // Step 1: Business Info
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    category: z.string().min(1, "Seleccioná un rubro"),
    customCategory: z.string().optional(),
    description: z.string().min(10, "Contanos un poco más sobre tu negocio (mínimo 10 caracteres)"),

    // Step 2: Contact & Socials & Auth
    ownerName: z.string().min(2, "Tu nombre es requerido"),
    ownerEmail: z.string().email("Ingresá un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"), // New Field
    whatsapp: z.string().optional(),
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
    city: z.string().min(2, "Ingresá la ciudad"),
    province: z.string().min(2, "Seleccioná la provincia"),
    zone: z.string().optional(),
    hours: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const steps = [
    { id: 1, title: "Tu Negocio" },
    { id: 2, title: "Tus Datos" },
    { id: 3, title: "Multimedia" },
    { id: 4, title: "Ubicación" },
]

export function SumateForm() {
    const regionCode = useRegion()
    const [step, setStep] = useState(1)
    const [isPending, setIsPending] = useState(false)
    const [showPassword, setShowPassword] = useState(false) // Toggle state
    const { toast } = useToast()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            ownerName: "",
            ownerEmail: "",
            password: "",
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
            city: "",
            province: "",
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
            fieldsToValidate = ["ownerName", "ownerEmail", "password"]
        } else if (step === 3) {
            fieldsToValidate = []
        } else if (step === 4) {
            fieldsToValidate = ["location", "locationType", "province", "city"]
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
                        detectedZone = address.city || address.town || address.village || address.suburb || address.municipality || ""
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

            // Prepare payload
            const payload = {
                ...data, // includes password
                email: data.ownerEmail,
                coordinates: { lat, lng },
                region: detectedRegion || data.province, // Use selected province as region if detection fails or just pass it
                province: data.province,
                city: data.city,
                zone: detectedZone || data.zone || "Zona General",
                web: data.website, // mapping website to web
            }

            // Call Server Action
            const result = await registerVenue(payload)

            if (!result.success) {
                throw new Error(result.error)
            }

            toast({
                title: "¡Cuenta Creada!",
                description: "Tu local ha sido registrado con éxito.",
            })

            // Redirect to Success Page
            window.location.href = "/sumate/exito"

        } catch (error: any) {
            console.error(error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Hubo un problema al registrar tu cuenta.",
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
                                                <div className="space-y-2">
                                                    <MarkdownToolbar elementId="description" />
                                                    <p className="text-xs text-muted-foreground">
                                                        Podés usar la barra de herramientas para resaltar texto o crear listas.
                                                    </p>
                                                    <FormControl>
                                                        <Textarea
                                                            id="description"
                                                            placeholder="¿Qué hacés? ¿Qué vendés? ¿Qué te hace especial?"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </div>
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

                        {/* Step 2: User Account & Contact */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <CardHeader>
                                    <CardTitle>Creá tu Cuenta</CardTitle>
                                    <p className="text-muted-foreground">Tus datos para administrar el local.</p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4 border-b pb-6">
                                        <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Tus Datos</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="ownerName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tu Nombre Completo</FormLabel>
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
                                                        <FormLabel>Tu Email (Usuario)</FormLabel>
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
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contraseña</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="Mínimo 6 caracteres"
                                                                {...field}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Contacto del Negocio</h3>
                                        <FormField
                                            control={form.control}
                                            name="whatsapp"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>WhatsApp Público</FormLabel>
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
                                                        <FormLabel>Instagram</FormLabel>
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
                                                        <FormLabel>Facebook</FormLabel>
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
                                                        <FormLabel>Web</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="www.tunegocio.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
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
                                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 mb-4">
                                        <strong>⭐ Beneficio Trial:</strong> Tenés habilitada la carga de Portada y Galería completa por 30 días.
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
                                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="province"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Provincia</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccioná" />
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
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ciudad</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ej: Ushuaia" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

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
                                        Confirmar y Crear
                                    </Button>
                                </CardFooter>
                            </div>
                        )}
                    </form>
                </Form>
            </Card>
        </div>
    )
}
