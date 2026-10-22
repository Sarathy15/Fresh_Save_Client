import React, { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Leaf,
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  Package,
} from "lucide-react"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { fetchProducts } from "../../services/products"
import type { Product } from "../../types"

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const { totalItems, subtotal, openCart } = useCart()
  const { user, location, setLocation, wishlist } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)

  const availableLocations = [
    "Bengaluru (Bellandur - 560103)",
    "Bengaluru (Indiranagar - 560038)",
    "Bengaluru (HSR Layout - 560102)",
    "Bengaluru (Whitefield - 560066)",
    "Mumbai (Bandra West - 400050)",
    "Delhi NCR (Gurgaon CyberHub - 122002)",
  ]

  // Autocomplete suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetchProducts({ search: searchQuery })
        setSuggestions((res.items || []).slice(0, 5))
      } catch {
        setSuggestions([])
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchFocused(false)
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSelectSuggestion = (prod: Product) => {
    setIsSearchFocused(false)
    setSearchQuery("")
    navigate(`/shop?search=${encodeURIComponent(prod.name)}`)
  }

  return (
    <>
      {/* Top Banner & Info bar */}
      <div className="bg-green-950 text-green-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
            >
              <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
              <span>Deliver to: <strong className="text-white font-medium">{location}</strong></span>
              <ChevronDown className="w-3 h-3 text-gray-300" />
            </button>
            <span className="hidden md:inline-block text-green-700">|</span>
            <div className="hidden md:flex items-center gap-1 text-green-200">
              <Clock className="w-3.5 h-3.5 text-lime-400" />
              <span>Standard delivery: <strong>60-90 Mins</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block bg-green-900/80 px-2 py-0.5 rounded-full text-lime-300 text-[11px] font-medium border border-green-800">
              ⚡ Free delivery on orders over ₹499
            </span>
            <Link
              to="/deals"
              className="text-lime-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Today's Smart Deals
            </Link>
          </div>
        </div>
      </div>

      {/* Main Flipkart-Style Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white shadow-md shadow-green-700/20 group-hover:scale-105 transition-transform">
                <Leaf className="w-6 h-6 text-lime-300" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black tracking-tight text-gray-900 font-sans">
                    FreshSave<span className="text-green-700 font-extrabold">.ai</span>
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold -mt-0.5">
                  Fresh Groceries • Smarter Savings
                </p>
              </div>
            </Link>

            {/* Flipkart-Style Search Bar */}
            <div ref={searchRef} className="flex-1 max-w-2xl relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search 1,000+ groceries, veggies, dairy, artisan bread..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-11 pr-24 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 focus:border-green-600 rounded-xl text-sm focus:outline-none transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {isSearchFocused && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-2 border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Suggested Fresh Items
                  </div>
                  {suggestions.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleSelectSuggestion(prod)}
                      className="w-full text-left p-2.5 hover:bg-green-50/70 flex items-center justify-between gap-3 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=80"}
                          alt={prod.name}
                          className="w-9 h-9 rounded-lg object-cover bg-gray-100 border border-gray-100"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {prod.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {prod.category} • {prod.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-800">
                          ₹{prod.discount_price || prod.base_price}
                        </span>
                        {prod.discount_percent > 0 && (
                          <span className="block text-[10px] font-semibold text-orange-600">
                            {prod.discount_percent}% off
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-green-700 transition-colors cursor-pointer"
                  >
                    View all matching results for "{searchQuery}" →
                  </button>
                </div>
              )}
            </div>

            {/* Actions: Account, Orders, Wishlist, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* My Orders */}
              <Link
                to="/orders"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-green-800 hover:bg-green-50/60 rounded-xl transition-colors text-sm font-medium"
              >
                <Package className="w-4 h-4 text-gray-500" />
                <span>Orders</span>
              </Link>

              {/* Wishlist */}
              <Link
                to="/account?tab=wishlist"
                className="relative p-2 text-gray-700 hover:text-green-800 hover:bg-green-50/60 rounded-xl transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <Link
                to="/account"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 text-gray-700 hover:text-green-800 hover:bg-green-50/60 rounded-xl transition-colors text-sm font-medium"
              >
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-xs">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden sm:inline-block max-w-[90px] truncate">
                  {user ? user.name.split(" ")[0] : "Sign In"}
                </span>
              </Link>

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="flex items-center gap-2.5 px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl shadow-sm transition-all cursor-pointer font-medium text-sm group"
                aria-label="View shopping cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-lime-300" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2.5 w-4.5 h-4.5 bg-orange-500 text-white rounded-full text-[11px] font-black flex items-center justify-center border-2 border-green-700">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline-block font-semibold">
                  {totalItems > 0 ? `₹${subtotal}` : "Cart"}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="mt-2.5 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-16 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-green-700 text-white rounded text-xs font-medium"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Categories Bar */}
        <nav className="border-t border-gray-100 bg-gray-50/60 overflow-x-auto scrollbar-none px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap">
            <Link
              to="/shop"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                routerLocation.pathname === "/shop" && !routerLocation.search
                  ? "bg-green-700 text-white font-semibold"
                  : "text-gray-700 hover:text-green-800 hover:bg-white"
              }`}
            >
              All Groceries
            </Link>
            <Link
              to="/deals"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                routerLocation.pathname === "/deals"
                  ? "bg-green-700 text-white font-semibold"
                  : "text-orange-700 hover:bg-orange-50 font-semibold"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Today's Smart Deals
            </Link>
            <Link
              to="/packages"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                routerLocation.pathname === "/packages"
                  ? "bg-green-700 text-white font-semibold"
                  : "text-gray-700 hover:text-green-800 hover:bg-white"
              }`}
            >
              <span>Grocery Packages</span>
              <span className="bg-lime-100 text-green-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                Save 25%
              </span>
            </Link>
            <Link
              to="/shop?category=Fruits"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-green-800 hover:bg-white transition-colors"
            >
              Fruits
            </Link>
            <Link
              to="/shop?category=Vegetables"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-green-800 hover:bg-white transition-colors"
            >
              Vegetables
            </Link>
            <Link
              to="/shop?category=Dairy"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-green-800 hover:bg-white transition-colors"
            >
              Dairy & Eggs
            </Link>
            <Link
              to="/shop?category=Bakery"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-green-800 hover:bg-white transition-colors"
            >
              Artisan Bakery
            </Link>
            <Link
              to="/shop?category=Rice%2C%20Dal%20%26%20Grains"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-green-800 hover:bg-white transition-colors"
            >
              Rice & Dal
            </Link>
            <Link
              to="/shop?category=Cooking%20Essentials"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-green-800 hover:bg-white transition-colors"
            >
              Cooking Oils & Ghee
            </Link>
          </div>
        </nav>
      </header>

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-green-800 font-bold">
                <MapPin className="w-5 h-5 text-green-700" />
                <span>Select Delivery Location</span>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Choose your delivery pin code to view real-time inventory from your nearest FreshSave AI partner store:
            </p>
            <div className="space-y-2">
              {availableLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocation(loc)
                    setIsLocationModalOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center justify-between cursor-pointer ${
                    location === loc
                      ? "border-green-600 bg-green-50 text-green-900 font-semibold"
                      : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{loc}</span>
                  {location === loc && (
                    <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
