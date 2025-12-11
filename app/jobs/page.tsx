import { getJobs } from '@/lib/actions/jobs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Clock, Building2, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
    const jobs = await getJobs();

    // Helper to format salary
    const formatSalary = (min?: number, max?: number, currency = 'ARS') => {
        if (!min && !max) return 'A convenir';
        const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 });
        if (min && max) return `${fmt.format(min)} - ${fmt.format(max)}`;
        if (min) return `Desde ${fmt.format(min)}`;
        if (max) return `Hasta ${fmt.format(max)}`;
        return 'A convenir';
    };

    const getJobTypeLabel = (type: string) => {
        const map: Record<string, string> = {
            full_time: 'Full Time',
            part_time: 'Part Time',
            contract: 'Contrato',
            freelance: 'Freelance',
            internship: 'Pasantía'
        };
        return map[type] || type;
    };

    // Helper to safe render strings that might be objects (JSONB)
    const safeRender = (value: any) => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            return value.es || value.en || value.name || JSON.stringify(value);
        }
        return String(value);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="mb-2">
                        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                            <ArrowLeft size={16} />
                            Volver al inicio
                        </Link>
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Bolsa de Trabajo
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Encontrá tu próxima oportunidad laboral
                    </p>

                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Buscar puesto, empresa o ciudad..."
                            className="pl-10 bg-gray-50 border-gray-200"
                        />
                    </div>
                </div>
            </div>

            {/* Job List - Horizontal Cards */}
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-gray-900 font-medium">No hay empleos activos</h3>
                        <p className="text-gray-500 text-sm mt-1">Volvé a intentar más tarde.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
                                <div className="flex gap-4">
                                    {/* Logo */}
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                            {(job.venues?.image || job.company_logo) ? (
                                                <img
                                                    src={job.venues?.image || job.company_logo}
                                                    alt={job.venues?.name || job.company_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Building2 className="text-gray-300" size={24} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm mt-0.5 font-medium truncate">
                                                    {safeRender(job.venues?.name) || job.company_name || 'Confidencial'}
                                                </p>
                                            </div>
                                            {/* New Badge */}
                                            {new Date(job.created_at).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000 && (
                                                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                    Nuevo
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-y-1 gap-x-3 mt-3 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} className="text-gray-400" />
                                                {job.location_type === 'remote' ? 'Remoto' : (safeRender(job.venues?.address) || 'Tierra del Fuego')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} className="text-gray-400" />
                                                {getJobTypeLabel(job.job_type)}
                                            </div>
                                            <div className="flex items-center gap-1 font-medium text-green-600">
                                                $ {formatSalary(job.salary_min, job.salary_max)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
