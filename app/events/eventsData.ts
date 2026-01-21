import { Calendar, MapPin, Ticket } from "lucide-react";

export const eventsDetails = [
    {
        icon: Calendar,
        title: "Creativity and Legal Crises 2026",
        description: "Join industry leaders for a day of networking, workshops, and screenings.",
        features: ["Keynote speakers", "Panel discussions", "Networking lunch", "Film screenings"],
        price: "#15,000",
        href: "/booking/cinema-conference-2024",
        date: "March 15, 2024",
        location: "Lagos, Nigeria"
    },
    {
        icon: Ticket,
        title: "What is creativity",
        description: "Hands-on masterclass with award-winning directors and cinematographers.",
        features: ["Directing workshop", "Lighting demo", "Q&A session", "Certificate of attendance"],
        price: "#25,000",
        href: "/booking/filmmaking-masterclass",
        date: "April 20, 2024",
        location: "Abuja, Nigeria"
    },
] as const;
