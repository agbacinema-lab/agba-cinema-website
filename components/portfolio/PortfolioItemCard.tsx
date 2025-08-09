import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Play, Clock } from "lucide-react"

interface PortfolioItem {
  id: number
  title: string
  slug: string
  category: string
  client: string
  description: string
  image: string
  duration: string
  year: number
}

interface PortfolioItemCardProps {
  item: PortfolioItem
}

export default function PortfolioItemCard({ item }: PortfolioItemCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          width={600}
          height={400}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="h-12 w-12 text-white" />
        </div>
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">{item.category}</span>
        </div>
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {item.duration}
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
        <p className="text-sm text-gray-500 mb-2">Client: {item.client}</p>
        <p className="text-gray-600 mb-4">{item.description}</p>
        <Button variant="outline" asChild>
          <Link href={`/portfolio/${item.slug}`}>View Project</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
