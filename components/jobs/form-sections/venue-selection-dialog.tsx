
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

interface VenueSelectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    detectedVenues: any[]
    selectedVenueId: string | null
    onSelectVenue: (id: string) => void
    onConfirm: () => void
    onSkip: () => void
}

export function VenueSelectionDialog({
    open,
    onOpenChange,
    detectedVenues,
    selectedVenueId,
    onSelectVenue,
    onConfirm,
    onSkip
}: VenueSelectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vincular a un Local</DialogTitle>
                    <DialogDescription>
                        Vemos que administrás estos locales. ¿Querés publicar el aviso a nombre de uno de ellos?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <RadioGroup onValueChange={onSelectVenue} value={selectedVenueId || ""}>
                        {detectedVenues.map((v) => (
                            <div key={v.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                                <RadioGroupItem value={v.id} id={v.id} />
                                <label htmlFor={v.id} className="flex-1 cursor-pointer font-medium">{v.name}</label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <DialogFooter className="flex-col sm:justify-between gap-2">
                    <Button variant="ghost" onClick={onSkip}>
                        No, publicar como independiente
                    </Button>
                    <Button onClick={onConfirm} disabled={!selectedVenueId}>
                        Vincular y Publicar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
