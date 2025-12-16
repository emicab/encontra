"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormData } from "./schema"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react"

interface StepContactProps {
    form: UseFormReturn<FormData>
    nextStep: () => void
    prevStep: () => void
}

export function StepContact({ form, nextStep, prevStep }: StepContactProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
                <CardTitle>Creá tu Cuenta</CardTitle>
                <p className="text-muted-foreground">Tus datos para administrar el local.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 border-b pb-6">
                    <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Tus Datos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="ownerName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tu Nombre Completo</FormLabel>
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
                                    <FormLabel>Tu Email (Usuario)</FormLabel>
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
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 6 caracteres"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Contacto del Negocio</h3>
                    <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>WhatsApp Público</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: 2901 123456" {...field} />
                                </FormControl>
                                <FormDescription>Para que los clientes te contacten.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instagram</FormLabel>
                                    <FormControl>
                                        <Input placeholder="@tu.negocio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Facebook</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tu Negocio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Web</FormLabel>
                                    <FormControl>
                                        <Input placeholder="www.tunegocio.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button type="button" onClick={nextStep}>
                    Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </div>
    )
}
