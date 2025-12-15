"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Store, Ticket, Settings, LogOut, Menu, Inbox, Flag, Briefcase, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { toast } = useToast()
    const [isAdmin, setIsAdmin] = React.useState(false)
    const [isRecruiter, setIsRecruiter] = React.useState(false)
    const [hasVenue, setHasVenue] = React.useState(false)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        checkUserRole()
    }, [])

    async function checkUserRole() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check Admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single()

        const _isAdmin = profile?.is_admin || false;
        setIsAdmin(_isAdmin)

        // Check Recruiter (via metadata)
        const _isRecruiter = user.user_metadata?.role === 'recruiter';
        setIsRecruiter(_isRecruiter)

        // Check Venue (if not admin, check if owns venue)
        if (!_isAdmin) {
            const { count } = await supabase
                .from("venues")
                .select("*", { count: 'exact', head: true })
                .eq("owner_id", user.id);

            setHasVenue((count || 0) > 0);
        }

        setLoading(false)
    }

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast({
                title: "Error",
                description: "No se pudo cerrar sesión.",
                variant: "destructive",
            })
        } else {
            router.push("/login")
            router.refresh()
        }
    }

    const NavLinks = () => (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {isAdmin ? (
                <>
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Panel Principal
                    </Link>
                    <Link
                        href="/admin/requests"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Inbox className="h-4 w-4" />
                        Solicitudes
                    </Link>
                    <Link
                        href="/admin/claims"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Flag className="h-4 w-4" />
                        Reclamos
                    </Link>
                    <Link
                        href="/admin/venues"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Store className="h-4 w-4" />
                        Locales
                    </Link>
                    <Link
                        href="/admin/jobs"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Briefcase className="h-4 w-4" />
                        Empleos
                    </Link>
                    <Link
                        href="/admin/coupons"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Ticket className="h-4 w-4" />
                        Cupones
                    </Link>
                    <Link
                        href="/admin/analytics"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Analíticas
                    </Link>
                </>
            ) : (
                <>
                    {/* Merchant Link */}
                    {hasVenue && (
                        <Link
                            href="/admin/my-venue"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                            <Store className="h-4 w-4" />
                            Mi Negocio
                        </Link>
                    )}

                    {/* Recruiter Link (Also show if generic user has jobs?) 
                        Let's just show "Mis Empleos" if they are recruiter OR have venue (hybrid) 
                        Actually, anyone can post jobs, so let's show it if isRecruiter OR we could check if they have jobs?
                        Simpler: If isRecruiter OR hasVenue (since venues can post too)
                    */}
                    {(isRecruiter || hasVenue) && (
                        <Link
                            href="/admin/my-jobs"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                            <Briefcase className="h-4 w-4" />
                            Mis Empleos
                        </Link>
                    )}
                </>
            )}
            <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
                <Settings className="h-4 w-4" />
                Configuración
            </Link>
        </nav>
    )

    if (loading) return null // Or a loading spinner

    return (
        <div className="flex min-h-screen bg-muted/40">
            {/* Sidebar Desktop */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Store className="h-6 w-6" />
                        <span className="">{isAdmin ? "Admin Encontrá" : "Encontrá | Mi Panel"}</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <NavLinks />
                </div>
                <div className="mt-auto p-4">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Alternar menú de navegación</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Menú de Navegación</SheetTitle>
                                <SheetDescription>Opciones de menú para administración</SheetDescription>
                            </SheetHeader>
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                                    <Store className="h-6 w-6" />
                                    <span className="sr-only">{isAdmin ? "Admin Encontrá" : "Encontrá | Mi Panel"}</span>
                                </Link>
                                <NavLinks />
                                <div className="mt-auto pt-4">
                                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4" />
                                        Cerrar Sesión
                                    </Button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <h1 className="text-lg font-semibold">{isAdmin ? "Panel de Administración" : "Panel de Control"}</h1>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
            </div>
        </div>
    )
}
