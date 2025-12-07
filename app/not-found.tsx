import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPinOff } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="flex flex-col items-center text-center space-y-6 max-w-md">
                <div className="bg-muted p-6 rounded-full">
                    <MapPinOff className="h-12 w-12 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter">404</h1>
                    <h2 className="text-2xl font-semibold">Page Not Found</h2>
                    <p className="text-muted-foreground">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button asChild variant="default">
                        <Link href="/">Go Home</Link>
                    </Button>

                </div>
            </div>
        </div>
    )
}
