import { getAdminJobs } from "@/lib/actions/jobs"
import { JobsTable } from "@/components/admin/jobs-table"

interface Props {
    params: Promise<{
        id: string
    }>
}

export default async function VenueJobsPage({ params }: Props) {
    const { id } = await params
    const jobs = await getAdminJobs(id)

    return (
        <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Empleos del Local</h3>
                    <p className="text-sm text-muted-foreground">Gestiona las búsquedas laborales de este local.</p>
                </div>
            </div>
            <JobsTable jobs={jobs} venueId={id} />
        </div>
    )
}
