import { withSentryConfig } from "@sentry/nextjs";
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

export default withSentryConfig(withMDX(config), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "refundcat",

  project: "javascript-nextjs",

  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
