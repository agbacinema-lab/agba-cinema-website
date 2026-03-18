"use client"

import { useState, useEffect } from "react"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import PageHero from "@/components/common/layout/PageHero"
import { Calendar, MapPin, Ticket, Users, Clock, ArrowUpRight, Zap } from "lucide-react"
import { eventService } from "@/lib/services"
import { eventsDetails as fallbackEvents } from "./eventsData"
import Image from "next/image"

export default function EventsPage() {
    const [eventsDetails, setEventsDetails] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        eventService.getAllEvents()
            .then(data => {
                if (data.length === 0) {
                    setEventsDetails(fallbackEvents)
                } else {
                    setEventsDetails(data)
                }
            })
            .catch(err => {
                console.error("Failed to fetch events:", err)
                setEventsDetails(fallbackEvents)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const ticketVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <PageHero
                title="ÀGBÀ EVENTS"
                subtitle="High-octane networking and elite training sessions. Get your pass to the next cinematic movement."
                backgroundImage="/event-videography-coverage.png"
            />

            {/* Events Section */}
            <section className="py-24 relative">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(250,204,21,0.05)_0%,transparent_50%)] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-yellow-400 font-black uppercase tracking-[0.4em] text-xs">Live Schedule</h4>
                            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                                Secure Your <br />
                                <span className="text-gray-600">All-Access Pass</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-black uppercase tracking-widest text-gray-400">Booking Open for {eventsDetails.length} Events</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-40">
                            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="space-y-10"
                        >
                            {eventsDetails.map((event, idx) => (
                                <motion.div
                                    key={event.id ?? idx}
                                    variants={ticketVariants}
                                    layout
                                    whileHover={{ scale: 1.01, y: -4 }}
                                    className="group relative"
                                >
                                    {/* Ticket Wrapper */}
                                    <div className="flex flex-col lg:flex-row bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden hover:border-yellow-400/50 transition-colors duration-500 shadow-premium">

                                        {/* Image/Flyer Section */}
                                        <div className="lg:w-80 relative h-64 lg:h-auto overflow-hidden">
                                            <Image
                                                src={event.image || "/event-videography-coverage.png"}
                                                alt={event.title}
                                                fill
                                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                                            <div className="absolute top-6 left-6">
                                                <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-premium">
                                                    {event.price}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Ticket Info */}
                                        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                                    <span className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-yellow-400" /> {event.date}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-yellow-400" /> {event.location}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-yellow-400" /> 50 Seats Only
                                                    </span>
                                                </div>

                                                <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter group-hover:text-yellow-400 transition-colors">
                                                    {event.title}
                                                </h3>

                                                <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-2xl">
                                                    {event.description}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3 mt-8">
                                                {(event.features || []).slice(0, 3).map((f: string, fi: number) => (
                                                    <span key={fi} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                        # {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Ticket Stub (Booking Action) */}
                                        <motion.div
                                            variants={containerVariants}
                                            className="lg:w-72 border-t lg:border-t-0 lg:border-l border-dashed border-white/20 bg-white/5 p-8 lg:p-12 flex flex-col items-center justify-center relative"
                                        >
                                            {/* Perforation Circles */}
                                            <div className="hidden lg:block absolute -top-4 -left-4 w-8 h-8 bg-black rounded-full" />
                                            <div className="hidden lg:block absolute -bottom-4 -left-4 w-8 h-8 bg-black rounded-full" />

                                            <div className="text-center space-y-6 w-full">
                                                <motion.div variants={ticketVariants} className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Pass Availability</p>
                                                    <p className="text-xl font-black text-yellow-400 uppercase italic">Limited Access</p>
                                                </motion.div>

                                                <motion.div variants={ticketVariants}>
                                                    <Button asChild className="w-full h-16 bg-yellow-400 hover:bg-white text-black font-black uppercase italic tracking-tighter text-lg rounded-2xl transition-all shadow-premium">
                                                        <a href={event.lumaUrl || event.href || '#'} target={event.lumaUrl ? "_blank" : "_self"} rel={event.lumaUrl ? "noopener noreferrer" : ""} className="flex items-center justify-center gap-2">
                                                            {event.lumaUrl ? "Claim Pass" : "Register Now"}
                                                            <ArrowUpRight className="h-5 w-5" />
                                                        </a>
                                                    </Button>
                                                </motion.div>
                                                <motion.p variants={ticketVariants} className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Non-Refundable • ID Required</motion.p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Exclusive Section */}
            <section className="py-24 border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
                    <Zap className="h-10 w-10 text-yellow-400 mx-auto animate-pulse" />
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                        Private Directing <span className="text-gray-500">&amp;</span> Masterclass
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium italic">
                        Want a 1-on-1 session or private branding consultation? Let's build your vision.
                    </p>
                    <Button asChild variant="outline" className="h-16 px-12 border-2 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-tighter rounded-2xl transition-all">
                        <a href="/contact">Apply for Private Session</a>
                    </Button>
                </div>
            </section>
        </div>
    )
}
