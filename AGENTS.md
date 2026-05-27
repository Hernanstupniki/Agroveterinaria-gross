# AGENTS.md - MAMAYUCCA / OrdenYa v2 Session Operating Contract

> Read this file immediately after every user request and before taking any action.
> This is the mandatory operating contract for the MAMAYUCCA / OrdenYa v2 CRM/ERP workspace.

---

## 1) Project Overview

**OrdenYa v2 / MAMAYUCCA** is a multi-tenant CRM/ERP with WhatsApp bot automation, e-commerce storefront, admin dashboard, operational workflows and Supabase/PostgreSQL-backed data.

### Stack

- Next.js 16
- React 19
- TypeScript
- Prisma
- PostgreSQL / Supabase
- Tailwind v4
- shadcn/ui
- pnpm `9.15.4`
- n8n automation
- WhatsApp / Evolution API
- Vercel production deployment
- VPS deployment when explicitly required

### Live URLs

- App: `https://mamayucca.vercel.app/`
- n8n: `https://n8n.zubuagency.com`

---

## 2) Non-Negotiable Workflow

For every user request, follow this sequence:

1. Read the user request fully.
2. Read this `AGENTS.md`.
3. Identify relevant skills and read each required `SKILL.md` before implementation.
4. Restate the objective in one line and choose the smallest executable path.
5. Run read-only inspection first:
   - Live state for n8n.
   - Current file state for code.
   - Current database/API state for data tasks.
   - Current git state before changing repository files.
   - Current VPS/release state before deployment.
6. Execute immediately after inspection.
7. Use the smallest valid change path.
8. Verify with real checks appropriate to the task.
9. Report exactly:
   - What changed.
   - How it was verified.
   - What remains pending.
   - Whether MCP, API, Vercel, local repo or VPS was used.

---

## 3) Per-Request Execution Protocol

For every request, execute this loop:

1. Restate the objective in one line.
2. Choose the smallest executable path.
3. Inspect current state before editing.
4. Execute immediately when a safe actionable step exists.
5. After every 3-5 tool calls, publish a short progress update with:
   - Done.
   - Next step.
   - Blocker, if any.
6. If a command hangs or provides no useful output for 90 seconds, abort that path and switch to a deterministic fallback.
7. Prefer fail-fast, timeout-bounded scripts/commands over interactive/manual sessions.
8. End each task with verifiable evidence:
   - Timestamps.
   - Markers.
   - Status flags.
   - Counts.
   - Syntax checks.
   - Build/lint output.
   - Workflow activation state.
   - Commit hash.
   - Release/version currently deployed.
   - Health check result.

### Anti-Stall Rule

Never leave a request stuck in analysis when a safe command/script can be executed.

If optional validation blocks progress, continue with the minimal safe deploy path and verify post-state.

---

## 4) Mandatory Skill Usage

Always load relevant skills before implementation.

### Baseline mandatory skills

- `find-skills`
- `best-practices`

### Agent/instructions behavior

- `agent-customization`

### n8n workflow operations

- `n8n-mcp-tools-expert`
- `n8n-code-javascript`
- `n8n-expression-syntax`
- `n8n-node-configuration`
- `n8n-validation-expert`
- `n8n-workflow-patterns`

### Supabase/Postgres

- `supabase-postgres-best-practices`

### React / Next.js / web app changes

- `react-doctor`
- `web-quality-audit`
- `accessibility`
- `performance`

### Public pages, SEO or loading performance

- `seo`
- `core-web-vitals`

If a request spans multiple domains, load every relevant skill.

---

## 5) Developer Commands

Use **pnpm only**. Never use npm or yarn in this repository.

```bash
# Development
pnpm dev
pnpm build
pnpm lint

# Prisma
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:migrate:deploy
pnpm prisma:seed

# React diagnostics
pnpm doctor:react
pnpm doctor:react:diff
```

### Command order when it matters

Use:

```bash
pnpm lint
pnpm build
```

Important: TypeScript errors may not block build because `ignoreBuildErrors: true` is configured. Do not rely only on `pnpm build` for type safety.

---

## 6) Architecture & Key Directories

```txt
app/
├── api/bot/                  # WhatsApp bot REST API endpoints
├── api/natural/              # E-commerce storefront APIs
├── api/admin/natural/        # Admin storefront APIs
├── api/erp/                  # ERP module APIs
├── (natural)/                # E-commerce pages
├── admin/                    # Admin dashboard pages

automation/n8n/
├── ordenya-wa-inbound-router.ts
├── ordenya-dispatch-status-outbound.ts
├── ordenya-reorder-diffusion.ts
├── ordenya-mp-webhook-relay.ts
├── ordenya-whatsapp-instance-sync.ts
├── *.json                    # Live exports / references. Do not edit directly unless explicitly needed.

prisma/
├── schema.prisma             # Database schema source of truth

scripts/
├── deploy_n8n_workflow_mcp.ps1
├── deploy_n8n_workflow_mcp.sh
├── *.ts

lib/
├── prisma.ts
├── server/
├── storage/
├── supabase/
├── natural-storefront/

components/
├── ui/
```

---

## 7) n8n Operational Policy

Live n8n is the operational source of truth.

Always inspect the live workflow before editing local workflow artifacts.

### Deployment priority

Use this exact order:

1. MCP.
2. n8n API.
3. VPS/SSH only as last resort.

### Default deterministic paths

```bash
# PowerShell preferred path
scripts/deploy_n8n_workflow_mcp.ps1

# Bash / WSL wrapper
scripts/deploy_n8n_workflow_mcp.sh
```

### Before editing workflows

- Inspect live workflow state first.
- Use existing workflows as examples and patterns.
- Prefer these references first:
  - Tobias folder/workflows.
  - Hernan folder/workflows.
  - EMAG example workflows.
- Check `automation/n8n/README.md` for endpoint documentation.
- Use `.wa_inbound_live.json` only as a reference for live state when available.

### Key workflows

- `ordenya-wa-inbound-router`
  - Live name: `MAMAYUCCA - WA Inbound Router`
- `ordenya-reorder-diffusion`
  - Live name: `MAMAYUCCA - Reorder Diffusion`
- `ordenya-dispatch-status-outbound`
  - Live name: `MAMAYUCCA - Dispatch Status Outbound`
- `ordenya-mp-webhook-relay`
- `ordenya-whatsapp-instance-sync`

### After deploying workflows

Verify:

- Workflow content markers.
- No JSON parse errors.
- Expected activation state.
- Intended change is present.
- Runtime validation only when applicable and safe.

### Workflow update order

When replacing or updating an n8n workflow from JSON or source, always use:

1. MCP.
2. n8n API.
3. VPS/SSH as last resort.

---

## 8) Database Policy

The project uses Prisma + PostgreSQL/Supabase.

### Key models

- `Tenant`
- `Order`
- `OrderItem`
- `OrderStatusHistory`
- `Client`
- `Product`
- `Vendor`
- `Distributor`
- `ConversationThread`
- `ConversationMessage`
- `EcommerceCustomerAccount`
- `EcommerceCart`

### Rules

- Multi-tenant by default: most queries require `tenantId`.
- Check Prisma relations before changing schema.
- Cascading deletes are common; inspect before mutating.
- Prefer bounded queries.
- For cleanup/query ops, always return pre/post counts.
- Use production migrations carefully:
  - Development: `pnpm prisma:migrate:dev`
  - Production: `pnpm prisma:migrate:deploy`

---

## 9) Environment & Configuration

Required local file:

```bash
.env.local
```

Copy from:

```bash
.env.example
```

### Important environment variables

```bash
DATABASE_URL=
DIRECT_URL=

MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=

BOT_API_SECRET=
BOT_EVENTS_WEBHOOK_URL=
ORDENYA_APP_URL=
MERCADO_PAGO_ACCESS_TOKEN=

NATURAL_AUTH_JWT_SECRET=
```

### Vercel environment variables used by MAMAYUCCA

```txt
MERCADO_PAGO_ACCESS_TOKEN
BOT_EVENTS_WEBHOOK_URL
BOT_API_SECRET
AFIP_INTEGRATION_MODE
AFIP_WSAA_PROD_URL
AFIP_WSFE_PROD_URL
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
AFIP_CUIT
AFIP_POINT_OF_SALE
AFIP_CERT_PATH
AFIP_KEY_PATH
AFIP_ISSUER_BUSINESS_NAME
AFIP_ISSUER_COMMERCIAL_ADDRESS
AFIP_ISSUER_IVA_CONDITION
AFIP_ISSUER_GROSS_INCOME
AFIP_ISSUER_ACTIVITY_START
NEXT_PUBLIC_SUPABASE_DOCS_BUCKET
AFIPSDK_ACCESS_TOKEN
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_URL
POSTGRES_DATABASE
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_PRISMA_URL
POSTGRES_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
SUPABASE_ANON_KEY
SUPABASE_JWT_SECRET
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Secrets policy

Do not hardcode secrets, passwords, JWTs, tokens or private keys in `AGENTS.md`.

If credentials are needed:

- Check `.env`.
- Check `.env.local`.
- Check Vercel environment variables.
- Check the configured secret store.
- Never commit secrets.
- Never print full secrets in logs or final reports.

---

## 9.5) Security & Secrets Policy (CRITICAL)

### Hardcoded Credentials Rule

NEVER commit scripts or code with hardcoded credentials, passwords, tokens, or API keys.

**Forbidden:**

- Scripts with `PASSWORD = 'actual-password'`.
- API keys in source code.
- Database URLs with credentials.
- JWT tokens in configuration files.

**Correct:**

- Use `.env.local` for local development.
- Use environment variables: `os.environ.get('VAR_NAME')`.
- Use prompt input: `getpass.getpass('Enter password: ')`.
- Use Docker secrets or secret management tools in production.

### Temporary Scripts Rule

Scripts created for debugging, deployment, checks, data fixes, migrations, VPS operations, or one-time execution MUST NOT be committed.

Temporary Python files are allowed only as disposable execution helpers.

Required behavior:

1. Prefer inline commands when possible:
   - `python -c "..."`
   - heredoc execution.
   - existing project scripts.

2. If a temporary Python file is necessary, create it outside the repository:
   - Linux/VPS: `/tmp/temp_<purpose>.py`
   - Windows: `$env:TEMP\temp_<purpose>.py`

3. If a temporary Python file must be created inside the repository, the agent MUST:
   - explain why it is necessary,
   - add it to `.gitignore` before execution,
   - ensure it is not staged,
   - delete it immediately after it completes its function.

4. As soon as the temporary Python file finishes executing, whether it succeeds or fails, the agent MUST delete it immediately.

5. The agent MUST verify deletion before continuing:
   - Linux/VPS: `test ! -f /tmp/temp_<purpose>.py`
   - Windows PowerShell: `Test-Path $env:TEMP\temp_<purpose>.py`

6. Temporary Python files MUST NOT remain in the repository, VPS working directory, deployment folder, or scripts folder after use.

7. Never commit files named:
   - `debug_*.py`
   - `temp_*.py`
   - `check_*.py`
   - `fix_*.py`
   - `oneoff_*.py`
   - `tmp_*.py`

8. Never create temporary Python files with hardcoded credentials, passwords, tokens, database URLs, API keys, or private keys.

9. If the logic is useful permanently, convert it into a properly named project script with:
   - no secrets,
   - safe environment variable usage,
   - clear purpose,
   - validation,
   - and explicit user approval before committing it.

### Pre-Commit Checklist

Before every commit, verify:

```bash
# Check for hardcoded secrets
grep -r "PASSWORD.*=" scripts/ --include="*.py" --include="*.ts" --include="*.js"
grep -r "<VPS_IP_OR_HOST>" . --include="*.py" --include="*.ts"
grep -r "Bearer eyJ" . --include="*.md" --include="*.json"

# Check what you're committing
git diff --cached --name-only
```

### If Secrets Are Committed

1. IMMEDIATELY rotate/revoke the exposed credentials.
2. Change passwords, tokens and API keys.
3. Do NOT rely on git history cleanup alone.
4. Treat it as a security incident and assume credentials are compromised.

---

## 10) Connection References

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

---

## 11) Next.js Config Notes

Current known quirks:

- `ignoreBuildErrors: true`
  - TypeScript errors may not block production build.
- `images.unoptimized: true`
  - Static image optimization is disabled.
- Path alias:
  - `@/*` maps to repository root.

---

## 12) Minimal-Change Rule

Always choose the least invasive path that safely completes the task.

Prefer:

- Reading live state first.
- Targeted updates.
- Built-in platform mechanisms.
- Reproducible validation.
- Minimal operational steps.
- Root-cause fixes.
- Preserving user data.
- Preserving previous commits/releases.

Avoid:

- Unnecessary infrastructure operations.
- Installing extra tools without need.
- Broad refactors when a targeted fix is enough.
- Changes outside the requested scope.
- Cosmetic patches that hide the real issue.
- Editing JSON workflow exports directly when `.ts` workflow sources should be changed.
- Replacing old work without comparing and merging.
- Destructive git commands unless explicitly authorized.

### Additional Constraints

- **Never create temporary debug scripts in the repository** - use `/tmp/` or memory.
- **Never hardcode production credentials** - always use env vars or prompts.

---

## 13) Workspace Scope To Always Consider

This workspace may involve:

- Full CRM/ERP application.
- Admin dashboard.
- E-commerce storefront.
- APIs under `app/api`.
- n8n automations under `automation/n8n`.
- WhatsApp bot routing and state handling.
- Supabase-backed operational data.
- Mercado Pago webhooks.
- AFIP-related internal receipt/facturation configuration.
- Vercel deployment.
- VPS-hosted automation infrastructure.

---

## 14) Mandatory Git Synchronization Protocol

Before deployment, release comparison or any VPS production change, the repository must be committed and synchronized first.

### Required order

1. Inspect local git status.
2. Inspect current branch.
3. Inspect recent commits.
4. Fetch remote state.
5. Compare local branch against remote branch.
6. Confirm all intended changes are present locally.
7. Commit the current changes.
8. Pull/merge remote changes if needed.
9. Resolve conflicts preserving both useful sides whenever possible.
10. Push the final synchronized branch.
11. Confirm the remote contains the final commit.

### Required inspection commands

```bash
git status
git branch --show-current
git log --oneline --decorate -n 10
git remote -v
git fetch --all --prune
git log --oneline --decorate --graph --all -n 20
```

### Commit flow

When changes are ready:

```bash
git add .
git commit -m "<clear message>"
git pull --rebase
git push
```

If rebase is unsafe, confusing, or conflicts are complex, prefer a normal merge that preserves history:

```bash
git pull --no-rebase
```

### Remote mismatch rule

If local and remote are not synchronized:

- Do not overwrite remote work.
- Do not replace older commits.
- Do not discard remote changes.
- Merge/combine the missing work.
- Preserve old useful code unless the user explicitly asks to remove it.
- If conflicts appear, resolve them by keeping the intended new change and any still-useful previous logic.

### Forbidden destructive git commands

Never use these unless the user explicitly authorizes them:

```bash
git reset --hard
git push --force
git clean -fd
git checkout -- .
git restore .
```

### Required evidence before deployment

Before touching VPS deployment, the agent must be able to report:

- Current branch.
- Latest local commit.
- Latest remote commit.
- Whether local and remote match.
- Whether a merge/rebase was needed.
- Whether conflicts appeared.
- Confirmation that final work was pushed.

---

## 15) Mandatory Git → Release → VPS Deployment Protocol

After completing and pushing any production-relevant code change, the agent MUST deploy the synchronized commit to the VPS following the Git → Release → VPS Deployment Protocol, unless the user explicitly says not to deploy.

However, deployment is strictly forbidden until the agent has completed all repository, release, and VPS consistency checks.

Before deploying, the agent MUST:

1. Verify the local working tree, current branch, latest commit, and pending changes.
2. Commit all valid local changes with a clear message.
3. Push the commit to the remote repository.
4. Fetch and compare the local branch against the remote branch.
5. Confirm that the pushed commit exists in the remote repository.
6. Inspect existing GitHub releases, tags, and/or deployment references.
7. Compare the latest local commit, latest remote commit, latest release, and current VPS deployed version.
8. Determine whether the VPS is behind, ahead, divergent, or already synchronized.
9. If the VPS or release contains changes that are not present locally or remotely, the agent MUST NOT overwrite them.
10. If there are unsynchronized or divergent changes, the agent MUST merge, preserve, or manually reconcile them before deployment.
11. The agent MUST never replace, delete, reset, or overwrite existing production code, releases, uploads, data, environment files, or deployment artifacts unless the user explicitly authorizes that destructive action.
12. Before deployment, the agent MUST create a backup of the current VPS production state, including the deployed directory, relevant configuration files, environment files, and any deployment metadata.
13. Before deployment, the agent MUST create or update a release/tag that points to the exact synchronized commit being deployed.
14. Only after the commit, remote repository, release, and VPS state are confirmed to be consistent may the agent deploy to the VPS.
15. After deployment, the agent MUST verify health checks, logs, running services, public endpoints, and the deployed commit/version.
16. If deployment fails or health checks fail, the agent MUST rollback using the backup or previous release and report the failure clearly.

The agent MUST treat deployment as a preservation-first process. Existing production state must be protected. The correct order is always:

Local changes → Commit → Push → Fetch/compare remote → Inspect releases → Inspect VPS state → Compare all versions → Backup VPS → Create/update release → Deploy synchronized commit → Verify health → Rollback if needed.

---

- Pass credentials via:
  - Command line: `--password "$ENV:ORDENYA_VPS_PASSWORD"`
  - Environment variable: `ORDENYA_VPS_PASSWORD`
  - Interactive prompt, safest.
- NEVER create new Python/Shell scripts with hardcoded credentials for one-time operations.
- If you must create a temporary script:
  1. Create it in `/tmp/` on the VPS, not in the repository.
  2. Or use `python -c "..."` inline commands.
  3. Delete immediately after use.

### 15.1) Commit and sync repository first

Before touching the VPS, ensure the repository is correctly updated.

Required steps:

1. Inspect current git state.
2. Confirm all intended changes are present locally.
3. Create a new commit with the current changes.
4. Ensure the commit is uploaded to the remote repository.
5. Do not overwrite, replace, reset or discard older commits/releases unless the user explicitly requests it.
6. If there are remote changes that are not synchronized locally, merge them instead of replacing them.
7. If there are conflicts, resolve them preserving both useful sides whenever possible.
8. Confirm the final branch contains:
   - The latest local changes.
   - The latest remote changes.
   - No accidental loss of previous work.

Recommended verification:

```bash
git status
git log --oneline --decorate -n 10
git branch --show-current
git remote -v
```

If remote sync is required:

```bash
git fetch --all --prune
git status
git log --oneline --decorate --graph --all -n 20
```

When changes are ready:

```bash
git add .
git commit -m "<clear message>"
git pull --rebase
git push
```

If rebase is unsafe or conflicts are complex, prefer a normal merge that preserves history:

```bash
git pull --no-rebase
```

Never use destructive commands such as these unless the user explicitly authorizes them:

```bash
git reset --hard
git push --force
git clean -fd
```

---

### 15.2) Compare repository commits with VPS releases

Only after the repository is committed and synchronized, inspect the VPS state.

Required VPS checks:

1. Check current deployed release.
2. Check current running containers/processes.
3. Check existing release folders or deployment history.
4. Compare the VPS deployed version against the latest repository commits.
5. Confirm whether the VPS matches the latest valid release/commit.
6. If the VPS release appears outdated, compare it with the latest commits and nearby releases.
7. If there are VPS-side changes or releases that look newer or partially unsynchronized, do not overwrite them blindly.
8. Attempt to merge/combine useful changes from the release that most closely matches the latest commit.
9. Preserve old releases until the new deploy is verified.

Recommended checks:

```bash
pwd
ls -la
git status || true
git log --oneline --decorate -n 10 || true
docker ps
docker compose ps || true
```

If the VPS uses release folders:

```bash
ls -lah /opt
find /opt -maxdepth 3 \( -type d -iname "*release*" -o -type d -iname "*current*" \)
```

The conclusion before deploy must clearly state:

- Latest repo commit.
- Current VPS release/commit.
- Whether they match.
- Whether anything had to be merged.
- Whether it is safe to deploy.

---

### 15.3) Merge/Combine unsynchronized release differences before deploy

If the VPS has a release that does not match the latest commit, do not deploy blindly.

Required behavior:

1. Identify whether the VPS release contains useful changes missing from the repository.
2. Compare the VPS release with the latest repository commit.
3. If differences are relevant, merge/combine them into the repository.
4. Commit the merged result.
5. Push the merged result.
6. Re-run the comparison between:
   - Latest repository commit.
   - Current VPS release.
   - Intended deploy release.
7. Only continue when the intended deploy version is confirmed safe.

Useful commands:

```bash
git diff
git diff --stat
git log --oneline --decorate --graph --all -n 30
```

If the VPS does not use git but has release folders, compare folders using safe read-only commands:

```bash
diff -qr /opt/<app>/current /opt/<app>/<candidate-release> || true
```

Do not delete, replace or overwrite a VPS release before backup and verification.

---

### 15.4) Deploy only after repo and VPS release comparison are correct

Deploy to VPS only when:

1. The repository has a fresh commit.
2. The commit is uploaded to remote.
3. Local and remote are synchronized.
4. VPS current state was inspected.
5. VPS release/current deployment was compared with the latest commits.
6. Any unsynchronized release/code differences were merged or explicitly preserved.
7. A backup was created.

Before deployment, create a backup of the current VPS state.

Backup should include, when applicable:

- Current release folder.
- Current `.env` or environment references without printing secrets.
- Current Docker Compose file.
- Current container/image metadata.
- Database backup only if the deploy touches schema/data.

Example backup pattern:

```bash
mkdir -p /root/backups
tar -czf /root/backups/app-before-deploy-$(date +%Y%m%d-%H%M%S).tar.gz /opt/<app>/current
docker ps > /root/backups/docker-ps-before-deploy-$(date +%Y%m%d-%H%M%S).txt
docker images > /root/backups/docker-images-before-deploy-$(date +%Y%m%d-%H%M%S).txt
```

Do not expose secrets in logs or final reports.

---

### 15.5) VPS deploy verification

After deployment, verify health before considering the task complete.

Required checks:

1. Confirm containers/processes are running.
2. Confirm application health endpoint or main URL responds.
3. Confirm logs do not show startup crashes.
4. Confirm the deployed version corresponds to the expected latest commit/release.
5. Confirm critical user-facing flow still works when applicable.

Recommended checks:

```bash
docker ps
docker compose ps || true
docker logs --tail=100 <container_name>
curl -I https://<app-url>
curl -fsS https://<app-url>/api/health || true
```

Final report must include:

- Commit hash deployed.
- Remote branch used.
- VPS previous release/current state.
- Backup path created.
- Deploy command used.
- Health check result.
- Any pending issue or warning.

---

### 15.6) Rollback rule

If health checks fail after deployment:

1. Stop the new release safely.
2. Restore the previous release from backup.
3. Restart services.
4. Verify health again.
5. Report clearly:
   - What failed.
   - Which backup was restored.
   - Current running version.
   - What remains pending.

Never leave the VPS in an unknown or partially deployed state.

---

## 16) Testing & Verification

No formal test suite is guaranteed.

Use the best available verification for the task.

### General verification

```bash
pnpm lint
pnpm build
```

### React verification

```bash
pnpm doctor:react
pnpm doctor:react:diff
```

### Prisma verification

```bash
pnpm prisma:generate
pnpm prisma:migrate:deploy
```

Only run migrations when the task actually requires schema changes.

### n8n verification

Verify:

- Workflow content markers.
- Expected activation state.
- No JSON parse errors.
- Relevant node/config changes exist.
- Runtime validation only when safe.

### Database verification

Return:

- Pre-change counts.
- Post-change counts.
- Affected IDs when safe.
- Status flags.
- Timestamps.
- Query result samples when useful.

### VPS verification

Return:

- Current deployed commit/release.
- Previous deployed commit/release.
- Backup path.
- Running containers/processes.
- Health endpoint result.
- Relevant logs summary.

---

## 17) Deployment

### App

Production is deployed on Vercel:

```txt
https://mamayucca.vercel.app/
```

### n8n

Self-hosted:

```txt
https://n8n.zubuagency.com
```

### WhatsApp

Evolution API instance:

```txt
tarnowski5
```

### VPS

Use VPS only when required, requested or when Vercel/n8n/API/MCP mechanisms cannot complete the task.

Before every VPS deploy, the mandatory order is:

1. Commit local changes.
2. Push to remote.
3. Merge remote changes if unsynchronized.
4. Inspect VPS state.
5. Compare VPS release with latest commits.
6. Merge/combine release differences if needed.
7. Backup current VPS state.
8. Deploy.
9. Verify health.
10. Rollback if health fails.

---

## 18) Common Gotchas

1. Use `pnpm` only.
2. Do not use `npm` or `yarn`.
3. TypeScript errors may not block build.
4. n8n live workflows must be inspected before editing.
5. n8n workflow `.ts` sources are preferred over exported JSON.
6. Most data queries require `tenantId`.
7. Bot API endpoints live under `/api/bot/*`.
8. Bot API endpoints are protected by `BOT_API_SECRET`.
9. JSON workflow exports are references unless the task explicitly requires direct JSON handling.
10. Always preserve production data unless the user explicitly requests destructive operations.
11. For live workflow mutations, keep backups first.
12. Do not expose or commit secrets.
13. Do not deploy to VPS before committing and pushing repository changes.
14. Do not overwrite old VPS releases blindly.
15. If VPS and repo are unsynchronized, compare and merge/combine before deploying.
16. Always create a backup before VPS deployment.
17. Always run health checks after deployment.
18. If health fails, rollback immediately.

---

## 19) Delivery Standard For Every Task

Every final response must include:

- Objective completed.
- What changed.
- Files/workflows/data touched.
- How it was verified.
- Evidence from verification.
- What remains pending, if anything.
- Whether MCP, API, Vercel, local repo or VPS was used.

For VPS deployments, always confirm:

- Repository was committed first.
- Commit was pushed to remote.
- Local and remote were synchronized.
- VPS release was compared against the latest commits.
- Unsynchronized release differences were merged or preserved.
- Backup was created.
- Deploy was completed.
- Health checks passed.
- Rollback status if anything failed.

Be production-safe, explicit and minimal.