import React, { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  User,
  Heart,
  Package,
  MapPin,
  Lock,
  LogOut,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Coins,
  Warehouse,
  Boxes,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { fetchProducts, createProduct } from "../services/products"
import { fetchAnalytics, type AnalyticsData } from "../services/analytics"
import { ProductCard } from "../components/products/ProductCard"
import type { Product } from "../types"

export const Account: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "profile"

  const { user, login, logout, wishlist } = useAuth()

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])

  // Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  // Retailer Quick Add State
  const [retailerProdName, setRetailerProdName] = useState("")
  const [retailerCategory, setRetailerCategory] = useState("Produce")
  const [retailerUnit, setRetailerUnit] = useState("1 kg")
  const [retailerPrice, setRetailerPrice] = useState("90")
  const [retailerStock, setRetailerStock] = useState("25")
  const [retailerFeedback, setRetailerFeedback] = useState<string | null>(null)
  const [isSubmittingRetailer, setIsSubmittingRetailer] = useState(false)

  // Demo Auth Form
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin")
  const [emailInput, setEmailInput] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [authFeedback, setAuthFeedback] = useState<string | null>(null)

  // Load analytics when tab is active
  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      const data = await fetchAnalytics()
      setAnalytics(data)
    } catch (err: any) {
      setAnalyticsError(err.message || "Failed to load store analytics from database.")
    } finally {
      setAnalyticsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "retailer") {
      loadAnalytics()
    }
  }, [activeTab])


  // Load wishlist products
  useEffect(() => {
    async function loadWishlistItems() {
      if (wishlist.length === 0) {
        setWishlistProducts([])
        return
      }
      try {
        const allRes = await fetchProducts()
        const matched = allRes.items.filter((p: Product) => wishlist.includes(p.id))
        setWishlistProducts(matched)
      } catch (err) {
        console.error("Wishlist products load failed:", err)
      }
    }
    loadWishlistItems()
  }, [wishlist])

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) return

    login(emailInput.trim(), nameInput.trim() || undefined)
    setAuthFeedback(`Welcome, ${nameInput || emailInput}! Demo profile loaded.`)
    setTimeout(() => setAuthFeedback(null), 3000)
  }

  const setTab = (tab: string) => {
    setSearchParams({ tab })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Customer Account
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your saved delivery address, saved wishlist, and demo profile
          </p>
        </div>

        {user && (
          <button
            onClick={logout}
            className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setTab("profile")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "profile"
              ? "bg-green-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Address</span>
        </button>

        <button
          onClick={() => setTab("wishlist")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "wishlist"
              ? "bg-green-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>My Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setTab("retailer")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "retailer"
              ? "bg-green-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Store Analytics & Retailer</span>
        </button>
      </div>


      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* User Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-700 to-emerald-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {user ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-950 text-sm">
                  {user ? user.name : "Guest Customer"}
                </h3>
                <p className="text-xs text-gray-500">
                  {user ? user.email : "demo@freshsave.in"}
                </p>
                <span className="inline-block mt-1 bg-green-50 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Verified Customer Account
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block mb-0.5">Primary Delivery Address:</span>
                  <p className="font-medium text-gray-800 leading-snug">
                    {user?.address || "Flat 402, Green Glen Layout, Bellandur"}
                  </p>
                  <p className="text-gray-500">
                    {user?.city || "Bengaluru"} - {user?.pincode || "560103"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/orders"
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-gray-200"
              >
                <Package className="w-3.5 h-3.5 text-green-700" />
                <span>View Order History</span>
              </Link>
            </div>
          </div>

          {/* Demo Auth Simulation Form */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-700" />
                <h3 className="font-bold text-gray-950 text-sm">
                  {authMode === "signin" ? "Switch / Sign In Account" : "Register Demo Account"}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setAuthMode("signin")}
                  className={`font-semibold cursor-pointer ${
                    authMode === "signin" ? "text-green-700 underline" : "text-gray-400"
                  }`}
                >
                  Sign In
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setAuthMode("register")}
                  className={`font-semibold cursor-pointer ${
                    authMode === "register" ? "text-green-700 underline" : "text-gray-400"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Disclaimer Alert */}
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 leading-relaxed">
              <strong>Hackathon Note:</strong> Real authentication requires backend token generation. This interface provides instant demo profile switching without transmitting plaintext credentials.
            </div>

            {authFeedback && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-xs text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                <span>{authFeedback}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Priya Sundaram"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.in"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {authMode === "signin" ? "Sign In to Demo Profile" : "Create Demo Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 max-w-md mx-auto">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 text-base mb-1">
                Your wishlist is empty
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Tap the heart icon on any product card in the catalogue to save items for later.
              </p>
              <Link
                to="/shop"
                className="px-6 py-2.5 bg-green-700 text-white rounded-xl text-xs font-bold hover:bg-green-800 transition-colors inline-block"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {wishlistProducts.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Retailer Analytics Tab */}
      {activeTab === "retailer" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>MongoDB Atlas Real-Time Analytics</span>
              </div>
              <h2 className="text-xl font-bold text-gray-950">
                Store Operations & Business Metrics
              </h2>
              <p className="text-xs text-gray-500">
                Authoritatively computed from <code className="bg-gray-100 px-1 py-0.5 rounded text-green-800">sales</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-green-800">orders</code>, and <code className="bg-gray-100 px-1 py-0.5 rounded text-green-800">inventory_batches</code>.
              </p>
            </div>
            <button
              onClick={loadAnalytics}
              disabled={analyticsLoading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {analyticsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 h-32 animate-pulse" />
              ))}
            </div>
          ) : analyticsError ? (
            <div className="bg-red-50 text-red-900 p-8 rounded-3xl border border-red-200 text-center max-w-md mx-auto space-y-3">
              <p className="text-xs font-semibold">{analyticsError}</p>
              <button
                onClick={loadAnalytics}
                className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* 4 Primary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
                    <Coins className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-950">
                    ₹{analytics.revenue}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {analytics.units_sold} units sold across confirmed orders
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Gross Profit</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-black text-green-800">
                    ₹{analytics.gross_profit}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Margin: <strong className="text-gray-900">{analytics.gross_margin_percent}%</strong> (COGS: ₹{analytics.cost_of_goods_sold})
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Live Inventory</span>
                    <Warehouse className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-950">
                    {analytics.available_inventory_units}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Units across {analytics.products_count} active catalogue products
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Near-Expiry Risk</span>
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-black text-orange-700">
                    {analytics.near_expiry_inventory_units}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {analytics.active_deals_count} active markdown deals diverting waste
                  </p>
                </div>
              </div>

              {/* Secondary Details & Retailer Operations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Store Inventory Health Breakdown */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-gray-950 text-sm pb-2 border-b border-gray-100">
                    Authoritative Database Records
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Total Customer Orders in MongoDB:</span>
                      <strong className="text-gray-900 font-mono">{analytics.order_counts} orders</strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Cost of Goods Sold (COGS):</span>
                      <strong className="text-gray-900 font-mono">₹{analytics.cost_of_goods_sold}</strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Expired or Unsold Wastage Units:</span>
                      <strong className="text-gray-900 font-mono">{analytics.expired_or_wasted_units} units</strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Active Food-Waste Markdown Deals:</span>
                      <strong className="text-green-800 font-mono">{analytics.active_deals_count} deals</strong>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-400">Calculated At:</span>
                      <span className="text-gray-500 font-mono text-[11px]">
                        {new Date(analytics.generated_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Retailer Quick Add Product Form */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <PlusCircle className="w-4 h-4 text-green-700" />
                    <h3 className="font-bold text-gray-950 text-sm">
                      Retailer: Add Product to Database
                    </h3>
                  </div>

                  {retailerFeedback && (
                    <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                      <span>{retailerFeedback}</span>
                    </div>
                  )}

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (!retailerProdName.trim() || !retailerPrice || Number(retailerPrice) <= 0) return
                      try {
                        setIsSubmittingRetailer(true)
                        setRetailerFeedback(null)
                        await createProduct({
                          name: retailerProdName.trim(),
                          category: retailerCategory.trim(),
                          unit: retailerUnit.trim() || "1 unit",
                          base_price: Number(retailerPrice),
                          unit_cost: Number(retailerPrice) * 0.7,
                          shelf_life_days: 7,
                          initial_stock: Number(retailerStock) || 0,
                        })
                        setRetailerFeedback(`Created "${retailerProdName}" directly in MongoDB!`)
                        setRetailerProdName("")
                        await loadAnalytics()
                      } catch (err: any) {
                        setRetailerFeedback(`Error: ${err.message}`)
                      } finally {
                        setIsSubmittingRetailer(false)
                      }
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Farm Fresh Spinach"
                        value={retailerProdName}
                        onChange={(e) => setRetailerProdName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">
                          Category *
                        </label>
                        <input
                          type="text"
                          required
                          value={retailerCategory}
                          onChange={(e) => setRetailerCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">
                          Unit *
                        </label>
                        <input
                          type="text"
                          required
                          value={retailerUnit}
                          onChange={(e) => setRetailerUnit(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">
                          Base Price (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          required
                          value={retailerPrice}
                          onChange={(e) => setRetailerPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">
                          Initial Stock (Units) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={retailerStock}
                          onChange={(e) => setRetailerStock(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRetailer}
                      className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                    >
                      {isSubmittingRetailer ? "Saving to MongoDB..." : "Persist to Store Catalogue"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

