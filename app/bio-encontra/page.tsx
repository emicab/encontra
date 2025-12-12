
import { Metadata } from "next"
import { EncontraBioView } from "@/components/bio/encontra-bio-view"

export const metadata: Metadata = {
    title: "Encontrá | Bio",
    description: "Todos los enlaces de Encontrá en un solo lugar.",
    robots: {
        index: false,
        follow: true
    }
}

export default function BioEncontraPage() {
    return <EncontraBioView />
}
