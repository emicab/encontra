
import { Control } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownToolbar } from "@/components/ui/markdown-toolbar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobFormValues } from "@/lib/schemas/jobs"

interface JobDescriptionFieldsProps {
    control: Control<JobFormValues>
    mode: 'basic' | 'advanced'
    onModeChange: (value: string) => void
}

export function JobDescriptionFields({ control, mode, onModeChange }: JobDescriptionFieldsProps) {
    return (
        <>
            <div className="mb-6">
                <Tabs value={mode} onValueChange={onModeChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="basic">Formulario Simple</TabsTrigger>
                        <TabsTrigger value="advanced">Formulario Detallado</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* BASIC MODE */}
            {mode === 'basic' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Descripción</h3>
                    <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                    <FormLabel>Descripción del Empleo (Opcional)</FormLabel>
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
                            control={control}
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
                            control={control}
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
                            control={control}
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
                            control={control}
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
                            control={control}
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
                                control={control}
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
                                control={control}
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
                                control={control}
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
                                control={control}
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
                            control={control}
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
        </>
    )
}
