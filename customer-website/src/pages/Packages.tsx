import React, { useState, useEffect } from "react"
import {
  Package,
  CheckCircle2,
  Leaf,
  Plus,
} from "lucide-react"
import { fetchPackages } from "../services/packages"
import { useCart } from "../context/CartContext"
import type { GroceryPackage, Product } from "../types"

export const Packages: React.FC = () => {
  const [packages, setPackages] = useState<GroceryPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedPkgId, setAddedPkgId] = useState<string | null>(null)
  const { addToCart, openCart } = useCart()


  const loadPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      const pkgs = await fetchPackages()
      setPackages(pkgs)
    } catch (err: any) {
      console.error("Packages fetch failed:", err)
      setError(
        err.message ||
          "Could not retrieve grocery packages. Please check backend connection."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPackages()
  }, [])

  const handleAddPackage = (pkg: GroceryPackage) => {
    const bundleProduct: Product = {
      id: pkg.id,
      name: pkg.name,
      category: "Grocery Packages",
      unit: `${pkg.items.length} Curated Items Bundle`,
      unit_cost: pkg.regular_price * 0.7,
      base_price: pkg.regular_price,
      discount_percent: pkg.savings_percent,
      discount_price: pkg.package_price,
      shelf_life_days: 7,
      average_daily_demand: 15,
      price_sensitivity: 1.0,
      stock: 20,
      is_deal: true,
      deal_reason: "Bundled Grocery Package Savings",
      image_url: pkg.image_url,
      description: `${pkg.subtitle}. Includes: ${pkg.items.map((i) => `${i.name} (${i.quantity})`).join(", ")}`,
      active: true,
      rating: 4.9,
      reviews_count: 85,
    }

    addToCart(bundleProduct, 1)
    setAddedPkgId(pkg.id)
    setTimeout(() => setAddedPkgId(null), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-green-800">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400 text-green-950 text-xs font-bold rounded-full">
            <Package className="w-3.5 h-3.5" />
            <span>Curated Household Bundles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-sans">
            Weekly & Monthly Grocery Packages
          </h1>
          <p className="text-sm text-green-100 leading-relaxed">
            Eliminate everyday grocery planning with our dietitian and chef-curated produce and pantry boxes. Enjoy guaranteed bulk savings of up to 25% while helping local supply chains balance seasonal harvests.
          </p>
        </div>
      </div>

      {/* Package Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl h-96 p-6 border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-900 p-8 rounded-3xl border border-red-200 text-center max-w-lg mx-auto space-y-3">
          <h3 className="font-bold text-sm text-red-950">Package Loading Error</h3>
          <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          <button
            onClick={loadPackages}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Retry Loading Packages
          </button>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Packages Currently Available</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Curated family boxes and harvest bundles are being scheduled for the upcoming cycle. Individual grocery essentials and daily deals are available now.
          </p>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors"
          >
            Browse Everyday Groceries
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {packages.map((pkg) => {
          const isAdded = addedPkgId === pkg.id

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border border-gray-200/90 hover:border-green-300 shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {pkg.badge}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                    {pkg.cadence}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-950 mb-1 group-hover:text-green-800 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    {pkg.subtitle}
                  </p>

                  {/* Included Items Checklist */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4">
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span>Included Essentials</span>
                      <span className="text-[11px] font-medium text-gray-500">
                        {pkg.items.length} Items
                      </span>
                    </p>
                    <div className="space-y-2">
                      {pkg.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs text-gray-700"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-700 shrink-0" />
                            <span className="truncate">{it.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900 shrink-0 ml-2">
                            {it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Waste Reduction Impact */}
                  <div className="bg-lime-50/80 border border-lime-200 text-green-900 rounded-xl p-3 flex items-center gap-2 text-xs mb-4">
                    <Leaf className="w-4 h-4 text-green-700 shrink-0" />
                    <span className="font-medium">{pkg.waste_reduction_impact}</span>
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart Action */}
              <div className="p-5 pt-0 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-baseline justify-between py-3">
                  <div>
                    <span className="text-xs text-gray-400 block line-through">
                      Regular Price: ₹{pkg.regular_price}
                    </span>
                    <span className="text-2xl font-black text-gray-950 font-sans">
                      ₹{pkg.package_price}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-md">
                      Save ₹{pkg.savings} ({pkg.savings_percent}%)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddPackage(pkg)}
                    className="flex-1 py-3 px-4 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-lime-300" />
                        <span>Bundle Added to Basket!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-lime-300" />
                        <span>Add Bundle to Basket</span>
                      </>
                    )}
                  </button>

                  {isAdded && (
                    <button
                      onClick={openCart}
                      className="px-4 py-3 bg-lime-400 hover:bg-lime-300 text-green-950 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      View Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}

