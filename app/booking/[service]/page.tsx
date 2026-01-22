import BookingForm from "@/components/services/BookingForm"
import PaymentForm from "@/components/services/PaymentForm"
import CalendarRedirectButton from "@/components/services/CalendarRedirectButton"
import ServiceBookingClient from "@/components/services/ServiceBookingClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"


const serviceDetails = {
  "corporate-videos": {
    title: "Corporate Videos",
    description: "Professional corporate video production for brands, training, and marketing campaigns.",
    price: "From #100,000",
    duration: "2-4 weeks",
    deliverables: ["Raw footage", "Edited video", "Color correction", "Audio mixing"],
    category: "service",
  },
  "Script-Writing": {
    title: "Script Writing",
    description: "Cinematic wedding films that capture your special day with artistic flair.",
    price: "From #50,000",
    duration: "6-8 weeks",
    deliverables: ["Concept development", "Story structure", "Dialogue writing", "Tone alignment"],
    category: "academy",
  },
  "live-event": {
    title: "Live Event Coverage",
    description: "Professional live streaming services for events, conferences, and broadcasts",
    price: "From #100,000",
    duration: "1-3 weeks",
    deliverables: ["Multi-camera footage", "Event highlights", "Live streaming", "Same-day clips"],
    category: "service",
  },
  "content-startegist": {
    title: "Content Stragist",
    description: "Strategic content planning to engage audiences and achieve your brand goals.",
    price: "From #5,000",
    duration: "Varies",
    deliverables: ["Audience research", "Content planning", "SEO optimization", "Performance tracking"],
    category: "service",
  },
  "video-editing": {
    title: "Premiere Pro Training",
    description: "Professional Premiere Pro training for video editing, storytelling, and content creation.",
    price: "From #70,000",
    duration: "8-12 weeks",
    deliverables: ["Editing workflow", "Color grading basics", "Audio sync & mixing", "Exporting best practices"],
    category: "academy",
  },
  "aftereffect": {
    title: "After Effect Training",
    description: "Professional After Effects training for animation, motion graphics, and video effects.",
    price: "From #100",
    duration: "4-6 weeks",
    deliverables: ["Motion graphics", "Visual effects", "Animation", "Compositing"],
    category: "academy",
  },
  "post-production": {
    title: "Post-Production",
    description: "Professional video editing, color grading, and post-production services.",
    price: "From #200,000",
    duration: "1-2 weeks",
    deliverables: ["Video editing", "Color correction", "Audio mixing", "Motion graphics"],
    category: "service",
  },
  "creative-consulting": {
    title: "Creative Consulting",
    description: "Creative consulting that helps you shape ideas into impactful visuals.",
    price: "#50,000 per hour",
    duration: "Varies",
    deliverables: ["Concept development", "Storyboarding", "Creative direction", "Project planning"],
    category: "service",
  },
  "Gopro-Video-Editing": {
    title: "Gopro-Video-Editing",
    description: "Gopro provide the best training for intending creative professionals.",
    price: "Free with refundable commitment fee of #20,000",
    duration: "7 months",
    deliverables: ["Internship opportunity", "Storytelling", "Color correction", "Audio syncing"],
    category: "gopro",
  },
  "Gopro-Aftereffect": {
    title: "Gopro Aftereffect",
    description: "Gopro provide the best training for intending creatives for free.",
    price: "Free with refundable commitment fee of #20,000",
    duration: "7 months",
    deliverables: ["Motion graphics", "Visual effects", "Animation", "Compositing", "Job internship"],
    category: "gopro",
  },
  "GoPro-Video-Editing-After-Effect": {
    title: "Go Pro Video Editing & After Effect",
    description: "Gopro provide the best training for intending creatives for free.",
    price: "Free with refundable commitment fee of #30,000",
    duration: "7 months",
    deliverables: ["Video Editing", "After Effect", "Creative direction", "Intenship placement"],
    category: "gopro",
  },
  "cinema-conference-2024": {
    title: "Creativity and Legal Crises 2026",
    description: "Join industry leaders for a day of networking, workshops, and screenings.",
    price: "#15,000",
    duration: "1 Day",
    deliverables: ["Keynote speakers", "Panel discussions", "Networking lunch", "Film screenings"],
    category: "event",
  },
  "filmmaking-masterclass": {
    title: "What is creativity",
    description: "Hands-on masterclass with award-winning directors and cinematographers.",
    price: "#25,000",
    duration: "1 Day",
    deliverables: ["Directing workshop", "Lighting demo", "Q&A session", "Certificate of attendance"],
    category: "event",
  },
}

export default function BookingPage({ params }: { params: { service: string } }) {
  const service = serviceDetails[params.service as keyof typeof serviceDetails]

  if (!service) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Service Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Book {service.title}</h1>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900">Starting Price</h4>
                    <p className="text-lg text-primary font-semibold">{service.price}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Timeline</h4>
                    <p className="text-gray-600">{service.duration}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What You'll Receive:</h4>
                  <ul className="space-y-2">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <CalendarRedirectButton />
            <PaymentForm
              service={service.title}
              amount={parseFloat(service.price.replace(/[^0-9]/g, "")) || 50000}
              category={service.category as "service" | "academy" | "gopro" | "event"}
            />
          </div>

          {/* Booking Form */}
          <div>
            <BookingForm service={service.title} />
          </div>
        </div>
      </div>
    </div>
  )
}