import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    resolveAlias: {
      "@/components/ui": "../../packages/ui",
      "@/lib/utils": "../../packages/lib/utils.ts",
      "@/lib": "../../packages/lib",
      "@/utils/supabase/client": "../../packages/database/utils/supabase/client.ts",
      "@/utils/supabase/server": "../../packages/database/utils/supabase/server.ts",
    },
  },
};

export default nextConfig;
