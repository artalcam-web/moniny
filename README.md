# moniNY

Marketplace de moda multi-vendedor (tema Nueva York). Cada vendedora tiene su
propia tienda, con colecciones (divisiones por temporada) y "conjuntos"
(sets curados) que se venden completos o pieza por pieza.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Prisma + PostgreSQL
- Autenticación de vendedoras con cookies de sesión firmadas (JWT)
- Subida de imágenes/video a disco (pensado para un Render Disk persistente)
- Estructura de datos lista para Stripe Connect (sin llaves activas todavía)

## Desarrollo local

```bash
npm install
cp .env.example .env   # y completa DATABASE_URL / AUTH_SECRET
npx prisma db push
npm run db:seed        # crea la vendedora demo Mónica NYC
npm run dev
```

## Cuenta demo
- Vendedora: monica@moniny.com / Monica2026!

## Despliegue
Pensado para Render (ver `render.yaml`): un Web Service + una base de datos
Postgres administrada. El build corre `prisma db push` y el seed en cada
deploy (idempotente).
