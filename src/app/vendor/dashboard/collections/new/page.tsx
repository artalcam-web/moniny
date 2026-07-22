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
      if (!res.ok) throw new Error(data.error || "Couldn't create the collection");
      router.push("/vendor/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-14 mn-fade-up">
      <h1 className="mn-headline text-2xl sm:text-3xl mb-8">New collection</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Name</label>
          <input required className="mn-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Season / division</label>
          <select className="mn-input" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
            <option value="">Not specified</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="fall">Fall</option>
            <option value="winter">Winter</option>
            <option value="sport">Sport</option>
            <option value="formal">Formal</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Description (optional)</label>
          <textarea
            className="mn-input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {error ? (
          <p className="text-sm" style={{ color: "var(--mn-pink)" }}>
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={submitting} className="mn-btn-accent w-full justify-center disabled:opacity-60">
          {submitting ? "Creating…" : "Create collection"}
        </button>
      </form>
    </div>
  );
}
