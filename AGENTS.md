# AGENTS.md — Agroveterinaria Gross

> Operating contract for this repository. Read it before acting on any request.
> This file was rewritten to focus on the **clinical-operative** product. Older references to
> MAMAYUCCA / OrdenYa / n8n / Prisma / Supabase / Vercel / e-commerce are **historical carry-over**
> from other projects and **do not apply here** unless the user explicitly asks for them.
> The **VPS / connection reference** block at the end (section 13) must not be edited unless the
> user explicitly asks to update those connection details.

---

## 1) Product identity

**Agroveterinaria Gross** is a **clinical-operative system** for an agroveterinary clinic. Its core
value is to **organize the daily work of veterinarians, surgeons and clinical administration** — not
to be a generic admin dashboard.

The system must let staff:

- Load clients (pet owners).
- Load pets (patients).
- Register clinical consultations.
- Register vaccines.
- Register treatments.
- Register surgeries.
- Register studies / files.
- Consult the full clinical history.
- Manage future WhatsApp reminders.
- Schedule appointments and surgeries.
- Work through **simple flows from a main action screen with large buttons**.

**Not a priority (do not build unless something minimal already exists):** billing, cash register,
stock/inventory, sales, e-commerce. This is a clinical/operative system, not a commercial one.

### Most important product rule

The app must feel like a **daily working tool for vets**, not an administrative metrics dashboard.

- The **main screen is a quick-action screen**, not a KPI dashboard.
- The old dashboard is now **`Resumen`** (`/resumen`) and lives **near the end** of navigation.
- The home route `/` is **`Principal`**: large, touch-friendly action buttons + an operative
  "Hoy requiere atención" section, with **KPIs only at the bottom** as secondary info.

Priority order on every screen: **action first → useful info next → metrics last.**

### Primary users

1. **Veterinarian / surgeon** — needs big buttons, fast data entry, an easy way back to `Principal`,
   few metrics, and minimal table navigation before acting.
2. **Administrator** — can see more: listings, configuration, templates, reminders and metrics; but
   metrics never occupy the main screen.

---

## 2) UX rules (every module)

Each module must offer:

- A **large primary action button**.
- Full **CRUD** (visually, on mock data for now).
- Clear **search**.
- Useful **empty states**.
- **Quick actions** on rows/cards.
- The ability to **create related entities without leaving the flow** (e.g. while loading a
  treatment, search a client, "Crear nuevo cliente", "Crear mascota", view basic client/pet data,
  then save and return to `Principal`).

### Clinical history is the spine

Everything below must end up recorded in the pet's clinical history:
consulta, tratamiento, vacuna, cirugía, estudio, control, evolución, dosis aplicada,
recordatorio generado, observación clínica importante.

The pet's technical sheet (`/mascotas/[id]`) must keep the full history of all consultations.

---

## 3) Navigation (canonical order)

1. Principal (`/`)
2. Clientes (`/clientes`)
3. Mascotas (`/mascotas`)
4. Historia Clínica (`/historial`)
5. Vacunas (`/vacunas`)
6. Tratamientos (`/tratamientos`)
7. Cirugías (`/cirugias`)
8. Turnos (`/turnos`)
9. Estudios y Archivos (`/estudios`)
10. Recordatorios WhatsApp (`/recordatorios`)
11. Resumen (`/resumen`)
12. Configuración (`/configuracion`)

`/operaciones` still exists as a route but is **not** in the primary navigation; do not break it.

---

## 4) Current stack

- Next.js 16.2.6 (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4 (`@theme inline` tokens in `app/globals.css`)
- shadcn/ui-style components in `components/ui/`
- lucide-react icons
- pnpm
- Mock data only — `lib/mock-data.ts` (no real backend yet)
- Assets in `public/` — **preserve the Gross logo** `public/agroveterinaria-gross.png`

### Commands (pnpm only)

```bash
pnpm dev
pnpm build   # reliable verification command
pnpm lint    # may fail if eslint isn't installed locally
```

`next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true`.
Path alias `@/*` maps to the repository root. Because build ignores TS errors, do not rely on
`pnpm build` alone for type safety — keep types correct by hand.

---

## 5) App structure

```txt
app/
  layout.tsx            # fonts, metadata, themeColor #B3007A
  globals.css           # design tokens + animations (Clinical Agro Boutique palette)
  page.tsx              # Principal (home / quick-action screen)
  resumen/page.tsx      # Resumen (relocated dashboard + KPIs)
  clientes/  mascotas/  mascotas/[id]/  historial/  vacunas/
  tratamientos/  cirugias/  turnos/  estudios/  recordatorios/
  operaciones/  configuracion/

components/
  layout/      # app-layout, sidebar, topbar
  principal/   # action-grid, action-card, today-attention (quick-action screen)
  shared/      # section-header, empty-state, kpi-strip, status-badge, large-primary-action, ...
  dashboard/   # Resumen content
  <section>/   # one folder per clinical module
  ui/          # shadcn primitives

lib/
  mock-data.ts # clients, pets, treatments, templates, vaccines, surgeries, history events, reminders
  utils.ts     # cn()
```

---

## 6) Design system — "Clinical Agro Boutique"

Refined, professional, clinical and premium — never landing-page-like, never generic SaaS.

Palette (tokens live as oklch in `app/globals.css`; reference hex):

- Gross Magenta `#B3007A` · Magenta profundo `#7A0054` · Magenta suave fondo `#FDF2F8`
- Rosa clínico `#FCE7F3` · Verde agro `#84A98C` · Verde profundo `#52796F`
- Crema fondo `#FAF7F2` · Blanco cálido `#FFFDF9` · Gris texto `#374151` · Gris suave `#F3F4F6`
- Amarillo alerta `#F59E0B` · Rojo crítico `#DC2626` · Verde éxito `#16A34A`

Usage: cream/warm-white backgrounds (not pure white); cards = warm white + soft border; sidebar keeps
magenta with more depth; main actions magenta or agro-green by category; few colors per screen.

Radii: cards/large buttons `rounded-2xl`, modals `rounded-3xl`, inputs/sidebar items `rounded-xl`.
Shadows: `shadow-sm` / `shadow-md` only. Transitions 180–300ms; hover lift on big buttons;
`active:scale-[0.98]`; staggered entrance on the action grid; pulsing dot only for urgent pending items.

---

## 7) Data model (conceptual)

No real DB yet. Keep `lib/mock-data.ts` shaped like a real system. Core entities:
`Cliente`, `Mascota` (with `etapaVida: cachorro|adulto|senior|no_definido`), `ConsultaClinica`,
`Tratamiento`, `PlantillaTratamiento` (includes a seeded **Leishmaniasis** template), `Vacuna`,
`Cirugia`, `EstudioArchivo`, `HistoriaClinicaEvento` (`tipo: consulta|vacuna|tratamiento|cirugia|estudio|control|recordatorio`),
`RecordatorioWhatsApp` (`tipo: vacuna|cirugia|tratamiento|control|consulta`, `estado: pendiente|enviado|cancelado|fallido`).

When a treatment / vaccine / surgery / study is created it must produce a `HistoriaClinicaEvento`.

---

## 8) Reminders / Evolution API (future)

No real automation yet — **do not invent a backend**. Keep the UI and data structure ready:
reminder state, scheduled date/time, suggested message, "marcar como enviado" / "programar" /
"cancelar" actions, and the client's WhatsApp consent. Leave comments marking where Evolution API
would later connect (e.g. send a WhatsApp X hours/days before a vaccine/surgery/dose).

---

## 9) Implementation rules

- Don't break existing routes — redirect/adapt instead.
- Keep TypeScript strict; reuse components; avoid unmanageable mega-components; split when it improves clarity.
- Use existing mock data; if persistence is missing, leave structure ready but don't fabricate a backend.
- No heavy unnecessary dependencies. Prefer Tailwind + shadcn/ui + lucide-react + CSS animations.
- Verify with `pnpm build`.

---

## 10) Minimal-change & safety

Choose the least invasive path. Read state before editing. Preserve user data, assets and previous
commits. Never hardcode secrets. Never commit `debug_*/temp_*/check_*/fix_*` scripts. Do not run
destructive git (`reset --hard`, `push --force`, `clean -fd`) unless the user explicitly authorizes it.

---

## 11) Deployment (Dokploy)

Production target: `https://agroveterinariagross.zubuagency.com`, deployed via **Dokploy** connected to
the GitHub repo. Standard flow: inspect git status → `pnpm build` → commit → push → let Dokploy deploy
via its Git flow → verify the domain responds. Prefer Dokploy's Git-based deploy over manual file
replacement. Commit/push only when the user asks.

- GitHub: `https://github.com/Hernanstupniki/Agroveterinaria-gross` · Main branch: `main`

---

## 12) Delivery standard

Every final response: objective, what changed, files touched, how it was verified (build output),
what remains pending for a real backend.

---

## 13) Connection References

> Do not store real credentials in this document. Use placeholders and load real values from `.env`, Vercel environment variables, a secret store or an approved vault.

## 4) Connection data (provided by user)

### VPS
- Host: 72.62.15.178
- User: root
- Password: K&;QLR2l4sU/jqkw

### n8n

{
  "mcpServers": {
    "n8n-mcp": {
      "type": "http",
      "url": "https://n8n.zubuagency.com/mcp-server/http",
      "headers": {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MTg4MmNjMC0zNTFmLTQ4NjgtOTE1Yy0wNmI4NzcyNDE3ODMiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjBmNmI0ZjExLTI1YjEtNGJmMC1iMDQzLTEzYzAzMzVjNGMxMCIsImlhdCI6MTc3NDY1MDcyNn0.ZtR8Yz-B3qp6HCvRuVpnZP9qFkIlbaGBpavVYSv5Z9g"
      }
    }
  }
}

### n8n

https://n8n.zubuagency.com/

### mamayucca
https://mamayucca.vercel.app/

### ordenya
https://ordenya.zubuagency.com/
https://ordenya.zubuagency.com/natural

### evolution
evolutionapi: https://wahomolog.zubuagency.com/manager/login

POSTGRES_PASSWORD=K9pMVBFvat3QPYegUxlS
N8N_ENCRYPTION_KEY=U5F8+WdA3Dof6DWY74sQa1hI+TzRnRrn
AUTHENTICATION_API_KEY_HOMOLOG=STUPNIKITARNOSKI789!_HOMOLOG
AUTHENTICATION_API_KEY=STUPNIKITARNOSKI789!
