"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageUpload from "@/components/ui/image-upload"
import { MarkdownToolbar } from "@/components/ui/markdown-toolbar"
import { REGIONS } from "@/lib/regions"
import { UseFormReturn } from "react-hook-form"

// We can define the form type flexibly or import it. 
// For now, using 'any' for the form control to avoid circular dependency complex types with the main file if strict typing isn't easily shared.
// Ideally, we export the Schema from job-form.tsx and infer it here, but let's keep it simple for modularization first.

interface SectionProps {
    form: UseFormReturn<any>;
    loading?: boolean;
}

export function CompanyInfoSection({ form, loading }: SectionProps) {
    return (
        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
            <div className="">
                <h4 className="text-base font-semibold text-gray-900">Datos de la Empresa</h4>
                <p className="text-sm text-gray-500">Información para mostrar si no hay un local asociado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <FormField
                    control={form.control}
                    name="region_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Provincia</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar provincia" />
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
                            <FormLabel>Ciudad / Partido</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Ej. La Plata" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}

export function BasicModeFields({ form }: SectionProps) {
    return (
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between items-center mb-2">
                        <FormLabel>Descripción del Puesto</FormLabel>
                        <MarkdownToolbar elementId="admin-job-description" />
                    </div>
                    <FormControl>
                        <Textarea
                            id="admin-job-description"
                            placeholder="Describí las tareas, requisitos y beneficios..."
                            className="min-h-[200px] leading-relaxed"
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export function AdvancedModeFields({ form }: SectionProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid gap-6">
                <FormField
                    control={form.control}
                    name="role_description"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center mb-2">
                                <FormLabel>Descripción del Rol</FormLabel>
                                <MarkdownToolbar elementId="desc-role" />
                            </div>
                            <FormControl>
                                <Textarea id="desc-role" placeholder="¿Qué va a hacer la persona?" className="min-h-[120px]" {...field} value={field.value ?? ''} />
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
                            <div className="flex justify-between items-center mb-2">
                                <FormLabel>Responsabilidades</FormLabel>
                                <MarkdownToolbar elementId="desc-resp" />
                            </div>
                            <FormControl>
                                <Textarea id="desc-resp" placeholder="Listá las responsabilidades..." className="min-h-[120px]" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="requirements_min"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Requisitos Mínimos</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Excluyentes..." className="min-h-[120px]" {...field} value={field.value ?? ''} />
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
                                <FormLabel>Requisitos Deseables</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Opcionales..." className="min-h-[120px]" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="schedule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Horario</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Lun a Vie de 9 a 18hs" {...field} value={field.value ?? ''} />
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
                                <FormLabel>Fecha Límite</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="company_description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción de la Empresa (Opcional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Breve descripción de la empresa..." {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location_address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección Exacta (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Av. San Martín 1234" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center mb-2">
                                <FormLabel>Beneficios</FormLabel>
                                <MarkdownToolbar elementId="desc-benefits" />
                            </div>
                            <FormControl>
                                <Textarea id="desc-benefits" placeholder="Obra social, viáticos..." className="min-h-[120px]" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
