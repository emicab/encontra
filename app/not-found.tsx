import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPinOff } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="flex flex-col items-center text-center space-y-6 max-w-md">
                <div className="bg-muted p-6 rounded-full">
                    <MapPinOff className="h-12 w-12 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter">404</h1>
                    <h2 className="text-2xl font-semibold">¡Ups! No encontramos nada</h2>
                    <p className="text-muted-foreground">
                        Irónicamente, en <span className="font-bold text-primary">Encontrá</span> no pudimos hallar la página que buscabas. Quizás se movió o nunca existió.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button asChild variant="default">
                        <Link href="/">Volver al Inicio</Link>
                    </Button>

                </div>
            </div>
        </div>
    )
}
