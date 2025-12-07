import { useState, useEffect } from "react"
import { MapPin, Search, User, LogOut, LayoutDashboard, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { t } from "@/lib/i18n"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useRegion } from "@/components/providers/region-provider"
import { getRegionName, REGIONS } from "@/lib/regions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const regionCode = useRegion()
  const regionName = getRegionName(regionCode)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()
      if (profile) setIsAdmin(profile.is_admin)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={regionCode ? `/${regionCode}` : "/"} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Search className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {t.appName}
                </h1>
                <p className="hidden text-xs text-muted-foreground sm:block">{t.tagline}</p>
              </div>
            </Link>

            <Select
              value={regionCode || "all"}
              onValueChange={(val) => {
                if (val === "all") router.push("/")
                else router.push(`/${val}`)
              }}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs bg-muted/50 border-0 focus:ring-0">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <SelectValue placeholder="Elegí tu provincia" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Provincias</SelectItem>
                {Object.entries(REGIONS).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                  <SelectItem key={code} value={code}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 bg-secondary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="default" size="sm" className="hidden sm:flex">
              <Link href="/sumate">
                Sumate
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={isAdmin ? "/admin" : "/admin/my-venue"}>
                      {isAdmin ? <LayoutDashboard className="mr-2 h-4 w-4" /> : <Store className="mr-2 h-4 w-4" />}
                      {isAdmin ? "Panel Admin" : "Mi Negocio"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  Ingresar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
