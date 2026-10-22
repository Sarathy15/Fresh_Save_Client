import { apiRequest } from "./api"
import type { GroceryPackage } from "../types"

export async function fetchPackages(): Promise<GroceryPackage[]> {
  const data = await apiRequest<{ packages: GroceryPackage[] }>("/api/packages")
  return data.packages || []
}

