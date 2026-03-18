import { NextRequest, NextResponse } from "next/server"
import Parser from "rss-parser"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"

const parser = new Parser()

export async function GET(request: NextRequest) {
  // Use agbacienma.substack.com by default
  const substackUser = request.nextUrl.searchParams.get("user") || "agbacienma"
  const feedUrl = `https://${substackUser}.substack.com/feed`

  try {
    const feed = await parser.parseURL(feedUrl)
    const postsCol = collection(db, "posts")

    const results = await Promise.all(feed.items.map(async (item) => {
      // Substack links usually end with the slug
      const slug = item.link?.split("/").pop()?.split("?")[0] || ""
      if (!slug) return null

      // Check if post already exists
      const q = query(postsCol, where("slug", "==", slug))
      const snap = await getDocs(q)

      if (snap.empty) {
        // Extract image from enclosure (Substack standard) or content
        let image = "/creative and legal crises.jpg"
        if (item.enclosure && item.enclosure.url) {
          image = item.enclosure.url
        } else {
          const imgRegex = /<img[^>]+src="([^">]+)"/g
          const match = imgRegex.exec(item["content:encoded"] || "")
          if (match) image = match[1]
        }

        // Substack categories are usually tags
        const category = item.categories?.[0] || "Editorial"
        const excerpt = item.contentSnippet?.slice(0, 160).replace(/\n/g, " ") + "..."

        await addDoc(postsCol, {
          title: item.title,
          slug: slug,
          excerpt: excerpt,
          content: item["content:encoded"] || item.content || "",
          author: item.creator || "ÀGBÀ CINEMA",
          publishedAt: new Date(item.pubDate || Date.now()).toISOString(),
          image: image,
          tags: item.categories || [],
          category: category,
          readTime: "5 min read",
          source: "substack",
          link: item.link,
          createdAt: serverTimestamp()
        })
        return { slug, status: "created" }
      }
      return { slug, status: "exists" }
    }))

    const added = results.filter(r => r?.status === "created").length

    return NextResponse.json({ 
      success: true, 
      message: `Substack Sync complete. Added ${added} new posts.`,
      postsProcessed: results.length,
      addedCount: added
    })
  } catch (error) {
    console.error("Substack Sync Error:", error)
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 })
  }
}
