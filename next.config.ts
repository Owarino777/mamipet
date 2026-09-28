import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;
const isLocalSupabase = supabaseUrl
  ? ["localhost", "127.0.0.1", "::1"].includes(supabaseUrl.hostname)
  : false;

const nextConfig: NextConfig = {
  ...(process.env.MAMIPET_QA_DIST_DIR ? { distDir: process.env.MAMIPET_QA_DIST_DIR } : {}),
  reactStrictMode: true,
  agentRules: false,
  images: {
    ...(isLocalSupabase ? { dangerouslyAllowLocalIP: true } : {}),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? (() => {
            const configuredUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
            return [{
              protocol: isLocalSupabase ? "http" as const : "https" as const,
              hostname: configuredUrl.hostname,
              ...(configuredUrl.port ? { port: configuredUrl.port } : {}),
              pathname: "/storage/v1/object/public/blog-images/**",
            }];
          })()
        : []),
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ] }];
  },
};

export default nextConfig;
