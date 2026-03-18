"use client";

import { useState, useEffect } from "react";
import PortfolioItemCard from "./PortfolioItemCard";
import { portfolioService } from "@/lib/services";
import portfolioStaticData from "@/data/portfolio.json";
import { motion, AnimatePresence } from "framer-motion";

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <AnimatePresence mode="popLayout">
        {filteredItems.map((item, idx) => (
          item ? (
            <PortfolioItemCard key={item.id || idx} item={item} />
          ) : null
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
