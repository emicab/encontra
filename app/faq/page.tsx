import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-background pb-12">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl">
                        Encontrá<span className="text-primary">.</span>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Preguntas Frecuentes</h1>
                        <p className="text-muted-foreground">
                            Todo lo que necesitás saber sobre Encontrá.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>¿Qué es Encontrá?</AccordionTrigger>
                            <AccordionContent>
                                Encontrá es la guía definitiva de locales, servicios y oportunidades en tu ciudad.
                                Conectamos a personas con los mejores comercios, ofertas y empleos de la zona de manera rápida y sencilla.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger>¿Cómo postularme a un empleo?</AccordionTrigger>
                            <AccordionContent>
                                Es muy fácil. Ingresá a la sección "Bolsa de Trabajo" desde el menú, buscá la oferta que te interese y hacé clic en "Postularme".
                                Solo necesitás completar tus datos básicos y adjuntar tu CV en formato PDF.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger>¿Tengo que pagar para usar la plataforma?</AccordionTrigger>
                            <AccordionContent>
                                Para los usuarios es 100% gratis.
                                <br /><br />
                                Para los comercios, ofrecemos distintos niveles de visibilidad:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>Plan Gratuito:</strong> Presencia básica en el directorio.</li>
                                    <li><strong>Plan Emprendedor:</strong> Mayor visibilidad y cargas de productos.</li>
                                    <li><strong>Plan Negocio Full:</strong> Perfil destacado, prioritaria en búsquedas, "Bio Inteligente" y soporte dedicado.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4">
                            <AccordionTrigger>¿Cómo puedo publicar mi negocio?</AccordionTrigger>
                            <AccordionContent>
                                Hacé clic en "Sumá tu Negocio" en el menú superior o en el pie de página.
                                Podrás crear tu cuenta, elegir tu plan y comenzar a publicar tus ofertas y horarios en minutos.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-6">
                            <AccordionTrigger>¿Cómo contacto con soporte?</AccordionTrigger>
                            <AccordionContent>
                                Si tenés alguna duda comercial o técnica, escribinos a <a href="mailto:hola@encontra.com.ar" className="text-primary hover:underline">hola@encontra.com.ar</a> y te responderemos a la brevedad.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}
