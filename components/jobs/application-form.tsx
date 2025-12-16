"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitApplication } from "@/lib/actions/jobs"
import { toast } from "sonner"
import { Loader2, UploadCloud, FileText, CheckCircle2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Turnstile from "react-turnstile"
import { supabase } from "@/lib/supabase"

interface ApplicationFormProps {
    jobId: string
    employerEmail: string
    jobTitle: string
}

export function ApplicationForm({ jobId, employerEmail, jobTitle }: ApplicationFormProps) {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                        Postularme Ahora
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Postulación a {jobTitle}</DialogTitle>
                        <DialogDescription>
                            Inicia tu postulación aquí. Dejános tus datos y CV.
                        </DialogDescription>
                    </DialogHeader>
                    <ApplicationFormContent
                        jobId={jobId}
                        employerEmail={employerEmail}
                        jobTitle={jobTitle}
                        onSuccess={() => setOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                    Postularme Ahora
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm max-h-[85vh] overflow-y-auto">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Postulación a {jobTitle}</DrawerTitle>
                        <DrawerDescription>
                            Completá tus datos para enviar tu CV.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">
                        <ApplicationFormContent
                            jobId={jobId}
                            employerEmail={employerEmail}
                            jobTitle={jobTitle}
                            onSuccess={() => setOpen(false)}
                        />
                    </div>
                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}



// ... (props interface remains same)

function ApplicationFormContent({ jobId, employerEmail, jobTitle, onSuccess }: ApplicationFormProps & { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false) // New success state
    const [file, setFile] = useState<File | null>(null)
    const [token, setToken] = useState("")
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        if (!file) {
            toast.error("Por favor, adjuntá un archivo PDF.");
            setLoading(false);
            return;
        }

        if (!token) {
            toast.error("Por favor, completá la validación de seguridad (Captcha).");
            setLoading(false);
            return;
        }

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${jobId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(fileName, file)

            if (uploadError) {
                console.error("Upload Error:", uploadError)
                throw new Error("Error al subir el CV. Intenta nuevamente.")
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(fileName)

            const formData = new FormData(event.currentTarget)
            formData.append("jobId", jobId)
            formData.append("employerEmail", employerEmail)
            formData.append("jobTitle", jobTitle)
            formData.append("turnstileToken", token)
            formData.append("cvUrl", publicUrl) // Send URL instead of file
            // Remove huge file from formdata to avoid payload limit
            formData.delete("cv")

            const result = await submitApplication(formData)

            if (result.success) {
                // Show success screen instead of closing immediately
                setSuccess(true)
            } else {
                toast.error(result.error || "Hubo un error al enviar tu postulación. Intentá nuevamente.")
            }
        } catch (error) {
            console.error("Error submitting application:", error)
            toast.error("Error de conexión. Por favor intentá nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">¡Postulación Enviada!</h3>
                <p className="text-gray-500 mb-8 max-w-[280px]">
                    Hemos enviado tu CV correctamente. La empresa se pondrá en contacto si tu perfil avanza.
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <Button
                        onClick={() => onSuccess()}
                        className="w-full bg-black text-white hover:bg-gray-800"
                    >
                        Ver más empleos
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            router.push('/')
                            // We don't necessarily need to close modal if we navigate away, but cleaner if we do.
                            // But navigation might unmount anyway.
                        }}
                        className="w-full"
                    >
                        Explorar locales
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" name="name" required placeholder="Juan Pérez" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="juan@ejemplo.com" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="message">Mensaje (Opcional)</Label>
                <Textarea id="message" name="message" placeholder="Contanos brevemente por qué sos ideal para el puesto..." />
            </div>

            <div className="grid gap-2">
                <Label>Curriculum Vitae (PDF)</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="file"
                        name="cv"
                        accept="application/pdf"
                        className="hidden"
                        id="cv-upload"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                const selectedFile = e.target.files[0]
                                // Limit to 10MB (Now using Storage)
                                if (selectedFile.size > 10 * 1024 * 1024) {
                                    toast.error("El archivo es demasiado grande. Máximo 10MB.");
                                    e.target.value = ""; // Reset input
                                    setFile(null);
                                    return;
                                }
                                setFile(selectedFile)
                            }
                        }}
                    />
                    <label
                        htmlFor="cv-upload"
                        className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        {file ? (
                            <div className="flex items-center gap-2 text-green-600 font-medium p-2">
                                <FileText size={20} />
                                <span className="truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                                <UploadCloud size={24} className="mb-1" />
                                <p className="text-xs">Hacé clic para subir tu PDF</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            <div className="flex justify-center py-2">
                <Turnstile
                    sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onVerify={(token) => setToken(token)}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2 bg-black text-white hover:bg-gray-800">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Postulación
            </Button>
        </form>
    )
}
