import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc } from "firebase/firestore";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  image: string;
  tags: string[];
  category: string;
  readTime: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  client: string;
  description: string;
  image: string;
  youtubeEmbedUrl: string;
  tags: string[];
  year: number;
  duration: string;
}

export const blogService = {
  async getAllPosts() {
    const postsCol = collection(db, "posts");
    const postsSnapshot = await getDocs(query(postsCol, orderBy("publishedAt", "desc")));
    return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  },

  async getPostBySlug(slug: string) {
    const postsCol = collection(db, "posts");
    const q = query(postsCol, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BlogPost;
  }
};

export const portfolioService = {
  async getAllItems() {
    const itemsCol = collection(db, "portfolio");
    const itemsSnapshot = await getDocs(query(itemsCol, orderBy("year", "desc")));
    return itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
  }
};
