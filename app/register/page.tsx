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
import Link from "next/link"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    )

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Las contraseñas no coinciden.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) throw error

            if (data.session) {
                // Check user role (though new users are always non-admin by default)
                // We can safely redirect to my-venue or claim page
                toast({
                    title: "¡Bienvenido!",
                    description: "Cuenta creada exitosamente.",
                })
                router.push("/")
                router.refresh()
            } else {
                // Fallback if email confirmation is still enabled on server
                toast({
                    title: "Cuenta creada",
                    description: "Por favor verificá tu email para continuar.",
                })
                router.push("/login")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudo crear la cuenta.",
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
                    <CardTitle className="text-2xl text-center font-bold">Crear Cuenta</CardTitle>
                    <CardDescription className="text-center">
                        Registrate para administrar tu local.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
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
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrarse
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground">
                        ¿Ya tenés cuenta? <Link href="/login" className="text-primary hover:underline">Iniciar Sesión</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
