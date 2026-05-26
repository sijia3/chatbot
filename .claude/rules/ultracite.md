# Ultracite — Code Quality Rules

This project uses [Ultracite](https://ultracite.dev) (Biome-based) for linting and formatting. Follow these rules when writing code.

## TypeScript

- No `any` type — use proper types or `unknown`
- No `!` non-null assertions — use proper null checks
- No enums — use `as const` objects or string unions
- No namespaces — use ES modules
- Use `import type` / `export type` for type-only imports/exports
- No empty interfaces — use `type` aliases instead
- Use `T[]` consistently (not `Array<T>`)
- Don't add type annotations on variables initialized with literals (let inference do the work)
- No `@ts-ignore` — fix the error instead

## React & JSX

- Don't define components inside other components
- Always include `key` prop in iterators (not array index)
- Use `<>...</>` not `<Fragment>...</Fragment>`
- Don't spread props on native elements unsafely
- Self-closing tags for components without children: `<Foo />`
- All hooks dependencies must be correctly specified
- Call hooks only at top level of components

## Next.js

- Use `<Image>` from `next/image`, not `<img>`
- Use `next/head` or Metadata API, not `<head>` element

## Accessibility (a11y)

- No `accessKey` on HTML elements
- Interactive elements must be focusable with keyboard handlers
- `<button>` must have explicit `type` attribute
- `<html>` must have `lang` attribute
- No `tabIndex` with positive integers
- No `aria-hidden="true"` on focusable elements
- `onClick` on non-interactive elements must have `onKeyUp`/`onKeyDown`/`onKeyPress`
- Always include `title` for SVG elements and `<iframe>`
- Links must have accessible content (text or aria-label)
- `target="_blank"` must have `rel="noopener"`

## Code Style

- Use `const` for variables assigned only once; no `var`
- Use arrow functions over function expressions
- Use `===` and `!==` (not `==`/`!=`)
- Use template literals for string interpolation
- Use optional chaining (`?.`) instead of chained `&&` checks
- Use `for...of` instead of `Array.forEach`
- No `else` when `if` block returns/breaks
- No `console` — use proper logging
- No `debugger` statements
- No reassigning function parameters
- No nested ternary expressions
- No `delete` operator — use destructuring or `Set`/`Map`
- Use object spread instead of `Object.assign()`
- Use `new Error(...)` with a message string when throwing
- Default clauses in `switch` must come last
- Radix argument required for `parseInt()`
- No `await` inside loops — use `Promise.all()` or similar

## Safety

- No `eval()`
- Handle all Promise rejections — don't leave Promises floating
- No `__dirname` / `__filename` in global scope
- No import cycles
- No hardcoded secrets, API keys, or tokens
- Exhaustive `switch` statements
- Use `isNaN()` not `=== NaN`
- Don't use `Object.prototype` builtins directly
