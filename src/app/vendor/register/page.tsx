"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VendorRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "New York", bio: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No pudimos crear tu cuenta");
      router.push("/vendor/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 mn-fade-up">
      <h1 className="mn-headline text-3xl mb-2">Vender en moniNY</h1>
      <p className="text-sm opacity-70 mb-8">
        Crea tu cuenta de vendedora para subir tus conjuntos, con fotos, precio y piezas por separado.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Nombre / marca</label>
          <input required className="mn-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
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
            minLength={6}
            className="mn-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Ciudad</label>
          <input className="mn-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Bio (opcional)</label>
          <textarea className="mn-input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        {error ? <p className="text-sm" style={{ color: "var(--mn-red)" }}>{error}</p> : null}
        <button type="submit" disabled={submitting} className="mn-btn-accent w-full justify-center disabled:opacity-60">
          {submitting ? "Creando cuenta…" : "Crear mi tienda"}
        </button>
      </form>
      <p className="text-sm opacity-70 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/vendor/login" className="underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
