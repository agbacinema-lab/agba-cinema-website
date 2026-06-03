import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDirectDriveUrl(url: string | undefined): string {
  if (!url) return "";
  // If it's already a direct googleusercontent image URL, return as-is
  if (url.includes("lh3.googleusercontent.com")) return url;

  // Handle common Drive share URL formats and convert to a direct view URL
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const id = idMatch ? idMatch[1] : null;
    if (id) {
      return `https://drive.google.com/uc?export=view&id=${id}`;
    }
  }

  return url;
}
