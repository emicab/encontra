import type { Venue } from "@/lib/data"

export type SubscriptionPlan = "free" | "basic" | "premium"

export const PLANS = {
    free: {
        name: "Vecino",
        price: 0,
        features: {
            whatsapp: false, // Text only
            socials: false,
            productsLimit: 0,
            verified: false,
            coupons: false,
            featured: false,
            galleryLimit: 1,
            analytics: false,
        },
    },
    basic: {
        name: "Emprendedor",
        price: 12000,
        features: {
            whatsapp: true,
            socials: true,
            productsLimit: 5,
            verified: true,
            coupons: true, // Limited to 3 active
            featured: false,
            galleryLimit: 3,
            analytics: true,
        },
    },
    premium: {
        name: "Negocio Full",
        price: 20000,
        features: {
            whatsapp: true,
            socials: true,
            productsLimit: 50, // Or unlimited (-1)
            verified: true,
            coupons: true, // Unlimited
            featured: true,
            galleryLimit: 10,
            analytics: true,
        },
    },
}

export function getVenueFeatures(venue: Venue) {
    // If subscription is inactive, fallback to free features or no features
    if (venue.subscriptionStatus !== "active") {
        return PLANS.free.features
    }

    const plan = venue.subscriptionPlan as SubscriptionPlan
    return PLANS[plan]?.features || PLANS.free.features
}

export function canCreateCoupon(venue: Venue, currentCouponCount: number) {
    const features = getVenueFeatures(venue)
    if (!features.coupons) return false

    if (venue.subscriptionPlan === "basic" && currentCouponCount >= 3) return false

    return true
}

export function checkIsOpen(venue: Venue): boolean {
    if (!venue.schedule) {
        // Fallback to simple open/close time if schedule object is missing
        // This is a simplified check and might not handle overnight hours correctly without full date parsing
        // But for consistency with existing simple logic:
        return venue.isOpen // Use the DB flag if no detailed schedule
    }

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const now = new Date()
    const today = days[now.getDay()]
    const schedule = venue.schedule[today]

    if (!schedule || !schedule.isOpen) return false

    // Check ranges
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    return schedule.ranges.some(range => {
        const [startHour, startMinute] = range.start.split(":").map(Number)
        const [endHour, endMinute] = range.end.split(":").map(Number)

        const startTotal = startHour * 60 + startMinute
        const endTotal = endHour * 60 + endMinute

        if (endTotal < startTotal) {
            // Overnight range (e.g. 22:00 - 02:00)
            // Open if current time is after start OR before end
            return currentMinutes >= startTotal || currentMinutes <= endTotal
        }

        return currentMinutes >= startTotal && currentMinutes <= endTotal
    })
}
