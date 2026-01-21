import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { academyDetails } from "./academyData"

export default function AcademyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Academy</h1>
                    <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
                        Professional training and workshops to help you master video production and storytelling.
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {academyDetails.map((service) => (
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h2>
                    <p className="text-xl mb-8 text-primary-foreground/90">
                        Join our academy and take your skills to the next level.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/contact">Enquire Now</Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
                        >
                            <Link href="/portfolio">Student Work</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
