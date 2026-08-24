import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://ofmchazfisvxjndjshgo.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbWNoYXpmaXN2eGpuZGpzaGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTU1NTMsImV4cCI6MjEwMzE3MTU1M30.snomOMiG9WW-YByn_sAc6DP0m3KGtjUOemhR5usjfrs",
  },
};

export default nextConfig;
