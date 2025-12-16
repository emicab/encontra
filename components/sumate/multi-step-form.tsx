"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

import { useRegion } from "@/components/providers/region-provider"
import { REGIONS } from "@/lib/regions"
import { registerVenue } from "@/lib/actions/onboarding"
import { formSchema, FormData, steps } from "./schema"
import { StepBusiness } from "./step-business"
import { StepContact } from "./step-contact"
import { StepMultimedia } from "./step-multimedia"
import { StepLocation } from "./step-location"

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
                            <StepBusiness form={form} nextStep={nextStep} />
                        )}

                        {/* Step 2: User Account & Contact */}
                        {step === 2 && (
                            <StepContact form={form} nextStep={nextStep} prevStep={prevStep} />
                        )}

                        {/* Step 3: Multimedia / Images */}
                        {step === 3 && (
                            <StepMultimedia form={form} nextStep={nextStep} prevStep={prevStep} isPending={isPending} />
                        )}

                        {/* Step 4: Location */}
                        {step === 4 && (
                            <StepLocation form={form} prevStep={prevStep} isPending={isPending} />
                        )}
                    </form>
                </Form>
            </Card>
        </div>
    )
}
