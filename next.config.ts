import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so a stray lockfile elsewhere
  // (e.g. in the home directory) can't be inferred as the root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
