import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Package,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Leaf,
} from "lucide-react"
import { fetchOrders } from "../services/orders"
import { EmptyState } from "../components/common/EmptyState"
import type { Order, OrderItem } from "../types"

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchOrders()
      setOrders(data || [])
    } catch (err: any) {
      console.error("Orders load failed:", err)
      setError(
        err.message ||
          "Could not retrieve orders from store database. Please check backend connection."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track verified customer orders and live delivery status from store database
          </p>
        </div>
        <Link
          to="/shop"
          className="text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
        >
          Shop More Groceries →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse h-40" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-900 p-8 rounded-3xl border border-red-200 text-center max-w-lg mx-auto space-y-3">
          <h3 className="font-bold text-sm text-red-950">Order History Error</h3>
          <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          <button
            onClick={loadOrders}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Retry Loading Orders
          </button>
        </div>
      ) : orders.length === 0 ? (

        <EmptyState
          title="No orders placed yet"
          description="Your order history will appear here once you place your first grocery order."
          actionText="Start Shopping"
          actionLink="/shop"
          icon={<Package className="w-10 h-10" />}
        />
      ) : (
        <div className="space-y-6">
          {orders.map((ord: Order) => {
            const formattedDate = new Date(ord.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <div
                key={ord.order_id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-gray-50/80 p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                      #{ord.order_id}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {ord.order_status}
                    </span>
                    <span className="font-bold text-gray-950 text-sm">
                      Total: ₹{ord.final_total}
                    </span>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="p-5 border-b border-gray-100 bg-emerald-50/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block mb-0.5">Delivered to:</span>
                      <span className="font-medium text-gray-800">
                        {ord.customer_name} • {ord.delivery_address}, {ord.delivery_city} ({ord.delivery_pincode})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 block mb-0.5">Delivery Slot:</span>
                      <span className="font-medium text-gray-800">
                        {ord.delivery_slot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="p-5 divide-y divide-gray-100">
                  <div className="space-y-3 pb-3">
                    {ord.items.map((it: OrderItem, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              it.image_url ||
                              "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=80"
                            }
                            alt={it.name}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{it.name}</h4>
                            <p className="text-gray-500 text-[11px]">{it.unit}</p>
                            <span className="text-gray-600 font-medium">
                              Qty: {it.quantity} × ₹{it.unit_price}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">
                            ₹{it.total_price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Environmental Metric */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2 bg-lime-50 text-green-900 px-3 py-1.5 rounded-xl border border-lime-200">
                      <Leaf className="w-4 h-4 text-green-700 shrink-0" />
                      <span>
                        Diverted <strong>{ord.food_waste_diverted_kg} kg</strong> of farm produce from municipal waste
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {ord.savings > 0 && (
                        <span className="text-green-700 font-bold">
                          Saved: ₹{ord.savings}
                        </span>
                      )}
                      <span className="text-gray-500">
                        Payment: <strong>{ord.payment_method}</strong> ({ord.payment_status})
                      </span>
                    </div>
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
