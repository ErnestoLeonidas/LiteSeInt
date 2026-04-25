---
name: liteseint-language-change
description: Implement and review LiteSeInt language changes across static validation, runtime semantics, autocomplete, examples, and documentation. Use when adding or changing pseudocode syntax, operators, native functions, control structures, error behavior, version prompts, README, changelog, or the visible app version in this project.
---

Use this skill to keep LiteSeInt language work aligned across every layer that matters.

## Start

Read `CLAUDE.md` first.

If the request names a version, phase, or roadmap item, locate the matching repo prompt with:

```bash
rg --files -g 'prompt_v*.txt'
```

Read only the prompt that matches the requested scope.

If no prompt is named, inspect the request and decide whether the task is:

- New syntax or new token
- Static validation change
- Runtime semantics change
- Autocomplete or example update
- Documentation-only change

State the scope before editing anything.

## Respect Layer Boundaries

Keep responsibilities in the correct file:

- `js/doc_errores.js`: tokenization, static validation, symbol table, exact error ranges, autocomplete helpers
- `js/LiteSeInt.js`: parser, AST, execution, expression evaluation, runtime errors
- `js/app.js`: UI controller, autocomplete wiring, examples, console behavior
- `index.html`: layout, visible version, user-facing chrome

Do not move validation logic into the UI.
Do not add DOM dependencies to `js/doc_errores.js`.
Do not add direct UI logic to `js/LiteSeInt.js`.
Do not duplicate parser or validation rules across files unless strictly necessary.

## Apply The Smallest Correct Cross-File Patch

When a user-visible language feature changes, update all affected layers together:

1. Update tokenization and static validation in `js/doc_errores.js`.
2. Update parsing and runtime behavior in `js/LiteSeInt.js`.
3. Update autocomplete, examples, or editor helpers in `js/app.js` if the feature is user-facing.
4. Update `README.md` for syntax, supported behavior, and examples.
5. Update `CHANGELOG.md` for notable visible changes.
6. Update the visible version in `index.html` only if the implementation is actually complete for that phase.

If the change is internal only, avoid unnecessary README or version edits.

## Keep Version Scope Tight

Honor the requested phase and its non-goals.

Use the phase prompts at repo root as scope guards:

- `prompt_v0.5.0_refactor_expresiones.txt`: expression architecture groundwork
- `prompt_v0.5.1_operadores_y_funciones_numericas.txt`: `mod`, power, `Abs`, `Redon`, `Trunc`
- `prompt_v0.5.2_funciones_texto_y_errores.txt`: `Longitud`, `Mayusculas`, `Minusculas`, error improvements

Do not silently pull in roadmap items such as `Dimension`, arrays, user-defined functions, `Funcion`, `SubProceso`, persistence, or live validation unless the request explicitly changes scope.

## Error And Validation Rules

Prefer precise, educational errors over generic ones.

Preserve exact validation ranges:

- `linea`
- `columnaInicio`
- `columnaFin`

Keep static validation and runtime behavior aligned:

- Do not let `js/doc_errores.js` approve syntax that `js/LiteSeInt.js` cannot execute.
- Do not implement runtime syntax without teaching the validator about it when the syntax is user-visible.
- If a call or operator is unsupported, make the error explicit and name the real issue.

## Verification

Before declaring the task done, run focused checks that match the touched flow.

Minimum checks when relevant:

- `Definir` with one and multiple variables
- Duplicate declarations
- Reserved words used as variables
- `Escribir` with strings, numbers, variables, and comma-separated expressions
- Unclosed strings
- Adjacent values missing a comma
- `Leer` with valid and invalid type input
- Assignment with arithmetic expressions and parentheses
- Undefined variable usage
- Uninitialized variable usage
- Comments with `//`
- The exact new syntax, operators, or functions added by the task
- Runtime stop flow if execution changed
- Mobile layout if toolbar, panels, spacing, or controls changed

Use small pseudocode programs that exercise the exact feature. Prefer focused manual validation over broad unrelated exploration.

## Output

Report:

- Which layers changed
- Which prompt or scope guard was used
- Which focused checks were actually performed
- Any remaining limitation or unverified path
