"use client"

import Image from "next/image"
import brands from "@/data/brands.json"

export default function TrustedLogosSlider() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Brands</h2>
          <p className="text-lg text-gray-600">We're proud to work with amazing companies and organizations</p>
        </div>

        <div className="overflow-hidden">
          <div className="flex space-x-16 animate-scroll">
            {[...brands, ...brands].map((brand, index) => (
              <div key={`${brand.id}-${index}`} className="flex-shrink-0 w-32 h-16 flex items-center justify-center">
                <Image
                  src={brand.logo || "/LIGHT.png"}
                  alt={brand.name}
                  width={128}
                  height={64}
                  className="max-w-full max-h-full object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </section>
  )
}
