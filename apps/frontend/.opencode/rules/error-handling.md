
# Handling errors

## General Principles

- Never silently ignore errors.
- Every error should be either handled, logged, or propagated.
- Show user-friendly error messages.
- Never expose internal implementation details to users.
- Prefer recovering from errors instead of crashing the application.
- in every catch write console.error('[client] : ' , err)

## Error Categories

Handle errors according to their type:

- Validation errors
- Network errors
- Authentication errors
- Authorization errors
- Server errors (5xx)
- Unexpected runtime errors

Each category should have an appropriate user experience.

## Async Code

- Always wrap asynchronous operations in `try/catch` when necessary.
- Never leave rejected promises unhandled.
- Surface meaningful errors to the caller.
- Return early when an operation fails.

## Components

Components should not contain complex error handling.

Instead:

- Receive error state from hooks.
- Render loading, empty, and error states.
- Keep UI logic separate from business logic.

## User Messages

Messages shown to users should be:

- Clear
- Short
- Actionable

Good:

- "Unable to load data."
- "Please check your internet connection."
- "Session expired. Please sign in again."

Avoid:

- Stack traces
- SQL errors
- Internal exception messages

## Forms

Display validation errors close to the relevant field.

- Validate before submission whenever possible.
- Show server validation errors clearly.
- Do not clear user input unnecessarily after failures.

---

## Loading & Empty States

Every asynchronous UI should consider:

- Loading state
- Success state
- Empty state
- Error state

Avoid rendering blank screens.

---

## Retry Strategy

Only retry operations when appropriate.

Good candidates:

- Temporary network failures
- Timeout errors

Do not automatically retry:

- Validation errors
- Authentication failures
- Permission errors

## Avoid

- Empty `catch` blocks.
- `console.error()` as the only error handling.
- Swallowing exceptions.
- Displaying raw backend messages directly to users.
- Duplicating error handling logic across components.
- Mixing business logic and UI error handling.