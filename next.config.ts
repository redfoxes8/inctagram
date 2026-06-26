import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-575589967758-eu-central-1-an.s3.eu-central-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
  /* config options here */
  reactCompiler: true,
}

export default nextConfig
