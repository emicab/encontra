import { VenueForm } from "@/components/admin/venue-form"

export default function NewVenuePage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Local</h2>
                <p className="text-muted-foreground">Agregar un nuevo local al directorio.</p>
            </div>
            <VenueForm />
        </div>
    )
}
