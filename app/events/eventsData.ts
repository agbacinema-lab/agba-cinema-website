import { Calendar, MapPin, Ticket } from "lucide-react";

export interface Event {
    icon: any; // Using any for simplicity with the icon component
    title: string;
    description: string;
    features: string[];
    price: string;
    href: string;
    lumaUrl?: string;
    date: string;
    location: string;
}

export const eventsDetails: Event[] = [
    {
        icon: Calendar,
        title: "Creativity and Legal Crises 2026",
        description: "Join industry leaders for a day of networking, workshops, and screenings.",
        features: ["Keynote speakers", "Panel discussions", "Networking lunch", "Film screenings"],
        price: "#15,000",
        href: "/booking/cinema-conference-2024",
        lumaUrl: "https://luma.com/flupt8pb",
        date: "April 26, 2026",
        location: "Lagos, Nigeria"
    },
    {
        icon: Ticket,
        title: "What is creativity",
        description: "Hands-on masterclass with award-winning directors and cinematographers.",
        features: ["Directing workshop", "Lighting demo", "Q&A session", "Certificate of attendance"],
        price: "#25,000",
        href: "/booking/filmmaking-masterclass",
        lumaUrl: "https://luma.com/1ilcbhp3",
        date: "June 20, 2026",
        location: "Abuja, Nigeria"
    },

    {
        icon: Ticket,
        title: "CREATIVE BUSINESS WORKSHOP",
        description: "Hands-on masterclass with award-winning directors and cinematographers.",
        features: ["Directing workshop", "Lighting demo", "Q&A session", "Certificate of attendance"],
        price: "#25,000",
        href: "/booking/filmmaking-masterclass",
        lumaUrl: "https://luma.com/1ilcbhp3",
        date: "August 20, 2026",
        location: "Abuja, Nigeria"
    },

    {
        icon: Ticket,
        title: "MARKETING FOR CREATIVES",
        description: "Hands-on masterclass with award-winning directors and cinematographers.",
        features: ["Directing workshop", "Lighting demo", "Q&A session", "Certificate of attendance"],
        price: "#25,000",
        href: "/booking/filmmaking-masterclass",
        lumaUrl: "https://luma.com/1ilcbhp3",
        date: "September 20, 2026",
        location: "Abuja, Nigeria"
    },
];
