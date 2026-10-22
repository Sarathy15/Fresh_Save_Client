import React, { useState } from "react"
import { Heart, Plus, Minus, Star, Sparkles, Clock, AlertCircle } from "lucide-react"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import type { Product } from "../../types"

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { items, addToCart, updateQuantity } = useCart()
  const { isInWishlist, toggleWishlist } = useAuth()
  const [imgError, setImgError] = useState(false)

  const cartItem = items.find((item) => item.product.id === product.id)
  const quantityInCart = cartItem ? cartItem.quantity : 0
  const isWishlisted = isInWishlist(product.id)

  const fallbackImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80"

  const finalPrice = product.discount_price || product.base_price
  const hasDiscount = product.discount_percent > 0 && product.discount_price < product.base_price
  const isOutOfStock = product.stock <= 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group relative p-3">
      {/* Top badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
        {hasDiscount && (
          <span className="bg-orange-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
            {product.discount_percent}% OFF
          </span>
        )}
        {product.is_deal && (
          <span className="bg-green-700 text-lime-200 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Smart Deal
          </span>
        )}
      </div>

      {/* Wishlist toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleWishlist(product.id)
        }}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all cursor-pointer ${
          isWishlisted
            ? "bg-red-50 text-red-500 shadow-sm"
            : "bg-white/80 backdrop-blur-xs text-gray-400 hover:text-red-500 hover:bg-white shadow-xs"
        }`}
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        aria-label="Wishlist toggle"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
      </button>

      {/* Product Image Area */}
      <div
        onClick={() => onQuickView && onQuickView(product)}
        className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer mb-3 relative"
      >
        <img
          src={imgError || !product.image_url ? fallbackImage : product.image_url}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Shelf life micro-tag */}
        {product.shelf_life_days && product.shelf_life_days <= 5 && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-lime-400" />
            <span>Optimal: {product.shelf_life_days} days</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-400 uppercase tracking-wider text-[10px]">
              {product.category}
            </span>
            {product.rating && (
              <span className="flex items-center gap-1 font-semibold text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {product.rating}
              </span>
            )}
          </div>

          <h3
            onClick={() => onQuickView && onQuickView(product)}
            className="text-sm font-semibold text-gray-900 group-hover:text-green-800 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[38px]"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 mt-1">{product.unit || "1 unit"}</p>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-3 pt-2.5 border-t border-gray-50">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-bold text-gray-950 font-sans">
              ₹{finalPrice}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.base_price}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          {product.stock <= 10 && product.stock > 0 && (
            <p className="text-[11px] text-orange-600 font-medium mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Only {product.stock} left in stock
            </p>
          )}

          {/* Add to Cart / Quantity controller */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold cursor-not-allowed text-center"
            >
              Out of Stock
            </button>
          ) : quantityInCart > 0 ? (
            <div className="w-full flex items-center justify-between bg-green-50 border border-green-600 rounded-xl px-2 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  updateQuantity(product.id, quantityInCart - 1)
                }}
                className="w-7 h-7 bg-white text-green-800 rounded-lg shadow-xs flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-green-900 px-2">
                {quantityInCart} in basket
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  updateQuantity(product.id, quantityInCart + 1)
                }}
                className="w-7 h-7 bg-green-700 text-white rounded-lg shadow-xs flex items-center justify-center hover:bg-green-800 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                addToCart(product, 1)
              }}
              className="w-full py-2 px-3 bg-white hover:bg-green-700 text-green-700 hover:text-white border border-green-600 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group-hover:bg-green-700 group-hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Basket</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
