import { getAdminJobs } from "@/lib/actions/jobs"
import { JobsTable } from "@/components/admin/jobs-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminJobsPage() {
    const jobs = await getAdminJobs()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Empleos</h1>
                    <p className="text-muted-foreground">Administra todas las ofertas laborales de la plataforma.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/jobs/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Empleo
                    </Link>
                </Button>
            </div>
            <JobsTable jobs={jobs} />
        </div>
    )
}
