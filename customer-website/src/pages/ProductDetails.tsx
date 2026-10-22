import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Star,
  Clock,
  ShieldCheck,
  Leaf,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Heart,
  Check,
} from "lucide-react"
import { fetchProductById } from "../services/products"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { EmptyState } from "../components/common/EmptyState"
import type { Product } from "../types"

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQty, setSelectedQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useAuth()

  const loadProduct = async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const p = await fetchProductById(id)
      setProduct(p)
    } catch (err: any) {
      console.error("Product fetch failed:", err)
      setError(err.message || "Failed to load product details from store database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 animate-pulse h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-red-50 text-red-900 p-8 rounded-3xl border border-red-200">
          <h3 className="font-bold text-sm text-red-950 mb-1">Could Not Load Product</h3>
          <p className="text-xs text-red-700 mb-4">{error}</p>
          <button
            onClick={loadProduct}
            className="px-5 py-2 bg-red-700 text-white rounded-xl text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <EmptyState
          title="Product Not Found"
          description="We couldn't locate this grocery item in the active store catalogue."
          actionText="Browse Catalogue"
          actionLink="/shop"
        />
      </div>
    )
  }


  const finalPrice = product.discount_price || product.base_price
  const hasDiscount = product.discount_percent > 0 && product.discount_price < product.base_price
  const isWishlisted = isInWishlist(product.id)

  const handleAdd = () => {
    addToCart(product, selectedQty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to groceries</span>
      </button>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Visual Column */}
        <div className="bg-gray-50 p-8 flex flex-col justify-center items-center relative border-b md:border-b-0 md:border-r border-gray-100">
          <div className="w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden bg-white shadow-xs">
            <img
              src={imgError || !product.image_url ? fallbackImage : product.image_url}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {hasDiscount && (
              <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-md">
                {product.discount_percent}% Discount Applied
              </span>
            )}
            {product.is_deal && (
              <span className="bg-green-700 text-lime-200 text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Retailer Deal
              </span>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-bold text-green-700 uppercase tracking-wider text-[11px]">
                {product.category}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded font-bold text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{product.rating}</span>
                  {product.reviews_count ? (
                    <span className="text-gray-400 font-normal">
                      ({product.reviews_count} verified reviews)
                    </span>
                  ) : null}
                </div>
              )}

            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 font-sans leading-tight">
              {product.name}
            </h1>

            <p className="text-sm font-semibold text-gray-600">
              Pack Size: <strong className="text-gray-900">{product.unit || "1 unit"}</strong>
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-gray-100">
              <span className="text-3xl font-black text-gray-950 font-sans">
                ₹{finalPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    ₹{product.base_price}
                  </span>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    Save ₹{(product.base_price - finalPrice).toFixed(0)}
                  </span>
                </>
              )}
            </div>

            {/* Quality & Freshness bullets */}
            <div className="py-2 space-y-2.5 text-xs text-gray-700">
              {product.shelf_life_days && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-green-700 shrink-0" />
                  <span>Optimal consumption freshness window: <strong>{product.shelf_life_days} days</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-green-700 shrink-0" />
                <span>Inventory status: <strong>{product.stock} units</strong> available in local store</span>
              </div>
              {product.deal_reason && (
                <div className="flex items-center gap-2.5 text-orange-800 bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                  <Leaf className="w-4 h-4 shrink-0 text-orange-600" />
                  <span>Deal Reason: <strong>{product.deal_reason}</strong></span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
              {product.description ||
                "Naturally grown and harvested everyday from partner farms. Packed under strict hygienic conditions to preserve vital vitamins, natural sweetness, and crunch."}
            </p>
          </div>

          {/* Quantity selector & CTA */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Select Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-gray-900">
                  {selectedQty}
                </span>
                <button
                  onClick={() => setSelectedQty((q) => Math.min(product.stock, q + 1))}
                  className="p-2 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="flex-1 py-3.5 px-6 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-lime-300" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-lime-300" />
                    <span>Add {selectedQty} to Basket • ₹{(finalPrice * selectedQty).toFixed(2)}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                  isWishlisted
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-200 hover:bg-gray-50 text-gray-500"
                }`}
                title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
