"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VendorLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No pudimos iniciar sesión");
      router.push("/vendor/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 mn-fade-up">
      <h1 className="mn-headline text-3xl mb-8">Panel de vendedora</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Email</label>
          <input
            required
            type="email"
            className="mn-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Contraseña</label>
          <input
            required
            type="password"
            className="mn-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error ? <p className="text-sm" style={{ color: "var(--mn-red)" }}>{error}</p> : null}
        <button type="submit" disabled={submitting} className="mn-btn-accent w-full justify-center disabled:opacity-60">
          {submitting ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>
      <p className="text-sm opacity-70 mt-6">
        ¿No tienes cuenta?{" "}
        <Link href="/vendor/register" className="underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
