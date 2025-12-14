"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { upsertJob } from "@/lib/actions/jobs"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Bold, List } from "lucide-react"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ui/image-upload"
import { REGIONS } from "@/lib/regions"

import { CompanyInfoSection, BasicModeFields, AdvancedModeFields } from "@/components/admin/job-form-sections"


// Define the schema
const jobSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, "El título es muy corto"),
    company_name: z.string().optional(),
    company_logo: z.string().optional(),
    description: z.string().min(10, "La descripción es obligatoria"),
    salary_min: z.coerce.number().optional(),
    salary_max: z.coerce.number().optional(),
    job_type: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship']),
    location_type: z.enum(['onsite', 'remote', 'hybrid']),
    contact_email: z.string().email("Email inválido"),
    is_active: z.boolean().default(true),
    city: z.string().min(2, "Ciudad requerida").optional(),
    region_code: z.string().min(2, "Provincia requerida").optional(),
    venue_id: z.string().optional().nullable(),

    // Advanced fields
    role_description: z.string().optional(),
    responsibilities: z.string().optional(),
    requirements_min: z.string().optional(),
    requirements_opt: z.string().optional(),
    schedule: z.string().optional(),
    company_description: z.string().optional(),
    location_address: z.string().optional(),
    benefits: z.string().optional(),
    contact_phone: z.string().optional(),
    deadline: z.string().optional(),
})

interface JobFormProps {
    initialData?: any
    venueId?: string // If creating contextually for a venue
    onSuccess?: () => void
}

export function JobForm({ initialData, venueId, onSuccess }: JobFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'basic' | 'advanced'>('basic')

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        defaultValues: initialData ? {
            ...initialData,
            city: initialData.city || "",
            region_code: initialData.region_code || "",
            // Ensure description is string if it comes as JSONB object
            description: typeof initialData.description === 'object' ? JSON.stringify(initialData.description) : initialData.description,
        } : {
            title: "",
            company_name: "",
            company_logo: "",
            description: "",
            salary_min: 0,
            salary_max: 0,
            job_type: "full_time",
            location_type: "onsite",
            city: "",
            region_code: "",
            contact_email: "",
            is_active: true,
            venue_id: venueId || null,
            // Advanced defaults
            role_description: "",
            responsibilities: "",
            requirements_min: "",
            requirements_opt: "",
            schedule: "",
            company_description: "",
            location_address: "",
            benefits: "",
            contact_phone: "",
            deadline: "",
        },
    })

    async function onSubmit(values: z.infer<typeof jobSchema>) {
        setLoading(true)
        try {
            // If venue_id is provided, prioritize it
            if (venueId) values.venue_id = venueId;

            // Fix strict type mismatch for null vs undefined
            const payload = {
                ...values,
                venue_id: values.venue_id || undefined
            };

            const result = await upsertJob(payload);

            if (result.success) {
                toast.success("Empleo guardado correctamente");
                router.refresh(); // Refresh current router cache to ensure 'back' might pick up changes if shared, or just good practice
                // Small delay to ensure server revalidation propagates? Unlikely needed with revalidatePath, 
                // but strictly router.back() relies on browser history which might be stale.
                // A better approach is often to replace instead of push, or just back.
                setTimeout(() => {
                    router.back();
                }, 100);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error(error)
            toast.error("Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                <Tabs value={mode} onValueChange={(v) => setMode(v as 'basic' | 'advanced')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="basic">Básico</TabsTrigger>
                        <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título del Puesto</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Mozo de Salón" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Show Company fields only if NO venueId */}
                    {!venueId && (
                        <CompanyInfoSection form={form} loading={loading} />
                    )}

                    {/* Description - Basic Mode */}
                    {mode === 'basic' && (
                        <BasicModeFields form={form} />
                    )}

                    {/* Advanced Fields */}
                    {mode === 'advanced' && (
                        <AdvancedModeFields form={form} />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="job_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Contrato</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="full_time">Full Time</SelectItem>
                                            <SelectItem value="part_time">Part Time</SelectItem>
                                            <SelectItem value="contract">Contrato</SelectItem>
                                            <SelectItem value="freelance">Freelance</SelectItem>
                                            <SelectItem value="internship">Pasantía</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modalidad</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="onsite">Presencial</SelectItem>
                                            <SelectItem value="hybrid">Híbrido</SelectItem>
                                            <SelectItem value="remote">Remoto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="salary_min"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salario Min (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="salary_max"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salario Max (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="contact_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email de contacto (Para recibir CVs)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="rrhh@empresa.com" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contact_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp / Teléfono (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+54 9 2901 ..." {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Activo</FormLabel>
                                    <FormDescription>
                                        Si está desactivado, no aparecerá en el listado público.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Empleo
                    </Button>
                </div>
            </form>
        </Form>
    )
}
