"use client"

import { Job } from "@/lib/actions/jobs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobsTable } from "./jobs-table"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Inbox } from "lucide-react"

interface AdminJobsDashboardProps {
    jobs: Job[]
}

export function AdminJobsDashboard({ jobs }: AdminJobsDashboardProps) {
    const activeJobs = jobs.filter(j => j.is_active)
    const pendingJobs = jobs.filter(j => !j.is_active)

    return (
        <Tabs defaultValue="pending" className="w-full">
            <div className="flex items-center justify-between mb-6">
                <TabsList>
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Inbox size={16} />
                        Solicitudes
                        {pendingJobs.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                {pendingJobs.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <Briefcase size={16} />
                        Activos
                        <Badge variant="secondary" className="ml-1 h-5 w-auto px-1.5 rounded-full flex items-center justify-center text-[10px]">
                            {activeJobs.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="pending" className="space-y-4">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                        <Inbox className="h-5 w-5" />
                        Bandeja de Entrada
                    </h3>
                    <p className="text-sm text-orange-700 mt-1">
                        Estas solicitudes requieren revisión. Hacé clic en "Editar" para revisar los datos y activar el empleo si corresponde.
                    </p>
                </div>
                <JobsTable jobs={pendingJobs} />
            </TabsContent>

            <TabsContent value="active">
                <JobsTable jobs={activeJobs} />
            </TabsContent>
        </Tabs>
    )
}
