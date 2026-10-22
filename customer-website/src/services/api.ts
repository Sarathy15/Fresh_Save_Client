const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "")

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorDetail = `Request failed with status ${response.status}`
      try {
        const errJson = await response.json()
        errorDetail = errJson.detail || errJson.message || errorDetail
      } catch {
        // use default message
      }
      throw new ApiError(errorDetail, response.status)
    }

    if (response.status === 204) {
      return {} as T
    }

    return await response.json()
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === "AbortError") {
      throw new ApiError("Network request timed out. Please check backend connection.", 408)
    }
    throw error
  }
}
