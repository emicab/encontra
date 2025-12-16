"use client"

import { UseFormReturn } from "react-hook-form"
import { FormData } from "./schema"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownToolbar } from "@/components/ui/markdown-toolbar"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface StepBusinessProps {
    form: UseFormReturn<FormData>
    nextStep: () => void
}

export function StepBusiness({ form, nextStep }: StepBusinessProps) {
    const category = form.watch("category")

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
                <CardTitle>Tu Negocio</CardTitle>
                <p className="text-muted-foreground">Contanos lo básico para empezar.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Negocio</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: La Pizzería de Juan" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rubro</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccioná un rubro" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="restaurant">Gastronomía (Restaurante/Bar)</SelectItem>
                                    <SelectItem value="cafe">Cafetería / Panadería</SelectItem>
                                    <SelectItem value="shop">Tienda / Local de Ropa</SelectItem>
                                    <SelectItem value="service">Servicios Profesionales</SelectItem>
                                    <SelectItem value="entertainment">Entretenimiento</SelectItem>
                                    <SelectItem value="health">Salud y Belleza</SelectItem>
                                    <SelectItem value="home">Hogar y Construcción</SelectItem>
                                    <SelectItem value="market">Mercado / Almacén</SelectItem>
                                    <SelectItem value="other">Otro (Especificar)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {category === "other" && (
                    <FormField
                        control={form.control}
                        name="customCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Cuál es tu rubro?</FormLabel>
                                <FormControl>
                                    <Input placeholder="Especificá tu rubro" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción Breve</FormLabel>
                            <div className="space-y-2">
                                <MarkdownToolbar elementId="description" />
                                <p className="text-xs text-muted-foreground">
                                    Podés usar la barra de herramientas para resaltar texto o crear listas.
                                </p>
                                <FormControl>
                                    <Textarea
                                        id="description"
                                        placeholder="¿Qué hacés? ¿Qué vendés? ¿Qué te hace especial?"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="button" onClick={nextStep}>
                    Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </div>
    )
}
