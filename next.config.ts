import type { NextConfig } from "next";
import { BASE_PATH, STATIC_DEMO } from "./lib/features";

/** Set by `npm run build:static` — enables `output: "export"`. */
const staticExport =
  STATIC_DEMO && process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(staticExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
        ...(BASE_PATH
          ? {
              basePath: BASE_PATH,
              assetPrefix: BASE_PATH,
            }
          : {}),
      }
    : {}),
  // Phones on Wi‑Fi hit the Mac via LAN IP — without this, Next blocks
  // /_next/* assets and the page stays black / never hydrates.
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "172.17.*.*",
    "172.18.*.*",
    "172.19.*.*",
    "172.20.*.*",
    "172.21.*.*",
    "172.22.*.*",
    "172.23.*.*",
    "172.24.*.*",
    "172.25.*.*",
    "172.26.*.*",
    "172.27.*.*",
    "172.28.*.*",
    "172.29.*.*",
    "172.30.*.*",
    "172.31.*.*",
  ],
};

export default nextConfig;
