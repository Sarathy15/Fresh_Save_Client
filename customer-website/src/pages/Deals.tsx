import React, { useState, useEffect } from "react"
import { Sparkles, ShieldCheck, Clock, Leaf, RefreshCw } from "lucide-react"
import { fetchActiveDeals } from "../services/deals"
import { ProductCard } from "../components/products/ProductCard"
import { ProductModal } from "../components/products/ProductModal"
import { ProductGridSkeleton } from "../components/common/Skeleton"
import { EmptyState } from "../components/common/EmptyState"
import type { Product } from "../types"

export const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const loadDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchActiveDeals()
      setDeals(res.items || [])
    } catch (err: any) {
      console.error("Deals load failed:", err)
      setError(
        err.message ||
          "Could not retrieve active deals from database. Please verify backend connection."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeals()
  }, [])


  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Deals Header Banner */}
      <div className="bg-gradient-to-r from-green-900 via-emerald-800 to-green-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-green-700 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400 text-green-950 font-black rounded-full text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retailer-Approved Markdown</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
            Today's Smart Deals
          </h1>

          <p className="text-sm text-green-100 leading-relaxed">
            Every deal here is confirmed by local store inventory managers. High quality farm produce, bakery batches, and dairy items nearing peak ripeness are offered at steep savings to guarantee zero store-level food waste.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-lime-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
              <span>100% Quality Inspected</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Strict Validity Windows</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Direct Waste Reduction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Transparency Note */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <RefreshCw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Transparent Markdown Policy:</strong> Prices and stock limits are validated directly from store batch data. Discontinued or expired products are never listed. All items carry our complete freshness guarantee with immediate refund if unsatisfactory.
        </div>
      </div>

      {/* Deals Listing */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Active Verified Offers ({deals.length})
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Updated in real-time from store catalogue
          </span>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <div className="bg-red-50 text-red-900 p-8 rounded-3xl border border-red-200 text-center max-w-lg mx-auto space-y-3">
            <h3 className="font-bold text-sm text-red-950">Active Deals Load Error</h3>
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            <button
              onClick={loadDeals}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Retry Loading Deals
            </button>
          </div>
        ) : deals.length === 0 ? (
          <EmptyState
            title="No active smart deals right now"
            description="Our store inventory is currently balanced with no near-ripeness surplus. Please check back later or explore our everyday catalogue."
            actionText="Browse Everyday Groceries"
            actionLink="/shop"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

            {deals.map((deal) => (
              <ProductCard
                key={deal.id}
                product={deal}
                onQuickView={(p: Product) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
