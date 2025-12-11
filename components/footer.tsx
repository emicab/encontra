import { t } from "@/lib/i18n"

export function Footer() {
    return (
        <footer className="border-t border-border mt-12 py-12 bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
                    <div className="text-muted-foreground">
                        © 2025 {t.appName}. {t.tagline}
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-6">
                            <a href="/sumate" className="font-medium text-primary hover:underline">
                                Sumá tu Negocio
                            </a>
                            <a href="/admin" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Ingreso Socios
                            </a>
                        </div>
                        <div className="hidden md:block h-4 w-px bg-border" />
                        <div className="flex items-center gap-6 text-muted-foreground">
                            <a href="/faq" className="hover:text-foreground transition-colors">Preguntas Frecuentes</a>
                            <a href="/terms" className="hover:text-foreground transition-colors">Términos y Condiciones</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
