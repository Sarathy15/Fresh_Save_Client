import { apiRequest } from "./api"
import type { Order, OrderCreatePayload } from "../types"

export async function submitOrder(payload: OrderCreatePayload): Promise<Order> {
  // Authoritatively submits to FastAPI server where prices and stock are validated
  return await apiRequest<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function fetchOrders(): Promise<Order[]> {
  const data = await apiRequest<{ orders: Order[] }>("/api/orders")
  return data.orders || []
}

export async function fetchOrderById(orderId: string): Promise<Order> {
  return await apiRequest<Order>(`/api/orders/${orderId}`)
}

