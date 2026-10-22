import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  ChevronRight,
  Percent,
  CheckCircle,
} from "lucide-react"
import { fetchProducts } from "../services/products"
import { fetchActiveDeals } from "../services/deals"
import { fetchPackages } from "../services/packages"
import { ProductCard } from "../components/products/ProductCard"
import { ProductModal } from "../components/products/ProductModal"
import { ProductGridSkeleton } from "../components/common/Skeleton"
import type { Product, GroceryPackage } from "../types"

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [deals, setDeals] = useState<Product[]>([])
  const [packages, setPackages] = useState<GroceryPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [prodRes, dealRes, pkgRes] = await Promise.all([
        fetchProducts(),
        fetchActiveDeals(),
        fetchPackages(),
      ])
      setFeaturedProducts(prodRes.items.slice(0, 8))
      setDeals(dealRes.items.slice(0, 4))
      setPackages(pkgRes.slice(0, 3))
    } catch (err: any) {
      console.error("Home data fetch failed:", err)
      setError(
        err.message ||
          "Could not connect to store backend. Please verify FastAPI backend and MongoDB status."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])


  const categories = [
    {
      name: "Fruits",
      slug: "Fruits",
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80",
      tag: "Fresh Harvest",
    },
    {
      name: "Vegetables",
      slug: "Vegetables",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80",
      tag: "Direct Farm",
    },
    {
      name: "Dairy & Eggs",
      slug: "Dairy",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80",
      tag: "Daily Fresh",
    },
    {
      name: "Bakery",
      slug: "Bakery",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
      tag: "Artisanal",
    },
    {
      name: "Rice & Grains",
      slug: "Rice, Dal & Grains",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80",
      tag: "Staples",
    },
    {
      name: "Cooking Oils",
      slug: "Cooking Essentials",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80",
      tag: "Cold Pressed",
    },
    {
      name: "Snacks",
      slug: "Snacks & Beverages",
      image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&q=80",
      tag: "Healthy Picks",
    },
  ]

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-950 via-green-900 to-green-950 text-white min-h-[420px] sm:min-h-[460px] flex items-center shadow-xl border border-green-800">
          {/* Background image overlay */}
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
            <img
              src="/images/hero-banner.jpg"
              alt="FreshSave AI groceries"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80"
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-950/80 to-transparent z-1" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl p-6 sm:p-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/20 border border-lime-400/40 text-lime-300 text-xs font-bold tracking-wide backdrop-blur-xs">
              <Leaf className="w-4 h-4 text-lime-400" />
              <span>Intelligent Grocery Commerce & Zero Food Waste</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans leading-tight">
                Fresh Groceries. <br />
                <span className="text-lime-400">Smarter Savings.</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-xl">
                Discover everyday kitchen essentials at great prices, find verified dynamic markdown deals, and help reduce avoidable food waste with every order.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="px-6 py-3.5 bg-lime-400 hover:bg-lime-300 text-green-950 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-lime-400/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Everyday Essentials</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/deals"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white rounded-xl font-semibold text-sm transition-all backdrop-blur-xs flex items-center gap-2 cursor-pointer"
              >
                <Percent className="w-4 h-4 text-lime-300" />
                <span>Explore Today's Deals</span>
              </Link>
            </div>

            {/* Micro value props */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs text-green-200">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-lime-400 shrink-0" />
                <span>60-90 Min Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Verified Freshness</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Up to 30% Off</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs text-gray-500">Farm fresh produce, staples, and daily essentials</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.slug)}`)}
              className="bg-white rounded-2xl p-3 border border-gray-100 hover:border-green-300 hover:shadow-md transition-all text-center group cursor-pointer flex flex-col items-center justify-between"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-gray-50 p-1 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 group-hover:text-green-800 transition-colors">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {cat.tag}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Error state if backend fails */}
      {error && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center max-w-xl mx-auto space-y-3">
            <h3 className="font-bold text-sm text-red-950">Store Connection Notice</h3>
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </section>
      )}

      {/* Today's Deals */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-lime-50 rounded-3xl p-6 sm:p-8 border border-green-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-700 text-lime-200 text-xs font-bold rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Retailer-Approved Dynamic Markdown</span>
              </div>
              <h2 className="text-2xl font-black text-gray-950 tracking-tight">
                Today's Smart Deals
              </h2>
              <p className="text-xs text-gray-600 max-w-xl mt-1">
                Verified high-quality groceries nearing their peak freshness window, marked down to prevent food waste.
              </p>
            </div>
            <Link
              to="/deals"
              className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <span>See All Active Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : deals.length === 0 ? (
            <div className="bg-white/80 rounded-2xl p-6 text-center border border-dashed border-green-300">
              <p className="text-xs font-semibold text-green-900">
                No active smart deals currently listed. All store produce is at standard inventory levels.
              </p>
              <Link to="/shop" className="text-xs text-green-700 font-bold underline mt-1 inline-block">
                Browse everyday groceries →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
      </section>

      {/* Featured Groceries */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Popular Groceries
            </h2>
            <p className="text-xs text-gray-500">Handpicked everyday favorites from local store inventory</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : featuredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 max-w-md mx-auto">
            <p className="text-xs text-gray-500 mb-3">No grocery products currently in catalogue.</p>
            <Link to="/shop" className="px-4 py-2 bg-green-700 text-white rounded-xl text-xs font-bold inline-block">
              Open Store Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p: Product) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Packages */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Bundled Savings
              </span>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
                Weekly & Monthly Grocery Packages
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Zero hassle family boxes with genuine bundle savings of up to 25%
              </p>
            </div>
            <Link
              to="/packages"
              className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1.5"
            >
              <span>View All Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={3} />
          ) : packages.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
              <p className="text-xs text-gray-500">
                Curated grocery packages are currently being prepared for the upcoming harvest cycle.
              </p>
              <Link to="/shop" className="text-xs text-green-700 font-bold underline mt-1 inline-block">
                Shop individual groceries in catalogue →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-gray-50/70 hover:bg-white rounded-2xl border border-gray-200/80 hover:border-green-300 p-5 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {pkg.badge}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {pkg.cadence}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-950 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    {pkg.subtitle}
                  </p>

                  <div className="space-y-1.5 mb-4 text-xs text-gray-600 border-t border-b border-gray-200/60 py-3">
                    {pkg.items.slice(0, 4).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="truncate">{it.name}</span>
                        <span className="font-semibold text-gray-800">{it.quantity}</span>
                      </div>
                    ))}
                    {pkg.items.length > 4 && (
                      <div className="text-[11px] text-green-700 font-semibold pt-1">
                        + {pkg.items.length - 4} more fresh items
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-gray-950">
                      ₹{pkg.package_price}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      ₹{pkg.regular_price}
                    </span>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      Save ₹{pkg.savings} ({pkg.savings_percent}%)
                    </span>
                  </div>

                  <Link
                    to="/packages"
                    className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Package Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>


      {/* Mission Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-900 to-emerald-950 text-white p-8 sm:p-12 border border-green-800 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 text-xs font-bold border border-lime-400/30">
                <Leaf className="w-4 h-4" />
                <span>Our Environmental Commitment</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight font-sans">
                Smart Savings. <br />
                <span className="text-lime-300">Less Food Waste.</span>
              </h2>
              <p className="text-sm text-green-100/90 leading-relaxed">
                In India, thousands of tonnes of farm-fresh produce are wasted daily due to inefficient markdown schedules. FreshSave AI bridges the gap by dynamically discounting surplus inventory before it expires, giving you wholesome groceries while keeping food out of landfills.
              </p>
              <div className="space-y-2 pt-2 text-xs text-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>Retailer-approved dynamic markdown algorithms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>100% certified quality inspection before packing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>Measurable food waste diverted reported on every invoice</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white/10 border border-white/20 shadow-2xl">
              <img
                src="/images/mission-banner.jpg"
                alt="Reducing food waste illustration"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
                }}
              />
            </div>
          </div>
        </div>
      </section>

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
