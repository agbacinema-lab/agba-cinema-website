import { Video, PenLine, Users, Briefcase, MonitorPlay, MonitorStop, Edit, Palette } from "lucide-react";


export interface ServiceDetail {
    title: string
    description: string
    icon?: React.ElementType
    href?: string
}
export const academyDetails = [

    {
        icon: PenLine,
        title: "Script Writing Training",
        description: "Compelling scripts that bring stories and messages to life.",
        features: ["Concept development", "Story structure", "Dialogue writing", "Tone alignment"],
        price: "From #50,000",
        href: "/booking/Script-Writing",
    },
    {
        icon: MonitorPlay,
        title: "Premiere Pro Training",
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
        icon: Palette,
        title: "GoPro Video Editing",
        description: "GoPro provide the best training for intending creative for free.",
        features: ["Internship opportunity", "Storytelling", "Color correction", "Audio syncing"],
        price: "Free with refundable commitment fee of #20,000",
        href: "/booking/Gopro-Video-Editing",
    },

    {
        icon: Palette,
        title: "GoPro After Effects",
        description: "GoPro provide the best training for intending creative for free.",
        features: ["Concept development", "Storyboarding", "Creative direction", "Project planning"],
        price: "Free with refundable commitment fee of #20,000",
        href: "/booking/Gopro-Aftereffect",
    },
    {
        icon: Palette,
        title: "GoPro Video Editing - After Effects",
        description: "GoPro provide the best training for intending creative for free.",
        features: ["Video Editing", "After Effects", "Creative direction", "Internship placement"],
        price: "Free with refundable commitment fee of #30,000",
        href: "/booking/GoPro-Video-Editing-After-Effect",
    },
] as const;
