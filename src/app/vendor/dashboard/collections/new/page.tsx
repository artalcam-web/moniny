"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCollectionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", season: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear la colección");
      router.push("/vendor/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14 mn-fade-up">
      <h1 className="mn-headline text-3xl mb-8">Nueva colección</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Nombre</label>
          <input required className="mn-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Temporada / división</label>
          <select className="mn-input" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
            <option value="">Sin especificar</option>
            <option value="Primavera">Primavera</option>
            <option value="Verano">Verano</option>
            <option value="Otoño">Otoño</option>
            <option value="Invierno">Invierno</option>
            <option value="Sport">Sport</option>
            <option value="Formal">Formal</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Descripción (opcional)</label>
          <textarea
            className="mn-input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {error ? <p className="text-sm" style={{ color: "var(--mn-red)" }}>{error}</p> : null}
        <button type="submit" disabled={submitting} className="mn-btn-accent w-full justify-center disabled:opacity-60">
          {submitting ? "Creando…" : "Crear colección"}
        </button>
      </form>
    </div>
  );
}
