import { CouponForm } from "@/components/admin/coupon-form"

export default function NewCouponPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Cupón</h2>
                <p className="text-muted-foreground">Crear un nuevo cupón de descuento.</p>
            </div>
            <CouponForm />
        </div>
    )
}
