export interface Venue {
  id: string
  slug: string
  name: string
  description: string
  category: string
  image: string
  logo?: string
  rating: number
  reviewCount: number
  distance: string
  openTime: string
  closeTime: string
  isOpen: boolean
  isFeatured: boolean
  isNew: boolean
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  whatsapp: string
  website?: string
  instagram?: string
  facebook?: string
  phone?: string
  subscriptionPlan: "free" | "basic" | "premium"
  subscriptionStatus: "active" | "inactive"
  venueType: "physical" | "entrepreneur" | "service"
  locationMode: "address" | "zone"
  zone?: string
  schedule?: WeeklySchedule
  serviceDelivery: boolean
  servicePickup: boolean
  serviceArrangement: boolean
  gallery?: string[]
  regionCode?: string
  ownerId?: string | null
  city?: string
}

export type TimeRange = { start: string; end: string }
export type DaySchedule = { isOpen: boolean; ranges: TimeRange[] }
export type WeeklySchedule = Record<string, DaySchedule>


export interface Product {
  id: string
  venueId: string
  name: string
  description: string
  price?: number
  image?: string
  isActive: boolean
}

export interface Coupon {
  id: string
  venueId: string
  venueName: string
  discount: string
  description: string
  validUntil: string
  image: string
  code: string
  type: "percent" | "fixed"
}

export const venues: Venue[] = [
  {
    id: "1",
    slug: "sakura-sushi",
    name: "Sakura Sushi",
    description: "Auténtica cocina japonesa con ingredientes frescos",
    category: "restaurant",
    image: "/japanese-sushi-restaurant.png",
    rating: 4.8,
    reviewCount: 342,
    distance: "0.3 km",
    openTime: "11:00",
    closeTime: "22:00",
    isOpen: true,
    isFeatured: true,
    isNew: false,
    address: "123 Main Street",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    whatsapp: "5491112345678",
    website: "https://sakurasushi.com",
    instagram: "sakurasushi",
    phone: "1112345678",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    venueType: "physical",
    locationMode: "address",
    serviceDelivery: true,
    servicePickup: true,
    serviceArrangement: false,
    logo: "/japanese-sushi-restaurant.png",
    gallery: ["/japanese-sushi-restaurant.png", "/sushi-platter-discount-coupon.jpg"],
    regionCode: "tdf",
    zone: "Ushuaia",
    ownerId: "mock_owner_1",
  },
  {
    id: "2",
    slug: "cafe-del-sol",
    name: "Café del Sol",
    description: "Café acogedor con café artesanal y pastelería",
    category: "cafe",
    image: "/cozy-cafe-coffee.png",
    rating: 4.6,
    reviewCount: 189,
    distance: "0.5 km",
    openTime: "07:00",
    closeTime: "20:00",
    isOpen: true,
    isFeatured: true,
    isNew: true,
    address: "456 Ocean Drive",
    coordinates: { lat: 35.6895, lng: 139.6917 },
    whatsapp: "5491187654321",
    instagram: "cafedelsol",
    subscriptionPlan: "basic",
    subscriptionStatus: "active",
    venueType: "physical",
    locationMode: "address",
    serviceDelivery: false,
    servicePickup: true,
    serviceArrangement: false,
    logo: "/cozy-cafe-coffee.png",
    regionCode: "tdf",
    zone: "Rio Grande",
  },
  {
    id: "3",
    slug: "local-crafts-market",
    name: "Mercado de Artesanías",
    description: "Souvenirs únicos y artesanías locales",
    category: "shop",
    image: "/gift-shop-with-souvenirs.jpg",
    rating: 4.4,
    reviewCount: 98,
    distance: "0.8 km",
    openTime: "10:00",
    closeTime: "19:00",
    isOpen: false,
    isFeatured: false,
    isNew: false,
    address: "789 Market Square",
    coordinates: { lat: 35.6586, lng: 139.7454 },
    whatsapp: "5491122334455",
    subscriptionPlan: "free",
    subscriptionStatus: "active",
    venueType: "physical",
    locationMode: "address",
    serviceDelivery: false,
    servicePickup: false,
    serviceArrangement: false,
    logo: "/gift-shop-with-souvenirs.jpg",
    regionCode: "cba",
    zone: "Capital",
  },
  {
    id: "4",
    slug: "tango-night-club",
    name: "Club de Tango",
    description: "Experiencia de cine premium con asientos reclinables",
    category: "entertainment",
    image: "/modern-cinema-theater-interior.jpg",
    rating: 4.7,
    reviewCount: 456,
    distance: "1.2 km",
    openTime: "12:00",
    closeTime: "23:00",
    isOpen: true,
    isFeatured: true,
    isNew: false,
    address: "321 Entertainment Blvd",
    coordinates: { lat: 35.6277, lng: 139.775 },
    whatsapp: "5491199887766",
    subscriptionPlan: "basic",
    subscriptionStatus: "active",
    venueType: "physical",
    locationMode: "address",
    serviceDelivery: false,
    servicePickup: false,
    serviceArrangement: false,
    logo: "/modern-cinema-theater-interior.jpg",
    regionCode: "tdf",
    zone: "Tolhuin",
  },
  {
    id: "5",
    slug: "golden-dragon",
    name: "Golden Dragon",
    description: "Dim sum tradicional chino y mariscos",
    category: "restaurant",
    image: "/chinese-dim-sum.png",
    rating: 4.5,
    reviewCount: 267,
    distance: "0.6 km",
    openTime: "10:00",
    closeTime: "22:00",
    isOpen: true,
    isFeatured: false,
    isNew: false,
    address: "555 Dragon Lane",
    coordinates: { lat: 35.7101, lng: 139.8107 },
    whatsapp: "5491155667788",
    subscriptionPlan: "basic",
    subscriptionStatus: "active",
    venueType: "physical",
    locationMode: "address",
    serviceDelivery: true,
    servicePickup: true,
    serviceArrangement: false,
    logo: "/chinese-dim-sum.png",
    regionCode: "tdf",
    zone: "Ushuaia",
  },
  {
    id: "6",
    slug: "museum-of-modern-art",
    name: "Sunset Rooftop Bar",
    description: "Vistas panorámicas con cócteles artesanales",
    category: "entertainment",
    image: "/rooftop-bar-sunset-view-cocktails.jpg",
    rating: 4.9,
    reviewCount: 521,
    distance: "0.9 km",
    openTime: "17:00",
    closeTime: "02:00",
    isOpen: true,
    isFeatured: true,
    isNew: true,
    address: "100 Sky Tower",
    coordinates: { lat: 35.6591, lng: 139.7006 },
    whatsapp: "5491144332211",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    venueType: "physical",
    locationMode: "address",
    serviceDelivery: true,
    servicePickup: true,
    serviceArrangement: false,
    logo: "/rooftop-bar-sunset-view-cocktails.jpg",
    gallery: ["/rooftop-bar-sunset-view-cocktails.jpg", "/cocktails-happy-hour-sunset.jpg"],
    regionCode: "tdf",
    zone: "Ushuaia",
  },
]

export const coupons: Coupon[] = [
  {
    id: "c1",
    venueId: "1",
    venueName: "Sakura Sushi",
    discount: "20%",
    description: "En todos los combos de almuerzo",
    validUntil: "2025-01-31",
    image: "/sushi-platter-discount-coupon.jpg",
    code: "SAKURA20",
    type: "percent",
  },
  {
    id: "c2",
    venueId: "2",
    venueName: "Blue Wave Café",
    discount: "15%",
    description: "En cafés especiales",
    validUntil: "2025-02-15",
    image: "/coffee-latte-art-coupon.jpg",
    code: "BLUEWAVE15",
    type: "percent",
  },
  {
    id: "c3",
    venueId: "4",
    venueName: "Starlight Cinema",
    discount: "30%",
    description: "En entradas de días de semana",
    validUntil: "2025-02-28",
    image: "/cinema-movie-tickets-popcorn.jpg",
    code: "STARLIGHT30",
    type: "percent",
  },
  {
    id: "c4",
    venueId: "6",
    venueName: "Sunset Rooftop Bar",
    discount: "25%",
    description: "En bebidas de happy hour",
    validUntil: "2025-01-20",
    image: "/cocktails-happy-hour-sunset.jpg",
    code: "SUNSET25",
    type: "percent",
  },
]
