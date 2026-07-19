import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // www.uaesinger.com was serving the whole site at 200 alongside the apex, with
  // no redirect and no canonical to tell them apart — two complete duplicate
  // sites as far as a crawler is concerned, including two favicons to associate.
  // Google indexed the apex, so send www there permanently.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.uaesinger.com" }],
        destination: "https://uaesinger.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
