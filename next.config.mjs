/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  distDir: '.next',
  poweredByHeader: false,
}

export default nextConfig
