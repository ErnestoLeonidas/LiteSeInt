# CLAUDE.md

Contexto permanente para Claude Code al trabajar en este repositorio.

## Working Style

- Read the relevant files before editing.
- Prefer the smallest correct patch over broad rewrites.
- Preserve existing behavior unless the request changes it.
- Test the exact affected flow before declaring done.
- Keep output concise and directly useful.
- User instructions always override this file.

## Project Snapshot

LiteSeInt is a browser-based pseudocode interpreter for educational use.

Current file ownership:

- `index.html`: app shell and script loading
- `css/styles.css`: visual system and responsive layout
- `js/app.js`: UI controller, editor behavior, console, autocomplete, examples, visual state
- `js/doc_errores.js`: tokenizer, static validator, symbol table, exact error ranges, autocomplete helpers
- `js/LiteSeInt.js`: parser, AST, runtime execution, expression evaluation, runtime checks
- `README.md`: user-facing documentation
- `CHANGELOG.md`: notable visible changes

## Core Architecture Rules

- Respect layer boundaries.
- `js/doc_errores.js` must not depend on DOM, jQuery, Bootstrap, or UI state.
- `js/LiteSeInt.js` must remain UI-agnostic. No direct DOM access.
- `js/app.js` owns UI orchestration and should consume the validator and runtime instead of reimplementing them.
- `index.html` should stay focused on shell markup and loading, not absorb language logic.
- Do not move validation logic into the UI.
- Do not duplicate parser or validation rules across files unless strictly necessary.
- If a rule belongs to lexical analysis or static validation, put it in `js/doc_errores.js`.
- If a rule belongs to execution semantics, put it in `js/LiteSeInt.js`.
- If a rule belongs to UI behavior or examples, put it in `js/app.js`.
- If a rule belongs to presentation only, keep it in HTML/CSS.

## Current Language Surface

Supported language elements currently include:

- `Definir`
- `Escribir`
- `Leer`
- assignment with `=`
- comments with `//`
- types: `Entero`, `Real`, `Caracter`, `Logico`
- boolean literals: `Verdadero`, `Falso`
- arithmetic expressions with precedence and parentheses
- relational operators: `==`, `!=`, `<>`, `<`, `>`, `<=`, `>=`
- logical operators: `Y`, `O`, `No`
- control structures:
  - `Si / Sino / FinSi`
  - `Mientras / FinMientras`
  - `Repetir / HastaQue` with `Hasta Que` accepted as alias
  - `Para / FinPara`
  - `Segun / De Otro Modo / FinSegun`

Use the current naming conventions:

- `Caracter`, not `Cadena`
- `LiteSeInt`, not old project names
- Match the current interpreter behavior, not generic PSeInt assumptions

## File-Specific Guidance

### `js/doc_errores.js`

This file owns:

- tokenization by line
- static validation of full documents
- symbol table tracking
- exact error objects with line and column ranges
- helpers for autocomplete support
- helpers for editor decoration inputs

Rules:

- Keep token definitions centralized.
- Preserve exact ranges: `linea`, `columnaInicio`, `columnaFin`.
- Prefer deterministic validation over heuristic guessing.
- Validation errors should be specific and actionable.
- If adding syntax, update tokenizer, validator, and helper behavior together.
- Avoid UI-oriented language or DOM assumptions here.
- Keep helpers generic and reusable.

### `js/LiteSeInt.js`

This file owns:

- execution lifecycle
- line-by-line interpretation
- runtime callbacks
- variable state during execution
- expression evaluation
- runtime type conversion and input validation

Rules:

- Keep the core independent from the browser UI.
- Use callbacks for output, input, error reporting, active line, system messages, and finish events.
- Runtime errors should be explicit and match the language model.
- Do not reimplement static validation here unless needed for runtime safety.
- If runtime semantics change, keep them aligned with static validation expectations.

### `js/app.js`

This file owns:

- editor event wiring
- console flow and inline input UX
- autocomplete UI and suggestion rendering
- example loading
- visual error lifecycle
- execution status and toolbar state

Rules:

- Reuse helpers from `js/doc_errores.js` and `js/LiteSeInt.js` instead of duplicating language rules.
- Preserve the current console, editor, overlay, and autocomplete flows unless the request changes them.
- If a user-visible language feature changes, update examples and relevant autocomplete entries here.

### `index.html`

Rules:

- Prefer focused edits.
- Do not turn it back into a monolithic UI controller file.
- Keep labels in Spanish unless the user asks otherwise.
- Update the visible app version only when the corresponding implementation is actually complete.

## Editor And UI Invariants

- Syntax highlight is a visual layer over a transparent textarea.
- Error decorations are separate from syntax highlighting.
- Execution highlight is separate from error highlight.
- Error badges and tooltips are tied to per-line overlay elements.
- Scroll positions across editor, gutter, syntax layer, and error layer must stay synchronized.
- Autocomplete must not activate inside strings or comments.
- Clearing the console currently also invalidates visual error state. Do not change this silently.
- Preserve mobile behavior unless the user explicitly asks otherwise.

## Language Change Workflow

For user-visible language changes, use the project skill `/liteseint-language-change` or follow the same workflow manually.

When adding or changing language behavior:

1. Update static analysis in `js/doc_errores.js`.
2. Update runtime semantics in `js/LiteSeInt.js`.
3. Update autocomplete, examples, or UI helpers in `js/app.js` if the feature is user-visible.
4. Update `README.md` if supported syntax or behavior changed.
5. Update `CHANGELOG.md` for notable visible changes.
6. Update the visible version in `index.html` only if the phase is actually complete.

Use `prompt_v*.txt` files at repo root as scope guards when the request maps to a planned phase.

## Error Handling Standards

- Prefer precise errors over generic ones.
- Use the existing error object shape.
- Preserve exact token ranges whenever possible.
- Keep messages short, direct, and tied to the actual issue.
- Distinguish clearly between:
  - variable not defined
  - variable not initialized
  - invalid syntax
  - invalid type input
  - unclosed string
  - missing comma for concatenation
  - runtime arithmetic errors

If an error should be visible in the editor, make sure the validation output still supports that flow.

## Style Rules

### JavaScript

- Use plain JavaScript. No frameworks.
- Keep existing code style unless changing a touched block consistently.
- Avoid unnecessary abstractions.
- Avoid introducing classes or utilities for one-off behavior.
- Prefer clear conditionals over clever compact code.
- No speculative refactors.

### CSS

- Reuse existing CSS variables from `:root`.
- Preserve the current visual language.
- Do not introduce random one-off colors when a variable already exists.
- Keep responsive behavior intact.

### UI Text

- Keep labels in Spanish.
- Keep internal identifiers consistent with existing project naming.
- Do not silently rename visible UI text unless requested.

## Documentation Discipline

- Update `README.md` for user-facing syntax, behavior, and usage changes.
- Update `CHANGELOG.md` for notable visible changes.
- Update `CLAUDE.md` only when repo conventions, architecture, or permanent guidance change.

## Non-Goals

- Do not add frameworks.
- Do not migrate to TypeScript unless explicitly requested.
- Do not split the project into a new architecture unless explicitly requested.
- Do not redesign the product while fixing a bug.
- Do not add unrelated features or cleanup.

## Definition Of Done

A task is done when:

- the relevant files were actually read
- the smallest correct change was made
- the affected flow was tested
- the response is concise and directly usable
- no unrelated code was changed
