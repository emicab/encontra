import { SumateForm } from "@/components/sumate/multi-step-form"

export default function SumatePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-3xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sumate a LocalGuide</h1>
                    <p className="text-muted-foreground text-lg">
                        Llevá tu negocio al siguiente nivel. Completá el formulario y descubrí cómo podemos ayudarte.
                    </p>
                </div>
                
                <SumateForm />
            </div>
        </div>
    )
}
