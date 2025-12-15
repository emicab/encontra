
import * as z from "zod"

// Common fields
export const commonSchema = {
    title: z.string().min(3, "El título es muy corto"),
    job_type: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship'], {
        required_error: "Seleccioná un tipo de contrato",
    }),
    location_type: z.enum(['onsite', 'remote', 'hybrid'], {
        required_error: "Seleccioná una modalidad",
    }),
    company_name: z.string().optional(),
    company_logo: z.string().url("URL inválida").optional().or(z.literal("")),
    contact_email: z.string().email("Email inválido"), // Postulación
    contact_phone: z.string().optional(), // WhatsApp
    salary_min: z.coerce.number().optional(),
    salary_max: z.coerce.number().optional(),
    location_city: z.string().min(2, "Ciudad requerida"),
    region_code: z.string().min(2, "Provincia requerida"),
    password: z.string().optional(), // Made optional here, refined validation happens in component or dedicated schema check
}

// Basic Schema
export const basicSchema = z.object({
    mode: z.literal('basic'),
    description: z.string().optional(),
    // Allow advanced fields to be present (e.g. empty strings) but ignore them
    role_description: z.string().optional().or(z.literal('')),
    responsibilities: z.string().optional().or(z.literal('')),
    requirements_min: z.string().optional().or(z.literal('')),
    requirements_opt: z.string().optional().or(z.literal('')),
    schedule: z.string().optional().or(z.literal('')),
    company_description: z.string().optional().or(z.literal('')),
    location_address: z.string().optional().or(z.literal('')),
    benefits: z.string().optional().or(z.literal('')),
    deadline: z.string().optional().or(z.literal('')),
    ...commonSchema,
})

// Advanced Schema
export const advancedSchema = z.object({
    mode: z.literal('advanced'),
    role_description: z.string().min(10, "Describí qué va a hacer la persona"),
    responsibilities: z.string().min(10, "Listá las responsabilidades principales"),
    requirements_min: z.string().min(5, "Requerido"),
    requirements_opt: z.string().optional(),
    schedule: z.string().optional(),
    company_description: z.string().optional(),
    location_address: z.string().optional(),
    benefits: z.string().optional(),
    deadline: z.string().optional(),
    ...commonSchema,
}).omit({ location_city: true }).extend({
    location_city: z.string().min(2, "Ciudad requerida"),
})


// Discriminated Union
export const jobFormSchema = z.discriminatedUnion("mode", [
    basicSchema,
    advancedSchema
])

export type JobFormValues = z.infer<typeof jobFormSchema>
