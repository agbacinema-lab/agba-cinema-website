import { notFound } from "next/navigation"
import { blogService } from "@/lib/services"
import { BlogPostContent } from "@/components/blog/BlogPostContent"

interface BlogPostPageProps {
  params: { slug: string }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await blogService.getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return <BlogPostContent initialPost={post} slug={params.slug} />
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const allPosts = await blogService.getAllPosts()
  return allPosts.map((post) => ({
    slug: post.slug,
  }))
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await blogService.getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: `${post.title} | ÀGBÀ CINEMA Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}
