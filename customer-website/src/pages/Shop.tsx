import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Filter,
  Search,
  X,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  PlusCircle,
  PackagePlus,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { fetchProducts, fetchCategories, createProduct } from "../services/products"
import { ProductCard } from "../components/products/ProductCard"
import { ProductModal } from "../components/products/ProductModal"
import { ProductGridSkeleton } from "../components/common/Skeleton"
import { EmptyState } from "../components/common/EmptyState"
import type { Product } from "../types"

const DEFAULT_CATEGORIES: string[] = [
  "All",
  "Produce",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Rice, Dal & Grains",
  "Cooking Essentials",
  "Snacks & Beverages",
]

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get("category") || "All"
  const initialSearch = searchParams.get("search") || ""

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [dealsOnly, setDealsOnly] = useState<boolean>(false)
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)
  const [maxPrice, setMaxPrice] = useState<number>(600)
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false)

  // Quick view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Retailer Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false)
  const [isSubmittingProduct, setIsSubmittingProduct] = useState<boolean>(false)
  const [addProductError, setAddProductError] = useState<string | null>(null)

  // Form inputs
  const [newProdName, setNewProdName] = useState("")
  const [newProdCategory, setNewProdCategory] = useState("Produce")
  const [newProdUnit, setNewProdUnit] = useState("1 kg")
  const [newProdBasePrice, setNewProdBasePrice] = useState("80")
  const [newProdShelfLife, setNewProdShelfLife] = useState("7")
  const [newProdStock, setNewProdStock] = useState("20")
  const [newProdDesc, setNewProdDesc] = useState("")
  const [newProdImg, setNewProdImg] = useState("")

  // Keep state synced with URL searchParams
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "All"
    const urlSearch = searchParams.get("search") || ""
    setSelectedCategory(urlCategory)
    setSearchQuery(urlSearch)
  }, [searchParams])

  // Fetch distinct categories from backend
  useEffect(() => {
    async function loadBackendCategories() {
      try {
        const backendCats = await fetchCategories()
        if (backendCats.length > 0) {
          const merged = Array.from(new Set(["All", ...backendCats, ...DEFAULT_CATEGORIES]))
          setCategories(merged)
        }
      } catch {
        // keep defaults
      }
    }
    loadBackendCategories()
  }, [])

  // Fetch products from backend
  const loadCatalogue = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchProducts({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: searchQuery || undefined,
      })
      setProducts(res.items || [])
    } catch (err: any) {
      setError(
        err.message ||
          "Could not connect to store backend. Please verify that the FastAPI backend and MongoDB are accessible."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalogue()
  }, [selectedCategory, searchQuery])

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProdName.trim() || !newProdBasePrice || Number(newProdBasePrice) <= 0) {
      setAddProductError("Please enter a valid product name and positive price.")
      return
    }

    try {
      setIsSubmittingProduct(true)
      setAddProductError(null)

      await createProduct({
        name: newProdName.trim(),
        category: newProdCategory.trim(),
        unit: newProdUnit.trim() || "1 unit",
        base_price: Number(newProdBasePrice),
        unit_cost: Number(newProdBasePrice) * 0.7,
        shelf_life_days: Number(newProdShelfLife) || 7,
        initial_stock: Number(newProdStock) || 0,
        description: newProdDesc.trim() || undefined,
        image_url: newProdImg.trim() || undefined,
      })

      // Reset form and reload catalogue
      setShowAddProductModal(false)
      setNewProdName("")
      setNewProdDesc("")
      setNewProdImg("")
      await loadCatalogue()
    } catch (err: any) {
      setAddProductError(err.message || "Failed to create product in database.")
    } finally {
      setIsSubmittingProduct(false)
    }
  }

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p: Product) => {
        if (dealsOnly && !p.is_deal) return false
        if (inStockOnly && p.stock <= 0) return false
        const currentPrice = p.discount_price || p.base_price
        if (currentPrice > maxPrice) return false
        return true
      })
      .sort((a: Product, b: Product) => {
        const priceA = a.discount_price || a.base_price
        const priceB = b.discount_price || b.base_price
        if (sortBy === "price_asc") return priceA - priceB
        if (sortBy === "price_desc") return priceB - priceA
        if (sortBy === "discount") return (b.discount_percent || 0) - (a.discount_percent || 0)
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0)
        return 0 // featured default
      })
  }, [products, dealsOnly, inStockOnly, maxPrice, sortBy])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    if (cat === "All") {
      searchParams.delete("category")
    } else {
      searchParams.set("category", cat)
    }
    setSearchParams(searchParams)
  }

  const handleClearFilters = () => {
    setSelectedCategory("All")
    setSearchQuery("")
    setSortBy("featured")
    setDealsOnly(false)
    setInStockOnly(false)
    setMaxPrice(600)
    setSearchParams({})
  }

  const hasActiveFilters =
    selectedCategory !== "All" ||
    searchQuery !== "" ||
    dealsOnly ||
    inStockOnly ||
    maxPrice < 600 ||
    sortBy !== "featured"

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Page Title, Retailer Action, & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Grocery Catalogue
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing <strong className="text-gray-800">{filteredProducts.length}</strong> fresh products available from MongoDB store inventory
          </p>
        </div>

        {/* Action buttons and sort */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product (Retailer)</span>
          </button>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-green-600" />
            )}
          </button>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-xs text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Fresh</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar & Mobile Drawer Filters */}
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden"
          } md:block bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-6 sticky top-28`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
              <Filter className="w-4 h-4 text-green-700" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-green-700 hover:text-green-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Search inside shop */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              Filter by Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              Categories
            </label>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-green-700 text-white font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && (
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <label className="text-xs font-semibold text-gray-700 block">
              Preferences
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={dealsOnly}
                onChange={(e) => setDealsOnly(e.target.checked)}
                className="rounded text-green-700 focus:ring-green-600"
              />
              <span className="flex items-center gap-1 font-medium text-orange-700">
                <Sparkles className="w-3 h-3 text-orange-600" />
                Verified Smart Deals Only
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-green-700 focus:ring-green-600"
              />
              <span>In-Stock Only</span>
            </label>
          </div>

          {/* Price Range Slider */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-gray-700">Max Price</span>
              <span className="font-bold text-green-800">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="30"
              max="600"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-green-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₹30</span>
              <span>₹600</span>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 text-xs">
              <span className="text-gray-400 font-medium">Applied:</span>
              {selectedCategory !== "All" && (
                <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-md flex items-center gap-1 text-gray-800">
                  {selectedCategory}
                  <button onClick={() => handleCategoryChange("All")}>
                    <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-md flex items-center gap-1 text-gray-800">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                  </button>
                </span>
              )}
              {dealsOnly && (
                <span className="bg-orange-50 border border-orange-200 text-orange-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  Deals Only
                  <button onClick={() => setDealsOnly(false)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {maxPrice < 600 && (
                <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-md flex items-center gap-1 text-gray-800">
                  Under ₹{maxPrice}
                  <button onClick={() => setMaxPrice(600)}>
                    <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <div className="bg-red-50 text-red-900 p-8 rounded-3xl border border-red-200 text-center max-w-lg mx-auto space-y-4 my-8">
              <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-red-950 mb-1">Database Connection Failed</h3>
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={loadCatalogue}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="Store Catalogue is Empty"
              description="No products have been added to the database yet. As an authorized store retailer, you can add new products and inventory batches directly."
              actionText="Add First Product"
              onActionClick={() => setShowAddProductModal(true)}
              icon={<PackagePlus className="w-8 h-8" />}
            />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No groceries matched your filters"
              description="Try adjusting your keyword, expanding your price range, or selecting 'All' categories."
              actionText="Reset Filters"
              onActionClick={handleClearFilters}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p: Product) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Retailer Add Product Modal */}
      {showAddProductModal && (
        <div
          onClick={() => setShowAddProductModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-green-700" />
                <h3 className="font-bold text-gray-950 text-base">
                  Authorized Retailer: Add Product
                </h3>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Saves product directly to MongoDB <code className="bg-gray-100 px-1 py-0.5 rounded text-green-800">products</code> and initializes an active inventory batch.
            </p>

            {addProductError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-200 text-xs">
                {addProductError}
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Cavendish Bananas"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Produce"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Unit Specification *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg / 500g"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={newProdBasePrice}
                    onChange={(e) => setNewProdBasePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Shelf Life (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProdShelfLife}
                    onChange={(e) => setNewProdShelfLife(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Freshness notes, farm origin, or pack details..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmittingProduct ? "Saving to MongoDB..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
