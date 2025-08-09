"use client"

import { useState } from "react"
import PortfolioItemCard from "./PortfolioItemCard"
import portfolio from "@/data/portfolio.json"

export default function PortfolioGrid() {
  const [filter, setFilter] = useState("All")

  const filteredPortfolio = filter === "All" ? portfolio : portfolio.filter((item) => item.category === filter)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredPortfolio.map((item) => (
        <PortfolioItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
