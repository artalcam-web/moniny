"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/client";

export default function VendorLoginPage() {
  const router = useRouter();
  const { dict } = useLocale();
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
      if (!res.ok) throw new Error(data.error || "We couldn't sign you in");
      router.push("/vendor/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 mn-fade-up">
      <h1 className="mn-headline text-2xl sm:text-3xl mb-8">{dict.vendorAuth.loginTitle}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">{dict.vendorAuth.emailLabel}</label>
          <input
            required
            type="email"
            className="mn-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">{dict.vendorAuth.passwordLabel}</label>
          <input
            required
            type="password"
            className="mn-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error ? (
          <p className="text-sm" style={{ color: "var(--mn-pink)" }}>
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={submitting} className="mn-btn-accent w-full justify-center disabled:opacity-60">
          {submitting ? dict.vendorAuth.signingIn : dict.vendorAuth.signIn}
        </button>
      </form>
      <p className="text-sm opacity-70 mt-6">
        {dict.vendorAuth.noAccount}{" "}
        <Link href="/vendor/register" className="underline">
          {dict.vendorAuth.registerLink}
        </Link>
      </p>
    </div>
  );
}
