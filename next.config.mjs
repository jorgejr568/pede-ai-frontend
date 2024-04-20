/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "pede-ai-admin.j-jr.app",
      },
      {
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
