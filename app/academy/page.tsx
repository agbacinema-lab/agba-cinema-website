"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageHero from "@/components/common/layout/PageHero"
import { BookOpen, CheckCircle2, Star } from "lucide-react"
import { academyService } from "@/lib/services"
import { academyDetails as fallbackAcademy } from "./academyData"
import Image from "next/image"

export default function AcademyPage() {
    const [academyDetails, setAcademyDetails] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        academyService.getAllServices().then(data => {
            if (data.length === 0) {
                setAcademyDetails([...fallbackAcademy])
            } else {
                setAcademyDetails(data)
            }
            setLoading(false)
        })
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero 
                title="Our Academy"
                subtitle="Professional training and workshops to help you master video production and storytelling."
                backgroundImage="/gp pro.jpg"
            />

            {/* Services Grid - One per line */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {academyDetails.map((service, idx) => (
                                <Card key={service.id || idx} className="overflow-hidden border-none shadow-premium rounded-[2.5rem] bg-white hover:scale-[1.01] transition-transform duration-300">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Image Section - Graphic space */}
                                        <div className="lg:w-1/3 relative h-64 lg:h-auto min-h-[300px] bg-gray-100">
                                            <Image 
                                                src={service.image || "/gp pro.jpg"} 
                                                alt={service.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-6 left-6">
                                                <span className="bg-black text-yellow-400 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest">
                                                    {service.price}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                                    <BookOpen className="h-6 w-6 text-indigo-600" />
                                                </div>
                                                <h3 className="text-3xl font-black text-gray-900">{service.title}</h3>
                                            </div>

                                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">{service.description}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                                <div>
                                                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Course Curriculum</h4>
                                                    <ul className="space-y-3">
                                                        {(service.features || []).map((feature: string, fIdx: number) => (
                                                            <li key={fIdx} className="flex items-center text-gray-700 font-medium">
                                                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="flex flex-col gap-4 justify-end">
                                                    <Button asChild className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-black h-16 rounded-2xl text-lg shadow-lg shadow-indigo-200">
                                                        <a href={service.href || '#'}>Enroll Today</a>
                                                    </Button>
                                                    <Button variant="outline" asChild className="w-full border-2 border-gray-100 font-black h-16 rounded-2xl text-lg hover:bg-gray-50">
                                                        <a href="/contact">Enquire About This Course</a>
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
            <section className="bg-indigo-600 text-white py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to Start Learning?</h2>
                    <p className="text-xl mb-12 text-indigo-100 font-medium">
                        Join our academy and master the art of video production using industry-standard tools and techniques.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 font-black h-16 px-12 rounded-2xl text-lg" asChild>
                            <a href="/contact">Enquire Now</a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-black h-16 px-12 rounded-2xl text-lg"
                        >
                            <a href="/portfolio">View Student Work</a>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
