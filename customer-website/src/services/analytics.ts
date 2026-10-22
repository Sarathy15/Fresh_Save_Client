import { apiRequest } from "./api"

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

export async function fetchAnalytics(): Promise<AnalyticsData> {
  return await apiRequest<AnalyticsData>("/api/analytics")
}
