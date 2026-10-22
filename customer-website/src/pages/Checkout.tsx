import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
  Leaf,
  ShoppingBag,
} from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { submitOrder } from "../services/orders"
import type { Order, CartItem } from "../types"

export const Checkout: React.FC = () => {
  const { items, subtotal, savings, deliveryFee, finalTotal, clearCart } = useCart()
  const { user } = useAuth()

  // Form State
  const [name, setName] = useState(user?.name || "Aarav Sharma")
  const [email, setEmail] = useState(user?.email || "aarav.sharma@example.in")
  const [phone, setPhone] = useState(user?.phone || "9876543210")
  const [address, setAddress] = useState(
    user?.address || "Flat 402, Green Glen Layout, Bellandur"
  )
  const [city, setCity] = useState(user?.city || "Bengaluru")
  const [pincode, setPincode] = useState(user?.pincode || "560103")
  const [deliverySlot, setDeliverySlot] = useState("Today Rapid (60-90 Mins)")
  const [paymentMethod, setPaymentMethod] = useState("Simulated UPI")

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Empty cart redirect
  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No items to checkout</h2>
        <p className="text-xs text-gray-500 mb-6">
          Your basket is empty. Please add items before checking out.
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-green-700 text-white rounded-xl text-xs font-bold hover:bg-green-800 transition-colors inline-block"
        >
          Explore Catalogue
        </Link>
      </div>
    )
  }

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      setErrorMsg("Please fill in all mandatory delivery address fields.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)

      const payload = {
        customer_name: name.trim(),
        customer_email: email.trim() || undefined,
        customer_phone: phone.trim(),
        delivery_address: address.trim(),
        delivery_city: city.trim(),
        delivery_pincode: pincode.trim(),
        delivery_slot: deliverySlot,
        payment_method: paymentMethod,
        items: items.map((it: CartItem) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
      }

      const orderResponse = await submitOrder(payload)
      setConfirmedOrder(orderResponse)
      clearCart()
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Could not place order. Please check item stock or server status and try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render Order Confirmation screen
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-green-200 p-8 shadow-xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
              Order Confirmed & Sent to Store
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 pt-2 font-sans">
              Thank You, {confirmedOrder.customer_name}!
            </h1>
            <p className="text-xs text-gray-500">
              Your order ID is{" "}
              <strong className="text-green-800 font-mono text-sm">
                #{confirmedOrder.order_id}
              </strong>
            </p>
          </div>

          {/* Environmental Impact Callout */}
          <div className="bg-lime-50 rounded-2xl p-4 border border-lime-200 text-left flex items-center gap-3">
            <div className="p-2.5 bg-lime-100 text-green-800 rounded-xl">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-green-950">
                You Diverted {confirmedOrder.food_waste_diverted_kg} kg of Farm Food Waste!
              </h4>
              <p className="text-[11px] text-green-800 leading-snug">
                By purchasing verified retailer deals and farm-direct groceries, you saved food from municipal landfills.
              </p>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left text-xs space-y-3">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200">
              <div>
                <span className="text-gray-400 block mb-0.5">Delivery Address:</span>
                <span className="font-semibold text-gray-800">
                  {confirmedOrder.delivery_address}, {confirmedOrder.delivery_city} - {confirmedOrder.delivery_pincode}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Delivery Window:</span>
                <span className="font-semibold text-gray-800">
                  {confirmedOrder.delivery_slot}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div>
                <span className="text-gray-400 block mb-0.5">Payment Method:</span>
                <span className="font-bold text-gray-800">{confirmedOrder.payment_method}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Status:</span>
                <span className="font-bold text-green-700">{confirmedOrder.payment_status}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Total Paid:</span>
                <span className="font-black text-gray-950 text-sm">₹{confirmedOrder.final_total}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              to="/orders"
              className="flex-1 py-3 px-4 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>Track in My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop"
              className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">
          Checkout & Order Confirmation
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Simulated demo checkout • Authoritative server-side stock and pricing validation
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Customer & Delivery Address */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-950 border-b border-gray-100 pb-3">
              <MapPin className="w-4 h-4 text-green-700" />
              <span>1. Customer & Delivery Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Complete Street Address / Apartment *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Pin Code *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Slot */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-950 border-b border-gray-100 pb-3">
              <Clock className="w-4 h-4 text-green-700" />
              <span>2. Delivery Slot</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { slot: "Today Rapid (60-90 Mins)", tag: "Instant" },
                { slot: "Today Evening (5 PM - 8 PM)", tag: "Scheduled" },
                { slot: "Tomorrow Morning (7 AM - 10 AM)", tag: "Breakfast" },
              ].map((s) => (
                <label
                  key={s.slot}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                    deliverySlot === s.slot
                      ? "border-green-600 bg-green-50/60 text-green-950 font-semibold"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">
                      {s.tag}
                    </span>
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={deliverySlot === s.slot}
                      onChange={() => setDeliverySlot(s.slot)}
                      className="accent-green-700"
                    />
                  </div>
                  <span>{s.slot}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Simulated Demo Payment */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-950 border-b border-gray-100 pb-3">
              <CreditCard className="w-4 h-4 text-green-700" />
              <span>3. Demo Payment Simulation</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
              <strong>Simulated Payment Notice:</strong> For this live hackathon demonstration, real payment gateways are disabled. No card details or sensitive information are ever collected.
            </div>

            <div className="space-y-2">
              {[
                {
                  method: "Simulated UPI",
                  desc: "GooglePay, PhonePe, Paytm simulation (Instant confirmation)",
                },
                {
                  method: "Cash on Delivery (COD)",
                  desc: "Pay in cash or UPI QR code on arrival",
                },
                {
                  method: "Demo NetBanking Simulation",
                  desc: "Simulated bank authorization",
                },
              ].map((p) => (
                <label
                  key={p.method}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === p.method
                      ? "border-green-600 bg-green-50 text-green-950 font-semibold"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div>
                    <span className="block font-bold">{p.method}</span>
                    <span className="text-[11px] text-gray-500 font-normal">
                      {p.desc}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === p.method}
                    onChange={() => setPaymentMethod(p.method)}
                    className="accent-green-700"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4 sticky top-28">
            <h3 className="font-bold text-base text-gray-950 border-b border-gray-100 pb-3">
              Basket Summary ({items.length} items)
            </h3>

            {/* Quick item thumbnails */}
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 space-y-2">
              {items.map((it: CartItem) => {
                const price = it.product.discount_price || it.product.base_price
                return (
                  <div key={it.product.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="font-bold text-green-800">{it.quantity}x</span>
                      <span className="truncate text-gray-800">{it.product.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 shrink-0">
                      ₹{(price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Bill details */}
            <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Markdown Savings</span>
                  <span>-₹{savings}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-700 font-bold uppercase text-[10px]">
                      FREE
                    </span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-black text-gray-950">
                <span>Total Due</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Submit Button with Duplicate Submission Protection */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 bg-green-700 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-green-800 cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validating & Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Demo Order • ₹{finalTotal}</span>
                  <ArrowRight className="w-4 h-4 text-lime-300" />
                </>
              )}
            </button>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
              <span>Safe demo submission via FastAPI endpoint</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
