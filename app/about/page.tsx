"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Users, Award, Heart, Zap, Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/common/layout/PageHero";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Dynamic import for react-slick (no SSR)
const Slider = dynamic(() => import("react-slick"), { ssr: false });

const stats = [
  { icon: Camera, label: "Narratives Built", value: "500+" },
  { icon: Users, label: "Creative Partners", value: "200+" },
  { icon: Award, label: "Cinema Honors", value: "5+" },
  { icon: Heart, label: "Decade of Vision", value: "8+" },
];

const team = [
  {
    name: "Agbele Ololade Abel",
    role: "Architect & Creative Visionary",
    image: "/haybel picture.jpeg",
    bio: "Close to a decade of redefining visual boundaries. Abel architects emotions through light and shadow.",
  },
  {
    name: "Oloniyo Testimony",
    role: "Narrative Strategist",
    image: "/testimony.jpg",
    bio: "The soul of the story. Testimony converts abstract concepts into cinematic precision.",
  },
  {
    name: "Oyelami Testimony",
    role: "Director of Mastery",
    image: "/t money.jpg",
    bio: "Empowering the next generation. Testimony guides creatives from technicality to true artistry.",
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

  const sliderSettings: any = {
    dots: false,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <PageHero 
        title="OUR LEGACY"
        subtitle="We don't just record the world. We architect its most profound narratives."
        backgroundImage="/creative and legal crises.jpg"
      />

      {/* The Manifesto Section */}
      <section className="py-32 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <h4 className="text-yellow-400 font-black uppercase tracking-[0.6em] text-xs">The Manifesto</h4>
              <h2 className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.85]">
                Truth <br />
                <span className="text-gray-700">In Every</span> <br />
                Frame.
              </h2>
            </div>
            
            <p className="text-xl text-gray-400 font-medium leading-relaxed italic max-w-lg">
              ÀGBÀ CINEMA exists at the intersection of technical perfection and raw human emotion. We believe a lens is a tool for truth-telling, not just documentation.
            </p>

            <div className="flex items-center gap-6">
               <div className="h-px w-20 bg-yellow-400" />
               <button className="text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-yellow-400 transition-colors">
                 Discover our process
               </button>
            </div>
          </motion.div>

          <div className="relative group">
             <div className="absolute -inset-4 bg-yellow-400/5 blur-3xl rounded-full opacity-50" />
             <div className="relative aspect-square md:aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
               <Slider {...sliderSettings}>
                 {images.map((src, index) => (
                   <div key={index} className="outline-none h-full">
                     <Image
                       src={src}
                       alt={`Gallery ${index}`}
                       fill
                       className="object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000"
                       unoptimized
                     />
                   </div>
                 ))}
               </Slider>
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
               
               <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div className="bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1">Current Reel</p>
                    <p className="text-white font-black italic uppercase tracking-tighter">Visual Excellence 2024</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Play className="h-4 w-4 text-black fill-black ml-0.5" />
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Heritage Stats Overlay */}
      <section className="py-20 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`text-center space-y-4 ${i !== stats.length - 1 ? 'lg:border-r lg:border-white/5' : ''}`}>
              <div className="text-5xl md:text-7xl font-black text-white italic tracking-tighter">
                {stat.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Architects (Team) Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-24 space-y-4">
             <h4 className="text-yellow-400 font-black uppercase tracking-[0.6em] text-xs">The Minds Behind</h4>
             <h2 className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tighter">The <span className="text-gray-800 underline decoration-yellow-400/30">Architects</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/5 grayscale-[50%] group-hover:grayscale-0 transition-all duration-700 shadow-2xl">
                   <Image
                     src={member.image || "/placeholder.svg"}
                     alt={member.name}
                     fill
                     className="object-cover group-hover:scale-110 transition-transform duration-1000"
                     unoptimized
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                   
                   <div className="absolute bottom-10 left-10 right-10 space-y-2">
                      <p className="text-yellow-400 font-black uppercase tracking-[0.2em] text-[10px]">{member.role}</p>
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{member.name}</h3>
                   </div>
                </div>

                <div className="mt-8 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <p className="text-gray-400 font-medium italic translate-y-4 group-hover:translate-y-0 transition-transform">
                     {member.bio}
                   </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call */}
      <section className="py-32 bg-yellow-400">
         <div className="max-w-4xl mx-auto px-4 text-center space-y-10">
            <h2 className="text-5xl md:text-8xl font-black text-black italic uppercase tracking-tighter leading-none">
              Start Your <br /> Visual Legacy.
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <button className="h-16 px-12 bg-black text-white font-black uppercase italic tracking-tighter rounded-2xl hover:scale-105 transition-all text-lg shadow-2xl">
                 Project Inquiry
               </button>
               <button className="h-16 px-12 bg-transparent border-2 border-black text-black font-black uppercase italic tracking-tighter rounded-2xl hover:bg-black hover:text-yellow-400 transition-all text-lg">
                 Our Services
               </button>
            </div>
         </div>
      </section>
    </div>
  );
}
