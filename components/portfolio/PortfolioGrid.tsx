"use client";

import { useState } from "react";
import PortfolioItemCard from "./PortfolioItemCard";
import portfolio from "@/data/portfolio.json"; // ✅ point this at your actual data

export default function PortfolioGrid() {
  const [items] = useState(
    Array.isArray(portfolio) ? portfolio.slice(0, 12) : []
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, idx) => (
        item ? (
          <PortfolioItemCard key={`${item.id}-${idx}`} item={item} />

        ) : null
      ))}
    </div>
  );
}
