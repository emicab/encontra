import * as z from "zod"

export const formSchema = z.object({
    // Step 1: Business Info
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    category: z.string().min(1, "Seleccioná un rubro"),
    customCategory: z.string().optional(),
    description: z.string().min(10, "Contanos un poco más sobre tu negocio (mínimo 10 caracteres)"),

    // Step 2: Contact & Socials & Auth
    ownerName: z.string().min(2, "Tu nombre es requerido"),
    ownerEmail: z.string().email("Ingresá un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"), // New Field
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
    facebook: z.string().optional(),

    // Step 3: Multimedia
    image: z.string().optional(), // Cover image (Full)
    logo: z.string().optional(), // Profile (Basic)

    // Step 4: Location & Schedule
    location: z.string().min(5, "Ingresá una dirección o zona"), // Address input
    locationType: z.enum(["address", "zone"]),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    street: z.string().optional(),
    city: z.string().min(2, "Ingresá la ciudad"),
    province: z.string().min(2, "Seleccioná la provincia"),
    zone: z.string().optional(),
    hours: z.string().optional(),
})

export type FormData = z.infer<typeof formSchema>

export const steps = [
    { id: 1, title: "Tu Negocio" },
    { id: 2, title: "Tus Datos" },
    { id: 3, title: "Multimedia" },
    { id: 4, title: "Ubicación" },
]
