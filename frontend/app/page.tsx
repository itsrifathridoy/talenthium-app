"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;
    router.replace(isAuthenticated ? "/dashboard" : "/auth/login");
  }, [isAuthenticated, isInitialized, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 dark:bg-[#0a1813]">
      <div className="w-10 h-10 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
    </div>
  );
}
