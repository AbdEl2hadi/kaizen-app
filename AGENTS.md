# Agent Rules

## shadcn CLI

Always use `bunx shadcn@latest` (without `--bun`). The `--bun` flag causes bun to resolve the project's `zod@4` instead of shadcn's bundled `zod@3`, breaking `.deepPartial()`.
