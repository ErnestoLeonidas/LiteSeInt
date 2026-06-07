# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Contexto permanente para Claude Code al trabajar en este repositorio.

## Commands

- `npm test` — runs `node tests/run-tests.js`, the full validator + runtime regression suite. This is the only npm script.
- Single test: there is no `--filter` flag. Either `grep` for the relevant case in `tests/run-tests.js` and read it, or temporarily comment out unrelated cases while iterating.
- Local app: this is a static site. Open `index.html` directly in a browser, or serve the folder (e.g. `python3 -m http.server`) — there is no build step.

## Working Style

- Read the relevant files before editing.
- Prefer the smallest correct patch over broad rewrites.
- Preserve existing behavior unless the request changes it.
- Test the exact affected flow before declaring done.
- For language or runtime changes, run `npm test`.
- Keep output concise and directly useful.
- User instructions always override this file.

## Project Snapshot

LiteSeInt is a browser-based pseudocode interpreter for educational use.

Current file ownership:

- `index.html`: app shell and script loading
- `css/styles.css`: visual system and responsive layout
- `js/app.js`: UI controller, editor behavior, console, autocomplete, examples, visual state
- `core/tokenizer.js`: lexical layer — token kinds (`TK`), per-line tokenizer, reserved-word/types/native-functions sets, cursor context, error factory, `stripComment`.
- `core/symbol-table.js`: `TablaSimbolos` and `ScopeChain` (single global scope in v1.1.0; chain ready for v1.8.0 subprocesos).
- `core/validator.js`: static validator and all `validar*` rules consuming the tokenizer and the symbol table.
- `core/doc_errores.js`: thin aggregator that re-exposes the public `DocErrores.{...}` contract consumed by `js/app.js`, the runtime and the tests.
- `core/ast.js`: AST node factories (`Programa`, `Definir`, `Asignar`, `Leer`, `Escribir`, `Si`, `Mientras`, `Repetir`, `Para`, `Segun`, `Caso`, `Desconocido`), `AST_VERSION` and JSON helpers. Spec lives in `shared/ast-contract.md`.
- `core/parser.js`: `parsearPrograma(codigo)` returns the `Programa` AST consumed by the runtime.
- `core/expression-evaluator.js`: shunting-yard pipeline, condition evaluator, `_OPERADORES` and `_FUNCIONES_NATIVAS` tables. Applied as a mixin onto `LiteSeInt.prototype`.
- `core/LiteSeInt.js`: runtime — walks the AST returned by `parsearPrograma`, owns execution state, callbacks and runtime-time errors.
- `js/ejercicios-data.js`: exercise definitions consumed by the UI and loaded into the test sandbox.
- `shared/ast-contract.md`: public contract of the AST. Update whenever a node is added, removed or its shape changes.
- `tests/run-tests.js`: Node-based regression tests for validator, parser, AST, runtime and exercise bank. Loads every `core/*.js` plus `js/ejercicios-data.js` into a `vm` context and exercises them via `DocErrores.validarDocumento`, `LiteSeIntParser.parsearPrograma`, `LiteSeIntSymbolTable.*` and `new LiteSeInt({...})` callbacks. New tests should follow the existing `validar(...)` / `ejecutar(...)` helper patterns at the top of the file.
- `package.json`: test script entrypoint
- `README.md`: user-facing documentation
- `CHANGELOG.md`: notable visible changes
- `EJERCICIOS.md`, `ejercicios/`: exercise documentation and assets
- `ROADMAP.md`: front/editor roadmap. Front occupies `v1.1.0` and `v1.6.0`–`v1.9.0` of the shared version line (the editor is built standalone, with no backend dependency, through `v1.9.0`).
- `roadmap_backend.md`: backend-only roadmap. Backend occupies `v1.2.0`–`v1.5.0` of the shared line and labels its deliverables `backend v0.1.0` → `backend v1.0.0`. `backend v1.0.0` must be ready when the front closes `v1.9.0`; integration is validated between front `v1.9.0` and `v2.0.0`.
- `prompt_v*.txt`: planned phases and per-phase scope guards (treat as source of truth when a request maps to one)

## Core Architecture Rules

- Respect layer boundaries.
- Nothing under `core/` may depend on DOM, jQuery, Bootstrap, or UI state.
- `core/LiteSeInt.js` must remain UI-agnostic. No direct DOM access.
- `js/app.js` owns UI orchestration and should consume the validator and runtime instead of reimplementing them.
- `index.html` should stay focused on shell markup and loading, not absorb language logic.
- Do not move validation logic into the UI.
- Do not duplicate parser or validation rules across files unless strictly necessary.
- Lexical rules go in `core/tokenizer.js`. Static validation rules go in `core/validator.js`. Both flow out through the `core/doc_errores.js` aggregator.
- AST shape changes go in `core/ast.js` and are documented in `shared/ast-contract.md`. The parser in `core/parser.js` produces them; the runtime in `core/LiteSeInt.js` consumes them.
- Execution semantics live in `core/LiteSeInt.js` and `core/expression-evaluator.js`.
- Symbol-table or scope-chain changes go in `core/symbol-table.js`.
- UI behavior or examples go in `js/app.js`. Presentation-only changes stay in HTML/CSS.

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

### `core/tokenizer.js`

Owns the lexical layer:

- per-line tokenization
- token kinds (`TK`)
- reserved-word, type and native-function sets
- cursor context and error factory
- `stripComment`

Rules:

- Keep token definitions centralized here.
- Pure functions; no DOM, no runtime state.

### `core/symbol-table.js`

Owns `TablaSimbolos` (per-scope variable map) and `ScopeChain` (stack of tables). In v1.1.0 there is only the global scope. Subprocesos in v1.8.0 will push/pop frames.

Rules:

- Pure data structures; no DOM, no I/O.
- Keep `lookup(nombre)` semantics (current frame down to global).

### `core/validator.js`

Owns static validation of full documents, exact error objects (`{linea, columnaInicio, columnaFin}`), and the helpers consumed by autocompletado and editor decorations.

Rules:

- Preserve exact ranges.
- Prefer deterministic validation over heuristic guessing.
- Validation errors should be specific and actionable.
- If adding syntax, update tokenizer, validator and the AST together.
- Avoid UI-oriented language or DOM assumptions.

### `core/doc_errores.js`

Thin aggregator. Re-exposes the public `DocErrores.{...}` contract consumed by `js/app.js`, the runtime and the tests. Do not add logic here — extend the underlying module instead.

### `core/ast.js`

Owns the AST node factories, `AST_VERSION` and JSON helpers. Specification: `shared/ast-contract.md`.

Rules:

- Adding/removing/changing a node bumps `AST_VERSION` and updates `shared/ast-contract.md`.
- Every node carries `loc: { linea, columnaInicio, columnaFin }`.

### `core/parser.js`

`parsearPrograma(codigo)` is the only entry. Returns the `Programa` AST consumed by the runtime.

Rules:

- Reuse `stripComment` from the tokenizer.
- Do not emit static errors — that is the validator's job. Unrecognized lines become `Desconocido` nodes; the runtime turns them into runtime errors.

### `core/expression-evaluator.js`

Owns the shunting-yard pipeline (`_tokenizarExpresion`, `_normalizarTokens`, `_parsearRPN`, `_evaluarRPN`), the condition evaluator (`_evaluarCondicion`, `_aplicarRelop`, `_splitByLogOp`) and the operator/native-function tables (`OPERADORES_EXPR`, `FUNCIONES_NATIVAS_EXPR`).

Rules:

- Applied as a mixin onto `LiteSeInt.prototype` from `core/LiteSeInt.js`. Methods rely on `this.variables` / `this.callbacks`.
- Adding an operator or native function should only touch the tables here and the tokenizer.

### `core/LiteSeInt.js`

Owns the runtime:

- execution lifecycle
- AST walk (`_ejecutarBloque`, `_ejecutarNodo` dispatched on PascalCase `tipo`)
- runtime callbacks
- variable state during execution
- runtime type conversion and input validation

Rules:

- Consume the AST returned by `LiteSeIntParser.parsearPrograma(...)` — do not re-parse by line.
- Apply the expression-evaluator mixin after the class declaration.
- Keep the core independent from the browser UI.
- Use callbacks for output, input, error reporting, active line, system messages and finish events.
- Runtime errors should be explicit and match the language model.
- Do not reimplement static validation here unless needed for runtime safety.

### `js/app.js`

This file owns:

- editor event wiring
- console flow and inline input UX
- autocomplete UI and suggestion rendering
- example loading
- visual error lifecycle
- execution status and toolbar state

Rules:

- Reuse helpers from `core/doc_errores.js` and `core/LiteSeInt.js` instead of duplicating language rules.
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

1. Update tokenization in `core/tokenizer.js` if new tokens appear.
2. Update static analysis in `core/validator.js` (and re-expose anything new through `core/doc_errores.js` if external consumers need it).
3. Update AST shape in `core/ast.js` and `shared/ast-contract.md`; bump `AST_VERSION` when nodes change.
4. Update parsing in `core/parser.js` so the new construct emits the right node.
5. Update runtime semantics in `core/LiteSeInt.js` (and `core/expression-evaluator.js` if the change touches operators or native functions).
6. Update autocomplete, examples, or UI helpers in `js/app.js` if the feature is user-visible.
7. Update `README.md` if supported syntax or behavior changed.
8. Update `CHANGELOG.md` for notable visible changes.
9. Update the visible version in `index.html` only if the phase is actually complete. The version trail across `index.html`, `CHANGELOG.md`, and the git tags (e.g. `v1.1.0`) should move together — do not bump one without the others.

Use `prompt_v*.txt` files at repo root as scope guards when they exist and the request maps to a planned phase. If no matching prompt exists, use this file, `README.md`, `CHANGELOG.md`, and the current implementation as the source of truth.

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
