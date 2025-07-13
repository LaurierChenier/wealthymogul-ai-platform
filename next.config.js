/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  
  // This is the KEY fix - tell Next.js how to handle different routes
  async exportPathMap(defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    // Remove API routes from static export
    const pathMap = {}
    for (const path in defaultPathMap) {
      if (!path.startsWith('/api/')) {
        pathMap[path] = defaultPathMap[path]
      }
    }
    return pathMap
  },
  
  // Alternative approach - disable static optimization for API routes
  experimental: {
    outputFileTracingExcludes: {
      '/api/*': ['./pages/api/**/*'],
    },
  }
}

module.exports = nextConfig
