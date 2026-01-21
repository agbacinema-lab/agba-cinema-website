import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { eventsDetails } from "./eventsData"

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-900 to-purple-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Upcoming Events</h1>
                    <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
                        Connect, learn, and grow with our community at these exclusive events.
                    </p>
                </div>
            </section>

            {/* Events Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {eventsDetails.map((event) => (
                            <Card key={event.title} className="h-full hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <div className="flex items-center space-x-4">
                                        <event.icon className="h-12 w-12 text-primary" />
                                        <div>
                                            <CardTitle className="text-2xl">{event.title}</CardTitle>
                                            <p className="text-lg font-semibold text-primary">{event.price}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600 mb-6 text-base">{event.description}</CardDescription>

                                    <div className="mb-4 text-sm text-gray-500 space-y-1">
                                        <p className="flex items-center"><span className="font-semibold w-20">Date:</span> {event.date}</p>
                                        <p className="flex items-center"><span className="font-semibold w-20">Location:</span> {event.location}</p>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3">Highlights:</h4>
                                        <ul className="space-y-2">
                                            {event.features.map((feature) => (
                                                <li key={feature} className="flex items-center text-gray-600">
                                                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex space-x-3">
                                        <Button asChild className="flex-1">
                                            <Link href={event.href}>Get Ticket</Link>
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Want to Host an Event?</h2>
                    <p className="text-xl mb-8 text-primary-foreground/90">
                        Partner with Agba Cinema to bring your vision to life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/contact">Contact Us</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
