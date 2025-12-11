'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { Buffer } from 'node:buffer';

// Initialize Resend with API Key from env
const resend = new Resend(process.env.RESEND_API_KEY);

export type Job = {
    id: string;
    created_at: string;
    owner_id?: string;
    venue_id?: string;
    company_name?: string;
    company_logo?: string;
    title: string;
    description: any; // API returns jsonb
    salary_min?: number;
    salary_max?: number;
    currency: string;
    job_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
    location_type: 'onsite' | 'remote' | 'hybrid';
    contact_email: string;
    is_active: boolean;
    application_count: number;
    slug?: string;
    venues?: {
        name: string;
        image: string;
        slug: string;
        address: string;
        region_code?: string;
        zone?: string;
        city?: string;
    };
};

export async function getJobs(filters?: { region?: string; city?: string; zone?: string }) {
    const supabase = await createClient();

    let query = supabase
        .from('jobs')
        .select(`
      *,
      venues!inner (
        name,
        image, 
        slug,
        address,
        region_code,
        zone,
        city
      )
    `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    // Note: We use !inner on venues to filter jobs based on venue properties

    if (filters?.region) {
        query = query.eq('venues.region_code', filters.region);
    }

    const { data: rawData, error } = await query;

    if (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }

    let data = rawData as Job[];

    // JS-side filtering for City/Zone
    // 'city' filter implies we want matches on the city field.
    // 'zone' filter (legacy or specific) might match zone.
    // If 'zone' is passed but we want to match City (from URL params like /region/ushuaia), we should check both or prefer city.

    // We'll normalize the input filter (which might be passed as 'zone' from legacy calls or 'city')
    const filterTerm = filters?.city || filters?.zone;

    if (filterTerm) {
        const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
        const target = normalize(filterTerm);

        data = data.filter(job => {
            if (!job.venues) return false;

            // Check City first (primary grouping)
            if (job.venues.city && normalize(job.venues.city) === target) return true;

            // Fallback: Check Zone (for legacy or specific neighborhood matching if needed)
            // If the user navigated to /ushuaia, and a venue has zone="Ushuaia" (and maybe empty city?), it should match.
            // But if venue has zone="Los Fueguinos" and city="Ushuaia", it matches via the city check above.
            if (job.venues.zone && normalize(job.venues.zone) === target) return true;

            return false;
        });
    }

    return data;
}

export async function getJob(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('jobs')
        .select(`
      *,
      venues (
        name,
        image,
        slug,
        address,
        region_code,
        zone,
        city
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching job:', error);
        return null;
    }

    return data as Job;
}

export async function submitApplication(formData: FormData) {
    const jobId = formData.get('jobId') as string;
    const employerEmail = formData.get('employerEmail') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const turnstileToken = formData.get('turnstileToken') as string;

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const file = formData.get('cv') as File;

    // 1. Validate Turnstile
    if (!turnstileToken) {
        return { success: false, error: 'Validación de seguridad requerida' };
    }

    const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
        }),
        headers: { 'Content-Type': 'application/json' }
    });

    const turnstileResult = await turnstileVerify.json();
    if (!turnstileResult.success) {
        return { success: false, error: 'Error de validación de seguridad (Captcha)' };
    }

    if (!employerEmail) {
        return { success: false, error: 'No employer email found' };
    }

    if (!file || file.size === 0) {
        return { success: false, error: 'CV requerido' };
    }

    // 2. Prepare Attachment
    console.log(`[JobApplication] Processing CV: ${file.name} (${file.size} bytes)`);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[JobApplication] Sending email via Resend to ${employerEmail}...`);

        // Create a timeout promise
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Email sending timed out after 15s')), 15000)
        );

        const emailPromise = resend.emails.send({
            from: 'Encontrá | Bolsa de Trabajo <trabajo@encontra.com.ar>',
            to: [employerEmail],
            replyTo: email,
            subject: `CV para: ${jobTitle} - Enviado vía Encontrá`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                
                <!-- Header -->
                <div style="background-color: #000000; padding: 30px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Encontrá</h1>
                    <p style="color: #a1a1aa; margin: 5px 0 0 0; font-size: 14px;">Bolsa de Trabajo</p>
                </div>

                <!-- Content -->
                <div style="padding: 40px;">
                    <h2 style="margin-top: 0; color: #111; font-size: 20px; font-weight: 600;">Nueva Postulación Recibida</h2>
                    <p style="color: #52525b; font-size: 16px;">¡Hola! Tenés un nuevo candidato para tu búsqueda de <strong>${jobTitle}</strong>.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding-bottom: 8px; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600;">Candidato</td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 16px; color: #1e293b; font-size: 16px; font-weight: 500;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 8px; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600;">Email de contacto</td>
                            </tr>
                            <tr>
                                <td style="color: #1e293b; font-size: 16px; font-weight: 500;">
                                    <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                                </td>
                            </tr>
                        </table>
                    </div>

                    ${message ? `
                    <div style="margin-bottom: 24px;">
                        <p style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Mensaje del candidato:</p>
                        <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px; color: #422006; font-style: italic; border-radius: 4px;">
                            "${message}"
                        </div>
                    </div>
                    ` : ''}

                    <p style="color: #52525b;">📎 El <strong>CV</strong> (Curriculum Vitae) se encuentra adjunto a este correo en formato PDF.</p>

                    <div style="margin-top: 32px; text-align: center;">
                        <a href="mailto:${email}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;">Responder al Candidato</a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                        Potenciado por <strong>Encontrá</strong>
                    </p>
                    
                    <div style="margin-top: 16px;">
                        <a href="https://encontra.com.ar/sumate" style="color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 500;">Publicar empleo</a>
                        <span style="color: #cbd5e1; margin: 0 8px;">•</span>
                        <a href="https://encontra.com.ar" style="color: #64748b; text-decoration: none; font-size: 13px;">Visitar sitio</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `,
            attachments: [
                {
                    filename: file.name,
                    content: buffer,
                }
            ]
        });

        // Race between email send and timeout
        const { data, error } = await Promise.race([emailPromise, timeout]) as any;

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error: 'Error enviando email: ' + error.message };
        }

        // Optional: Increment stats in DB here if desired, but we keep it stateless for now as requested.

        return { success: true, data };
    } catch (err) {
        console.error('Error sending email:', err);
        return { success: false, error: 'Failed to send email' };
    }
}

// --- Admin / Owner Actions ---

export async function getAdminJobs(venueId?: string) {
    const supabase = await createClient();

    let query = supabase
        .from('jobs')
        .select(`
            *,
            venues(
                name,
                image,
                slug
            )
        `)
        .order('created_at', { ascending: false });

    if (venueId) {
        query = query.eq('venue_id', venueId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching admin jobs:', error);
        return [];
    }

    return data as Job[];
}

export async function upsertJob(data: Partial<Job>) {
    const supabase = await createClient();

    // Validate session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const jobData = {
        ...data,
        owner_id: user.id, // Ensure owner is set on creation
        // On update, RLS checks ownership/admin status
    };

    // Auto-generate slug if not present or title changed (simple version)
    // For now, if creating a new job without slug, make one.
    if (!jobData.slug && jobData.title) {
        jobData.slug = jobData.title
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dash
            .replace(/(^-|-$)+/g, '') // remove leading/trailing dashes
            + '-' + Math.random().toString(36).substring(2, 7); // add randomness to ensure uniqueness
    }

    // --- ENFORCE JOB LIMITS ---
    if (jobData.venue_id && jobData.is_active !== false) { // Only check if activating/creating active
        const { data: venue, error: venueError } = await supabase
            .from('venues')
            .select('subscription_plan')
            .eq('id', jobData.venue_id)
            .single();

        if (venueError || !venue) {
            return { success: false, error: 'Local no encontrado' };
        }

        const plan = venue.subscription_plan as 'free' | 'basic' | 'premium';
        let limit = 0;
        if (plan === 'basic') limit = 1;
        if (plan === 'premium') limit = 10;

        if (limit === 0) {
            return { success: false, error: 'Tu plan actual no permite publicar empleos.' };
        }

        // Count active jobs
        let countQuery = supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('venue_id', jobData.venue_id)
            .eq('is_active', true);

        if (jobData.id) {
            countQuery = countQuery.neq('id', jobData.id); // Exclude current job if updating
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
            console.error("Error counting jobs", countError);
            return { success: false, error: 'Error verificando límites' };
        }

        // If we are creating/updating to active, checking count + 1 > limit is wrong if we rely on count < limit
        // Current count (0) < limit (1) -> OK.
        // Current count (1) < limit (1) -> Fail.
        if ((count || 0) >= limit) {
            return { success: false, error: `Has alcanzado el límite de ${limit} empleos activos para tu plan.` };
        }
    }
    // ---------------------------

    // Remove expanded relations if present to avoid DB error
    delete (jobData as any).venues;

    const { data: result, error } = await supabase
        .from('jobs')
        .upsert(jobData)
        .select()
        .single();

    if (error) {
        console.error('Error upserting job:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/jobs');
    revalidatePath('/[region]/jobs'); // Wildcard revalidation isn't standard, but let's try or just rely on concrete paths if possible. 
    // Ideally we revalidate the specific region pages but we don't have the region here easily unless we query the venue.
    // For now, let's focus on the Admin list which is the user's report.
    revalidatePath('/admin/jobs');

    if (data.venue_id) {
        revalidatePath(`/admin/venues/${data.venue_id}`);
        revalidatePath(`/admin/venues/${data.venue_id}/jobs`);
    }

    return { success: true, data: result };
}

export async function deleteJob(id: string) {
    const supabase = await createClient();

    // Validate session
    const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting job:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/jobs');
    revalidatePath('/admin/jobs');
    return { success: true };
}
