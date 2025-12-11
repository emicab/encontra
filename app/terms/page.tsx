import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
                <div className="max-w-3xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Términos y Condiciones</h1>
                        <p className="text-muted-foreground">Última actualización: 11 de Diciembre, 2025</p>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">1. Introducción</h2>
                            <p className="text-muted-foreground">
                                Bienvenido a <strong>Encontrá</strong>. Al acceder y utilizar nuestra plataforma, aceptás cumplir con los siguientes términos y condiciones.
                                Si no estás de acuerdo con alguna parte de estos términos, te pedimos que no utilices nuestros servicios.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">2. Uso de la Plataforma</h2>
                            <p className="text-muted-foreground">
                                Encontrá es una plataforma que conecta usuarios con locales comerciales y ofertas laborales.
                                Te comprometes a utilizar el servicio solo para fines legales y de acuerdo con todas las leyes aplicables.
                            </p>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                                <li>No podés publicar contenido falso, engañoso o fraudulento.</li>
                                <li>No podés intentar acceder a áreas restringidas del sistema.</li>
                                <li>Respetarás la propiedad intelectual de la plataforma y de terceros.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">3. Cuentas y Seguridad</h2>
                            <p className="text-muted-foreground">
                                Para acceder a ciertas funciones, es posible que debas registrarte. Sos responsable de mantener la confidencialidad de tu cuenta y contraseña.
                                Encontrá no se hace responsable por cualquier pérdida derivada del uso no autorizado de tu cuenta.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">4. Publicación de Empleos y Locales</h2>
                            <p className="text-muted-foreground">
                                Los usuarios que publiquen locales u ofertas de trabajo garantizan que tienen el derecho y la autoridad para hacerlo.
                                Nos reservamos el derecho de eliminar cualquier contenido que viole nuestras políticas o que consideremos inapropiado.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">5. Limitación de Responsabilidad</h2>
                            <p className="text-muted-foreground">
                                Encontrá actúa como intermediario y no garantiza la calidad, seguridad o legalidad de los servicios o empleos ofrecidos por terceros.
                                No somos responsables de las transacciones o acuerdos entre usuarios y locales.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">6. Contacto</h2>
                            <p className="text-muted-foreground">
                                Si tenés alguna duda sobre estos términos, por favor contactanos a través de nuestro formulario de soporte o enviando un email a hola@encontra.com.ar.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
