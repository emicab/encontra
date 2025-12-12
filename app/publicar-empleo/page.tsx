
import { PublicJobForm } from "@/components/jobs/public-job-form"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Publicar Empleo | Encontrá",
    description: "Publicá tu búsqueda laboral en Encontrá.",
}

export default function PublicJobPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <PublicJobForm />
        </div>
    )
}
