
import { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { REGIONS } from "@/lib/regions"
import { JobFormValues } from "@/lib/schemas/jobs"

interface JobBasicInfoProps {
    control: Control<JobFormValues>
}

export function JobBasicInfo({ control }: JobBasicInfoProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información General</h3>

            <FormField
                control={control}
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
                control={control}
                name="company_name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre de la Empresa (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. Restaurante El Faro" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={control}
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
                    control={control}
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
                    control={control}
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
                    control={control}
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
                    control={control}
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
    )
}
