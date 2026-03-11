"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const plans = [
  {
    name: "Storytelling",
    price: "₦50,000",
    tagline: "Perfect for absolute beginners",
    values: [
      { item: "Video storytelling fundamentals", value: "₦25,000" },
      { item: "Script writing workshop", value: "₦15,000" },
      { item: "Basic editing principles", value: "₦20,000" },
      { item: "Peer critique sessions", value: "₦10,000" },
      { item: "Certificate of completion", value: "₦5,000" },
    ],
    total: "₦75,000",
    href: "/academy",
    cta: "Enrol Now",
    highlighted: false,
    badge: null,
  },
  {
    name: "Video Editing Mentorship",
    price: "₦70,000",
    tagline: "Most popular — 8-week full program",
    values: [
      { item: "Premiere Pro training", value: "₦40,000" },
      { item: "After Effects training", value: "₦40,000" },
      { item: "Live brand project", value: "₦50,000" },
      { item: "Portfolio development", value: "₦30,000" },
      { item: "1-on-1 mentoring (8 sessions)", value: "₦80,000" },
      { item: "Internship placement support", value: "₦100,000" },
    ],
    total: "₦340,000",
    href: "/academy",
    cta: "Apply Now",
    highlighted: true,
    badge: "Best Value",
  },
  {
    name: "Motion Design",
    price: "₦150,000",
    tagline: "Advanced — for serious creatives",
    values: [
      { item: "Advanced motion graphics", value: "₦80,000" },
      { item: "VFX & compositing", value: "₦60,000" },
      { item: "Brand identity in motion", value: "₦50,000" },
      { item: "Agency-style project workflow", value: "₦50,000" },
      { item: "Internship placement support", value: "₦100,000" },
      { item: "Lifetime community access", value: "₦30,000" },
    ],
    total: "₦370,000",
    href: "/academy",
    cta: "Apply Now",
    highlighted: false,
    badge: null,
  },
]

export default function Pricing() {
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
          <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-3">Mentorship Programs</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            No hidden fees. See exactly what you're getting — and what it's really worth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl p-8 flex flex-col border transition-all duration-300 hover:-translate-y-1
                ${plan.highlighted
                  ? "bg-gradient-to-br from-gray-900 to-black text-white border-yellow-400/50 shadow-2xl shadow-yellow-400/10 scale-[1.03]"
                  : "bg-white text-gray-900 border-gray-200 hover:shadow-lg"
                }`}
            >
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap">
                  ⭐ {plan.badge}
                </span>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>{plan.tagline}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${plan.highlighted ? "text-yellow-400" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>/program</span>
                </div>
              </div>

              {/* Value stack */}
              <div className={`rounded-xl p-4 mb-6 ${plan.highlighted ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100"}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                  What's Included
                </p>
                <ul className="space-y-2.5">
                  {plan.values.map(v => (
                    <li key={v.item} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? "text-yellow-400" : "text-gray-400"}`} />
                        <span className={`text-xs ${plan.highlighted ? "text-gray-300" : "text-gray-600"}`}>{v.item}</span>
                      </span>
                      <span className={`text-xs font-bold flex-shrink-0 ${plan.highlighted ? "text-gray-400 line-through" : "text-gray-400 line-through"}`}>{v.value}</span>
                    </li>
                  ))}
                </ul>

                {/* Total value */}
                <div className={`mt-4 pt-3 border-t flex items-center justify-between ${plan.highlighted ? "border-white/10" : "border-gray-200"}`}>
                  <span className={`text-xs font-bold ${plan.highlighted ? "text-gray-300" : "text-gray-600"}`}>Total value:</span>
                  <span className={`text-sm font-black line-through ${plan.highlighted ? "text-gray-400" : "text-gray-400"}`}>{plan.total}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs font-bold ${plan.highlighted ? "text-yellow-400" : "text-yellow-600"}`}>Your investment:</span>
                  <span className={`text-lg font-black ${plan.highlighted ? "text-yellow-400" : "text-gray-900"}`}>{plan.price}</span>
                </div>
              </div>

              <Button
                size="lg"
                asChild
                className={`w-full font-bold mt-auto transition-all duration-300 hover:scale-[1.02] py-6 rounded-xl ${
                  plan.highlighted
                    ? "bg-yellow-400 hover:bg-yellow-300 text-black border-0"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                }`}
              >
                <a href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 text-sm mt-10"
        >
          All prices in Nigerian Naira (₦). Payment plans available.{" "}
          <a href="/contact" className="text-gray-700 font-semibold hover:underline">Contact us to discuss.</a>
        </motion.p>
      </div>
    </section>
  )
}
