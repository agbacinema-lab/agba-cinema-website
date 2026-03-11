"use client"

import { notFound } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from "lucide-react"
import { blogService, BlogPost } from "@/lib/services"

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      const data = await blogService.getPostBySlug(params.slug)
      if (data) {
        setPost(data)
        const allPosts = await blogService.getAllPosts()
        const related = allPosts
          .filter((p) => p.category === data.category && p.id !== data.id)
          .slice(0, 2)
        setRelatedPosts(related)
      }
      setLoading(false)
    }
    fetchPost()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-black text-white">
        {/* Background glow */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.05)_0%,transparent_70%)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            asChild
            className="mb-8 bg-white/5 border-white/20 text-white hover:bg-white hover:text-black rounded-xl transition-all duration-300"
          >
            <a href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </a>
          </Button>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center">
              <Tag className="h-3 w-3 mr-2" />
              {post.category}
            </span>
            <div className="flex items-center text-gray-400 text-sm font-medium">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-gray-400 text-sm font-medium">
              <Clock className="h-4 w-4 mr-2" />
              {post.readTime}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed font-medium">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-black text-xs">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-gray-300 font-bold uppercase tracking-widest text-xs">By {post.author}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 text-white hover:bg-white hover:text-black rounded-xl"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Image */}
          <div className="mb-12">
            <Image
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              width={800}
              height={500}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none mb-12">
            {post.content.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
                    {paragraph.replace("## ", "")}
                  </h2>
                )
              }
              return (
                <p key={index} className="text-muted-foreground leading-relaxed mb-6">
                  {paragraph}
                </p>
              )
            })}
          </div>

          {/* Tags */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover:bg-accent transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">ÀC</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{post.author}</h3>
                  <p className="text-muted-foreground">
                    The creative team at ÀGBÀ CINEMA brings years of experience in video production, cinematography, and
                    storytelling to every project and blog post.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <Image
                        src={relatedPost.image || "/placeholder.svg"}
                        alt={relatedPost.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {relatedPost.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                        <a href={`/blog/${relatedPost.slug}`} className="hover:text-primary transition-colors">
                          {relatedPost.title}
                        </a>
                      </h4>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{relatedPost.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{relatedPost.readTime}</span>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/blog/${relatedPost.slug}`}>Read More</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 bg-primary text-primary-foreground rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Video Project?</h3>
            <p className="text-primary-foreground/90 mb-6">
              Let's bring your vision to life with professional video production services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="/contact">Get Free Quote</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
              >
                <a href="/portfolio">View Our Work</a>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return [] 
}
