import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Video, Camera, Users, Briefcase, Heart, Mic, Edit, Palette } from "lucide-react"

const services = [
  {
    icon: Video,
    title: "Corporate Videos",
    description: "Professional corporate video production for brands, training, and marketing campaigns.",
    features: ["Brand storytelling", "Training videos", "Company profiles", "Product demos"],
    price: "From $2,500",
    href: "/booking/corporate-videos",
  },
  {
    icon: Heart,
    title: "Wedding Cinematography",
    description: "Cinematic wedding films that capture your special day with artistic flair.",
    features: ["Full day coverage", "Highlight reels", "Ceremony & reception", "Drone footage"],
    price: "From $3,500",
    href: "/booking/wedding-cinematography",
  },
  {
    icon: Users,
    title: "Event Coverage",
    description: "Complete event documentation with multiple camera angles and professional editing.",
    features: ["Multi-camera setup", "Live streaming", "Post-event editing", "Same-day highlights"],
    price: "From $1,800",
    href: "/booking/event-coverage",
  },
  {
    icon: Briefcase,
    title: "Commercial Production",
    description: "High-quality commercials and promotional videos for your business.",
    features: ["Script development", "Professional actors", "Location scouting", "Post-production"],
    price: "From $5,000",
    href: "/booking/commercial-production",
  },
  {
    icon: Camera,
    title: "Documentary Films",
    description: "Compelling documentary storytelling that engages and informs your audience.",
    features: ["Research & planning", "Interview setup", "B-roll footage", "Narrative editing"],
    price: "From $8,000",
    href: "/booking/documentary-films",
  },
  {
    icon: Mic,
    title: "Live Streaming",
    description: "Professional live streaming services for events, conferences, and broadcasts.",
    features: ["Multi-platform streaming", "Professional audio", "Graphics overlay", "Recording"],
    price: "From $1,200",
    href: "/booking/live-streaming",
  },
  {
    icon: Edit,
    title: "Post-Production",
    description: "Professional video editing, color grading, and post-production services.",
    features: ["Video editing", "Color correction", "Audio mixing", "Motion graphics"],
    price: "From $800",
    href: "/booking/post-production",
  },
  {
    icon: Palette,
    title: "Creative Consulting",
    description: "Strategic creative consulting to help bring your video vision to life.",
    features: ["Concept development", "Storyboarding", "Creative direction", "Project planning"],
    price: "From $500",
    href: "/booking/creative-consulting",
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Comprehensive video production services tailored to meet your unique needs and vision.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.title} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <service.icon className="h-12 w-12 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">{service.title}</CardTitle>
                      <p className="text-lg font-semibold text-primary">{service.price}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-6 text-base">{service.description}</CardDescription>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <Button asChild className="flex-1">
                      <Link href={service.href}>Book Now</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact">Learn More</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Let's discuss your vision and create something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Get Free Quote</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
            >
              <Link href="/portfolio">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
