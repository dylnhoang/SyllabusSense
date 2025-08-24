"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-2xl">SS</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          SyllabusSense
        </h1>
        <p className="text-muted-foreground">
          Redirecting to login...
        </p>
      </div>
    </div>
  );
}
