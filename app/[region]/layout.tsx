import { REGIONS } from "@/lib/regions";
import { notFound } from "next/navigation";
import { RegionProvider } from "@/components/providers/region-provider";

export default async function RegionLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ region: string }>
}) {
    const { region } = await params

    // Validate region code
    if (!REGIONS[region]) {
        notFound();
    }

    return (
        <RegionProvider regionCode={region}>
            {children}
        </RegionProvider>
    )
}
