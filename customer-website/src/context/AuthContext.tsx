import React, { createContext, useContext, useState, useEffect } from "react"

export interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  pincode: string
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  login: (email: string, name?: string) => void
  logout: () => void
  location: string
  setLocation: (loc: string) => void
  wishlist: string[]
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_USER: UserProfile = {
  name: "Aarav Sharma",
  email: "aarav.sharma@example.in",
  phone: "9876543210",
  address: "Flat 402, Green Glen Layout, Bellandur",
  city: "Bengaluru",
  pincode: "560103",
}

const WISHLIST_STORAGE_KEY = "freshsave_wishlist_v1"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("freshsave_user")
      return stored ? JSON.parse(stored) : DEFAULT_USER
    } catch {
      return DEFAULT_USER
    }
  })

  const [location, setLocation] = useState<string>("Bengaluru (Bellandur - 560103)")

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })


  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    } catch (err) {
      console.error("Failed to save wishlist", err)
    }
  }, [wishlist])

  const login = (email: string, name?: string) => {
    const newUser: UserProfile = {
      name: name || email.split("@")[0],
      email,
      phone: "9876543210",
      address: "Flat 402, Green Glen Layout, Bellandur",
      city: "Bengaluru",
      pincode: "560103",
    }
    setUser(newUser)
    localStorage.setItem("freshsave_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("freshsave_user")
  }

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const isInWishlist = (productId: string) => wishlist.includes(productId)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        location,
        setLocation,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
