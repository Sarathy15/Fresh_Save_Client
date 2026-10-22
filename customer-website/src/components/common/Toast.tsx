import React from "react"
import { CheckCircle2, X, ShoppingBag } from "lucide-react"
import { useCart } from "../../context/CartContext"

export const Toast: React.FC = () => {
  const { showToast, dismissToast, lastAddedProduct, openCart } = useCart()

  if (!showToast || !lastAddedProduct) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white rounded-xl shadow-2xl border border-green-100 p-4 animate-fade-in flex items-start gap-3">
      <div className="p-2 bg-green-50 rounded-lg text-green-700 shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-green-700 tracking-wide uppercase">
          Added to Basket
        </p>
        <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
          {lastAddedProduct.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          ₹{lastAddedProduct.discount_price || lastAddedProduct.base_price} • {lastAddedProduct.unit}
        </p>
        <button
          onClick={() => {
            dismissToast()
            openCart()
          }}
          className="mt-2 text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          View Basket & Checkout
        </button>
      </div>
      <button
        onClick={dismissToast}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
