import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: "/inferencejs",
        destination: "/",
        permanent: true, // Set to false for temporary (307) redirect
      },
    ];
  },
};

export default nextConfig;
