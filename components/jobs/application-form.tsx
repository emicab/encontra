"use client"

import { useState, useRef } from "react"
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
import { Loader2, UploadCloud, FileText } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Turnstile from "react-turnstile"

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
            </DrawerContent>
        </Drawer>
    )
}

function ApplicationFormContent({ jobId, employerEmail, jobTitle, onSuccess }: ApplicationFormProps & { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [token, setToken] = useState("")

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

        const formData = new FormData(event.currentTarget)
        formData.append("jobId", jobId)
        formData.append("employerEmail", employerEmail)
        formData.append("jobTitle", jobTitle)
        formData.append("turnstileToken", token)
        // File is already in formData because of input type="file" name="cv", but we validated it state-side

        const result = await submitApplication(formData)

        setLoading(false)

        if (result.success) {
            toast.success("¡Postulación enviada con éxito!")
            onSuccess()
        } else {
            toast.error(result.error || "Hubo un error al enviar tu postulación. Intentá nuevamente.")
        }
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
                                setFile(e.target.files[0])
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
