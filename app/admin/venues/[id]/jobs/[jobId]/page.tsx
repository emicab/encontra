import { JobForm } from "@/components/admin/job-form"
import { getJob } from "@/lib/actions/jobs"
import { notFound } from "next/navigation"

interface Props {
    params: Promise<{
        id: string
        jobId: string
    }>
}

export default async function EditVenueJobPage({ params }: Props) {
    const { id, jobId } = await params
    const job = await getJob(jobId)

    if (!job) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Empleo</h1>
                <p className="text-muted-foreground">Modifica la oferta laboral.</p>
            </div>
            <JobForm initialData={job} venueId={params.id} />
        </div>
    )
}
