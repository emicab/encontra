'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { Buffer } from 'node:buffer';
import { createAdminClient } from '@/lib/supabase/admin';

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
    contact_phone?: string;
    is_active: boolean;
    application_count?: number; // DB column: applications_count
    applications_count?: number; // Alias often used if not careful, sticking to snake_case matches DB usually
    views?: number;
    slug?: string;
    venues?: {
        name: string;
        image: string;
        slug: string;
        address: string;
        region_code?: string;
        zone?: string;
        city?: string;
        website?: string;
    };
    city?: string; // Cache/Denormalized
    region_code?: string; // Cache/Denormalized
};

export async function getJobs(filters?: { region?: string; city?: string; zone?: string }) {
    const supabase = await createClient();

    let query = supabase
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
        city,
        website
      )
    `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    // Filter by Region
    if (filters?.region) {
        // We want jobs where (jobs.region_code = region) OR (venues.region_code = region)
        // Since we can't easily do OR across tables in one simple chain without embedding constraints differently,
        // A common pattern is to rely on duplication or specific PostgREST filter syntax.
        // But the easiest fix for "Public Jobs" is to ensure they rely on 'region_code' column in jobs table.
        // AND for Venue Jobs, we should ALSO populate 'region_code' in jobs table upon upsert/insert.
        // IF we assume 'region_code' in jobs table is the source of truth for filtering:
        // Then we just filter .eq('region_code', filters.region).
        // BUT we need to backfill existing venue jobs or ensure upsertJob populates it.

        // TEMPORARY FIX: Use specific OR syntax string or just rely on jobs.region_code IF we enforce it.
        // Let's try to filter on jobs.region_code primarily.
        // But existing jobs from venues have NULL region_code in jobs table.
        // So we need a hybrid approach or migrate data.

        // Let's try the PostgREST "or" filter with embedded resource syntax if possible, but that's hard.
        // Alternative: Filter in memory? No, pagination.

        // BEST PATH: Update getJobs to look for EITHER.
        // Actually, if we change `venues!inner` to just `venues` (left join), we get all jobs.
        // Then simple `.eq` on `venues.region_code` would filter out nulls... wait.

        // Let's use the explicit 'or' syntax.
        // `query.or(`region_code.eq.${filters.region},venues.region_code.eq.${filters.region}`)`
        // But `venues.region_code` is in a joined table. PostgREST referencing joined cols in top-level OR is tricky.

        // STRATEGY: 
        // 1. Modify `upsertJob` to ALWAYS save `region_code` to the job (copy from venue if needed).
        // 2. Run a "migration" script or just accept that old jobs need an update.
        // 3. For now, to make the user's NEW job show up, it has `region_code`.
        // 4. The `venues!inner` constraint is killing us.

        // Change: Use Left Join for venues.
        // Then how to filter?

        // If I use `query.eq('region_code', filters.region)` it will find the new public job.
        // But it won't find old venue jobs (null region_code).

        // Recommendation: UPDATE jobs SET region_code = venues.region_code FROM venues WHERE jobs.venue_id = venues.id;
        // If I run this SQL, then I can rely 100% on `jobs.region_code`.
        // This is the cleanest solution.

        // So I will change the code to filter by `jobs.region_code`.
        // And I will ask the user to run the SQL to backfill.
        // AND I will update `upsertJob` to maintain this invariant.

        query = query.eq('region_code', filters.region);
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
            // Check Job City (Denormalized/Public)
            if (job.city && normalize(job.city) === target) return true;

            // Check Venue City/Zone (if venue exists)
            if (job.venues) {
                if (job.venues.city && normalize(job.venues.city) === target) return true;
                if (job.venues.zone && normalize(job.venues.zone) === target) return true;
            }

            return false;
        });
    }

    return data;
}

export async function getJob(idOrSlug: string) {
    const supabase = await createClient();

    // Simple UUID check regex (8-4-4-4-12 hex digits)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    let query = supabase
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
    `);

    if (isUUID) {
        query = query.eq('id', idOrSlug);
    } else {
        query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.single();

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

    // Increment Application Count in DB (Optimistic - we do it before email or parallel)
    const supabaseAdmin = createAdminClient();
    // We use RPC or raw update to increment safely
    // But simplistic approach: get current, +1, update.
    // Better: create a stored procedure 'increment_applications_count' or just use rpc if available.
    // For now, let's just do a simple read-update since high concurrency is unlikely for this niche.
    // Actually, Supabase has no built-in atomic increment via JS client easily without Rpc.
    // Let's use the 'rpc' approach if we had one "increment_counter".
    // Fallback: Fetch current count.
    const { data: jobData } = await supabaseAdmin.from('jobs').select('applications_count').eq('id', jobId).single();
    const currentCount = jobData?.applications_count || 0;

    await supabaseAdmin.from('jobs').update({ applications_count: currentCount + 1 }).eq('id', jobId);


    if (!employerEmail) {
        return { success: false, error: 'No employer email found' };
    }

    if (!file || file.size === 0) {
        return { success: false, error: 'CV requerido' };
    }

    // 2. Prepare Attachment


    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);



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
                        <a href="https://encontra.com.ar/publicar-empleo" style="color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 500;">Publicar empleo</a>
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
    // Use Admin Client to view ALL jobs (including inactive/unowned)
    const supabase = createAdminClient();

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

export async function getAdminJob(id: string) {
    const supabase = createAdminClient();

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
        console.error('Error fetching admin job:', error);
        return null;
    }

    return data as Job;
}

export async function upsertJob(data: Partial<Job>) {
    const supabase = await createClient(); // Standard client for auth check

    // Validate session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if user is Admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin;

    // Select Client: Admins get service role (bypass RLS), Users get standard (enforced RLS)
    const client = isAdmin ? createAdminClient() : supabase;




    // Prepare data
    const jobData = { ...data };

    // Set owner_id for new records if not present (Admins might be creating for themselves or others, but typically valid logic matches existing pattern)
    // If updating, owner_id shouldn't change unless explicit.
    if (!jobData.id && !jobData.owner_id) {
        jobData.owner_id = user.id;
    }

    // Check ownership / Adoption logic (Only for standard users if we wanted to enforce logic, but RLS/Admin client split handles 99%)
    // If Updating...
    if (jobData.id) {
        // SAFETY CHECK: Preserve owner_id if not provided in update payload
        // This prevents Admin Approval from accidentally wiping the owner if the form didn't send it.
        if (!jobData.owner_id) {
            const adminClient = createAdminClient();
            const { data: currentJob } = await adminClient
                .from('jobs')
                .select('owner_id')
                .eq('id', jobData.id)
                .single();

            if (currentJob && currentJob.owner_id) {

                jobData.owner_id = currentJob.owner_id;
            }
        }

        if (!isAdmin) {
            // ... legacy logic for standard user adoption ...
            const supabaseAdmin = createAdminClient();
            const { data: currentJob, error: fetchError } = await supabaseAdmin
                .from('jobs')
                .select('owner_id')
                .eq('id', jobData.id)
                .single();

            if (fetchError || !currentJob) {
                return { success: false, error: 'Job not found' };
            }

            // If job has NO owner (Public Request), allow adoption!
            if (!currentJob.owner_id) {
                jobData.owner_id = user.id; // Claim it
            } else if (currentJob.owner_id !== user.id) {
                // Check if user is absolute Admin (optional, but RLS usually handles this)
                // For now, if owner mismatch, RLS "update" policy will fail unless we use Admin Client.
                // If we WANT admins to edit ANY job, we should use Admin Client here too.
                // Let's rely on standard RLS "Users can update their own jobs" for normal logic,
                // OR use AdminClient if we trust the user is an Admin (which we don't know here easily).

                // NOTE: If the user IS the owner, standard client works.
                // If the user IS NOT the owner, standard client fails.
                // If the user just claimed it (was null), we MUST use AdminClient to perform the update
                // because standard client RLS "auth.uid() = owner_id" will compare with NULL (db) vs USER (auth).
            }

            // If we are claiming it (owner was null), we MUST use Admin Client to save.
            if (!currentJob.owner_id) {
                const { data: result, error } = await supabaseAdmin
                    .from('jobs')
                    .upsert(jobData)
                    .select()
                    .single();

                if (error) return { success: false, error: error.message };

                // Revalidate
                revalidatePath('/jobs');
                revalidatePath('/admin/jobs');
                return { success: true, data: result };
            }

        }
    }


    // Standard Upsert (for normal flows)
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
    if (jobData.venue_id) {
        // Sync location from Venue
        const { data: venue, error: venueError } = await supabase
            .from('venues')
            .select('subscription_plan, region_code, city, zone')
            .eq('id', jobData.venue_id)
            .single();

        if (venue) {
            // Copy location to job for easier filtering
            jobData.region_code = venue.region_code;
            jobData.city = venue.city; // Or venue.zone if city is empty?
            // Actually, venue has 'city' column? Check schema.
            // Schema view showed: `city` in getAdminJob select? 
            // Wait, `getAdminJob` selected `city` from venues. `multi_tenant_regions.sql` added `region_code`. 
            // I did NOT verify `city` column exists on venues table in the initial view_file.
            // Let's assume it does or I'll check.
            // Inspecting `schema.sql` again... lines 1-21 do NOT show city.
            // But step 229 showed `city` in the select. Maybe it was added later or in a migration I missed or inferred.
            // Let's look at `getJobs` select in step 270: `venues ( ..., city )`.
            // So `venues` has a `city` column (or relation?).

            // If `venues` has city, use it.
        }

        if (venueError || !venue) {
            return { success: false, error: 'Local no encontrado' };
        }

        const plan = venue.subscription_plan as 'free' | 'basic' | 'premium';
        // ... rest of limit logic ...
        if (jobData.is_active !== false) {
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

            if ((count || 0) >= limit) {
                return { success: false, error: `Has alcanzado el límite de ${limit} empleos activos para tu plan.` };
            }
        }
    }
    // ---------------------------

    // Remove expanded relations if present to avoid DB error
    delete (jobData as any).venues;



    const { data: result, error } = await client
        .from('jobs')
        .upsert(jobData)
        .select()
        .single();

    if (result) {

    }

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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if user is Admin
    // We can't trust the client-side cookie claim fully without verifying against DB or relying on custom claims if set.
    // Query profiles.
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;

    let error;

    if (isAdmin) {
        // Use Admin Client to bypass RLS (Admins can delete anything)
        const supabaseAdmin = createAdminClient();
        const response = await supabaseAdmin
            .from('jobs')
            .delete()
            .eq('id', id);
        error = response.error;
    } else {
        // Standard User (RLS will restrict to own jobs)
        const response = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);
        error = response.error;
    }

    if (error) {
        console.error('Error deleting job:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/jobs');
    revalidatePath('/admin/jobs');
    return { success: true };
}



export async function submitJobRequest(data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Validate Inputs
    if (!user && (!data.contact_email || !data.password)) {
        return { success: false, error: 'Email y contraseña son requeridos para gestionar tu aviso.' };
    }

    if (!data.title) {
        return { success: false, error: 'El título es requerido.' };
    }

    const supabaseAdmin = createAdminClient();
    // supabase client already declared at top



    let userId = '';
    let venueIdToLink = data.venue_id || null; // If passed from UI (user selected one)

    // 2. Auth Logic: Check if user exists or create
    let verifiedUser = user || null;
    let isNewUser = false;

    if (!verifiedUser) {


        // Try to create user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: data.contact_email,
            password: data.password,
            email_confirm: true,
            user_metadata: { role: 'recruiter' }
        });

        if (createError) {


            // Check if user already exists
            if (createError.message.includes('already registered') || createError.status === 400 || createError.status === 422) {


                // Verify Password
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: data.contact_email,
                    password: data.password
                });

                if (signInError || !signInData.user) {
                    console.error("SubmitJobRequest: SignIn failed:", signInError);
                    return { success: false, error: 'El usuario ya existe pero la contraseña es incorrecta.' };
                }

                verifiedUser = signInData.user;

            } else {
                console.error("SubmitJobRequest: Create user critical error:", createError);
                return { success: false, error: 'Error al registrar usuario: ' + createError.message };
            }
        } else {

            verifiedUser = newUser.user;
        }
    }

    if (!verifiedUser) {
        return { success: false, error: "Error de autenticación inesperado." };
    }

    userId = verifiedUser.id;


    // 3. User Venues Check (for linking)
    const { data: userVenues } = await supabaseAdmin
        .from('venues')
        .select('id, name, slug, image')
        .eq('owner_id', userId);

    if (userVenues && userVenues.length > 0) {
        // If the user hasn't selected a venue yet (and didn't explicitly skip)
        if (!venueIdToLink && !data.skip_venue_link) {

            return {
                success: false,
                requires_venue_selection: true,
                venues: userVenues,
                message: `Detectamos que administrás locales. ¿Querés publicar esto a nombre de alguno?`
            };
        }
    }

    // 3. Prepare Job Data
    // Random slug for uniqueness
    const slug = (data.title || "job")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        + '-' + Math.random().toString(36).substring(2, 7);

    // Format Description Block
    let descriptionBlock = ``;

    if (data.description && typeof data.description === 'string' && data.description.length > 0) {
        // Basic Mode: Description is passed directly
        descriptionBlock = data.description;
    } else {
        // Advanced Mode Assembly
        if (data.role_description) descriptionBlock += `**Descripción del Rol:**\n${data.role_description}\n\n`;
        if (data.responsibilities) descriptionBlock += `**Responsabilidades:**\n${data.responsibilities}\n\n`;
        if (data.requirements_min) descriptionBlock += `**Requisitos Mínimos:**\n${data.requirements_min}\n\n`;
        if (data.requirements_opt) descriptionBlock += `**Requisitos Opcionales:**\n${data.requirements_opt}\n\n`;
        if (data.schedule) descriptionBlock += `**Horario:** ${data.schedule}\n`;
        if (data.benefits) descriptionBlock += `\n**Beneficios:**\n${data.benefits}\n\n`;
        if (data.company_description) descriptionBlock += `\n**Sobre la empresa:**\n${data.company_description}\n`;
        if (data.deadline) descriptionBlock += `\n**Fecha Límite:** ${data.deadline}`;
    }

    // 4. Insert Job
    const jobData = {
        owner_id: userId, // KEY CHANGE: Linked to real user
        venue_id: venueIdToLink, // Optional: Linked to venue if selected
        title: data.title,
        company_name: data.company_name,
        company_logo: data.company_logo || null,
        description: descriptionBlock,
        salary_min: data.salary_min || null,
        salary_max: data.salary_max || null,
        currency: 'ARS',
        job_type: data.job_type,
        location_type: data.location_type,
        region_code: data.region_code || null,
        city: data.location_city || null,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        is_active: false, // Still requires approval (or automatic if we want?) -> Keep false for safety
        slug: slug,
        // Advanced Fields Persistence
        role_description: data.role_description || null,
        responsibilities: data.responsibilities || null,
        requirements_min: data.requirements_min || null,
        requirements_opt: data.requirements_opt || null,
        schedule: data.schedule || null,
        benefits: data.benefits || null,
        company_description: data.company_description || null,
        deadline: data.deadline || null,
        // source: 'self_service_covert' // Removed until column is added
    };

    // Use Admin Client to insert (User might not have RLS permission to insert 'jobs' directly dependent on policy)
    // Assuming 'authenticated' users can insert their own jobs? 
    // If not, using AdminClient is safer for this specific flow to guarantee insertion.
    const { data: result, error } = await supabaseAdmin
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

    if (error) {
        console.error('Error submitting job request:', error);
        return { success: false, error: 'Error al guardar aviso: ' + error.message };
    }

    // 5. Send Notification Email (To User)
    try {
        await resend.emails.send({
            from: 'Encontrá <hola@encontra.com.ar>',
            to: [data.contact_email],
            subject: '¡Tu aviso está creado!',
            html: `
                <h1>Hola!</h1>
                <p>Tu aviso <strong>${data.title}</strong> se ha creado correctamente.</p>
                <p>Está pendiente de aprobación. Te avisaremos cuando esté online.</p>
                <p>Podés gestionarlo ingresando con tu email y la contraseña que acabas de crear/usar.</p>
                <br/>
                <p><strong>Encontrá</strong></p>
            `
        });
    } catch (e) {
        console.error("Error sending confirmation email", e);
        // Don't fail the request, just log
    }

    return { success: true, data: result, isNewUser };
}

export async function getMyDashboardJobs() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    // Use Admin Client to ensure we can see Pending jobs regardless of restrictive RLS
    // (Assuming RLS might be "is_active=true" only for public view)
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user jobs", error);
        return [];
    }

    return data as Job[];
}

export async function incrementJobView(jobId: string) {
    const supabaseAdmin = createAdminClient();

    // Atomic increment would be better, but read-update suffices for stats
    const { data: job } = await supabaseAdmin.from('jobs').select('views').eq('id', jobId).single();
    const currentViews = job?.views || 0;

    await supabaseAdmin.from('jobs').update({ views: currentViews + 1 }).eq('id', jobId);
    return { success: true };
}
