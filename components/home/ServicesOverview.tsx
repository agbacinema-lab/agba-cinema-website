"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Users, BarChart3, Clapperboard, Palette, GraduationCap, ArrowRight, Zap } from "lucide-react"
import { motion } from "framer-motion"

const creativesServices = [
  {
    id: "01",
    icon: GraduationCap,
    title: "Video Editing Mentorship",
    description: "Architectural coaching in Premiere Pro & After Effects. Master the narrative engine.",
    href: "/academy",
    cta: "Initiate Training",
  },
  {
    id: "02",
    icon: Palette,
    title: "Motion Design Mastery",
    description: "Visual effects and high-end motion graphics for the next generation of creators.",
    href: "/academy",
    cta: "Start Mastery",
  },
  {
    id: "03",
    icon: Clapperboard,
    title: "Project GO PRO",
    description: "The elite internship pathway. Direct deployment to brand projects and placement.",
    href: "/academy",
    cta: "View Blueprint",
    featured: true,
  },
]

const brandsServices = [
  {
    id: "04",
    icon: Video,
    title: "Corporate Narratives",
    description: "Professional production for global brands. We turn communication into cinema.",
    href: "/services",
    cta: "Request Quote",
  },
  {
    id: "05",
    icon: Users,
    title: "Live Command",
    description: "Multicam coverage and high-fidelity live streaming for world-class summits.",
    href: "/services",
    cta: "Book Unit",
  },
  {
    id: "06",
    icon: BarChart3,
    title: "Visual Intelligence",
    description: "Strategic content planning designed to capture attention and drive growth.",
    href: "/services",
    cta: "Start Brief",
  },
]

function UnitCard({
  id,
  icon: Icon,
  title,
  description,
  href,
  cta,
  featured,
  index,
}: {
  id: string
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
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative group rounded-[2.5rem] p-10 flex flex-col gap-6 border transition-all duration-700
        ${featured
          ? "bg-black text-white border-yellow-400/30 shadow-[0_0_50px_rgba(250,204,21,0.1)]"
          : "bg-white text-black border-gray-100 hover:border-black shadow-sm"
        }`}
    >
      <div className="flex justify-between items-start">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 duration-500 ${featured ? "bg-yellow-400/10 text-yellow-400" : "bg-gray-50 text-black border border-gray-100"}`}>
          <Icon className="h-7 w-7" />
        </div>
        <span className={`text-4xl font-black italic tracking-tighter opacity-10 group-hover:opacity-30 transition-opacity ${featured ? "text-yellow-400" : "text-black"}`}>
          {id}
        </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none group-hover:text-yellow-600 transition-colors">
          {title}
        </h3>
        <p className={`text-sm font-medium leading-relaxed italic ${featured ? "text-gray-400" : "text-gray-500"}`}>
          {description}
        </p>
      </div>

      <div className="pt-6 mt-auto">
        <Link href={href}>
          <button className={`w-full h-14 flex items-center justify-between px-6 rounded-2xl font-black uppercase italic tracking-widest text-[10px] transition-all
            ${featured 
              ? "bg-yellow-400 text-black hover:bg-white" 
              : "bg-black text-white hover:bg-yellow-400 hover:text-black shadow-xl shadow-black/5"
            }`}>
            {cta}
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function ServicesOverview() {
  return (
    <section className="py-40 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32 items-end">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 space-y-6"
          >
             <h4 className="text-yellow-500 font-black uppercase tracking-[0.5em] text-[10px]">Strategic Deployment</h4>
             <h2 className="text-5xl md:text-8xl font-black text-black italic uppercase tracking-tighter leading-[0.85]">
               Operational <br /> <span className="text-gray-200">Units & Path</span>ways.
             </h2>
          </motion.div>
          <motion.div 
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="lg:col-span-4"
          >
             <p className="text-xl text-gray-500 italic font-medium leading-relaxed">
               Whether you are an architect of motion or a brand seeking narrative dominance, we have a unit ready for engagement.
             </p>
          </motion.div>
        </div>

        {/* For Creatives */}
        <div className="mb-24">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] italic">0.1 Creative Support</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {creativesServices.map((service, index) => (
              <UnitCard key={service.title} {...service} index={index} />
            ))}
          </div>
        </div>

        {/* For Brands */}
        <div>
          <div className="flex items-center gap-6 mb-12">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] italic">0.2 Brand Intelligence</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {brandsServices.map((service, index) => (
              <UnitCard key={service.title} {...service} index={index + 3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
