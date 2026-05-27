"use client";

import { useState, useEffect } from "react";
import PortfolioItemCard from "./PortfolioItemCard";
import { portfolioService } from "@/lib/services";
import portfolioStaticData from "@/data/portfolio.json";
import { motion, AnimatePresence } from "framer-motion";

export default function PortfolioGrid({ selectedCategory = "All", section }: { selectedCategory?: string; section?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await portfolioService.getAllItems();
        if (data.length === 0) {
          setItems(portfolioStaticData);
        } else {
          setItems(data);
        }
      } catch (error) {
        console.error("Portfolio load failed, falling back to static data:", error);
        setItems(portfolioStaticData);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    if (!item) return false;

    const normalize = (str: string) => {
      let val = (str || '').toString().toLowerCase().trim();
      if (val.endsWith('s')) {
        val = val.slice(0, -1);
      }
      return val;
    };

    const normalizedSelectedCategory = normalize(selectedCategory);
    const normalizedSelectedSection = section ? normalize(section) : null;
    const itemSection = normalize(item.portfolioSection || item.section || '');
    const itemCategory = normalize(item.category || '');
    const videoSource = item.youtubeEmbedUrl || item.videoUrl || item.video || item.embedUrl || item.youtubeUrl;

    // If a section is specified, ONLY show items with matching portfolioSection
    if (normalizedSelectedSection && itemSection !== normalizedSelectedSection) {
      return false;
    }

    if (normalizedSelectedCategory === "all") {
      return true;
    }

    if (normalizedSelectedCategory === "video") {
      return Boolean(videoSource);
    }

    return itemCategory === normalizedSelectedCategory || itemSection === normalizedSelectedCategory;
  });

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
