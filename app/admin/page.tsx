"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Ticket, Users, Star, ClipboardList, Loader2, Briefcase, Target, Settings2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { startOfWeek, endOfWeek, format, subDays, isSameDay, isSameWeek, isSameMonth, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns"
import { es } from "date-fns/locale"

type ViewMode = 'day' | 'week' | 'month';

interface Goals {
    venues: number;
    jobs: number;
}

import { useRouter } from "next/navigation"

export default function AdminDashboard() {
<<<<<<< HEAD
    // Stats State
=======
    const router = useRouter()
>>>>>>> f4428da20a7b69f70021bc9268acc4c87c6ff252
    const [stats, setStats] = useState({
        totalVenues: 0,
        totalCoupons: 0,
        pendingRequests: 0,
        totalReviews: 0,
        avgRating: "0.0",
        totalJobs: 0
    })

    // Chart Data State
    const [viewMode, setViewMode] = useState<ViewMode>('month')
    const [venuesChartData, setVenuesChartData] = useState<any[]>([])
    const [jobsChartData, setJobsChartData] = useState<any[]>([])

    // Raw Data State (for reprocessing)
    const [rawVenues, setRawVenues] = useState<any[]>([])
    const [rawJobs, setRawJobs] = useState<any[]>([])

    // Goals State
    const [goals, setGoals] = useState<Goals>({ venues: 10, jobs: 5 }) // Defaults
    const [tempGoals, setTempGoals] = useState<Goals>({ venues: 10, jobs: 5 }) // For dialog input
    const [isGoalsOpen, setIsGoalsOpen] = useState(false)
    const [currentProgress, setCurrentProgress] = useState({ venues: 0, jobs: 0 })

    const [loading, setLoading] = useState(true)

    // Load Goals from LS on mount
    useEffect(() => {
        const savedGoals = localStorage.getItem('admin_goals')
        if (savedGoals) {
            try {
                const parsed = JSON.parse(savedGoals)
                setGoals(parsed)
                setTempGoals(parsed)
            } catch (e) {
                console.error("Failed to parse goals", e)
            }
        }
    }, [])

    // Fetch Data
    useEffect(() => {
        async function fetchStats() {
            try {
<<<<<<< HEAD
                // 1. Venues
=======
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push("/login")
                    return
                }

                // Check Admin Status
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single()

                if (!profile?.is_admin) {
                    router.push("/admin/my-venue")
                    return
                }

                // 1. Total Venues & Reviews Stats
>>>>>>> f4428da20a7b69f70021bc9268acc4c87c6ff252
                const { data: venuesData, error: venuesError } = await supabase
                    .from('venues')
                    .select('created_at, review_count, rating')

                if (venuesError) throw venuesError

                const totalVenues = venuesData?.length || 0
                const totalReviews = venuesData?.reduce((acc, v) => acc + (v.review_count || 0), 0) || 0
                const avgRating = totalVenues > 0
                    ? (venuesData?.reduce((acc, v) => acc + (v.rating || 0), 0) / totalVenues).toFixed(1)
                    : "0.0"

                setRawVenues(venuesData || [])

                // 2. Coupons
                const { count: couponsCount, error: couponsError } = await supabase
                    .from('coupons')
                    .select('*', { count: 'exact', head: true })

                if (couponsError) throw couponsError

                // 3. Requests
                const { count: requestsCount, error: requestsError } = await supabase
                    .from('venue_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending')

                if (requestsError) throw requestsError

                // 4. Jobs
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select('created_at')

                if (jobsError) throw jobsError

                setRawJobs(jobsData || [])

                setStats({
                    totalVenues,
                    totalCoupons: couponsCount || 0,
                    pendingRequests: requestsCount || 0,
                    totalReviews,
                    avgRating,
                    totalJobs: jobsData?.length || 0
                })
                setLoading(false)

            } catch (error) {
                console.error("Error fetching admin stats:", error)
                setLoading(false)
            }
        }

        fetchStats()
    }, [router])

    // Process Data when ViewMode or Raw Data changes
    useEffect(() => {
        if (loading) return;

        const processData = (data: any[], type: 'day' | 'week' | 'month') => {
            const now = new Date()
            let intervals: Date[] = []
            let dateFormat = ""
            let checkFn: (d1: Date, d2: Date) => boolean = isSameDay;

            if (type === 'day') {
                // Last 30 days
                const start = subDays(now, 29)
                intervals = eachDayOfInterval({ start, end: now })
                dateFormat = "dd/MM"
                checkFn = isSameDay
            } else if (type === 'week') {
                // Last 12 weeks
                const start = subWeeks(now, 11)
                intervals = eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 })
                dateFormat = "'S'w" // Week number
                checkFn = isSameWeek
            } else {
                // Current Year (Jan - Dec)
                // const start = startOfYear(now) 
                // Let's do last 12 months for better continuity
                // const start = subMonths(now, 11)
                // Actually user requested "Current Year" logic before, but "Last 12 Month" is often better. 
                // Let's stick to Current 12 Months window or Start of Year?
                // Standard: Current Year (Jan to Now)
                const start = new Date(now.getFullYear(), 0, 1) // Jan 1st
                intervals = eachMonthOfInterval({ start, end: now })
                dateFormat = "MMM"
                checkFn = isSameMonth
            }

            // Map intervals to counts
            const currentPeriodCounts = intervals.map(date => {
                const count = data.filter(item => {
                    const itemDate = new Date(item.created_at)
                    return checkFn(date, itemDate)
                }).length
                return {
                    name: format(date, dateFormat, { locale: es }),
                    total: count,
                    fullDate: date // Internal use
                }
            })

            return currentPeriodCounts
        }

        const vData = processData(rawVenues, viewMode)
        const jData = processData(rawJobs, viewMode)

        setVenuesChartData(vData)
        setJobsChartData(jData)

        // Calculate Goal Progress (based on the last unit of time)
        // Rule: Goal is "Per Day" | "Per Week" | "Per Month" based on viewMode?
        // Or Goal is always "Monthly"?
        // Let's assume the user config is "Monthly Goal".
        // If viewMode is 'month', compare 'This Month's count' vs Goal.
        // If viewMode is 'day', maybe compare 'Today' vs (Goal / 30)? No, stick to "This Month" for simplicity context
        // OR better: User enters a target value for the CURRENT view.
        // Let's scale: 
        // If View=Month -> Target = Goal
        // If View=Week -> Target = Goal / 4
        // If View=Day -> Target = Goal / 30

        // Actually, simpler: "Metas Mensuales" is the standard.
        // We calculate "Current Month Progress" regardless of the chart view, OR we adapt.
        // Let's calculate "This [Period] Count" based on the last entry of the chart (which is 'now').

        const lastVenueCount = vData[vData.length - 1]?.total || 0;
        const lastJobCount = jData[jData.length - 1]?.total || 0;

        setCurrentProgress({
            venues: lastVenueCount,
            jobs: lastJobCount
        })

    }, [viewMode, rawVenues, rawJobs, loading])

    const saveGoals = () => {
        setGoals(tempGoals)
        localStorage.setItem('admin_goals', JSON.stringify(tempGoals))
        setIsGoalsOpen(false)
    }

    // Dynamic Goal Label
    const getGoalLabel = () => {
        if (viewMode === 'day') return "Meta Diaria"
        if (viewMode === 'week') return "Meta Semanal"
        return "Meta Mensual"
    }

    // Adjusted Goal Value based on view
    const getAdjustedGoal = (baseMonthlyGoal: number) => {
        if (viewMode === 'day') return Math.ceil(baseMonthlyGoal / 30) || 1
        if (viewMode === 'week') return Math.ceil(baseMonthlyGoal / 4) || 1
        return baseMonthlyGoal
    }

    const currentVenueGoal = getAdjustedGoal(goals.venues)
    const currentJobGoal = getAdjustedGoal(goals.jobs)

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                    <TabsList>
                        <TabsTrigger value="day">Días</TabsTrigger>
                        <TabsTrigger value="week">Semanas</TabsTrigger>
                        <TabsTrigger value="month">Meses</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Dialog open={isGoalsOpen} onOpenChange={setIsGoalsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Target className="h-4 w-4" />
                            Configurar Metas
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Configurar Metas Mensuales</DialogTitle>
                            <DialogDescription>
                                Establece tus objetivos de crecimiento <b>por mes</b>. El sistema ajustará automáticamente la meta para vidas diarias o semanales.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="g-venues" className="text-right">Lokales</Label>
                                <Input
                                    id="g-venues"
                                    type="number"
                                    value={tempGoals.venues}
                                    onChange={(e) => setTempGoals({ ...tempGoals, venues: parseInt(e.target.value) || 0 })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="g-jobs" className="text-right">Empleos</Label>
                                <Input
                                    id="g-jobs"
                                    type="number"
                                    value={tempGoals.jobs}
                                    onChange={(e) => setTempGoals({ ...tempGoals, jobs: parseInt(e.target.value) || 0 })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={saveGoals}>Guardar Metas</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Goals Tracking */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-200/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100 flex justify-between">
                            <span>Objetivo de Locales ({getGoalLabel()})</span>
                            <span className="font-bold">{currentProgress.venues} / {currentVenueGoal}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={(currentProgress.venues / currentVenueGoal) * 100} className="h-2 bg-amber-100 dark:bg-amber-900" indicatorClassName="bg-amber-500" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {currentProgress.venues >= currentVenueGoal ? "¡Meta completada! 🎉" : `Faltan ${currentVenueGoal - currentProgress.venues} para el objetivo.`}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100 flex justify-between">
                            <span>Objetivo de Empleos ({getGoalLabel()})</span>
                            <span className="font-bold">{currentProgress.jobs} / {currentJobGoal}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={(currentProgress.jobs / currentJobGoal) * 100} className="h-2 bg-blue-100 dark:bg-blue-900" indicatorClassName="bg-blue-500" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {currentProgress.jobs >= currentJobGoal ? "¡Meta completada! 🎉" : `Faltan ${currentJobGoal - currentProgress.jobs} para el objetivo.`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Locales</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalVenues}</div>
                        <p className="text-xs text-muted-foreground">Registros activos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Empleos Publicados</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalJobs}</div>
                        <p className="text-xs text-muted-foreground">Oportunidades laborales</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">Requieren aprobación</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cupones Activos</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCoupons}</div>
                        <p className="text-xs text-muted-foreground">Ofertas disponibles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Crecimiento de Locales</CardTitle>
                        <CardDescription>
                            {viewMode === 'day' ? "Últimos 30 días" : viewMode === 'week' ? "Últimas 12 semanas" : "Este año"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={venuesChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Locales" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Crecimiento de Empleos</CardTitle>
                        <CardDescription>
                            {viewMode === 'day' ? "Últimos 30 días" : viewMode === 'week' ? "Últimas 12 semanas" : "Este año"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={jobsChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Empleos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
