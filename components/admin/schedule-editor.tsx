"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Copy } from "lucide-react"
import { WeeklySchedule, DaySchedule, TimeRange } from "@/lib/data"

interface ScheduleEditorProps {
    value?: WeeklySchedule
    onChange: (schedule: WeeklySchedule) => void
}

const DAYS_MAP: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo"
}

const DAYS = Object.keys(DAYS_MAP)

const DEFAULT_DAY_SCHEDULE: DaySchedule = {
    isOpen: true,
    ranges: [{ start: "09:00", end: "17:00" }]
}

const DEFAULT_SCHEDULE: WeeklySchedule = DAYS.reduce((acc, day) => {
    acc[day] = { ...DEFAULT_DAY_SCHEDULE }
    return acc
}, {} as WeeklySchedule)

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
    const [schedule, setSchedule] = useState<WeeklySchedule>(value || DEFAULT_SCHEDULE)

    useEffect(() => {
        if (value) {
            setSchedule(value)
        }
    }, [value])

    const updateDay = (day: string, updates: Partial<DaySchedule>) => {
        const newSchedule = {
            ...schedule,
            [day]: { ...schedule[day], ...updates }
        }
        setSchedule(newSchedule)
        onChange(newSchedule)
    }

    const updateRange = (day: string, index: number, field: keyof TimeRange, val: string) => {
        const newRanges = [...schedule[day].ranges]
        newRanges[index] = { ...newRanges[index], [field]: val }
        updateDay(day, { ranges: newRanges })
    }

    const addRange = (day: string) => {
        const newRanges = [...schedule[day].ranges, { start: "17:00", end: "21:00" }]
        updateDay(day, { ranges: newRanges })
    }

    const removeRange = (day: string, index: number) => {
        const newRanges = schedule[day].ranges.filter((_, i) => i !== index)
        updateDay(day, { ranges: newRanges })
    }

    const copyMondayToAll = () => {
        const mondaySchedule = schedule["monday"]
        const newSchedule = DAYS.reduce((acc, day) => {
            acc[day] = JSON.parse(JSON.stringify(mondaySchedule))
            return acc
        }, {} as WeeklySchedule)
        setSchedule(newSchedule)
        onChange(newSchedule)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={copyMondayToAll}>
                    <Copy className="mr-2 h-3 w-3" />
                    Copiar Lunes a Todos
                </Button>
            </div>
            <div className="space-y-4">
                {DAYS.map((day) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 p-3 border rounded-lg">
                        <div className="w-24 pt-2">
                            <Label className="capitalize font-medium">{DAYS_MAP[day]}</Label>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Switch
                                checked={schedule[day]?.isOpen}
                                onCheckedChange={(checked) => updateDay(day, { isOpen: checked })}
                            />
                            <span className="text-sm text-muted-foreground w-16">
                                {schedule[day]?.isOpen ? "Abierto" : "Cerrado"}
                            </span>
                        </div>

                        {schedule[day]?.isOpen && (
                            <div className="flex-1 space-y-2">
                                {schedule[day].ranges.map((range, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            type="time"
                                            value={range.start}
                                            onChange={(e) => updateRange(day, index, "start", e.target.value)}
                                            className="w-32"
                                        />
                                        <span>a</span>
                                        <Input
                                            type="time"
                                            value={range.end}
                                            onChange={(e) => updateRange(day, index, "end", e.target.value)}
                                            className="w-32"
                                        />
                                        {index > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive h-8 w-8"
                                                onClick={() => removeRange(day, index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {schedule[day].ranges.length < 2 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => addRange(day)}
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Agregar Turno
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
