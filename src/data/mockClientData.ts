export interface ClientPromotion {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  currentPrice: number;
  discountPercentage: number;
  businessName: string;
  businessAddress: string;
  distance: number; // en km
  image: string;
  category: string;
  rating: number;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: 'restaurant', name: 'Restaurante', icon: '🍽️', color: 'bg-purple-100' },
  { id: 'cafe', name: 'Cafetería', icon: '☕', color: 'bg-amber-100' },
  { id: 'fast_food', name: 'Comida rápida', icon: '🍔', color: 'bg-yellow-100' },
  { id: 'casino', name: 'Casino', icon: '🎰', color: 'bg-pink-100' },
  { id: 'food_truck', name: 'Food truck', icon: '🚚', color: 'bg-green-100' },
  { id: 'ice_cream', name: 'Heladería', icon: '🍦', color: 'bg-blue-100' },
  { id: 'kiosk', name: 'Kiosko', icon: '🏪', color: 'bg-gray-100' },
  { id: 'store', name: 'Almacén', icon: '🏬', color: 'bg-red-100' },
];

// Datos reales vendrán de Supabase
export const popularPromotions: ClientPromotion[] = [];

export const promotionsByCategory: Record<string, ClientPromotion[]> = {};

export interface Business {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  distance: number; // en km
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  isOpen: boolean;
  openingHours: string;
  phone: string;
  website?: string;
  activePromotions: ClientPromotion[];
  dailyMenu?: DailyMenu;
  products: Product[];
}

export interface DailyMenu {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  items: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  tags: string[];
}

// Datos reales vendrán de Supabase
export const nearbyBusinesses: Business[] = []; 