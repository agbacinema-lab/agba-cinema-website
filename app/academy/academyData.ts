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
        icon: Palette,
        title: "Gopro Video Editing",
        description: "Gopro provide the best training for intending creative for free.",
        features: ["intenship oppturnity", "Storytelling", "Color correction", "Audio syncing"],
        price: "Free with refundable commitment fee of #20,000",
        href: "/booking/Gopro-Video-Editing",
    },

    {
        icon: Palette,
        title: "Gopro After Effect",
        description: "Gopro provide the best training for intending creative for free.",
        features: ["Concept development", "Storyboarding", "Creative direction", "Project planning"],
        price: "Free with refundable commitment fee of #20,000",
        href: "/booking/Gopro-Aftereffect",
    },
    {
        icon: Palette,
        title: "Go Pro Video Editing - After Effect",
        description: "Gopro provide the best training for intending creative for free.",
        features: ["Video Editing", "After Effect", "Creative direction", "Intenship placement"],
        price: "Free with refundable commitment fee of #30,000",
        href: "/booking/GoPro-Video-Editing-After-Effect",
    },
] as const;
