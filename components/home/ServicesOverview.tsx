"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Camera, Users, Briefcase, Heart, Mic } from "lucide-react"
import { motion } from "framer-motion"

const services = [
  {
    icon: Video,
    title: "Corporate Videos",
    description: "Professional corporate video production for brands, training, and marketing.",
    href: "/services",
  },
  {
    icon: Heart,
    title: "Wedding Cinematography",
    description: "Cinematic wedding films that capture your special day beautifully.",
    href: "/services",
  },
  {
    icon: Users,
    title: "Event Coverage",
    description: "Complete event documentation with multiple camera angles and professional editing.",
    href: "/services",
  },
  {
    icon: Briefcase,
    title: "Commercial Production",
    description: "High-quality commercials and promotional videos for your business.",
    href: "/services",
  },
  {
    icon: Camera,
    title: "Documentary Films",
    description: "Compelling documentary storytelling that engages and informs your audience.",
    href: "/services",
  },
  {
    icon: Mic,
    title: "Live Streaming",
    description: "Professional live streaming services for events, conferences, and broadcasts.",
    href: "/services",
  },
]

export default function ServicesOverview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From concept to completion, we offer comprehensive video production services tailored to meet your unique
            needs and vision.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <service.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">{service.description}</CardDescription>
                  <Button variant="outline" asChild>
                    <Link href={service.href}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" asChild>
            <Link href="/services">View All Services</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
