"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2, Eye, MoreVertical, Users } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteJob, getMyDashboardJobs } from "@/lib/actions/jobs"
import { toast } from "sonner"
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

export default function MyJobsPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchMyJobs()
    }, [])

    async function fetchMyJobs() {
        try {
            const data = await getMyDashboardJobs();
            if (data) {
                setJobs(data)
            }
        } catch (error) {
            console.error("Error fetching my jobs:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        const result = await deleteJob(deleteId)
        if (result.success) {
            toast.success("Empleo eliminado")
            fetchMyJobs()
        } else {
            toast.error(result.error)
        }
        setDeleteId(null)
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mis Empleos</h2>
                    <p className="text-muted-foreground">Gestioná tus avisos publicados.</p>
                </div>
                <Button asChild>
                    <Link href="/publicar-empleo">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Aviso
                    </Link>
                </Button>
            </div>

            {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-gray-50 text-center">
                    <div className="rounded-full bg-gray-100 p-4 mb-4">
                        <BriefcaseIcon className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No tenés empleos publicados</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Publicá tu primera oferta laboral para encontrar talento local.
                    </p>
                    <Button asChild>
                        <Link href="/publicar-empleo">Publicar Empleo</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow gap-4">
                            {/* Left Section: Info */}
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-lg truncate leading-none">{job.title}</h3>
                                    <Badge variant={job.is_active ? "default" : "secondary"} className={`text-[10px] h-5 ${!job.is_active ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : ""}`}>
                                        {job.is_active ? "Activo" : "Pendiente"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                                    <span className="font-medium text-gray-700">{job.company_name}</span>
                                    <span>•</span>
                                    <span>{job.location_city}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="hidden sm:inline text-xs">Pub hace {formatDistanceToNow(new Date(job.created_at), { locale: es })}</span>
                                </div>
                            </div>

                            {/* Right Section: Stats & Actions */}
                            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5" title="Visitas">
                                        <Eye className="h-4 w-4 text-gray-400" />
                                        <span>{job.views || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Candidatos">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span>{job.applications_count || 0}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/jobs/${job.slug || job.id}`} target="_blank">
                                                    <Eye className="mr-2 h-4 w-4" /> Ver Publicación
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                onClick={() => setDeleteId(job.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El aviso será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
