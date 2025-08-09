import BookingForm from "@/components/services/BookingForm"
import CalendarRedirectButton from "@/components/services/CalendarRedirectButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

const serviceDetails = {
  "corporate-videos": {
    title: "Corporate Videos",
    description: "Professional corporate video production for brands, training, and marketing campaigns.",
    price: "From $2,500",
    duration: "2-4 weeks",
    deliverables: ["Raw footage", "Edited video", "Color correction", "Audio mixing"],
  },
  "wedding-cinematography": {
    title: "Wedding Cinematography",
    description: "Cinematic wedding films that capture your special day with artistic flair.",
    price: "From $3,500",
    duration: "6-8 weeks",
    deliverables: ["Full ceremony", "Reception highlights", "Drone footage", "Music licensing"],
  },
  "event-coverage": {
    title: "Event Coverage",
    description: "Complete event documentation with multiple camera angles and professional editing.",
    price: "From $1,800",
    duration: "1-3 weeks",
    deliverables: ["Multi-camera footage", "Event highlights", "Live streaming", "Same-day clips"],
  },
  "commercial-production": {
    title: "Commercial Production",
    description: "High-quality commercials and promotional videos for your business.",
    price: "From $5,000",
    duration: "4-6 weeks",
    deliverables: ["Script development", "Professional production", "Post-production", "Multiple formats"],
  },
  "documentary-films": {
    title: "Documentary Films",
    description: "Compelling documentary storytelling that engages and informs your audience.",
    price: "From $8,000",
    duration: "8-12 weeks",
    deliverables: ["Research & interviews", "B-roll footage", "Professional editing", "Sound design"],
  },
  "live-streaming": {
    title: "Live Streaming",
    description: "Professional live streaming services for events, conferences, and broadcasts.",
    price: "From $1,200",
    duration: "1 day",
    deliverables: ["Multi-platform streaming", "Professional audio", "Graphics overlay", "Recording"],
  },
  "post-production": {
    title: "Post-Production",
    description: "Professional video editing, color grading, and post-production services.",
    price: "From $800",
    duration: "1-2 weeks",
    deliverables: ["Video editing", "Color correction", "Audio mixing", "Motion graphics"],
  },
  "creative-consulting": {
    title: "Creative Consulting",
    description: "Strategic creative consulting to help bring your video vision to life.",
    price: "From $500",
    duration: "1-2 weeks",
    deliverables: ["Concept development", "Storyboarding", "Creative direction", "Project planning"],
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
