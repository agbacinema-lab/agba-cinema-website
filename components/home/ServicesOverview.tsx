"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Users, BarChart3, Clapperboard, Palette, GraduationCap, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const creativesServices = [
  {
    icon: GraduationCap,
    title: "Video Editing Mentorship",
    description: "1-on-1 coaching in Premiere Pro & After Effects. Go from beginner to job-ready in weeks.",
    href: "/academy",
    cta: "Apply Now",
  },
  {
    icon: Palette,
    title: "Motion Design Training",
    description: "Master motion graphics and visual effects used by Nigeria's top content creators and brands.",
    href: "/academy",
    cta: "Apply Now",
  },
  {
    icon: Clapperboard,
    title: "Go Pro Program",
    description: "Our flagship internship pathway — learn editing, work on real brand projects, get placed.",
    href: "/academy",
    cta: "Apply for Cohort",
    featured: true,
  },
]

const brandsServices = [
  {
    icon: Video,
    title: "Corporate Videos",
    description: "Professional corporate video production for brands, training materials, and marketing campaigns.",
    href: "/services",
    cta: "Get a Quote",
  },
  {
    icon: Users,
    title: "Live Event Production",
    description: "Full-service live streaming and event coverage for conferences, product launches, and summits.",
    href: "/services",
    cta: "Book Coverage",
  },
  {
    icon: BarChart3,
    title: "Content Strategy",
    description: "Data-driven content planning that drives audience growth and achieves your brand goals.",
    href: "/services",
    cta: "Start Strategy",
  },
]

function ServiceCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
  featured,
  index,
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
  cta: string
  featured?: boolean
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative rounded-2xl p-6 flex flex-col gap-4 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
        ${featured
          ? "bg-gradient-to-br from-gray-900 to-black text-white border-yellow-400/40 shadow-yellow-400/10 shadow-lg"
          : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
        }`}
    >
      {featured && (
        <span className="absolute -top-3 left-6 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
          ★ Most Popular
        </span>
      )}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${featured ? "bg-yellow-400/20" : "bg-gray-100"}`}>
        <Icon className={`h-6 w-6 ${featured ? "text-yellow-400" : "text-gray-700"}`} />
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold mb-2 ${featured ? "text-white" : "text-gray-900"}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${featured ? "text-gray-300" : "text-gray-500"}`}>{description}</p>
      </div>
      <Button
        variant={featured ? "default" : "outline"}
        asChild
        className={`w-full mt-2 font-semibold ${
          featured
            ? "bg-yellow-400 hover:bg-yellow-300 text-black border-0"
            : ""
        }`}
      >
        <a href={href}>
          {cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </motion.div>
  )
}

export default function ServicesOverview() {
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
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Whether you're a creative looking to level up or a brand that needs results — we have a path for you.
          </p>
        </motion.div>

        {/* For Creatives */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-0.5 w-8 bg-yellow-400" />
            <span className="text-yellow-600 font-bold text-sm uppercase tracking-widest">For Creatives</span>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creativesServices.map((service, index) => (
              <ServiceCard key={service.title} {...service} index={index} />
            ))}
          </div>
        </div>

        {/* For Brands */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-0.5 w-8 bg-gray-900" />
            <span className="text-gray-700 font-bold text-sm uppercase tracking-widest">For Brands</span>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brandsServices.map((service, index) => (
              <ServiceCard key={service.title} {...service} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
