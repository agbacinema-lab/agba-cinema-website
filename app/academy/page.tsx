"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageHero from "@/components/common/layout/PageHero"
import { BookOpen, CheckCircle2, ArrowRight, Play, Award, Zap, Briefcase } from "lucide-react"
import { academyService } from "@/lib/services"
import { academyDetails as fallbackAcademy } from "./academyData"
import Image from "next/image"
import { motion, AnimatePresence, Variants } from "framer-motion"

export default function AcademyPage() {
    const [academyDetails, setAcademyDetails] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        academyService.getAllServices()
            .then(data => {
                if (data.length === 0) {
                    setAcademyDetails([...fallbackAcademy])
                } else {
                    setAcademyDetails(data)
                }
            })
            .catch(err => {
                console.error("Failed to fetch academy services:", err)
                setAcademyDetails([...fallbackAcademy])
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
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.1
            }
        }
    }

    const contentVariants: Variants = {
        hidden: { opacity: 0, x: -10 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <PageHero
                title="ÀGBÀ Academy"
                subtitle="From beginner to industry pro. Master the art of cinematic storytelling and elite commercial editing."
                backgroundImage="/gp pro.jpg"
            />

            {/* Curriculum Section Header */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h4 className="text-yellow-500 font-black uppercase tracking-[0.3em] text-sm mb-4">The Go-Pro Framework</h4>
                            <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter leading-tight italic uppercase">
                                Elite Training for <span className="text-gray-300">Modern Visionaries</span>
                            </h2>
                        </div>
                        <p className="text-gray-500 font-bold max-w-sm">
                            Our curriculum is designed to push you beyond software mastery into the psychology of editing.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-40">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin" />
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="space-y-24"
                        >
                            {academyDetails.map((service, idx) => (
                                <motion.div 
                                    key={service.id ?? idx} 
                                    variants={itemVariants}
                                    layout
                                    whileHover={{ y: -8 }}
                                    className="group relative"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                        {/* Image Container with Floating Label */}
                                        <div className="lg:col-span-5 relative group">
                                            <div className="absolute -inset-4 bg-yellow-400/10 rounded-[3rem] blur-2xl group-hover:bg-yellow-400/20 transition-all duration-700" />
                                            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-premium bg-black border-4 border-white">
                                                <Image
                                                    src={service.image || "/gp pro.jpg"}
                                                    alt={service.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                                <div className="absolute top-8 left-8">
                                                    <div className="glass-morphism text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl">
                                                       Starts at {service.price}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Side */}
                                        <motion.div 
                                            variants={containerVariants}
                                            className="lg:col-span-7 space-y-10"
                                        >
                                            <motion.div variants={contentVariants} className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Premium Mentorship</span>
                                                </div>
                                                <h3 className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase italic">{service.title}</h3>
                                            </motion.div>

                                            <motion.p variants={contentVariants} className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl italic">
                                                {service.description}
                                            </motion.p>

                                            <motion.div variants={contentVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                                                <div className="space-y-6">
                                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black/40 border-b border-gray-100 pb-3">Core Modules</h4>
                                                    <ul className="space-y-4">
                                                        {(service.features || []).map((feature: string, fIdx: number) => (
                                                            <li key={fIdx} className="flex items-start gap-3 group/li">
                                                                <div className="mt-1 w-5 h-5 rounded-full bg-yellow-400/10 flex items-center justify-center group-hover/li:bg-yellow-400 transition-colors">
                                                                    <CheckCircle2 className="h-3 w-3 text-yellow-600 group-hover/li:text-black" />
                                                                </div>
                                                                <span className="text-gray-700 font-bold group-hover/li:text-black transition-colors">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                
                                                <div className="flex flex-col gap-4 justify-end">
                                                    <Button asChild className="group h-20 bg-black text-white hover:bg-yellow-400 hover:text-black font-black uppercase italic tracking-tighter text-xl rounded-3xl transition-all duration-500 shadow-premium">
                                                        <a href={service.href || '#'} className="flex items-center justify-center gap-2">
                                                            Apply for Access
                                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                                        </a>
                                                    </Button>
                                                    <Button variant="outline" asChild className="h-16 border-2 border-gray-100 text-gray-400 hover:text-black hover:border-black font-black uppercase tracking-tighter rounded-2xl transition-all">
                                                        <a href="/contact">Curriculum Inquiry</a>
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                    <div className="absolute -bottom-12 left-0 right-0 h-px bg-gray-100" />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Elite Stats / Social Proof Bar */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { label: "Graduated Editors", value: "500+", icon: Award },
                        { label: "Internship Partners", value: "40+", icon: Briefcase },
                        { label: "Course Modules", value: "120+", icon: BookOpen },
                        { label: "Mentorship Hours", value: "2K+", icon: Zap }
                    ].map((stat, i) => (
                        <div key={i} className="text-center space-y-2 group">
                            <div className="flex justify-center mb-2 text-yellow-400 group-hover:scale-110 transition-transform">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <h5 className="text-4xl md:text-5xl font-black italic tracking-tighter">{stat.value}</h5>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA with Premium Blur */}
            <section className="py-32 relative overflow-hidden bg-white">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.05)_0%,transparent_60%)]" />
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                            Stop Being an Editor. <br />
                            <span className="text-yellow-400">Start Being a Producer.</span>
                        </h2>
                        <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
                            Join the next intake of visionaries and redefine your creative potential.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                        <Button size="lg" className="h-20 px-12 bg-yellow-400 text-black hover:bg-black hover:text-white font-black uppercase italic tracking-tighter text-2xl rounded-[2rem] transition-all transform shadow-2xl hover:scale-105" asChild>
                            <a href="/contact">Join Intake</a>
                        </Button>
                        <Button size="lg" variant="outline" className="h-20 px-12 border-4 border-black text-black hover:bg-black hover:text-white font-black uppercase italic tracking-tighter text-2xl rounded-[2rem] transition-all" asChild>
                            <a href="/portfolio">Our Work</a>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
