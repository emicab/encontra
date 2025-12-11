"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Job } from "@/lib/actions/jobs"
import { deleteJob } from "@/lib/actions/jobs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JobsTableProps {
    jobs: Job[]
    venueId?: string // If present, we are in venue context
}

export function JobsTable({ jobs, venueId }: JobsTableProps) {
    const router = useRouter()

    async function handleDelete(id: string) {
        if (confirm("¿Estás seguro de que querés eliminar este empleo?")) {
            const res = await deleteJob(id);
            if (res.success) {
                toast.success("Empleo eliminado");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Empleos Publicados ({jobs.length})</h2>
                <Link href={venueId ? `/admin/venues/${venueId}/jobs/new` : "/admin/jobs/new"}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Empleo
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Empresa / Local</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Modalidad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Candidatos</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No hay empleos cargados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{job.title}</span>
                                            <span className="text-xs text-muted-foreground">{job.slug}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {job.venues?.name || job.company_name || "-"}
                                    </TableCell>
                                    <TableCell>{job.job_type.replace('_', ' ')}</TableCell>
                                    <TableCell>{job.location_type}</TableCell>
                                    <TableCell>
                                        <Badge variant={job.is_active ? "default" : "secondary"}>
                                            {job.is_active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {job.application_count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/jobs/${job.id}`} target="_blank">
                                                <Button size="icon" variant="ghost" title="Ver Publicación">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={venueId ? `/admin/venues/${venueId}/jobs/${job.id}` : `/admin/jobs/${job.id}`}>
                                                <Button size="icon" variant="outline" title="Editar">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button size="icon" variant="destructive" onClick={() => handleDelete(job.id)} title="Eliminar">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
