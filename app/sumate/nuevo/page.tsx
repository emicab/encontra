import { SumateForm } from "@/components/sumate/multi-step-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function SumateNuevoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-3xl space-y-8">
                <div>
                    <Link href="/sumate" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Volver a la Propuesta
                    </Link>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Alta de Negocio</h1>
                        <p className="text-muted-foreground text-lg">
                            Completá tus datos y los de tu local para empezar tu prueba gratuita.
                        </p>
                    </div>
                </div>

                <SumateForm />
            </div>
        </div>
    )
}
