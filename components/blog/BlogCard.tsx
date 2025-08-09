import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Tag } from "lucide-react"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  author: string
  publishedAt: string
  image: string
  tags: string[]
  category: string
  readTime: string
}

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative">
        <Image
          src={post.image || "/placeholder.svg"}
          alt={post.title}
          width={600}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            {post.category}
          </span>
        </div>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(post.publishedAt).toLocaleDateString()}
          <Clock className="h-4 w-4 ml-4 mr-1" />
          {post.readTime}
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h2>

        <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">{post.excerpt}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
              {tag}
            </span>
          ))}
          {post.tags.length > 2 && <span className="text-muted-foreground text-sm">+{post.tags.length - 2} more</span>}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-muted-foreground">By {post.author}</span>
          <Button variant="outline" asChild>
            <Link href={`/blog/${post.slug}`}>Read More</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
