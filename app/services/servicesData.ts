import { Video, PenLine, Users, Briefcase, MonitorPlay, MonitorStop, Edit, Palette } from "lucide-react";


export interface ServiceDetail {
  title: string
  description: string
  icon?: React.ElementType
  href?: string
}
export const serviceDetails = [
  {
    icon: Video,
    title: "Corporate Videos",
    description: "Professional corporate video production for brands, training, and marketing campaigns.",
    features: ["Brand storytelling", "Training videos", "Company profiles", "Product demos"],
    price: "From #100,000",
    href: "/booking/corporate-videos",
  },
  {
    icon: PenLine,
    title: "Script Writing",
    description: "Compelling scripts that bring stories and messages to life.",
    features: ["Concept development", "Story structure", "Dialogue writing", "Tone alignment"],
    price: "From #50,000",
    href: "/booking/Script-Writing",
  },
  {
    icon: Users,
    title: "Live Event Coverage",
    description: "Professional live streaming services for events, conferences, and broadcasts.",
    features: ["Multi-camera setup", "Live streaming", "Post-event editing", "Same-day highlights"],
    price: "From #100,000",
    href: "/booking/live-event",
  },
  {
    icon: Briefcase,
    title: "Content Strategist",
    description: "Strategic content planning to engage audiences and achieve your brand goals.",
    features: ["Audience research", "Content planning", "SEO optimization", "Performance tracking"],
    price: "From #100,000",
    href: "/booking/content-startegist",
  },
  {
    icon: MonitorPlay,
    title: "Premire Pro Training",
    description: "Professional Premiere Pro training for video editing, storytelling, and content creation.",
    features: ["Video editing", "Storytelling", "Color correction", "Audio syncing"],
    price: "From #70,000",
    href: "/booking/video-editing",
  },
  {
    icon: MonitorStop,
    title: "After Effects Training",
    description: "Professional After Effects training for animation, motion graphics, and video effects.",
    features: ["Motion graphics", "Visual effects", "Animation", "Compositing"],
    price: "From #150,000",
    href: "/booking/aftereffect",
  },
  {
    icon: Edit,
    title: "Post-Production",
    description: "Professional video editing, color grading, and post-production services.",
    features: ["Video editing", "Color correction", "Audio mixing", "Motion graphics"],
    price: "From #200,000",
    href: "/booking/post-production",
  },
  {
    icon: Palette,
    title: "Creative Consulting",
    description: "Creative consulting that helps you shape ideas into impactful visuals.",
    features: ["Concept development", "Storyboarding", "Creative direction", "Project planning"],
    price: "#50,000 per hour",
    href: "/booking/creative-consulting",
    },

      {
    icon: Palette,
    title: "Gopro Video Editing",
    description: "Gopro provide the best training for intending creative for free.",
    features: ["intenship oppturnity", "Storytelling", "Color correction", "Audio syncing"],
    price: "Free with refundable commitment fee of #20,000",
    href: "/booking/Gopro-Video-Editing",
    },

      {
    icon: Palette,
    title: "Gopro Aftereffect",
    description: "Gopro provide the best training for intending creative for free.",
    features: ["Concept development", "Storyboarding", "Creative direction", "Project planning"],
    price:"Refundable #20,000",
    href: "/booking/Gopro-Aftereffect",
    },
] as const;
