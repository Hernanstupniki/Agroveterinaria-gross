# CLAUDE.md — Agroveterinaria Gross

This file guides Claude Code in this repo. It is aligned with `AGENTS.md` (read that for the full
contract, data model and connection references). When they appear to conflict, follow `AGENTS.md`.

## What this product is

**Agroveterinaria Gross** is a **clinical-operative system** for an agroveterinary clinic — a daily
working tool for veterinarians, surgeons and clinical admin. It is **not** a generic admin dashboard
and **not** a commercial system.

Build only clinical/operative features. **Do not** add billing, cash register, stock, sales or
e-commerce unless something minimal already exists and the user asks.

## The one rule that shapes everything

**Action first → useful info next → metrics last.**

- `/` = **Principal**: a quick-action screen with large, touch-friendly buttons, then a
  "Hoy requiere atención" operative section, then KPIs at the very bottom.
- `/resumen` = **Resumen**: the relocated dashboard (KPIs, alerts, activity). Never the home screen.
- Clinical history (`/historial` + the pet sheet) is the spine: consultas, vacunas, tratamientos,
  cirugías, estudios, controles, recordatorios all end up there as `HistoriaClinicaEvento`s.

## Navigation order

Principal · Clientes · Mascotas · Historia Clínica · Vacunas · Tratamientos · Cirugías · Turnos ·
Estudios y Archivos · Recordatorios WhatsApp · Resumen · Configuración.
(`/operaciones` still works but is not in the primary nav.)

## Flows to honor

- Create client → offer "Crear mascota" / "Ver cliente" / "Volver a Principal".
- Create pet → offer "Cargar consulta / vacuna / tratamiento", "Ver ficha", "Volver a Principal".
- Any treatment/vaccine/surgery/study created → write a clinical-history event + a reminder when relevant.
- Treatments support reusable **plantillas** (seeded: **Leishmaniasis**) — prefill but stay editable.
- Vaccines vary by life stage (cachorro/adulto/senior) — don't hardcode one calendar.
- Forms that need a client/pet must allow inline search + "crear nuevo".

## Stack & conventions

- Next.js 16.2.6 App Router · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · lucide-react · pnpm.
- Mock data only in `lib/mock-data.ts`. Leave structure backend-ready; don't fabricate a backend.
- Theme: "Clinical Agro Boutique" tokens in `app/globals.css` — warm cream bg, refined magenta,
  agro-green accent. Radii: cards/buttons `rounded-2xl`, modals `rounded-3xl`, inputs `rounded-xl`.
  Animations 180–300ms, hover lift, `active:scale-[0.98]`, staggered grid entrance.
- Reusable pieces in `components/shared/` and `components/principal/`. Avoid mega-components.
- Preserve assets, especially `public/agroveterinaria-gross.png`.

## Verify

```bash
pnpm build
```

`ignoreBuildErrors: true` means build won't catch TS errors — keep types correct manually.
Commit/push only when asked; deploy via Dokploy's Git flow. Never hardcode or print secrets.
