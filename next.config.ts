/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Skip trailing slash redirect (moved from experimental section)
  skipTrailingSlashRedirect: true,
  images: {
    domains: ["bjvdlqjsxymxrqshldjm.supabase.co"],
  },
  // Remove the env section as it's overriding .env.local values
  // env: {
  //   NEXT_PUBLIC_SUPABASE_URL: "https://placeholder-project-id.supabase.co",
  //   SUPABASE_SERVICE_ROLE_KEY: "placeholder-service-role-key",
  // },
};

export default nextConfig;
