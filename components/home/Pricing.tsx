"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const plans = [
  {
    name: "Storytelling",
    price: "₦50,000",
    description: "Master the art of visual storytelling — perfect for beginners entering the creative industry.",
    features: [
      "4-week intensive program",
      "Story structure & scriptwriting",
      "Basic video editing principles",
      "Peer review sessions",
      "Certificate of completion",
    ],
    href: "/academy",
    cta: "Enrol Now",
    highlighted: false,
  },
  {
    name: "Video Editing Mentorship",
    price: "₦70,000",
    description: "Industry-standard Premiere Pro & After Effects training with real project experience.",
    features: [
      "8-week structured program",
      "Premiere Pro + After Effects",
      "3 real brand projects",
      "1-on-1 mentor sessions",
      "Portfolio building",
      "Job-ready certification",
    ],
    href: "/academy",
    cta: "Apply Now",
    highlighted: true,
    badge: "Most Enrolled",
  },
  {
    name: "Motion Design",
    price: "₦150,000",
    description: "Advanced motion graphics & VFX for creatives ready to work with top brands and agencies.",
    features: [
      "12-week advanced program",
      "Motion graphics & VFX",
      "Brand identity in motion",
      "Agency-style workflows",
      "Internship placement support",
      "Lifetime community access",
    ],
    href: "/academy",
    cta: "Apply Now",
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section className="py-24 bg-white">
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
            No hidden fees. Choose the program that matches your creative goals and budget.
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
                  : "bg-gray-50 text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-lg"
                }`}
            >
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-4xl font-black ${plan.highlighted ? "text-yellow-400" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>/program</span>
                </div>
                <p className={`text-sm leading-relaxed ${plan.highlighted ? "text-gray-300" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-yellow-400" : "text-gray-500"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-gray-200" : "text-gray-600"}`}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                asChild
                className={`w-full font-bold transition-all duration-300 hover:scale-[1.02] ${
                  plan.highlighted
                    ? "bg-yellow-400 hover:bg-yellow-300 text-black border-0"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                }`}
              >
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 text-sm mt-10"
        >
          All prices in Nigerian Naira (₦). Payment plans available on request. 
          <Link href="/contact" className="text-gray-700 font-semibold ml-1 hover:underline">Contact us to discuss.</Link>
        </motion.p>
      </div>
    </section>
  )
}
