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
import { Job, deleteJob } from "@/lib/actions/jobs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface JobsTableProps {
    jobs: Job[]
    venueId?: string // If present, we are in venue context
}

export function JobsTable({ jobs, venueId }: JobsTableProps) {
    const router = useRouter()
    const [jobToDelete, setJobToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        if (!jobToDelete) return

        setIsDeleting(true)
        try {
            const res = await deleteJob(jobToDelete);
            if (res.success) {
                toast.success("Empleo eliminado");
                router.refresh();
            } else {
                toast.error(res.error || "No se pudo eliminar el empleo");
            }
        } catch (error) {
            toast.error("Ocurrió un error al eliminar");
        } finally {
            setIsDeleting(false)
            setJobToDelete(null)
        }
    }

    return (
        <div className="space-y-4">
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
                                        {(() => {
                                            const vName = job.venues?.name;
                                            if (typeof vName === 'object' && vName !== null) {
                                                return (vName as any).es || (vName as any).en || "-";
                                            }
                                            return vName || job.company_name || "-";
                                        })()}
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
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => setJobToDelete(job.id)}
                                                title="Eliminar"
                                            >
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

            <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El empleo será eliminado permanentemente de la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
