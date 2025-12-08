import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // Exclude Docs folder (old reference code) from type checking
    tsconfigPath: 'tsconfig.json',
  },
};
