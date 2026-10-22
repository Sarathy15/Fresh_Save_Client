import React from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Truck,
  Leaf,
} from "lucide-react"
import { useCart } from "../../context/CartContext"

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate()
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    savings,
    deliveryFee,
    finalTotal,
  } = useCart()

  if (!isCartOpen) return null

  const freeDeliveryThreshold = 499
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal)
  const deliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))

  const handleProceedToCheckout = () => {
    closeCart()
    navigate("/checkout")
  }

  return (
    <div
      onClick={closeCart}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-700" />
            <h2 className="font-bold text-gray-900 text-base">
              My Shopping Basket ({totalItems})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              onClick={closeCart}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Tracker */}
        {subtotal > 0 && (
          <div className="bg-green-50/80 p-3 border-b border-green-100 text-xs">
            {amountNeededForFreeDelivery > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-green-900">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5 text-green-700" />
                    Add ₹{amountNeededForFreeDelivery} more for <strong>FREE Delivery</strong>
                  </span>
                  <span className="font-bold">{deliveryProgress}%</span>
                </div>
                <div className="w-full bg-green-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-green-700 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${deliveryProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-900 font-bold">
                <Sparkles className="w-4 h-4 text-green-700" />
                <span>You've unlocked FREE Rapid Delivery on this order!</span>
              </div>
            )}
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">Your basket is empty</h3>
              <p className="text-xs text-gray-500 mb-6 max-w-xs">
                Explore farm fresh produce, bakery, and verified smart deals to fill your basket.
              </p>
              <Link
                to="/shop"
                onClick={closeCart}
                className="px-6 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const unitPrice =
                item.product.discount_price && item.product.discount_price > 0
                  ? item.product.discount_price
                  : item.product.base_price
              const itemTotal = (unitPrice * item.quantity).toFixed(2)

              return (
                <div key={item.product.id} className="py-3 flex items-center gap-3">
                  <img
                    src={
                      item.product.image_url ||
                      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=80"
                    }
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-gray-500">{item.product.unit}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-green-900">₹{unitPrice}</span>
                      {item.product.base_price > unitPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{item.product.base_price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900 block">
                      ₹{itemTotal}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors mt-0.5 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Bill Summary & Footer CTA */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
            {/* Environmental diverted badge */}
            <div className="bg-lime-50 text-green-900 p-2.5 rounded-xl border border-lime-200 flex items-center gap-2 text-xs">
              <Leaf className="w-4 h-4 text-green-700 shrink-0" />
              <span>
                This order diverts approx. <strong>{(items.length * 0.45).toFixed(1)} kg</strong> of harvest from landfill waste!
              </span>
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Item Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal}</span>
              </div>
              {savings > 0 && (
                <div className="flex items-center justify-between text-green-700 font-semibold">
                  <span>Verified Savings</span>
                  <span>-₹{savings}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Delivery Partner Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-700 font-bold uppercase text-[10px]">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm font-bold text-gray-950">
                <span>Total Amount</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-lime-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
