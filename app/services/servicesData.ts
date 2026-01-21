import { Video, PenLine, Users, Briefcase, MonitorPlay, MonitorStop, Edit, Palette } from "lucide-react";


export interface ServiceDetail {
  title: string
  description: string
  icon?: React.ElementType
  href?: string
}
export const serviceDetails = [

  {
    icon: PenLine,
    title: "Script Writing Training",
    description: "Compelling scripts that bring stories and messages to life.",
    features: ["Concept development", "Story structure", "Dialogue writing", "Tone alignment"],
    price: "From #50,000",
    href: "/booking/Script-Writing",
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
    price: "From #100",
    href: "/booking/aftereffect",
  },

  {
    icon: Palette,
    title: "Gopro Video Editing",
    description: "Gopro provide the best training for intending creative for free.",
    features: ["intenship oppturnity", "Storytelling", "Color correction", "Audio syncing"],
    price: "Free with refundable commitment fee of #20,000",
    href: "/booking/Gopro-Video-Editing",
  },

] as const;
