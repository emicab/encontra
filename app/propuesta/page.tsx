import Image from "next/image"
import Link from "next/link"
import { Check, Clock, FileText, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react"
import { PLANS } from "@/lib/business-logic"

export default function PropuestaPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">

            {/* 1. HERO SECTION */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-[#020617]"> {/* Forces Dark Slate-950 */}
                {/* Background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: "1s" }}></div>
                </div>

                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center text-white">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                            Tu negocio visible en Google y organizado, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">las 24 horas.</span>
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                            Dejá de depender solo de las historias que se borran. Encontrá es la guía digital de tu ciudad que te ayuda a vender más y contratar personal sin estrés.
                        </p>
                        <div>
                            <Link
                                href="/sumate"
                                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1"
                            >
                                Crear mi Perfil Gratis
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                        <div className="relative mx-auto w-[280px] md:w-[320px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-blue-500/30 blur-2xl rounded-full transform scale-110"></div>
                            <Image
                                src="/propuesta/hero-mockup.png"
                                alt="Perfil de negocio en Encontrá"
                                width={320}
                                height={640}
                                className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border-8 border-slate-900"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. PROBLEM VS SOLUTION */}
            <section className="py-24 bg-muted/50 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            ¿Te pasa esto en tu comercio?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group p-8 rounded-3xl bg-card border hover:border-primary/50 transition-all hover:shadow-lg">
                            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 text-destructive group-hover:scale-110 transition-transform">
                                <Clock className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-destructive">El Problema</h3>
                            <p className="text-muted-foreground mb-6 min-h-[80px]">
                                "Subís una historia con una oferta y a las 24hs desaparece. Si el cliente no la vio, perdiste la venta."
                            </p>
                            <div className="pt-6 border-t">
                                <div className="flex items-center gap-2 mb-2 text-success font-semibold">
                                    <Check className="w-5 h-5" /> Solución Encontrá
                                </div>
                                <p className="text-muted-foreground">
                                    Tu perfil es permanente. Tus horarios, precios y catálogo están siempre disponibles.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="group p-8 rounded-3xl bg-card border hover:border-primary/50 transition-all hover:shadow-lg">
                            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 text-destructive group-hover:scale-110 transition-transform">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-destructive">El Problema</h3>
                            <p className="text-muted-foreground mb-6 min-h-[80px]">
                                "Publicás que buscás personal y te llegan correos desordenados, fotos de CVs borrosas o archivos que no abren."
                            </p>
                            <div className="pt-6 border-t">
                                <div className="flex items-center gap-2 mb-2 text-success font-semibold">
                                    <Check className="w-5 h-5" /> Solución Encontrá
                                </div>
                                <p className="text-muted-foreground">
                                    Recibís los CVs en tu email filtrados, en formato PDF limpio y libre de virus. Sin hacer nada extra.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="group p-8 rounded-3xl bg-card border hover:border-primary/50 transition-all hover:shadow-lg">
                            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 text-destructive group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-destructive">El Problema</h3>
                            <p className="text-muted-foreground mb-6 min-h-[80px]">
                                "Te preguntan 10 veces al día '¿a qué hora cierran?' o '¿cuánto sale?'."
                            </p>
                            <div className="pt-6 border-t">
                                <div className="flex items-center gap-2 mb-2 text-success font-semibold">
                                    <Check className="w-5 h-5" /> Solución Encontrá
                                </div>
                                <p className="text-muted-foreground">
                                    La información está clara en tu perfil. El cliente se autogestiona.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. HR SECTION */}
            <section className="py-24 overflow-hidden bg-[#0f172a] text-white"> {/* Forces Dark Slate-900 */}
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-1/2 order-2 md:order-1">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-30 rounded-full"></div>
                                <Image
                                    src="/propuesta/hr-flow.png"
                                    alt="Flujo de contratación simplificado"
                                    width={600}
                                    height={400}
                                    className="w-full rounded-2xl shadow-2xl relative z-10 border border-white/10 p-4 bg-slate-900/50 backdrop-blur-sm"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 order-1 md:order-2 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold">
                                Profesionalizá tu búsqueda de personal
                            </h2>
                            <div className="space-y-6 text-lg text-slate-300">
                                <p>
                                    No cambies tu forma de trabajar, mejorala. Seguí pidiendo que te manden mail, pero usá nuestro formulario para que te lleguen perfectos.
                                </p>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-start gap-4">
                                    <ShieldCheck className="w-6 h-6 text-green-400 mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-white">Protección Anti-Spam (Cloudflare Turnstile)</h4>
                                        <p className="text-sm text-slate-400 mt-1">Filtramos bots y correos maliciosos automáticamente antes de que lleguen a tu bandeja.</p>
                                    </div>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-green-400">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <span>Evitá spam.</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-green-400">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <span>Estandarizá los asuntos de los correos.</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-green-400">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <span>Dale seriedad a tu empresa.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. PLANS SECTION */}
            <section id="planes" className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Un plan para cada etapa de tu negocio</h2>
                        <p className="text-muted-foreground text-lg">Elegí la opción que mejor se adapte a tus necesidades actuales.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Plan Emprendedor */}
                        <div className="p-8 rounded-3xl bg-card border flex flex-col hover:border-primary/50 transition-colors shadow-sm">
                            <h3 className="text-2xl font-bold mb-2">{PLANS.basic.name}</h3>
                            <p className="text-muted-foreground mb-6">Para arrancar con presencia digital profesional.</p>
                            <div className="mb-8">
                                <span className="text-4xl font-bold">${PLANS.basic.price.toLocaleString('es-AR')}</span>
                                <span className="text-muted-foreground ml-2">/ mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-card-foreground">
                                    <Check className="w-5 h-5 text-primary" /> WhatsApp Directo
                                </li>
                                <li className="flex items-center gap-3 text-card-foreground">
                                    <Check className="w-5 h-5 text-primary" /> Redes Sociales
                                </li>
                                <li className="flex items-center gap-3 text-card-foreground">
                                    <Check className="w-5 h-5 text-primary" /> Hasta {PLANS.basic.features.productsLimit} Productos
                                </li>
                                <li className="flex items-center gap-3 text-card-foreground">
                                    <Check className="w-5 h-5 text-primary" /> Perfil Verificado
                                </li>
                            </ul>
                            <Link href="/sumate" className="w-full block text-center py-3 rounded-xl border hover:bg-muted transition-colors font-semibold">
                                Elegir {PLANS.basic.name}
                            </Link>
                        </div>

                        {/* Plan Full */}
                        <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#020617] text-white border border-primary/30 flex flex-col shadow-xl">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                Recomendado
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{PLANS.premium.name}</h3>
                            <p className="text-slate-400 mb-6">Para potenciar tus ventas y procesos al máximo.</p>
                            <div className="mb-8">
                                <span className="text-4xl font-bold">${PLANS.premium.price.toLocaleString('es-AR')}</span>
                                <span className="text-slate-500 ml-2">/ mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                                    <span>Todo lo de {PLANS.basic.name}</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                                    <span>Hasta {PLANS.premium.features.productsLimit} Productos</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                                    <span>Bio Inteligente</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                                    <span>Cupones Ilimitados</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="bg-primary/20 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                                    <span>Recepción de CVs en PDF</span>
                                </li>
                            </ul>
                            <Link href="#contact" className="w-full block text-center py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-colors font-bold shadow-lg">
                                Contactar para Alta
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. AUTHORITY & SOCIAL PROOF */}
            <section className="py-24 relative overflow-hidden bg-muted/30">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">Potenciando el comercio local en todo el país</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        Somos un desarrollo nacional pensado para nuestra economía. Sin comisiones por venta, sin intermediarios raros. Trato directo dueño a dueño.
                    </p>

                    <Link
                        href="https://wa.me/5492901XXXXXX"
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors font-semibold shadow-lg hover:shadow-green-500/30"
                    >
                        <MessageCircle className="w-5 h-5" />
                        ¿Tenés dudas? Hablá con nosotros.
                    </Link>
                </div>
            </section>

            {/* 6. FOOTER */}
            <footer className="bg-[#020617] py-16 border-t border-slate-900 text-white">
                <div className="container mx-auto px-4 text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">¿Listo para digitalizar tu local?</h2>
                    <div>
                        <Link
                            href="/sumate"
                            className="inline-flex items-center px-10 py-5 text-xl font-bold rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/80 hover:to-blue-500 transition-all shadow-lg hover:shadow-primary/40 text-white"
                        >
                            Sumar mi Negocio Ahora
                        </Link>
                    </div>
                    <p className="text-slate-500 pt-8">© {new Date().getFullYear()} Encontrá. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
