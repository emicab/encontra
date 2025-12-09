"use client"

import { useState } from "react"
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
    ownerName: z.string().min(2, "Tu nombre es requerido"),
    ownerEmail: z.string().email("Ingresá un email válido"),
    category: z.string().min(1, "Seleccioná un rubro"),
    customCategory: z.string().optional(),
    description: z.string().min(10, "Contanos un poco más sobre tu negocio (mínimo 10 caracteres)"),
    phone: z.string().min(8, "Ingresá un número de contacto válido"),
    hours: z.string().optional(),
    location: z.string().optional(),
    locationType: z.enum(["address", "zone"]).optional(),

    // Step 2: Diagnostic
    visibility: z.enum(["yes", "no", "dont_know"], { required_error: "Por favor seleccioná una opción" }),
    friction: z.enum(["few", "many", "too_many"], { required_error: "Por favor seleccioná una opción" }),
    security: z.enum(["yes", "no"], { required_error: "Por favor seleccioná una opción" }),
})

type FormData = z.infer<typeof formSchema>

const steps = [
    { id: 1, title: "Tu Negocio" },
    { id: 2, title: "Diagnóstico" },
    { id: 3, title: "Confirmación" },
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
            phone: "",
            hours: "",
            location: "",
            locationType: "address",
            visibility: undefined,
            friction: undefined,
            security: undefined,
        },
        mode: "onChange",
    })

    const category = form.watch("category")

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormData)[] = []
        if (step === 1) {
            fieldsToValidate = ["name", "ownerName", "ownerEmail", "category", "description", "phone", "hours", "location", "locationType"]
            if (category === "other") fieldsToValidate.push("customCategory")
        } else if (step === 2) {
            fieldsToValidate = ["visibility", "friction", "security"]
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
            let detectedRegion = regionCode
            let detectedZone = ""

            if (data.location) {
                try {
                    // Always try to detect zone and region from address if provided
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.location)}&format=json&addressdetails=1&limit=1`)
                    const results = await response.json()

                    if (results && results.length > 0) {
                        const address = results[0].address

                        // Extract Zone (City/Town/Village/Suburb)
                        detectedZone = address.city || address.town || address.village || address.suburb || address.municipality || ""

                        if (!detectedRegion) {
                            // Nominatim returns 'state' for Argentina provinces
                            const state = address.state || address.province || ""

                            const match = Object.entries(REGIONS).find(([_, name]) => {
                                return state.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(state.toLowerCase())
                            })

                            if (match) detectedRegion = match[0]
                        }
                    }
                } catch (error) {
                    console.error("Error detecting details from address:", error)
                }
            }

            const { error } = await supabase.from("venue_requests").insert([{
                name: data.name,
                owner_name: data.ownerName,
                owner_email: data.ownerEmail,
                category: data.category === "other" ? data.customCategory : data.category,
                custom_category: data.customCategory,
                description: data.description,
                phone: data.phone,
                hours: data.hours,
                location: data.location,
                location_type: data.locationType,
                visibility: data.visibility,
                friction: data.friction,
                security: data.security,
                region_code: detectedRegion || 'tdf',
                zone: detectedZone,
            }])

            if (error) throw error

            setStep(3) // Move to success step
            toast({
                title: "¡Solicitud enviada!",
                description: "Nos pondremos en contacto con vos pronto.",
            })
        } catch (error) {
            console.error("Error submitting form:", error)
            toast({
                title: "Error",
                description: "Hubo un problema al enviar tu solicitud. Por favor intentá nuevamente.",
                variant: "destructive",
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

            <Card className="border-2 shadow-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <CardHeader>
                                    <CardTitle>Contanos sobre tu negocio</CardTitle>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="ownerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tu Nombre</FormLabel>
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
                                                    <FormLabel>Tu Email</FormLabel>
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

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono / WhatsApp</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: 11 1234 5678" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Para contactarte y darte la devolución.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="hours"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Horarios (Opcional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ej: Lun-Vie 9-18hs" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Para que sepan cuándo encontrarte.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ubicación / Zona (Opcional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ej: Av. Corrientes 1234 o 'Palermo'" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Si no tenés local, poné tu barrio.
                                                    </FormDescription>
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
                                                                Solo Zona/Barrio (Sin local o privado)
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
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

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <CardHeader>
                                    <CardTitle>Diagnóstico Rápido</CardTitle>
                                    <p className="text-muted-foreground">Ayudanos a entender tus desafíos actuales.</p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="visibility"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-base font-semibold">
                                                    Visibilidad: "Si yo busco tu producto en Google ahora mismo, ¿aparecés primero?"
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="yes" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Sí</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="no" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">No (o aparecen locales viejos)</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="dont_know" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">No sé</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="friction"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-base font-semibold">
                                                    Fricción de Venta: "¿Cuántas veces por semana te preguntan 'Precio' o 'Horario' por Instagram aunque ya lo hayas publicado?"
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="few" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Pocas</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="many" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Muchas (Me quita tiempo)</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="too_many" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Muchísimas</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="security"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-base font-semibold">
                                                    Seguridad (Para los sin local): "¿Te sentís cómodo poniendo la dirección exacta de tu casa pública en internet?"
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="yes" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Sí, no tengo problema.</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="no" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">No, prefiero privacidad.</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
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

                        {step === 3 && (
                            <div className="animate-in zoom-in duration-500 text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <Check className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">¡Gracias por sumarte!</h2>
                                <p className="text-muted-foreground mb-6">
                                    Hemos recibido tu información. Analizaremos tu diagnóstico y te contactaremos con una propuesta a medida.
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
