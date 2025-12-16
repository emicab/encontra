"use client"

import { UseFormReturn } from "react-hook-form"
import { FormData } from "./schema"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, ChevronLeft } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"

interface StepMultimediaProps {
    form: UseFormReturn<FormData>
    nextStep: () => void
    prevStep: () => void
    isPending: boolean
}

export function StepMultimedia({ form, nextStep, prevStep, isPending }: StepMultimediaProps) {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
                <CardTitle>Multimedia</CardTitle>
                <p className="text-muted-foreground">Dale vida a tu perfil (Subí tus imágenes).</p>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 mb-4">
                    <strong>⭐ Beneficio Trial:</strong> Tenés habilitada la carga de Portada y Galería completa por 30 días.
                </div>

                <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value ? [field.value] : []}
                                    disabled={isPending}
                                    onChange={(url) => field.onChange(url)}
                                    onRemove={() => field.onChange("")}
                                />
                            </FormControl>
                            <FormDescription>Tu logo cuadrado.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Foto de Portada</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value ? [field.value] : []}
                                    disabled={isPending}
                                    onChange={(url) => field.onChange(url)}
                                    onRemove={() => field.onChange("")}
                                />
                            </FormControl>
                            <FormDescription>Foto apaisada/horizontal.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
