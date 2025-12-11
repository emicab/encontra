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
import { Switch } from "@/components/ui/switch"
import { upsertJob } from "@/lib/actions/jobs"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ui/image-upload"

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
    venue_id: z.string().optional().nullable(),
})

interface JobFormProps {
    initialData?: any
    venueId?: string // If creating contextually for a venue
}

export function JobForm({ initialData, venueId }: JobFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Handle JSONB description field if coming from DB
    const processedInitialData = initialData ? {
        ...initialData,
        description: typeof initialData.description === 'string' ? initialData.description : JSON.stringify(initialData.description)
    } : null;

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        defaultValues: processedInitialData || {
            title: "",
            company_name: "",
            company_logo: "",
            description: "",
            salary_min: 0,
            salary_max: 0,
            job_type: "full_time",
            location_type: "onsite",
            contact_email: "",
            is_active: true,
            venue_id: venueId || null,
        },
    })

    async function onSubmit(values: z.infer<typeof jobSchema>) {
        setLoading(true)
        try {
            // If venue_id is provided, prioritize it
            if (venueId) values.venue_id = venueId;

            const result = await upsertJob(values);

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-semibold text-gray-500 mb-2">Datos de la Empresa (Si no está asociada a un Local)</h4>
                            </div>
                            <FormField
                                control={form.control}
                                name="company_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de Empresa</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Hotel Fueguino" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="company_logo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo (URL)</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value ? [field.value] : []}
                                                onChange={(url) => field.onChange(url)}
                                                onRemove={() => field.onChange("")}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Responsabilidades, requisitos..." className="min-h-[150px]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
