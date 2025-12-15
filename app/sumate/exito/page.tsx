import Link from "next/link"
import { Check, ArrowRight, Clock, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SumateExitoPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-8 text-center animate-in fade-in zoom-in duration-500">

                <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center ring-4 ring-green-500/10">
                    <Check className="w-12 h-12 text-green-400" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">¡Perfil Creado con Éxito! 🎉</h1>
                    <p className="text-slate-400 text-lg">
                        Tu local está en proceso de revisión. Te avisaremos por WhatsApp cuando esté online (aprox 24hs).
                    </p>
                </div>

                <Card className="bg-slate-900 border-slate-800 text-left">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Clock className="w-5 h-5" />
                            Estado del Plan: TRIAL ACTIVO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Tenés <strong>30 días de prueba</strong> del Plan Negocio Full bonificados para configurar tu perfil sin apuro.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="bg-green-500/10 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                                <span>WhatsApp Directo Habilitado</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="bg-green-500/10 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                                <span>Carga Ilimitada de Productos</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="bg-green-500/10 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                                <span>Publicación de Empleos</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <div className="pt-4">
                    <Button asChild size="lg" className="w-full text-lg h-14 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500">
                        <Link href="/admin">
                            Ir a mi Panel de Control
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                    <p className="mt-4 text-sm text-slate-500">
                        Ya podés ingresar y empezar a cargar tus fotos y productos.
                    </p>
                </div>
            </div>
        </div>
    )
}
