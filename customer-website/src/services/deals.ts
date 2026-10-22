import { apiRequest } from "./api"
import type { Product } from "../types"

export interface DealsResponse {
  items: Product[]
  total: number
  policy?: string
}

export async function fetchActiveDeals(): Promise<DealsResponse> {
  const data = await apiRequest<{ items: Product[]; total: number; policy?: string }>(
    "/api/deals"
  )
  return {
    items: data.items || [],
    total: data.total ?? data.items?.length,
    policy: data.policy,
  }
}

