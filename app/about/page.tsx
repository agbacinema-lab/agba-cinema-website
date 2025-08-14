"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Users, Award, Heart } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Dynamic import for react-slick (no SSR)
const Slider = dynamic(() => import("react-slick"), { ssr: false });

const stats = [
  { icon: Camera, label: "Projects Completed", value: "500+" },
  { icon: Users, label: "Happy Clients", value: "200+" },
  { icon: Award, label: "Awards Won", value: "5+" },
  { icon: Heart, label: "Years Experience", value: "5+" },
];

const team = [
  {
    name: "Agbele Ololade Abel",
    role: "Founder & Creative Director",
    image: "/haybel picture.jpeg",
    bio: "With close to a decade in the industry, Abel brings creative vision and technical expertise to every project.",
  },
  {
    name: "Oloniyo Testimony",
    role: "Lead Writer and Storyteller",
    image: "/testimony.jpg",
    bio: "Testimony brings a rare blend of storytelling brilliance and editorial precision, leading every project with creativity, clarity, and purpose.",
  },
  {
    name: "Oyelami Testimony",
    role: "Head of Training & Mentorship",
    image: "/t money.jpg",
    bio: "Testimony empowers creatives to transform their skills into impactful careers. With close to a decade of industry insight, they guide the next generation with clarity, creativity, and real-world expertise.",
  },
];

export default function AboutPage() {
  const images = [
    "/IMG-20240515-WA0028.jpg",
    "/Screenshot (11).png",
    "/Screenshot (191).png",
    "/IMG-20250627-WA0001.jpg",
    "/IMG-20250814-WA0007.jpg",
    "/IMG-20250814-WA0009.jpg",
    "/IMG-20240515-WA0020.jpg",
    "/IMG-20250814-WA0006.jpg",
    "/gp pro.jpg",
    "/creative and legal crises.jpg",
  ];

  const sliderSettings: import("react-slick").Settings = {
    dots: true,
    infinite: true,
    speed: 800,
    fade: true,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <div className="absolute top-1/2 right-2 z-20 cursor-pointer text-white bg-black/50 rounded-full p-2 transform -translate-y-1/2">&rarr;</div>,
    prevArrow: <div className="absolute top-1/2 left-2 z-20 cursor-pointer text-white bg-black/50 rounded-full p-2 transform -translate-y-1/2">&larr;</div>,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero / Gallery Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About ÀGBÀ CINEMA</h1>
            <p className="text-xl text-gray-200 mb-8">
              We are passionate storytellers dedicated to creating cinematic experiences that captivate, inspire, and leave lasting impressions.
            </p>
            <Button size="lg" asChild>
              <Link href="/contact">Work With Us</Link>
            </Button>
          </div>

          <div className="relative w-full">
            <Slider {...sliderSettings}>
              {images.map((src, index) => (
                <div key={index}>
                  <Image
                    src={src}
                    alt={`Gallery Image ${index + 1}`}
                    width={800}
                    height={450}
                    className="rounded-lg object-cover w-full h-[450px]"
                    unoptimized
                  />
                </div>
              ))}
            </Slider>
            <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-md text-lg font-semibold">
              Gallery
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
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
                    unoptimized
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
    </div>
  );
}
