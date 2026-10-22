import React from "react"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

interface EmptyStateProps {
  title: string
  description: string
  actionText?: string
  actionLink?: string
  onActionClick?: () => void
  icon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText = "Explore Catalogue",
  actionLink = "/shop",
  onActionClick,
  icon,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
      <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
        {icon || <ShoppingBag className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">{description}</p>
      {onActionClick ? (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors cursor-pointer"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
