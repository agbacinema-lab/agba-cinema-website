"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Ticket } from "lucide-react"
import { motion } from "framer-motion"

const mentorshipClasses = [
  {
    name: "Storytelling & Writing",
    price: "₦100,000",
    tagline: "The foundation of every great film.",
    features: [
      "Visual storytelling fundamentals",
      "Professional script writing",
      "Creative direction & planning",
      "Narrative structure workshop",
      "Content Writing with AI"
    ],
    highlighted: false,
    href: "/academy?track=storytelling"
  },
  {
    name: "Video Editing Mentorship",
    price: "₦200,000",
    tagline: "Master the industry's most in-demand skill.",
    features: [
      "Premiere Pro",
      "Color Grading",
      "Sound Design & Mixing",
      "Live Brand Projects",
      "Creative Business Strategy"
    ],
    highlighted: true,
    badge: "Most Popular",
    href: "/academy?track=editing"
  },
  {
    name: "Motion Design & VFX",
    price: "₦300,000",
    tagline: "Advanced graphics for serious creators.",
    features: [
      "Advanced Motion Graphics",
      "3D Compositing & VFX",
      "Animated Brand Identities",
      "Live Brand Projects",
      "Creative Business Strategy"
    ],
    highlighted: false,
    href: "/academy?track=motion"
  },
  {
    name: "Full Creative Masterclass",
    price: "₦1,000,000",
    tagline: "The ultimate pathway to creative mastery.",
    features: [
      "Access to ALL mentorship tracks",
      "1-on-1 career coaching sessions",
      "Priority internship placement",
      "Executive networking events",
      "Lifetime VIP community access"
    ],
    highlighted: false,
    href: "/academy?track=full"
  }
]

export default function Pricing() {
  const [promoCode, setPromoCode] = useState("")

  return (
    <section id="pricing" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-400 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gray-900 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-yellow-600 text-sm font-bold uppercase tracking-widest block mb-3">Mentorship Programs</span>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter">Choose Your Track</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Professional training designed to take you from beginner to industry-ready specialist.
          </p>
        </motion.div>

        {/* Promo Code Global Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto mb-20"
        >
          <div className="bg-white p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 group">
            <div className="flex items-center">
              <div className="pl-6 pr-2">
                <Ticket className="h-6 w-6 text-yellow-500 group-focus-within:rotate-12 transition-transform" />
              </div>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="First Timer Promo Code?"
                className="w-full bg-transparent py-5 px-2 text-gray-900 focus:outline-none placeholder:text-gray-400 font-bold text-sm"
              />
              <div className="pr-2">
                <Button className="rounded-2xl bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest px-6 hover:bg-yellow-400 hover:text-black transition-all">
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {mentorshipClasses.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-[2.5rem] p-8 flex flex-col border transition-all duration-500 hover:-translate-y-3
                ${plan.highlighted
                  ? "bg-gray-900 text-white border-yellow-400/50 shadow-[0_40px_80px_-15px_rgba(250,204,21,0.2)] scale-[1.03] z-10"
                  : "bg-white text-gray-900 border-gray-100 hover:shadow-2xl hover:border-yellow-400/30"
                }`}
            >
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                  🔥 {plan.badge}
                </span>
              )}

              <div className="mb-8">
                <h3 className={`text-2xl font-black italic uppercase tracking-tighter mb-2 leading-none ${plan.highlighted ? "text-yellow-400" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs font-bold italic leading-relaxed ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                  {plan.tagline}
                </p>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl xl:text-4xl font-black tracking-tighter ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${plan.highlighted ? "text-gray-500" : "text-gray-400"}`}>
                  Full Program Enrollment
                </p>
              </div>

              <div className="flex-1 space-y-5 mb-12">
                <div className={`h-px w-12 ${plan.highlighted ? "bg-yellow-400/30" : "bg-gray-200"}`} />
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className={`rounded-full p-1 mt-0.5 ${plan.highlighted ? "bg-yellow-400/10" : "bg-gray-100"}`}>
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? "text-yellow-400" : "text-yellow-600"}`} />
                      </div>
                      <span className={`text-sm font-semibold leading-tight ${plan.highlighted ? "text-gray-300" : "text-gray-600"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                asChild
                size="lg"
                className={`w-full font-black uppercase tracking-widest text-[10px] h-16 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${plan.highlighted
                  ? "bg-yellow-400 hover:bg-white text-black shadow-xl shadow-yellow-400/20"
                  : "bg-black hover:bg-yellow-400 text-white hover:text-black shadow-xl shadow-black/5"
                  }`}
              >
                <a href={plan.href}>
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center space-y-6"
        >
          <p className="text-gray-400 text-sm font-medium">
            Not sure which track to choose? <a href="/contact" className="text-gray-900 font-black border-b-2 border-yellow-400 hover:text-yellow-600 transition-colors">Speak with a Mentor</a>
          </p>
          <div className="flex items-center justify-center gap-8 opacity-30 grayscale contrast-200">
            {/* Payment Logos or Trust Badges could go here */}
            <span className="font-black italic tracking-tighter text-xl text-gray-400">PAYSTACK SECURED</span>
            <span className="font-black italic tracking-tighter text-xl text-gray-400">LIFETIME ACCESS</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
