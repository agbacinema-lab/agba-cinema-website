"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, TrendingUp, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

// Updated testimonials with results-based quotes
const testimonials = [
  {
    id: 1,
    name: "Olumide Shode",
    position: "CEO",
    company: "Alarrt",
    content: "The commercial they produced for us increased our engagement by 300%. Outstanding creative vision and execution.",
    rating: 5,
    result: "+300% Engagement",
    category: "brand",
  },
  {
    id: 2,
    name: "Divinegift Soeatan",
    position: "CEO",
    company: "Importa Pay",
    content: "Our product launch video was absolutely stunning. The final product increased our conversion rate significantly — best investment we made that quarter.",
    rating: 5,
    result: "↑ Conversion Rate",
    category: "brand",
  },
  {
    id: 3,
    name: "KOLAWOLE ELIJAH",
    position: "CEO",
    company: "Shuriken Labs",
    content: "ÀGBÀ CINEMA delivered exceptional quality for our corporate video. Professional, creative, and exceeded our expectations.",
    rating: 5,
    result: "Corporate Excellence",
    category: "brand",
  },
  {
    id: 4,
    name: "Oriowo Victoria",
    position: "Event Coordinator",
    company: "Eventify",
    content: "Professional, reliable, and incredibly talented. ÀGBÀ CINEMA has become our go-to live event production partner. Every event looks 10x better.",
    rating: 5,
    result: "Repeat Client",
    category: "brand",
  },
  {
    id: 5,
    name: "Creative Student",
    position: "Go Pro Program Graduate",
    company: "Now working at a Lagos Agency",
    content: "I went from knowing nothing about Premiere Pro to landing a full-time editing role at a Lagos agency within 3 months of the Go Pro Program. Life-changing.",
    rating: 5,
    result: "Landed Agency Job",
    category: "student",
  },
  {
    id: 6,
    name: "Gbenga Rotowale",
    position: "Operations Manager",
    company: "RETOBAR",
    content: "You are really the ÀGBÀ CINEMA they say you are. The team was efficient, and the final video was of the highest quality. Highly recommend!",
    rating: 5,
    result: "Highest Quality",
    category: "brand",
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-3">Social Proof</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Real Results, Real Clients</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Don't just take our word for it — see what brands and creatives say after working with ÀGBÀ CINEMA.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-100">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Result badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-full">
                      {t.result}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < t.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-600 italic leading-relaxed flex-1 mb-6">"{t.content}"</p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.position}, {t.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" asChild className="font-semibold px-8">
            <a href="/contact">
              Start Your Success Story
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
