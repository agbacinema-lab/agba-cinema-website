"use client";

import { useState, useEffect } from "react";
import PortfolioItemCard from "./PortfolioItemCard";
import { portfolioService } from "@/lib/services";
import { PortfolioItem as FirebasePortfolioItem } from "@/lib/types";
import portfolioStaticData from "@/data/portfolio.json";

export default function PortfolioGrid({ selectedCategory = "All" }: { selectedCategory?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portfolioService.getAllItems().then(data => {
      if (data.length === 0) {
        setItems(portfolioStaticData);
      } else {
        setItems(data);
      }
      setLoading(false);
    });
  }, []);

  const filteredItems = items.filter(item => 
    selectedCategory === "All" || item.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredItems.map((item, idx) => (
        item ? (
          <PortfolioItemCard key={item.id || idx} item={item} />
        ) : null
      ))}
    </div>
  );
}
