import React, { useState } from "react"
import {
  X,
  Plus,
  Minus,
  Star,
  Clock,
  ShieldCheck,
  Leaf,
  Sparkles,
  ShoppingBag,
  Check,
} from "lucide-react"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import type { Product } from "../../types"

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useAuth()
  const [selectedQty, setSelectedQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  if (!product) return null

  const finalPrice = product.discount_price || product.base_price
  const hasDiscount = product.discount_percent > 0 && product.discount_price < product.base_price
  const isWishlisted = isInWishlist(product.id)

  const handleAdd = () => {
    addToCart(product, selectedQty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80"

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col md:flex-row overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Visual Area */}
        <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col justify-center items-center relative border-b md:border-b-0 md:border-r border-gray-100">
          <div className="w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden bg-white shadow-xs">
            <img
              src={imgError || !product.image_url ? fallbackImage : product.image_url}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Deal & Discount badging */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {hasDiscount && (
              <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                {product.discount_percent}% Discount Applied
              </span>
            )}
            {product.is_deal && (
              <span className="bg-green-700 text-lime-200 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Retailer Deal
              </span>
            )}
          </div>
        </div>

        {/* Product Information Area */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span className="font-semibold text-green-700 uppercase tracking-wider text-[11px]">
                {product.category}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-bold text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{product.rating}</span>
                  {product.reviews_count ? (
                    <span className="text-gray-400 font-normal">({product.reviews_count})</span>
                  ) : null}
                </div>
              )}

            </div>

            <h2 className="text-xl font-bold text-gray-950 mb-1 leading-snug">
              {product.name}
            </h2>

            <p className="text-sm font-medium text-gray-500 mb-4">
              Pack Size: <strong className="text-gray-800">{product.unit || "1 unit"}</strong>
            </p>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-gray-100">
              <span className="text-2xl font-black text-gray-950">
                ₹{finalPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.base_price}
                  </span>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    Save ₹{(product.base_price - finalPrice).toFixed(0)}
                  </span>
                </>
              )}
            </div>

            {/* Shelf life & freshness note */}
            <div className="py-3 space-y-2 text-xs text-gray-600">
              {product.shelf_life_days && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-700 shrink-0" />
                  <span>Optimal consumption window: <strong>{product.shelf_life_days} days</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-700 shrink-0" />
                <span>Stock remaining: <strong>{product.stock} units</strong> available</span>
              </div>
              {product.deal_reason && (
                <div className="flex items-center gap-2 text-orange-700 bg-orange-50/70 p-2 rounded-lg">
                  <Leaf className="w-4 h-4 shrink-0 text-orange-600" />
                  <span>Deal Reason: <strong>{product.deal_reason}</strong></span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              {product.description ||
                "Sourced fresh every morning from verified local agricultural partners. Graded for freshness and packed carefully in protective packaging."}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-gray-900">
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

            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 py-3 px-4 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isWishlisted
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-200 hover:bg-gray-50 text-gray-500"
                }`}
                title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              >
                <Star className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
