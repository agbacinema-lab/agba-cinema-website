"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

interface PageHeroProps {
  title: string
  subtitle: string
  backgroundImage?: string
}

export default function PageHero({ title, subtitle, backgroundImage }: PageHeroProps) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  return (
    <section ref={containerRef} className="relative h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Cinematic Background Layer */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        {backgroundImage ? (
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className="w-full h-full bg-[#050505]" />
        )}
        {/* Gradients and Filters */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#050505]" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        
        {/* Film Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </motion.div>

      {/* Light Leaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-yellow-400/10 blur-[180px] rounded-full animate-pulse" />
         <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <motion.div
           style={{ opacity }}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="space-y-8"
        >
          <div className="space-y-2">
            <motion.span 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-yellow-400 font-black uppercase tracking-[0.6em] text-[10px] md:text-xs block"
            >
              ÀGBÀ CINEMA PRESENTS
            </motion.span>
            
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
              {title.split(' ').map((word, i) => (
                <span key={i} className="relative inline-block mr-4 last:mr-0">
                  {word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'agba' || word.toLowerCase() === 'cinema' ? (
                    <span className="text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">{word}</span>
                  ) : (
                    <span className="relative">
                      {word}
                      {/* Outline/Depth version behind */}
                      <span className="absolute inset-0 -z-10 text-transparent stroke-white/20 stroke-1 select-none pointer-events-none transform translate-x-1 translate-y-1">
                        {word}
                      </span>
                    </span>
                  )}
                </span>
              ))}
            </h1>
          </div>

          <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium italic opacity-80">
            {subtitle}
          </p>

          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: "circOut" }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-12"
          />
        </motion.div>
      </div>
      
      {/* Floating UI Elements */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
         <span className="animate-bounce">Scroll to Explore</span>
         <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  )
}
