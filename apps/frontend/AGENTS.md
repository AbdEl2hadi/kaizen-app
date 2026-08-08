# OpenCode Rules

## Tech Stack
- **Framework**: TanStack Start + TanStack Router
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + Shadcn UI
- **Package Manager**: Bun
- **Data Fetching & Validation**: Axios + TanStack React Query + Zod
- **icons** : Lucide icons (if the icons is deprecated use react-icons)
- **state management** : tanstack store
- **charts** : tanstack charts
- **toasts** : sonner from shadcn

## Build and test commands
- **Build**  : bun run build
- **Test**   : bun test
- **Lint**   : bun run lint --fix
- **routes** : bun run generate-routes 

## code Style 
- Functional components only. Never class components.
Use `const` exclusively. Never `var`, never `let` unless reassignment is needed.
Named exports only. Never default exports unless it needed.

// Component pattern:
```ts
    export const UserCard = ({ name, email }: UserCardProps) => {
        return <div className="p-4">{name}</div>;
    };
```
- Prefer early returns.
- Avoid deeply nested conditionals.
- Use descriptive names.
- Keep functions short and focused.
- Keep imports organized.
- Use consistent formatting. 

## Rule Modules
Detailed rules and reference code are organized in `.opencode/rules/`. Read the relevant module before starting a task:
- `.opencode/rules/architecture.md` — folder layouts and typing guidelines.
- `.opencode/rules/styling-theme.md` — dark/light mode setup and code.
- `.opencode/rules/api-handling.md` — Axios client, `ApiResponse<T>`, Query options, mutations.
- `.opencode/rules/env-handling.md` — env validation via zod in `src/lib/env.ts`.
- `.opencode/rules/error-handling.md` — error categories, loading/empty states, retry rules.
- `.opencode/rules/hooks.md` — custom hook structure, ordering, sizing, naming.
- `.opencode/rules/route-guarding.md` — `_auth` layout, `requireAuth`/`redirectIfAuth` guards.

## Constraints
- Never handle database or backend code (frontend only).
- Always use `bun` instead of `npm`/`pnpm`.
- Never commit .env or any file containing secrets.
- always validate search params with zod.
- Avoid unnecessary renders.

