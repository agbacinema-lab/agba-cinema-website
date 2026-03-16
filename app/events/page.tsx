"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageHero from "@/components/common/layout/PageHero"
import { Calendar, MapPin, Tag } from "lucide-react"
import { eventService } from "@/lib/services"
import { eventsDetails as fallbackEvents } from "./eventsData"
import Image from "next/image"

export default function EventsPage() {
    const [eventsDetails, setEventsDetails] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        eventService.getAllEvents().then(data => {
            if (data.length === 0) {
                setEventsDetails(fallbackEvents)
            } else {
                setEventsDetails(data)
            }
            setLoading(false)
        })
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero 
                title="Upcoming Events"
                subtitle="Connect, learn, and grow with our community at these exclusive events."
                backgroundImage="/event-videography-coverage.png"
            />

            {/* Events Grid - One per line */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {eventsDetails.map((event, idx) => (
                                <Card key={event.id || idx} className="overflow-hidden border-none shadow-premium rounded-[2.5rem] bg-white hover:scale-[1.01] transition-transform duration-300">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Image Section - Flyer space */}
                                        <div className="lg:w-1/3 relative h-64 lg:h-auto min-h-[300px] bg-gray-100">
                                            <Image 
                                                src={event.image || "/event-videography-coverage.png"} 
                                                alt={event.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-6 left-6">
                                                <span className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest">
                                                    {event.price}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
                                                    <Calendar className="h-6 w-6 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-gray-900">{event.title}</h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="flex items-center text-gray-500 font-medium text-sm">
                                                            <Calendar className="h-4 w-4 mr-2" /> {event.date}
                                                        </span>
                                                        <span className="flex items-center text-gray-500 font-medium text-sm">
                                                            <MapPin className="h-4 w-4 mr-2" /> {event.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">{event.description}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                                <div>
                                                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Event Highlights</h4>
                                                    <ul className="space-y-3">
                                                        {(event.features || []).map((feature: string, fIdx: number) => (
                                                            <li key={fIdx} className="flex items-center text-gray-700 font-medium">
                                                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 shadow-sm"></div>
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="flex items-end">
                                                     <Button asChild className="w-full bg-black text-white hover:bg-gray-800 font-black h-16 rounded-2xl text-lg">
                                                        {event.lumaUrl ? (
                                                            <a href={event.lumaUrl} target="_blank" rel="noopener noreferrer">
                                                                Get Ticket on Luma
                                                            </a>
                                                        ) : (
                                                            <a href={event.href || '#'}>Register Now</a>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-black text-white py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Want to Host an Event?</h2>
                    <p className="text-xl mb-12 text-gray-400 font-medium">
                        Partner with ÀGBÀ CINEMA to bring your vision to life with professional coverage and management.
                    </p>
                    <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 font-black h-16 px-12 rounded-2xl text-lg" asChild>
                        <a href="/contact">Partner With Us</a>
                    </Button>
                </div>
            </section>
        </div>
    )
}
