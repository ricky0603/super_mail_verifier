import { createMDX } from "fumadocs-mdx/next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "logos-world.net",
      },
    ],
  },
  turbopack: {
    // Avoid incorrect workspace root inference (e.g. when a parent directory has another lockfile).
    // This also ensures fumadocs-mdx can find `source.config.ts` and generate its virtual modules.
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack: (webpackConfig) => {
    // Suppress specific warnings from Supabase realtime-js and Edge Runtime compatibility
    webpackConfig.ignoreWarnings = [
      {
        module: /node_modules\/\@supabase\/realtime-js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/\@supabase\/realtime-js/,
        message: /A Node\.js API is used \(process\.versions/,
      },
      {
        module: /node_modules\/\@supabase\/realtime-js/,
        message: /A Node\.js API is used \(process\.version/,
      },
      {
        module: /node_modules\/\@supabase\/supabase-js/,
        message: /A Node\.js API is used \(process\.version/,
      },
    ];

    return webpackConfig;
  },
};

const withMDX = createMDX({
  configPath: "source.config.ts",
});

export default withMDX(config);
