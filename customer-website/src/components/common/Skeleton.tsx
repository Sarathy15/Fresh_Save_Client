import React from "react"

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs animate-pulse flex flex-col justify-between">
      <div>
        <div className="w-full h-44 bg-gray-200 rounded-xl mb-3" />
        <div className="h-4 bg-gray-200 rounded-sm w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded-sm w-1/2 mb-3" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-gray-200 rounded-sm w-20" />
          <div className="h-4 bg-gray-200 rounded-sm w-12" />
        </div>
        <div className="h-9 bg-gray-200 rounded-xl w-full" />
      </div>
    </div>
  )
}

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  )
}
