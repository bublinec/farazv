import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  poweredByHeader: false,
  // Both loopback names are used by local browser tests and developer previews.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: { root: path.resolve(import.meta.dirname) },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
          }
        ]
      },
      {
        source: "/design/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" }
        ]
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/cms/index.php/farnost/farske-oznamy",
        destination: "/farnost/farske-oznamy",
        permanent: true
      },
      {
        source: "/cms/index.php/farnost/kontakt",
        destination: "/kontakt",
        permanent: true
      },
      { source: "/cms/index.php", destination: "/", permanent: true },
      { source: "/cms", destination: "/", permanent: true }
    ];
  }
};

export default config;
