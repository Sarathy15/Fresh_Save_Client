export interface Product {
  id: string
  name: string
  category: string
  unit: string
  unit_cost?: number
  base_price: number
  discount_percent: number
  discount_price: number
  shelf_life_days?: number
  average_daily_demand?: number
  price_sensitivity?: number
  stock: number
  is_deal: boolean
  deal_reason?: string
  deal_valid_until?: string
  rating?: number | null
  reviews_count?: number | null
  description?: string | null
  image_url?: string | null
  active: boolean
  created_at?: string
  updated_at?: string
  // Bulk / tiered pricing set by retailer
  bulk_min_qty?: number | null   // minimum qty to trigger bulk price (e.g. 3)
  bulk_price?: number | null     // price per unit when buying bulk_min_qty or more
}

export interface AnalyticsData {
  revenue: number
  cost_of_goods_sold: number
  gross_profit: number
  gross_margin_percent: number
  units_sold: number
  available_inventory_units: number
  near_expiry_inventory_units: number
  expired_or_wasted_units: number
  order_counts: number
  active_deals_count: number
  products_count: number
  generated_at: string
}


export interface CartItem {
  product: Product
  quantity: number
}

export interface PackageItem {
  name: string
  quantity: string
}

export interface GroceryPackage {
  id: string
  name: string
  badge: string
  subtitle: string
  cadence: string
  regular_price: number
  package_price: number
  savings: number
  savings_percent: number
  image_url: string
  items: PackageItem[]
  waste_reduction_impact: string
}

export interface OrderItem {
  product_id: string
  name: string
  unit: string
  unit_price: number
  base_price: number
  quantity: number
  total_price: number
  image_url?: string | null
}

export interface Order {
  order_id: string
  customer_name: string
  customer_email?: string | null
  customer_phone: string
  delivery_address: string
  delivery_city: string
  delivery_pincode: string
  delivery_slot: string
  payment_method: string
  payment_status: string
  order_status: "Confirmed" | "Packed" | "Out for Delivery" | "Delivered"
  items: OrderItem[]
  item_count: number
  subtotal: number
  original_subtotal: number
  savings: number
  delivery_fee: number
  final_total: number
  food_waste_diverted_kg: number
  created_at: string
  estimated_delivery: string
}

export interface OrderCreatePayload {
  customer_name: string
  customer_email?: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  delivery_pincode: string
  delivery_slot: string
  payment_method: string
  items: {
    product_id: string
    quantity: number
  }[]
}

export type CategoryType =
  | "All"
  | "Fruits"
  | "Vegetables"
  | "Dairy"
  | "Bakery"
  | "Rice, Dal & Grains"
  | "Cooking Essentials"
  | "Snacks & Beverages"
