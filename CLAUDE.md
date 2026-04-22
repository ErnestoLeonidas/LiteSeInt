# CLAUDE.md

Guía de contexto para Claude Code al trabajar en este repositorio.

## Approach

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read unless the file may have changed.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.

## Output

- Return code first. Explanation after, only if non-obvious.
- No inline prose inside code unless it is an actual code comment.
- Use comments sparingly. Only where logic is unclear.
- No boilerplate unless explicitly requested.
- When modifying files, show the exact changed blocks or a focused diff when possible.
- Do not dump entire files unless the user asks for the full file.

## Project Snapshot

LiteSeInt is a browser-based pseudocode interpreter for educational use.

Current architecture:

- `index.html`: full UI shell, CSS theme, editor overlays, console, toolbar, examples, and UI controller logic
- `LiteSeInt.js`: interpreter core, execution flow, expression evaluation, runtime checks, callback-based bridge to UI
- `doc_errores.js`: tokenizer, static validator, symbol table, line/column error ranges, helpers for autocomplete and editor decorations
- `README.md`: user-facing project overview
- `CHANGELOG.md`: notable changes by version

## Core Architecture Rules

- Respect layer boundaries.
- `doc_errores.js` must not depend on DOM, jQuery, Bootstrap, or UI state.
- `LiteSeInt.js` must remain UI-agnostic. No direct DOM access.
- `index.html` is allowed to orchestrate UI, visual state, events, overlays, tooltips, console, and editor interactions.
- Do not move validation logic into the UI.
- Do not duplicate parser or validation rules across files unless strictly necessary.
- If a rule belongs to lexical analysis or static validation, put it in `doc_errores.js`.
- If a rule belongs to execution semantics, put it in `LiteSeInt.js`.
- If a rule belongs to presentation only, keep it in `index.html`.

## Language Model of the Project

Supported language elements currently include:

- `Definir`
- `Escribir`
- `Leer`
- assignment with `=`
- types: `Entero`, `Real`, `Caracter`
- comments with `//`
- arithmetic expressions with precedence and parentheses
- string literals with double quotes

Use the current naming conventions:

- `Caracter`, not `Cadena`
- `LiteSeInt`, not old project names
- pseudocode syntax should match the current interpreter behavior, not generic PSeInt assumptions

## File-Specific Guidance

### `doc_errores.js`

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

### `LiteSeInt.js`

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

### `index.html`

This file currently contains:

- app layout
- theme variables
- responsive CSS
- editor overlay system
- line gutter
- syntax highlighting layer
- error underline layer
- console UI
- autocomplete UI
- example loading
- full UI controller logic

Rules:

- Prefer focused edits. This file is large and mixes CSS, HTML, and JS intentionally.
- Do not split this file into multiple files unless the user explicitly asks for a restructure.
- Preserve overlay stacking and scroll sync behavior.
- Preserve the error visual lifecycle:
  - errors appear after execute
  - editing invalidates visual errors immediately
- Preserve mobile behavior unless the user asks otherwise.
- If changing toolbar or controls, verify the mobile breakpoint behavior too.

## Editor and UI Invariants

- Syntax highlight is a visual layer over a transparent textarea.
- Error decorations are separate from syntax highlighting.
- Execution highlight is separate from error highlight.
- Error badges and tooltips are tied to per-line overlay elements.
- Scroll positions across editor, gutter, syntax layer, and error layer must stay synchronized.
- Autocomplete must not activate inside strings or comments.
- Clearing the console currently also invalidates visual error state. Do not change this silently.
- The minimum visible editor line count is intentional.

## Validation and Execution Rules

When adding or changing language behavior:

1. Update static analysis in `doc_errores.js`
2. Update runtime semantics in `LiteSeInt.js` if needed
3. Update syntax highlight or autocomplete in `index.html` if the token model changed
4. Update examples if the feature is user-visible
5. Update `README.md` if the feature changes supported syntax or usage
6. Update `CHANGELOG.md` for notable user-visible changes

Never implement a language feature in only one layer if it affects parsing, validation, and execution.

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
- No docstrings or type annotations on untouched code.
- No speculative refactors.

### CSS

- Reuse existing CSS variables from `:root`.
- Preserve the current visual language: dark terminal-like UI, monospaced typography, restrained neon accents.
- Do not introduce random one-off colors when a variable already exists.
- Keep responsive behavior intact.
- For mobile fixes, patch the smallest relevant rule set first.

### HTML/UI text

- Keep labels in Spanish, matching the current UI.
- Keep internal code identifiers consistent with existing project naming.
- Do not silently rename visible UI text unless requested.

## Review Rules

- State the bug.
- Show the fix.
- Stop.
- No extra suggestions outside scope.
- No praise, no filler.

## Debugging Rules

- Never speculate without reading the relevant code first.
- State what you found, where it is, and the fix.
- If the root cause is uncertain, say so.
- Do not invent causes to sound confident.

## Testing Rules

Before declaring a change done, validate the affected behavior with focused examples.

Minimum manual checks when relevant:

- `Definir` with one and multiple variables
- duplicate variable declarations
- reserved words used as variables
- `Escribir` with strings, variables, numbers, and comma-separated expressions
- unclosed double quotes
- adjacent value tokens missing a comma
- `Leer` with valid and invalid input by type
- assignment with arithmetic expressions and parentheses
- undefined variable usage
- uninitialized variable usage
- comments with `//`
- runtime stop flow if the change touches execution
- mobile layout if the change touches toolbar, panels, spacing, or controls

Do not claim something is fixed if you did not verify the exact path affected.

## Preferred Change Strategy

- Smallest correct patch first.
- Preserve architecture.
- Preserve user-visible behavior unless the requested fix changes it.
- Avoid broad rewrites in `index.html`.
- Do not rename functions, variables, or selectors without reason.
- Do not change public behavior and internal structure in the same patch unless necessary.

## Documentation Discipline

Update docs when behavior changes:

- `README.md` for user-facing features, syntax, usage, architecture overview
- `CHANGELOG.md` for notable changes
- `CLAUDE.md` only when working conventions or architecture expectations change

If the change is purely internal and not user-visible, avoid unnecessary README edits.

## Non-Goals

- Do not add frameworks.
- Do not migrate to TypeScript unless explicitly requested.
- Do not split the monolithic UI file unless explicitly requested.
- Do not redesign the product while fixing a bug.
- Do not add features that were not requested.
- Do not "clean up" unrelated code.

## Simple Formatting

- No em dashes, smart quotes, or decorative Unicode symbols.
- Plain hyphens and straight quotes only.
- Natural language characters are fine when content requires them.
- Code output must be copy-paste safe.

## Definition of Done

A task is done when:

- the relevant file(s) were actually read
- the smallest correct change was made
- the affected flow was tested
- output is concise and directly usable
- no unrelated code was changed
