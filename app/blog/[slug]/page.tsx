import { notFound } from "next/navigation"
import { blogService } from "@/lib/services"
import { BlogPostContent } from "@/components/blog/BlogPostContent"

export const dynamic = 'force-dynamic'

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
