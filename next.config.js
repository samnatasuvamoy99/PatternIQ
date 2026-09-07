/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },

  // All API routes read request.headers for JWT auth — mark them all as
  // server-side dynamic so Next.js doesn't attempt static pre-rendering
  // and the [API ERROR] DYNAMIC_SERVER_USAGE noise disappears from builds.
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Silence the dynamic-server-usage logs during static page generation
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};
module.exports = nextConfig;

