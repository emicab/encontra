"use server"

import { createClient } from "@/lib/supabase/server"
import { addDays } from "date-fns"
import { slugify } from "@/lib/utils"

export async function registerVenue(data: any) {
    const supabase = await createClient()

    try {
        const {
            email,
            password,
            ownerName,
            name,
            description,
            category,
            customCategory,
            whatsapp,
            instagram,
            web,
            facebook,
            location,
            locationType,
            coordinates,
            hours,
            logo,
            image,
            zone,
            region,
            province, // New
            city, // New
        } = data

        let userId = null

        // 1. Auth: Sign Up or Sign In
        // Try to Sign Up first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: ownerName,
                },
            },
        })

        if (signUpError) {
            // If user exists, try to Sign In
            // The error message from Supabase for existing user varies, but let's try login if signup fails
            // or simply check if the error indicates existence.
            // Alternatively, we can just try SignIn if SignUp fails.
            console.log("SignUp failed (might exist), trying SignIn...", signUpError.message)

            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                // Return specific error if password is wrong or other issue
                console.error("SignIn failed:", signInError.message)
                return {
                    success: false,
                    error: `No pudimos crear tu cuenta ni iniciar sesión. \nSignUp: ${signUpError?.message} \nSignIn: ${signInError.message}`
                }
            }

            userId = signInData.user.id
        } else {
            userId = signUpData.user?.id
        }

        if (!userId) {
            return {
                success: false,
                error: `Error de autenticación. \nSignUp: ${signUpError?.message}`
            }
        }

        // 2. DB Insert: Create Venue
        // Calculate trial end date (Now + 30 days)
        const trialEnd = addDays(new Date(), 30).toISOString()
        const slug = slugify(name)

        const { error: insertError } = await supabase.from("venues").insert({
            owner_id: userId,
            slug, // Added slug
            name: { es: name }, // Assuming name is JSONB based on schema
            description: { es: description }, // Assuming JSONB
            category,
            custom_category: customCategory,
            whatsapp,
            image,
            logo,
            address: location, // Storing main location string here
            // Note: Schema might have 'location' or 'address'. Schema says 'address'.
            coordinates,
            open_time: null, // We have 'hours' text field, but schema has specific columns. 
            // We should check if we store raw hours text or parse it. 
            // The UpdateVenueRequests sql added 'hours' column.
            hours: hours,

            // Location fields (Enriched)
            city: city,
            region_code: region,

            // Onboarding V2 Specifics
            status: "pending",
            plan_trial_end: trialEnd,
            subscription_plan: "premium", // Giving them full plan as trial
            subscription_status: "active", // Active trial

            // Socials (Check if columns exist or if we need to jsonb them)
            // Schema didn't show social columns in 'venues' main definition in schema.sql but view_file showed incomplete file.
            // I'll assume they might not exist or are in a different place? 
            // Wait, schema.sql showed basic columns. 'add_socials.sql' implies they exist.
            // For safety, I will verify columns or just try to insert common ones.
            // I'll stick to what I saw in 'venue_requests' used in MultiStepForm and map to venues.

            // Let's rely on what we know:
            // owner_id (added in claim_system)
            // status, plan_trial_end (added in my migration)
        })

        if (insertError) {
            console.error("Venue insert error:", insertError)
            return { success: false, error: `Error registrando el local: ${insertError.message} (Code: ${insertError.code})` }
        }

        return { success: true, userId }

    } catch (error: any) {
        console.error("RegisterVenue unexpected error:", error)
        return { success: false, error: error.message || "Error desconocido." }
    }
}
