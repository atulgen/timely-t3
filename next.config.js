/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
      images: {
    domains: ['gennextit.com'],
  },
  // Your Next.js configuration here
  // For example:
  // reactStrictMode: true,
  // swcMinify: true,
};

export default nextConfig;