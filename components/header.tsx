"use client"

import { useState, useEffect } from "react"
import { MapPin, Search, User, LogOut, LayoutDashboard, Store, ChevronDown, ChevronLeft } from "lucide-react"
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
import { useRouter, useParams } from "next/navigation"
import { useRegion } from "@/components/providers/region-provider"
import { getRegionName, REGIONS } from "@/lib/regions"
import { slugify } from "@/lib/utils"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const regionCode = useRegion()
  const params = useParams()
  const citySlug = params?.city as string
  const regionName = getRegionName(regionCode)

  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Location Selector State
  const [view, setView] = useState<'regions' | 'cities'>('regions')
  const [cities, setCities] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (regionCode) {
      localStorage.setItem("lastRegion", regionCode)
      fetchCities(regionCode)
      // If we have a region but no specific city involved in this effect logic yet, defaults to showing cities if opened? 
      // Actually let's default to 'cities' view if a region is selected, 'regions' if not.
      setView('cities')
    } else {
      setView('regions')
    }
  }, [regionCode])

  async function fetchCities(region: string) {
    const { data } = await supabase
      .from('venues')
      .select('city')
      .eq('region_code', region)

    if (data) {
      // Extract unique cities, filter nulls/empties, sort
      const uniqueCities = Array.from(new Set(data.map(v => v.city).filter(Boolean))) as string[]
      setCities(uniqueCities.sort())
    }
  }

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

  // Determine display name for location
  // If we have a city slug, try to find the matching real name from our cities list, otherwise de-slugify or show slug
  const cityName = citySlug
    ? cities.find(c => slugify(c) === citySlug) || citySlug.replace(/-/g, ' ') // Simple fallback
    : null

  const displayLocation = cityName ? cityName : regionName

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo / Region Selector */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setOpen(true)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Search className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground flex flex-col sm:flex-row sm:items-center items-start leading-none sm:leading-normal">
                  <span>
                    <span className="hidden xs:inline">{t.appName}</span>
                    <span className="visible xs:hidden">Encontrá</span>
                  </span>

                  <div className="flex items-center text-xs sm:text-lg sm:font-bold font-normal text-muted-foreground sm:text-foreground mt-0.5 sm:mt-0">
                    {displayLocation && <span className="mr-1 sm:mx-1 whitespace-nowrap">en</span>}
                    <span className={`truncate max-w-[140px] sm:max-w-[300px] block ${displayLocation ? "text-primary border-b border-primary/20 border-dashed" : ""}`}>
                      {displayLocation || ""}
                    </span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-muted-foreground shrink-0" />
                  </div>
                </h1>
                <p className="hidden text-xs text-muted-foreground sm:block">{t.tagline}</p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-1 max-w-md mx-4">
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
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href={
                citySlug && regionCode ? `/${regionCode}/${citySlug}/jobs` :
                  regionCode ? `/${regionCode}/jobs` :
                    "/jobs"
              }>
                Bolsa de Trabajo
              </Link>
            </Button>

            <Button asChild variant="default" size="sm">
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

        {/* Mobile Search Bar */}
        <div className="mt-3 sm:hidden">
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
      </div>

      <CommandDialog open={open} onOpenChange={(val) => {
        setOpen(val)
        if (val && regionCode) setView('cities') // Reset to cities view when opening if region exists
        else if (val) setView('regions')
      }}>
        <CommandInput placeholder={view === 'cities' ? `Buscar ciudad en ${regionName}...` : "Buscar provincia..."} />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>

          {view === 'cities' && regionCode ? (
            <CommandGroup heading={`Ciudades en ${regionName}`}>
              <CommandItem onSelect={() => setView('regions')} className="font-medium text-muted-foreground">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Cambiar Provincia
              </CommandItem>
              <CommandSeparator />

              {/* Option to see all region */}
              <CommandItem onSelect={() => {
                router.push(`/${regionCode}`)
                setOpen(false)
              }}>
                <MapPin className="mr-2 h-4 w-4" />
                Todas en {regionName}
              </CommandItem>

              {cities.map((city) => (
                <CommandItem key={city} value={city} onSelect={() => {
                  const slug = slugify(city)
                  router.push(`/${regionCode}/${slug}`)
                  setOpen(false)
                }}>
                  <MapPin className="mr-2 h-4 w-4" />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            <CommandGroup heading="Provincias">
              <CommandItem value="Todas las Provincias" onSelect={() => {
                localStorage.removeItem("lastRegion")
                window.location.href = "/"
                setOpen(false)
              }}>
                <MapPin className="mr-2 h-4 w-4" />
                Todas las Provincias
              </CommandItem>
              {Object.entries(REGIONS).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                <CommandItem key={code} value={name} onSelect={() => {
                  // When selecting a region, go to that region page (and implicitly switch context)
                  // We could also switch to 'cities' view but navigation seems more natural
                  window.location.href = `/${code}`
                  setOpen(false)
                }}>
                  <MapPin className="mr-2 h-4 w-4" />
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  )
}
