---
description: Project-specific rules and patterns for the Polling App with QR Code Sharing project.
globs:
  alwaysApply: true
---

## Project-Specific Rules:Snapvote a Polling App with QR Code Sharing

Follow these conventions in addition to the global architecture guidelines to ensure consistency and maintainability in this project.

---

### Folder Structure Rules
- All poll-related pages live under `/app/polls/` (e.g., `/app/polls/[id]/page.tsx` for viewing a poll).
- API routes (if needed beyond Server Actions) must live in `/app/api/` and follow resource-based naming (`/app/api/polls/route.ts`).
- Reusable UI components go into `/components/ui/`. Custom components go into `/components/`.

---

### Form Handling Rules
- Use **react-hook-form** with **shadcn/ui form components** for all interactive forms (e.g., poll creation, login).
- Validation should be defined with `zod` schemas and integrated via `@hookform/resolvers/zod`.
- Submit forms using **Next.js Server Actions** — do not post via client `fetch` requests.

---

### Supabase Usage Rules
- All authentication (sign-up, login, logout) must use the Supabase Auth client (`supabase.auth`).
- All database reads and writes must go through the Supabase client instance exported from `/lib/supabaseClient.ts`.
- Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) must only be accessed via environment variables — never hardcoded.

---

### Component Rules
- Use **Server Components** for fetching and displaying poll data.
- Use **Client Components** (`'use client'`) only for interactive elements (e.g., voting form, buttons with state).
- UI elements must use **shadcn/ui** where available for consistency (e.g., `<Button>`, `<Input>`, `<Form>`).

---

### Error Handling Rules
- All Supabase mutations must be wrapped in `try/catch` inside Server Actions.
- User-facing errors should be surfaced via `shadcn/ui` `FormMessage` or toast notifications.
- Route-level errors should use `error.tsx` in the corresponding `/app/polls/` or `/app/api/` segment.

---

## Verification Checklist
- Are all forms built with react-hook-form + shadcn/ui components?  
- Are all form submissions handled via Server Actions (no client fetch)?  
- Is Supabase the only database/auth interface, accessed through `/lib/supabaseClient.ts`?  
- Are all poll-related routes inside `/app/polls/`?  
- Are environment variables used for Supabase keys?  
