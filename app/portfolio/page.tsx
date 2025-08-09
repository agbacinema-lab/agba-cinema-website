import PortfolioGrid from "@/components/portfolio/PortfolioGrid"
import PortfolioFilters from "@/components/portfolio/PortfolioFilters"

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Portfolio</h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Explore our collection of cinematic stories and professional video productions.
          </p>
        </div>
      </section>

      {/* Portfolio Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortfolioFilters />
          <PortfolioGrid />
        </div>
      </section>
    </div>
  )
}
