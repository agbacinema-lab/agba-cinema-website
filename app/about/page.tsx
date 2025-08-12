import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Award, Users, Camera, Heart } from "lucide-react"

const stats = [
  { icon: Camera, label: "Projects Completed", value: "500+" },
  { icon: Users, label: "Happy Clients", value: "200+" },
  { icon: Award, label: "Awards Won", value: "15+" },
  { icon: Heart, label: "Years Experience", value: "8+" },
]

const team = [
  {
    name: "Agbele Ololade Abel",
    role: "Founder & Creative Director",
    image: "/haybel picture.jpeg",
    bio: "With over 8 years in the industry, Adebayo brings creative vision and technical expertise to every project.",
  },
  {
    name: "Kemi Adebisi",
    role: "Lead Cinematographer",
    image: "/IMG-20240515-WA0020.jpg",
    bio: "Kemi specializes in cinematic storytelling and has worked on numerous award-winning productions.",
  },
  {
    name: "Tunde Okafor",
    role: "Post-Production Specialist",
    image: "/IMG-20240515-WA0032.jpg",
    bio: "Tunde transforms raw footage into compelling stories through expert editing and color grading.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About ÀGBÀ CINEMA</h1>
              <p className="text-xl text-gray-200 mb-8">
                We are passionate storytellers dedicated to creating cinematic experiences that captivate, inspire, and
                leave lasting impressions.
              </p>
              <Button size="lg" asChild>
                <Link href="/contact">Work With Us</Link>
              </Button>
            </div>
            <div>
              <Image
                src="/IMG-20240515-WA0028.jpg"
                alt="ÀGBÀ CINEMA Team"
                width={600}
                height={500}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                Founded in 2016, ÀGBÀ CINEMA began as a passion project with a simple mission: to tell compelling
                stories through the art of cinematography. What started as a small team of creative enthusiasts has
                grown into one of Nigeria's most trusted video production companies.
              </p>
              <p>
                Our name "ÀGBÀ" means "elder" or "master" in Yoruba, reflecting our commitment to mastery in our craft
                and respect for the storytelling traditions that inspire us. We believe every project, whether it's a
                corporate video, wedding film, or documentary, deserves the same level of artistic attention and
                technical excellence.
              </p>
              <p>
                Over the years, we've had the privilege of working with amazing clients across various industries, from
                startups to multinational corporations, couples celebrating their love stories, and organizations making
                a difference in their communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our talented team of creatives, technicians, and storytellers work together to bring your vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="p-6">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every frame, every edit, and every client interaction.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Passion</h3>
              <p className="text-gray-600">
                Our love for storytelling drives us to create meaningful and impactful content.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Collaboration</h3>
              <p className="text-gray-600">We work closely with our clients to ensure their vision becomes reality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Tell Your Story?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Let's create something amazing together. Get in touch to discuss your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Start Your Project</Link>
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
