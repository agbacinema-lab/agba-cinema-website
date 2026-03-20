import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDirectDriveUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    const idMatch = url.match(/\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
    const id = idMatch ? idMatch[1] : null;
    return id ? `https://lh3.googleusercontent.com/u/0/d/${id}=w1000?authuser=0` : url;
  }
  return url;
}
