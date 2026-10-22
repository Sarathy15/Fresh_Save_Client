import { apiRequest } from "./api"
import type { Product } from "../types"

export interface ProductListResponse {
  items: Product[]
  total?: number
  limit?: number
  skip?: number
}

export interface ProductCreatePayload {
  name: string
  category: string
  unit?: string
  base_price: number
  unit_cost?: number
  shelf_life_days?: number
  initial_stock?: number
  description?: string
  image_url?: string
}

export async function fetchProducts(params?: {
  category?: string
  search?: string
  deal_only?: boolean
}): Promise<ProductListResponse> {
  const query = new URLSearchParams()
  if (params?.category && params.category !== "All") {
    query.set("category", params.category)
  }
  if (params?.search && params.search.trim()) {
    query.set("search", params.search.trim())
  }
  if (params?.deal_only) {
    query.set("deal_only", "true")
  }

  const queryString = query.toString() ? `?${query.toString()}` : ""

  const data = await apiRequest<{ items: Product[]; total?: number; limit?: number; skip?: number }>(
    `/api/products${queryString}`
  )

  return {
    items: data.items || [],
    total: data.total ?? data.items?.length,
    limit: data.limit,
    skip: data.skip,
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  return await apiRequest<Product>(`/api/products/${id}`)
}

export async function fetchCategories(): Promise<string[]> {
  const data = await apiRequest<{ categories: string[] }>("/api/products/categories")
  return data.categories || []
}

export async function createProduct(payload: ProductCreatePayload): Promise<Product> {
  return await apiRequest<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

