"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Store } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    )

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Check user role
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single()

                toast({
                    title: "Bienvenido",
                    description: "Has iniciado sesión correctamente.",
                })

                router.push("/")
                router.refresh()
            }
        } catch (error: any) {
            console.error("Login error:", error)
            let message = "Ocurrió un error al iniciar sesión."

            if (error.message === "Invalid login credentials") {
                message = "Email o contraseña incorrectos."
            } else if (error.message.includes("Email not confirmed")) {
                message = "Tu email no ha sido confirmado aún."
            } else if (error.message.includes("Rate limit exceeded")) {
                message = "Demasiados intentos. Por favor esperá unos minutos."
            } else {
                message = error.message // Fallback
            }

            setErrorMsg(message)

            toast({
                title: "Error de ingreso",
                description: message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Store className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold">Encontrá Admin</CardTitle>
                    <CardDescription className="text-center">
                        Ingresá tus credenciales para acceder al panel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {errorMsg && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                                <span className="font-semibold">Error:</span> {errorMsg}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@encontra.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ingresar
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        ¿No tenés cuenta?{" "}
                        <a href="/sumate" className="text-primary font-semibold hover:underline">
                            Sumá tu Negocio
                        </a>
                    </p>
                    <div className="flex flex-col gap-2 text-xs">
                        <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                            ← Volver al inicio
                        </a>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
