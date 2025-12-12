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
import { submitJobRequest } from "@/lib/actions/jobs"
import { toast } from "sonner"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { REGIONS } from "@/lib/regions";
import { Bold, List } from "lucide-react"

// Helper Component: Markdown Toolbar
function MarkdownToolbar({ elementId }: { elementId: string }) {
    const insertText = (before: string, after: string = "") => {
        const textarea = document.getElementById(elementId) as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(textarea, newText);

        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
    };

    return (
        <div className="flex gap-1 mb-1.5 p-1 bg-gray-50 border border-gray-200 rounded-md w-fit">
            <button
                type="button"
                onClick={() => insertText("**", "**")}
                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                title="Negrita"
            >
                <Bold size={14} />
            </button>
            <button
                type="button"
                onClick={() => insertText("- ")}
                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                title="Lista"
            >
                <List size={14} />
            </button>
        </div>
    );
}

// Common fields
const commonSchema = {
    title: z.string().min(3, "El título es muy corto"),
    job_type: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship']),
    location_type: z.enum(['onsite', 'remote', 'hybrid']),
    company_name: z.string().min(2, "Nombre de empresa requerido"),
    company_logo: z.string().url("URL inválida").optional().or(z.literal("")),
    contact_email: z.string().email("Email inválido"), // Postulación
    contact_phone: z.string().optional(), // WhatsApp
    salary_min: z.coerce.number().optional(),
    salary_max: z.coerce.number().optional(),
    location_city: z.string().min(2, "Ciudad requerida"),
    region_code: z.string().min(2, "Provincia requerida"),
}

// Basic Schema
const basicSchema = z.object({
    mode: z.literal('basic'),
    description: z.string().min(10, "La descripción es obligatoria"),
    ...commonSchema,
})

// Advanced Schema
const advancedSchema = z.object({
    mode: z.literal('advanced'),
    role_description: z.string().min(10, "Describí qué va a hacer la persona"),
    responsibilities: z.string().min(10, "Listá las responsabilidades principales"),
    requirements_min: z.string().min(5, "Requerido"),
    requirements_opt: z.string().optional(),
    schedule: z.string().optional(),
    company_description: z.string().optional(),
    location_address: z.string().optional(),
    benefits: z.string().optional(),
    deadline: z.string().optional(),
    ...commonSchema,
}).omit({ location_city: true }).extend({
    location_city: z.string().min(2, "Ciudad requerida"),
})


// Discriminated Union
const jobFormSchema = z.discriminatedUnion("mode", [
    basicSchema,
    advancedSchema
])


export function PublicJobForm() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [mode, setMode] = useState<'basic' | 'advanced'>('basic')

    const form = useForm<z.infer<typeof jobFormSchema>>({
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
        },
    })

    // Update mode in form when state changes
    const onModeChange = (value: string) => {
        const newMode = value as 'basic' | 'advanced';
        setMode(newMode);
        form.setValue('mode', newMode);
        // Clean errors when switching?
        form.clearErrors();
    }

    async function onSubmit(values: z.infer<typeof jobFormSchema>) {
        setLoading(true)
        try {
            const result = await submitJobRequest(values);

            if (result.success) {
                setSuccess(true);
                toast.success("Solicitud enviada correctamente");
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
                        <Link href="/bio-encontra">Volver al Inicio</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-8">
                <Link href="/bio-encontra" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4">
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

            <div className="mb-6">
                <Tabs value={mode} onValueChange={onModeChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="basic">Formulario Simple</TabsTrigger>
                        <TabsTrigger value="advanced">Formulario Detallado</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">

                    {/* Common Fields */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información General</h3>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título del Puesto <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Desarrollador Frontend Jr" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Empresa <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Restaurante El Faro" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                <SelectItem value="contract">Temporal / Proyecto</SelectItem>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="region_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provincia <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccioná una provincia" />
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
                                name="location_city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ciudad / Localidad <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Ushuaia" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contact_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>WhatsApp (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+54 2901..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* BASIC MODE */}
                    {mode === 'basic' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Descripción</h3>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between items-center">
                                            <FormLabel>Descripción del Empleo <span className="text-red-500">*</span></FormLabel>
                                            <MarkdownToolbar elementId="desc-basic" />
                                        </div>
                                        <FormDescription>Incluí responsabilidades, requisitos y cualquier info relevante.</FormDescription>
                                        <FormControl>
                                            <Textarea
                                                id="desc-basic"
                                                placeholder="Estamos buscando..."
                                                className="min-h-[200px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {/* ADVANCED MODE */}
                    {mode === 'advanced' && (
                        <>
                            {/* 1. Información del Puesto Detalles */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Detalles del Puesto</h3>

                                <FormField
                                    control={form.control}
                                    name="role_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Descripción del Rol <span className="text-red-500">*</span></FormLabel>
                                                <MarkdownToolbar elementId="desc-role" />
                                            </div>
                                            <FormControl>
                                                <Textarea id="desc-role" placeholder="Qué va a hacer la persona, sin vueltas..." className="min-h-[100px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="responsibilities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Responsabilidades Principales <span className="text-red-500">*</span></FormLabel>
                                                <MarkdownToolbar elementId="desc-resp" />
                                            </div>
                                            <FormDescription>Listá de 3 a 8 items (bullets)</FormDescription>
                                            <FormControl>
                                                <Textarea id="desc-resp" placeholder="- Tarea 1&#10;- Tarea 2&#10;- Tarea 3" className="min-h-[100px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="schedule"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Horario (Si aplica)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Lunes a Viernes 9 a 18hs" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* 2. Requisitos */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Requisitos</h3>

                                <FormField
                                    control={form.control}
                                    name="requirements_min"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Requisitos Mínimos <span className="text-red-500">*</span></FormLabel>
                                                <MarkdownToolbar elementId="desc-req-min" />
                                            </div>
                                            <FormControl>
                                                <Textarea id="desc-req-min" placeholder="Experiencia, habilidades técnicas, idiomas..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="requirements_opt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Requisitos Opcionales (Bonus)</FormLabel>
                                                <MarkdownToolbar elementId="desc-req-opt" />
                                            </div>
                                            <FormControl>
                                                <Textarea id="desc-req-opt" placeholder="Cosas que suman puntos pero no excluyen..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* 3. Mas Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Más Información</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="location_address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dirección Aproximada</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. Centro, o Calle San Martín al 500" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="company_description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Breve Descripción de la Empresa</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Qué hacen, sector, tamaño..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="company_logo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Logo URL (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="deadline"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha Límite (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="benefits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Beneficios</FormLabel>
                                                <MarkdownToolbar elementId="desc-benefits" />
                                            </div>
                                            <FormControl>
                                                <Textarea id="desc-benefits" placeholder="Obra social, viáticos, comida, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </>
                    )}

                    {/* Common Footer */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Salario y Contacto</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="salary_min"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salario Min (ARS)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
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
                                        <FormLabel>Salario Max (ARS)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
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
                                    <FormLabel>Email de Recepción <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="rrhh@empresa.com" {...field} />
                                    </FormControl>
                                    <FormDescription>Dónde llegan los CVs (No será público)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>


                    <Button type="submit" className="w-full h-12 text-lg" size="lg" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Pubicar Empleo
                    </Button>

                </form>
            </Form>
        </div>
    )
}
