"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        fetchProfile()
    }, [])

    async function fetchProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUserId(user.id)
                setEmail(user.email || "")
                setName(user.user_metadata?.full_name || "")

                // Try to fetch from profiles table if exists, to get the most up to date name
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single()

                if (profile && profile.full_name) {
                    setName(profile.full_name)
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        if (!userId) return

        setSaving(true)
        try {
            // 1. Update Auth Metadata (Source of truth for session)
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: name }
            })

            if (authError) throw authError

            // 2. Update Profiles Table (Source of truth for DB relations)
            // We use upsert to handle cases where profile might not exist yet
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: userId,
                    full_name: name,
                    // We don't update email here as it usually requires re-verification flow
                    updated_at: new Date().toISOString()
                })

            if (profileError) {
                console.warn("Profile table update failed (might be missing column):", profileError)
                // We don't throw here strictly if auth update worked, but it's good to know
            }

            toast({
                title: "Cambios guardados",
                description: "Tu información de perfil ha sido actualizada.",
            })

        } catch (error: any) {
            console.error("Error saving profile:", error)
            toast({
                title: "Error",
                description: error.message || "No se pudieron guardar los cambios.",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">Administra la configuración general del sistema.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>Actualiza tu información personal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            placeholder="Tu nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            El email no se puede cambiar directamente para mantener la seguridad de la cuenta.
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
