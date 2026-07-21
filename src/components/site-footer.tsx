import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--mn-line)", background: "var(--mn-panel)" }}>
      <div className="mx-auto max-w-6xl px-5 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="mn-headline text-xl">
            moni<span style={{ color: "var(--mn-red)" }}>NY</span>
          </p>
          <p className="mt-2 text-sm opacity-70">
            El marketplace de conjuntos curados de Nueva York. Cada vendedora arma su propia colección,
            pieza a pieza.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-2">Explorar</p>
          <p><Link className="opacity-70 hover:opacity-100" href="/marcas">Vendedoras</Link></p>
          <p><Link className="opacity-70 hover:opacity-100" href="/vendor/register">Vender en moniNY</Link></p>
          <p><Link className="opacity-70 hover:opacity-100" href="/vendor/login">Panel de vendedora</Link></p>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-2">Newsletter</p>
          <p className="opacity-70 mb-2">Novedades de las vendedoras, sin spam.</p>
          <div className="flex gap-2">
            <input className="mn-input" placeholder="tu@email.com" />
            <button className="mn-btn-accent !px-4 whitespace-nowrap">Unirme</button>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs opacity-60" style={{ borderColor: "var(--mn-line)" }}>
        © {new Date().getFullYear()} moniNY. Todos los derechos reservados.
      </div>
    </footer>
  );
}
