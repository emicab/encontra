import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
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
                        <Input id="name" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="tu@email.com" />
                    </div>
                    <Button>Guardar Cambios</Button>
                </CardContent>
            </Card>
        </div>
    )
}
