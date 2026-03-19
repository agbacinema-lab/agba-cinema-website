/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/tools/video-caption',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://unpkg.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; worker-src 'self' blob: https://cdn.jsdelivr.net; connect-src 'self' blob: data: https:; img-src 'self' data: blob: https://www.facebook.com; media-src 'self' blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
