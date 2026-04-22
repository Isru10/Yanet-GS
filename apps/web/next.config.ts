import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/components/ui": path.resolve(__dirname, "../../packages/ui"),
      "@/lib/utils": path.resolve(__dirname, "../../packages/lib/utils.ts"),
      "@/lib": path.resolve(__dirname, "../../packages/lib"),
      "@/utils/supabase/client": path.resolve(
        __dirname,
        "../../packages/database/utils/supabase/client.ts"
      ),
      "@/utils/supabase/server": path.resolve(
        __dirname,
        "../../packages/database/utils/supabase/server.ts"
      ),
    };
    return config;
  },
};

export default nextConfig;
