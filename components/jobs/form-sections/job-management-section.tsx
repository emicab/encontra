
import { Control, UseFormGetValues, UseFormRegister } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { JobFormValues } from "@/lib/schemas/jobs"

interface JobManagementFieldsProps {
    control: Control<JobFormValues>
    register: UseFormRegister<JobFormValues>
    getValues: UseFormGetValues<JobFormValues>
    isLoggedIn: boolean
    loading: boolean
}

export function JobManagementFields({ control, register, getValues, isLoggedIn, loading }: JobManagementFieldsProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Salario y Contacto</h3>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
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
                    control={control}
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


            {/* Management Section */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 pb-2">Gestión del Aviso</h3>

                {!isLoggedIn ? (
                    <>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                Creá una contraseña para poder editar o borrar este aviso después. Si ya tenés cuenta, usá tu contraseña actual.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name="contact_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tu Email <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="tu@email.com" {...field} />
                                        </FormControl>
                                        <FormDescription>Recibirás los CVs aquí.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tu Contraseña <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} />
                                        </FormControl>
                                        <FormDescription>Para gestionar tu aviso luego.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </>
                ) : (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                            <span className="font-semibold">Sesión iniciada como:</span> {getValues('contact_email')}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                            Este aviso se vinculará a tu cuenta automáticamente.
                        </p>
                        {/* Hidden fields to keep form logic happy if needed, though we skip validation in backend */}
                        <input type="hidden" {...register('contact_email')} />
                    </div>
                )}
            </div>


            <Button type="submit" className="w-full h-12 text-lg" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publicar Empleo Gratis
            </Button>
        </div>
    )
}
