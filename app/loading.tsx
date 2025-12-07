import { Search } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4 py-24">
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Search className="h-12 w-12 text-primary animate-bounce" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse text-sm">Encontrá...</p>
        </div>
    )
}
