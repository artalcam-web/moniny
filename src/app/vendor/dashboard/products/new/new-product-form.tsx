"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Collection = { id: string; name: string; season: string | null };

type ItemDraft = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  sizes: string;
  uploading: boolean;
};

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al subir el archivo");
  return data.url as string;
}

export function NewProductForm({ collections }: { collections: Collection[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [sellSeparately, setSellSeparately] = useState(false);
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  async function handleImagesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImagesUploading(true);
    setError(null);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadFile));
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes");
    } finally {
      setImagesUploading(false);
    }
  }

  async function handleVideoSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setVideoUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      setVideoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el video");
    } finally {
      setVideoUploading(false);
    }
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", description: "", price: "", imageUrl: "", sizes: "", uploading: false }]);
  }

  function updateItem(idx: number, patch: Partial<ItemDraft>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleItemImage(idx: number, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    updateItem(idx, { uploading: true });
    try {
      const url = await uploadFile(file);
      updateItem(idx, { imageUrl: url, uploading: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen de pieza");
      updateItem(idx, { uploading: false });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Sube al menos una fotografía del conjunto.");
      return;
    }
    const priceCents = Math.round(parseFloat(price) * 100);
    if (!priceCents || priceCents <= 0) {
      setError("Indica un precio válido para el conjunto.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          videoUrl: videoUrl || undefined,
          priceCents,
          collectionId: collectionId || undefined,
          sellItemsSeparately: sellSeparately,
          status,
          images,
          items: sellSeparately
            ? items
                .filter((it) => it.name && it.price)
                .map((it) => ({
                  name: it.name,
                  description: it.description || undefined,
                  priceCents: Math.round(parseFloat(it.price) * 100) || 0,
                  imageUrl: it.imageUrl || undefined,
                  sizes: it.sizes
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
            : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear el conjunto");
      router.push(`/product/${data.product.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el conjunto");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-semibold">Nombre del conjunto</label>
        <input required className="mn-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Descripción</label>
        <textarea required className="mn-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Precio del conjunto completo (USD)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            className="mn-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Colección (opcional)</label>
          <select className="mn-input" value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
            <option value="">Sin colección</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.season ? ` (${c.season})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Fotografías del conjunto</label>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImagesSelected(e.target.files)}
          className="mn-input"
        />
        {imagesUploading ? <p className="text-xs opacity-60 mt-1">Subiendo…</p> : null}
        {images.length > 0 ? (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((url, i) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-square w-full rounded-sm object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Video (opcional)</label>
        <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleVideoSelected(e.target.files)} className="mn-input" />
        {videoUploading ? <p className="text-xs opacity-60 mt-1">Subiendo video…</p> : null}
        {videoUrl ? <p className="text-xs opacity-60 mt-1">Video listo ✓</p> : null}
      </div>

      <div className="rounded border p-4" style={{ borderColor: "var(--mn-line)" }}>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={sellSeparately} onChange={(e) => setSellSeparately(e.target.checked)} />
          Permitir vender las piezas del conjunto por separado
        </label>

        {sellSeparately ? (
          <div className="mt-4 space-y-4">
            {items.map((it, idx) => (
              <div key={idx} className="rounded border p-3" style={{ borderColor: "var(--mn-line)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="Nombre de la pieza"
                      className="mn-input"
                      value={it.name}
                      onChange={(e) => updateItem(idx, { name: e.target.value })}
                    />
                    <input
                      placeholder="Descripción breve (opcional)"
                      className="mn-input"
                      value={it.description}
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Precio (USD)"
                        type="number"
                        min="0"
                        step="0.01"
                        className="mn-input"
                        value={it.price}
                        onChange={(e) => updateItem(idx, { price: e.target.value })}
                      />
                      <input
                        placeholder="Tallas (S, M, L)"
                        className="mn-input"
                        value={it.sizes}
                        onChange={(e) => updateItem(idx, { sizes: e.target.value })}
                      />
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleItemImage(idx, e.target.files)} className="mn-input" />
                    {it.uploading ? <p className="text-xs opacity-60">Subiendo…</p> : null}
                    {it.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.imageUrl} alt="" className="h-20 w-16 rounded-sm object-cover" />
                    ) : null}
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} className="text-xs opacity-50 hover:opacity-100">
                    Quitar
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem} className="mn-btn-outline !py-2 !px-4 text-sm">
              + Añadir pieza
            </button>
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Estado</label>
        <select className="mn-input" value={status} onChange={(e) => setStatus(e.target.value as "published" | "draft")}>
          <option value="published">Publicado (visible ya)</option>
          <option value="draft">Borrador (solo tú lo ves)</option>
        </select>
      </div>

      {error ? <p className="text-sm" style={{ color: "var(--mn-red)" }}>{error}</p> : null}

      <button type="submit" disabled={submitting} className="mn-btn-accent w-full justify-center disabled:opacity-60">
        {submitting ? "Publicando…" : "Publicar conjunto"}
      </button>
    </form>
  );
}
