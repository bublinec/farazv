import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  poweredByHeader: false,
  distDir:
    process.env.FARAZV_PREVIEW_DEV === "true" ? ".next-preview" : ".next",
  // Both loopback names are used by local browser tests and developer previews.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: { root: path.resolve(import.meta.dirname) },
  serverExternalPackages: ["word-extractor"],
  // Binary extraction runs in an isolated worker with native package resolution.
  outputFileTracingIncludes: {
    "/api/admin/bulletins/import": [
      "./node_modules/word-extractor/**/*",
      "./node_modules/saxes/**/*",
      "./node_modules/xmlchars/**/*",
      "./node_modules/yauzl/**/*",
      "./node_modules/fd-slicer/**/*",
      "./node_modules/pend/**/*",
      "./node_modules/buffer-crc32/**/*"
    ]
  },
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
        source: "/birmovanci",
        destination: "/sviatosti/sviatost-birmovania",
        permanent: true
      },
      {
        source: "/design/:path*",
        destination: "/",
        permanent: false
      },
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
