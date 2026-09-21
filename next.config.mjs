/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Streaming chat routes run on the Node runtime so you can talk to a
    // self-hosted vLLM / Nebius endpoint over plain fetch.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
