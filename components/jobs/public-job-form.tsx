"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form } from "@/components/ui/form"
import { submitJobRequest } from "@/lib/actions/jobs"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { supabase } from "@/lib/supabase"
import { jobFormSchema, JobFormValues } from "@/lib/schemas/jobs"

// Sub-components
import { JobBasicInfo } from "./form-sections/job-basic-info"
import { JobDescriptionFields } from "./form-sections/job-details-mode"
import { JobManagementFields } from "./form-sections/job-management-section"
import { VenueSelectionDialog } from "./form-sections/venue-selection-dialog"

export function PublicJobForm() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [mode, setMode] = useState<'basic' | 'advanced'>('basic')
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Venue Selection State
    const [venueSelectionOpen, setVenueSelectionOpen] = useState(false)
    const [detectedVenues, setDetectedVenues] = useState<any[]>([])
    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
    const [pendingValues, setPendingValues] = useState<any>(null)

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobFormSchema),
        defaultValues: {
            mode: 'basic',
            title: "",
            job_type: "full_time",
            location_type: "onsite",
            salary_min: 0,
            salary_max: 0,
            company_name: "",
            location_city: "",
            region_code: "",
            contact_email: "",
            // Basic
            description: "",
            // Advanced defaults
            role_description: "",
            responsibilities: "",
            requirements_min: "",
            requirements_opt: "",
            schedule: "",
            company_description: "",
            location_address: "",
            benefits: "",
            company_logo: "",
            contact_phone: "",
            deadline: "",
            password: "",
        } as any,
    })

    // Check Session
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setIsLoggedIn(true)
                form.setValue("contact_email", user.email || "")
            }
        }
        checkUser()
    }, [form])

    // Update mode in form when state changes
    const onModeChange = (value: string) => {
        const newMode = value as 'basic' | 'advanced';
        setMode(newMode);
        form.setValue('mode', newMode);
        form.clearErrors();
    }

    async function onSubmit(values: JobFormValues) {
        if (!isLoggedIn && (!values.password || values.password.length < 6)) {
            form.setError("password", { message: "La contraseña es requerida para nuevos usuarios" })
            return
        }

        setLoading(true)
        try {
            // Include selected venue if any
            const valuesToSend = {
                ...values,
                venue_id: selectedVenueId || undefined,
            };

            const result = await submitJobRequest(valuesToSend) as any;

            if (result.success) {
                setSuccess(true);
                toast.success("Solicitud enviada correctamente");
            } else if (result.requires_venue_selection) {
                // Open Modal
                setPendingValues(values); // Save for retry
                setDetectedVenues(result.venues);
                setVenueSelectionOpen(true);
            } else {
                toast.error(result.error || "Error al enviar solicitud");
            }
        } catch (error) {
            console.error(error)
            toast.error("Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    const handleVenueSelection = async () => {
        if (!selectedVenueId) return;
        setVenueSelectionOpen(false);
        // Retry with selection
        setLoading(true);
        try {
            const result = await submitJobRequest({
                ...pendingValues,
                venue_id: selectedVenueId
            });
            if (result.success) {
                setSuccess(true);
                toast.success("Solicitud vinculada y enviada correctamente");
            } else {
                toast.error(result.error);
            }
        } catch (e) { toast.error("Error al reintentar"); }
        finally { setLoading(false); }
    }

    const handleSkipVenue = async () => {
        setVenueSelectionOpen(false);
        setLoading(true);
        try {
            // Retry with explicit skip
            const result = await submitJobRequest({
                ...pendingValues,
                skip_venue_link: true
            });
            if (result.success) {
                setSuccess(true);
                toast.success("Solicitud enviada (Cuenta Personal)");
            } else {
                toast.error(result.error);
            }
        } catch (e) { toast.error("Error al reintentar"); }
        finally { setLoading(false); }
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h2>
                <p className="text-gray-600 mb-8">
                    Recibimos tu solicitud para <strong>{form.getValues('title')}</strong>. Nuestro equipo la revisará y la aprobará en breve.
                </p>
                <div className="space-y-3">
                    <Button asChild className="w-full">
                        <Link href={isLoggedIn ? "/admin" : "/bio-encontra"}>Volver al Inicio</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-8">
                <Link href={isLoggedIn ? "/admin" : "/bio-encontra"} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4">
                    <ArrowLeft size={16} />
                    Volver
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Publicar un Empleo</h1>
                        <p className="text-gray-500 mt-2">Completá el formulario para publicar tu búsqueda laboral gratis.</p>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">

                    <JobBasicInfo control={form.control} />

                    <JobDescriptionFields
                        control={form.control}
                        mode={mode}
                        onModeChange={onModeChange}
                    />

                    <JobManagementFields
                        control={form.control}
                        register={form.register}
                        getValues={form.getValues}
                        isLoggedIn={isLoggedIn}
                        loading={loading}
                    />

                </form>
            </Form>

            <VenueSelectionDialog
                open={venueSelectionOpen}
                onOpenChange={setVenueSelectionOpen}
                detectedVenues={detectedVenues}
                selectedVenueId={selectedVenueId}
                onSelectVenue={setSelectedVenueId}
                onConfirm={handleVenueSelection}
                onSkip={handleSkipVenue}
            />
        </div>
    )
}
