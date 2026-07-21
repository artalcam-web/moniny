"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="mn-btn-outline !py-2 !px-4 text-sm"
    >
      Cerrar sesión
    </button>
  );
}
