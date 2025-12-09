/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/bio-:slug',
        destination: '/bio/:slug',
      },
    ]
  },
}

export default nextConfig
