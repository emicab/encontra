import { getJob } from '@/lib/actions/jobs';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ArrowLeft, Building2, Globe, Share2 } from 'lucide-react';
import Link from 'next/link';
import { ApplicationForm } from '@/components/jobs/application-form';

export const dynamic = 'force-dynamic';

function safeRender(value: any): string {
    if (typeof value === 'object' && value !== null) {
        return value.es || value.en || "";
    }
    return value || "";
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const job = await getJob(id);

    if (!job) {
        notFound();
    }

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

    // Check if we have a valid contact email to receive applications
    const canApply = !!job.contact_email;

    // structured data for Google Jobs
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: typeof job.description === 'string'
            ? job.description
            : JSON.stringify(job.description).replace(/[\{\}"]/g, ''),
        identifier: {
            '@type': 'PropertyValue',
            name: safeRender(job.venues?.name) || job.company_name,
            value: job.id,
        },
        datePosted: job.created_at,
        validThrough: new Date(new Date(job.created_at).setMonth(new Date(job.created_at).getMonth() + 3)).toISOString(), // Approx 3 months validity
        employmentType: job.job_type.toUpperCase(),
        hiringOrganization: {
            '@type': 'Organization',
            name: safeRender(job.venues?.name) || job.company_name,
            logo: job.venues?.image || job.company_logo,
            sameAs: job.venues?.website ? `https://${job.venues.website}` : undefined
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                streetAddress: safeRender(job.venues?.address) || 'Remoto',
                addressLocality: safeRender(job.venues?.city) || 'Tierra del Fuego',
                addressRegion: 'Tierra del Fuego',
                addressCountry: 'AR'
            }
        },
        baseSalary: (job.salary_min || job.salary_max) ? {
            '@type': 'MonetaryAmount',
            currency: job.currency || 'ARS',
            value: {
                '@type': 'QuantitativeValue',
                minValue: job.salary_min,
                maxValue: job.salary_max,
                unitText: 'MONTH'
            }
        } : undefined
    };

    if (job.location_type === 'remote') {
        jsonLd.jobLocationType = 'TELECOMMUTE';
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Navigation Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-3xl">
                    <Link href="/jobs" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
                        <div className="p-1.5 rounded-full hover:bg-gray-100 mr-2 -ml-2 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        Volver
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                            <Share2 size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Unified Card Module */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* 1. Header Section */}
                    <div className="p-6 sm:p-8 border-b border-gray-100 bg-white text-center">
                        <div className="w-20 h-20 mx-auto bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shadow-sm mb-4">
                            {(job.venues?.image || job.company_logo) ? (
                                <img
                                    src={job.venues?.image || job.company_logo}
                                    alt={safeRender(job.venues?.name) || job.company_name}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            ) : (
                                <Building2 className="text-gray-300" size={32} />
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                            {job.title}
                        </h1>
                        <p className="text-lg text-gray-500 font-medium">
                            {safeRender(job.venues?.name) || job.company_name}
                        </p>
                    </div>

                    {/* 2. Metadata Grid (Compact) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50">
                        <div className="p-4 text-center">
                            <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Modalidad</span>
                            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700">
                                <Clock size={14} className="text-blue-500" />
                                {getJobTypeLabel(job.job_type)}
                            </div>
                        </div>
                        <div className="p-4 text-center">
                            <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Ubicación</span>
                            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700">
                                <Globe size={14} className="text-green-500" />
                                {job.location_type === 'onsite' ? 'Presencial' : 'Remoto'}
                            </div>
                        </div>
                        <div className="p-4 text-center col-span-2 sm:col-span-1 border-t sm:border-t-0 border-gray-100">
                            <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Salario</span>
                            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700">
                                <span className="font-bold text-emerald-500">$</span>
                                {formatSalary(job.salary_min, job.salary_max)}
                            </div>
                        </div>
                    </div>

                    {/* 3. Description (Highlighted) */}
                    <div className="p-6 sm:p-10 bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2 inline-block">
                            Sobre esta oportunidad
                        </h3>
                        <div className="prose prose-gray prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                            {typeof job.description === 'string'
                                ? job.description
                                : JSON.stringify(job.description, null, 2).replace(/[\{\}"]/g, '')
                            }
                        </div>
                    </div>

                    {/* 4. Desktop Action Footer */}
                    <div className="hidden md:block p-6 bg-gray-50 border-t border-gray-100 text-center">
                        <div className="max-w-xs mx-auto">
                            {canApply ? (
                                <ApplicationForm
                                    jobId={job.id}
                                    employerEmail={job.contact_email}
                                    jobTitle={job.title}
                                />
                            ) : (
                                <Button disabled className="w-full text-lg h-12">
                                    Postulación Cerrada
                                </Button>
                            )}
                            <p className="text-xs text-gray-400 mt-3">
                                Al postularte, compartirás tu CV directamente con la empresa.
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            {/* Mobile Fixed Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {canApply ? (
                    <ApplicationForm
                        jobId={job.id}
                        employerEmail={job.contact_email}
                        jobTitle={job.title}
                    />
                ) : (
                    <Button disabled className="w-full" size="lg">
                        Postulación Cerrada
                    </Button>
                )}
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const job = await getJob(id);

    if (!job) {
        return {
            title: 'Empleo no encontrado | Encontrá TDF',
        };
    }

    const title = `${job.title} en ${safeRender(job.venues?.name) || job.company_name}`;
    const description = `Postulate para ${job.title}. ${job.job_type} en ${safeRender(job.venues?.address) || 'Tierra del Fuego'}.`;

    return {
        title: `${title} | Bolsa de Trabajo`,
        description,
        openGraph: {
            title,
            description,
            images: [job.venues?.image || job.company_logo || '/og-job-placeholder.png'],
        },
    };
}
