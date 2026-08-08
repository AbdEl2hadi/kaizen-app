# hooks 

in (`/src/features/<feature>/hooks`)

## Philosophy

- Components should focus on rendering UI.
- Custom hooks should own state, business logic, form handling, API interactions, and event handlers.
- Keep hooks reusable, predictable..

## Hook Size

Hooks should remain easy to understand.
- make one larger hook
- Aim to keep hooks under **150 lines**.
- If a hook exceeds **150 lines**, split it into smaller hooks by responsibility.
- Compose specialized hooks instead of creating one monolithic hook.

## Hook Organization

Organize hooks in a consistent order:

1. Imports
2. Constants
3. Hook declaration
4. Other React hooks (`useState`, `useMemo`, `useCallback`, etc.)
5. Third-party hooks (Router, Query, Form, etc.)
6. Local state
7. Derived values
8. Event handlers
9. Effects
10. Return object


## State Management

- Keep state as local as possible.
- Avoid duplicated state.
- Prefer derived values over storing computed values.
- Do not store values that can be calculated.
- Expose only the state required by consumers.


## Side Effects

- Use `useEffect` only when necessary.
- Avoid unnecessary effects.
- Keep effects focused on one responsibility.
- Always clean up subscriptions, timers, and listeners.


## Event Handlers

- Prefer `useCallback` for handlers returned from hooks.
- Keep handlers small and focused.
- One handler should perform one action.

## Async Logic

- Keep asynchronous logic inside hooks.
- Handle loading, success, and error states.
- Never let components manage networking or business logic.
- Keep error handling centralized inside the hook whenever possible.

## hooks should : 
- Handle expected failures.
- Expose loading and error state.
- Convert low-level errors into meaningful messages.
- Never throw expected API errors unless explicitly required.

## Return Object

Return values in a consistent order:

1. Data
2. Derived values
3. Loading state
4. Error state
5. UI state
6. Actions
7. State setters (only if necessary)


## Naming

- Every custom hook must start with `use`.
- Use descriptive, intention-revealing names.
- Name hooks after the responsibility they encapsulate.

## Performance

- Use `useMemo` only for expensive computations.
- Use `useCallback` only when it provides value.
- Do not prematurely optimize.
- Avoid unnecessary state updates.


## Reusability

Before creating a new hook, check if similar logic already exists.

If the same logic appears in multiple places, extract it into a reusable hook.


## Avoid

- Business logic inside components.
- Returning values that are never used.
- Deeply nested logic.
- Duplicated logic across hooks.
- Unnecessary state.
- Hooks with excessive side effects.