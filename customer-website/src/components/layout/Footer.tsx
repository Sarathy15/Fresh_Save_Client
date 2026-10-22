import React from "react"
import { Link } from "react-router-dom"
import { Leaf, ShieldCheck, Truck, RefreshCw, HeartHandshake } from "lucide-react"

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      {/* Value Proposition Strip */}
      <div className="border-b border-gray-800 py-8 bg-gray-950/60">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-green-900/60 text-lime-400 flex items-center justify-center shrink-0 border border-green-800/60">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Farm Fresh</h4>
              <p className="text-xs text-gray-400">Directly sourced daily from certified regional farms</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-green-900/60 text-lime-400 flex items-center justify-center shrink-0 border border-green-800/60">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Intelligent Markdown</h4>
              <p className="text-xs text-gray-400">Dynamic pricing saves surplus before it reaches expiry</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-green-900/60 text-lime-400 flex items-center justify-center shrink-0 border border-green-800/60">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">60-90 Min Delivery</h4>
              <p className="text-xs text-gray-400">Cold-chain insulated doorstep delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-green-900/60 text-lime-400 flex items-center justify-center shrink-0 border border-green-800/60">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Freshness Guarantee</h4>
              <p className="text-xs text-gray-400">No questions asked instant return or replacement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5 text-lime-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                FreshSave<span className="text-lime-400">.ai</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              "Discover fresh essentials, find intelligent grocery deals, and help reduce avoidable food waste."
            </p>
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-800">
              <span className="font-semibold text-lime-400 block mb-1">Live Hackathon Demonstration</span>
              <span>Integrated with FastAPI backend & simulated MongoDB catalog.</span>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Categories
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/shop?category=Fruits" className="hover:text-lime-400 transition-colors">
                  Fresh Fruits & Berries
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Vegetables" className="hover:text-lime-400 transition-colors">
                  Daily Greens & Vegetables
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Dairy" className="hover:text-lime-400 transition-colors">
                  Farm Dairy, Milk & Paneer
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Bakery" className="hover:text-lime-400 transition-colors">
                  Artisanal Sourdough & Bakery
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Rice%2C%20Dal%20%26%20Grains" className="hover:text-lime-400 transition-colors">
                  Aged Basmati & Desi Dals
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-lime-400 transition-colors">
                  Curated Grocery Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Customer Experience
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/orders" className="hover:text-lime-400 transition-colors">
                  Track Demo Orders
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-lime-400 transition-colors">
                  Retailer-Approved Deals
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-lime-400 transition-colors">
                  Customer Profile & Saved Addresses
                </Link>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">
                  Simulated Cash on Delivery & UPI
                </span>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">
                  Cold Storage Quality Standards
                </span>
              </li>
            </ul>
          </div>

          {/* Mission & Food Waste Note */}
          <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-2 text-lime-400 text-xs font-bold uppercase tracking-wider mb-2">
              <HeartHandshake className="w-4 h-4" />
              <span>Smart Waste Reduction</span>
            </div>
            <h5 className="text-sm font-bold text-white mb-2">
              Every purchase saves food
            </h5>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              FreshSave AI matches peak harvest surplus and optimal freshness items with real customer savings before food ever goes to waste.
            </p>
            <div className="bg-green-950/80 p-2.5 rounded-xl border border-green-800/80 text-[11px] text-lime-300">
              🌱 Over <strong>1,420 kg</strong> of fresh groceries diverted this month in pilot stores.
            </div>
          </div>
        </div>

        {/* Copyright strip */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FreshSave AI. Built with React, TypeScript, Tailwind CSS & FastAPI.</p>
          <p className="text-gray-400 font-medium">Fresh Groceries. Smarter Savings.</p>
        </div>
      </div>
    </footer>
  )
}
