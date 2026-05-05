# Roadmap LiteSeInt 2.0

LiteSeInt cerró su versión `v1.0.0` como editor educativo de pseudolenguaje, estático, sin backend y con dialecto congelado. El camino hacia 2.0 transforma el proyecto en una plataforma educativa institucional para colegios y educación superior, sin romper el editor 1.0 ni el banco de 245 ejercicios existente.

> LiteSeInt 2.0 permite a instituciones enseñar, asignar y evaluar pseudolenguaje con cuentas, cursos, secciones, progreso, ranking y herramientas avanzadas (arreglos, subprocesos, inspector de variables y diagrama bidireccional), preservando el editor educativo de 1.0.

Este roadmap describe **cada versión futura** con su contenido detallado: objetivo, cambios técnicos, schema, endpoints, UI, pruebas, documentación, criterios de aceptación y restricciones específicas. No se planifica por fases sueltas: cada versión es entregable, instalable y demoable por sí misma.

## Índice de Versiones

| Versión | Tipo | Tema | Estado |
|---|---|---|---|
| `v1.0.x` | patch | Mantenimiento del editor 1.0 | Abierto a parches no disruptivos |
| `v1.1.0` | minor | Reestructura interna y AST explícito | Planificado |
| `v2.0.0` | major | Plataforma institucional (MVP1) | Planificado |
| `v2.1.0` | minor | Arreglos y matrices (`Dimension`) | Planificado |
| `v2.2.0` | minor | Panel de pestañas e inspector de variables | Planificado |
| `v2.3.0` | minor | `SubProceso`/`Funcion`, scopes y call stack | Planificado |
| `v2.4.0` | minor | Diagrama bidireccional | Planificado |
| `v2.5.0` | minor | Reportes, ranking configurable y exportación | Planificado |
| `v2.6.0` | minor | QA institucional, seeds de demo y hardening | Planificado |

---

## Estado Base: v1.0.0

- Sitio estático con HTML, CSS y JavaScript vanilla.
- `index.html` como shell visual; `css/styles.css` como sistema visual y responsive.
- `js/app.js` como controlador de UI.
- `js/doc_errores.js` como tokenizador, validador estático, tabla de símbolos y helpers.
- `js/LiteSeInt.js` como parser, runtime y evaluador de expresiones.
- `js/ejercicios-data.js` y `json/N1.json`-`json/N7.json` como banco de 245 ejercicios.
- `tests/run-tests.js` como suite de regresión.
- Dialecto LiteSeInt congelado: `Definir`, `Escribir`, `Leer`, `=`, `//`, tipos `Entero`/`Real`/`Caracter`/`Logico`, control completo, operadores aritméticos, relacionales y lógicos en español.

`v1.0.x` queda abierto a parches puntuales (typos, accesibilidad, ajustes responsive) que no introduzcan backend ni cambios de dialecto.

---

## Decisiones de Arquitectura para 2.0

- Monorepo con `core/`, `frontend/`, `backend/`, `shared/`, `tests/`.
- `core/` como ES modules importable desde navegador y desde Node.
- AST explícito y versionado (`astVersion`) como contrato compartido entre validador, runtime y diagrama.
- El código fuente es la verdad; AST y diagrama son derivados/cache.
- Stack: Node 20 + Express + Prisma. SQLite en desarrollo, PostgreSQL en producción.
- Auth: JWT de acceso corto + refresh token httpOnly. Hash con argon2id (alternativa bcrypt).
- Multi-tenant con `institucion_id` en toda tabla de dominio y middleware obligatorio de aislamiento.
- Rankings on-demand con cache hasta tener volumen real.
- Frontend continúa en HTML + Bootstrap 5.3 + JavaScript vanilla + jQuery.
- Tests con `npm test` para `core` y backend (`node:test` + `supertest`).
- Estructura final de carpetas:

```
/LiteSeInt
├── core/                tokenizer, validator, parser, ast, runtime, expression-evaluator,
│                        symbol-table, diagram-mapper
├── frontend/            index.html, css/, js/app.js, js/editor/, js/ui/, js/services/api.js
├── backend/             server.js, routes/, controllers/, services/, repositories/,
│                        middleware/, database/, migrations/, seeds/
├── shared/              ast-contract.md, roles.js, errors.js
└── tests/               core/, api/, integration/
```

---

## v1.1.0 — Reestructura Interna y AST Explícito

Tipo: minor preparatorio. Sin nueva funcionalidad visible para el estudiante.

### Objetivo

Dejar el motor reutilizable desde Node y con AST estable, sin alterar comportamiento ni romper la app actual.

### Alcance

- Reorganizar el repositorio a monorepo con `core/`, `frontend/`, `backend/` (esqueleto), `shared/` y `tests/`.
- Convertir `js/doc_errores.js` y `js/LiteSeInt.js` a ES modules en `core/`.
- Mantener shim `window.DocErrores` y `window.LiteSeInt` en `frontend/` para compatibilidad.
- Producir AST explícito en parser; runtime ejecuta sobre AST.
- Introducir scope chain en la tabla de símbolos aunque solo exista el global.
- Documentar el contrato AST en `shared/ast-contract.md`.

### Cambios Técnicos

- `core/tokenizer.js`: extraído de `doc_errores.js`. Sin cambios de tokens.
- `core/validator.js`: extraído de `doc_errores.js`. Conserva mensajes y `loc:{linea,columnaInicio,columnaFin}`.
- `core/parser.js`: nuevo. Construye AST a partir de tokens.
- `core/ast.js`: define nodos `Programa`, `Definir`, `Asignar`, `Leer`, `Escribir`, `Si`, `Mientras`, `Para`, `Repetir`, `Segun`, `Llamar`, `SubProceso`, `Dimension` con `loc` en cada nodo y `astVersion: 2`.
- `core/runtime.js`: extraído de `LiteSeInt.js`. Recorre AST en lugar de re-parsear por línea.
- `core/expression-evaluator.js`: extraído. Sin cambios semánticos.
- `core/symbol-table.js`: nuevo, con scope chain (solo global por ahora).
- `frontend/index.html`, `frontend/js/app.js`: ajustados a las nuevas rutas. Shim conserva globales.
- `tests/run-tests.js`: importa desde `core/` vía ESM.

### Schema, Endpoints, UI

No aplica. No hay backend ni cambios visibles.

### Pruebas

- `npm test` pasa con la nueva organización.
- Test nuevo: roundtrip serialización/deserialización de AST.
- Test nuevo: ejecución de los 245 ejercicios produce las mismas salidas que en `v1.0.0`.

### Documentación

- `shared/ast-contract.md` publicado.
- `README.md`: nota de cambio de organización para contribuidores.
- `CHANGELOG.md`: entrada `1.1.0`.

### Criterios de Aceptación

- `npm test` verde.
- Los 245 ejercicios validan y ejecutan idénticos.
- `core/` no depende de DOM, jQuery ni Bootstrap.
- El editor 1.0 funciona sin cambios visibles.

### Restricciones Específicas

- No se introduce backend.
- No se cambia el dialecto.
- No se mueven archivos del `frontend/` que rompan rutas públicas existentes (GitHub Pages sigue funcionando).

### Riesgos Específicos

- Cambio de runtime por línea a runtime sobre AST puede romper ejercicios. Mitigación: cierre de versión condicionado a salidas idénticas en los 245 ejercicios.

---

## v2.0.0 — Plataforma Institucional MVP1

Tipo: major. Primera versión institucional usable.

### Objetivo

Que una institución pueda darse de alta, configurar su modelo académico, dar acceso a docentes y estudiantes, y que el estudiante resuelva ejercicios con persistencia y ranking básico.

### Alcance

- Backend Express + Prisma con SQLite en desarrollo y PostgreSQL en producción.
- Auth con JWT + refresh token httpOnly. Hash argon2id.
- Roles `SUPER_ADMIN`, `ADMINISTRADOR`, `DOCENTE`, `ESTUDIANTE`.
- Multi-tenant con `institucion_id` y middleware de aislamiento.
- Modelo académico completo: institución, sede, curso, asignatura, sección, matrícula, asignación docente.
- Persistencia de código, versiones, intentos, progreso.
- Reanudación exacta de ejercicios.
- Ranking básico por sección con fórmula fija (ejercicios completados + dificultad + tiempo).
- Sandbox server-side para validación con timeout.
- Pantallas mínimas para los cuatro roles.

### Cambios Técnicos

- `backend/server.js`: bootstrap Express, CORS, helmet, rate limit en login.
- `backend/middleware/auth.js`: verifica JWT, carga `req.user` y `req.tenant`.
- `backend/middleware/rbac.js`: `requireRole(...roles)` y `requireSameTenant`.
- `backend/middleware/tenant.js`: inyecta `where: { institucion_id }` en queries Prisma vía extension.
- `backend/services/sandbox.js`: ejecuta `core/runtime.js` en `Worker` con `AbortController`, timeout 3s y tope de iteraciones.
- `frontend/js/services/api.js`: cliente HTTP con manejo de refresh token.
- `frontend/js/ui/login.js`, `frontend/js/ui/menu.js`: pantallas y menú dinámico por rol.
- `frontend/js/ui/admin/`, `docente/`, `estudiante/`: paneles mínimos por rol.

### Schema (migración inicial)

Tablas:

- `usuarios`: id, nombre, email UNIQUE, password_hash, rol, activo, institucion_id, sede_id, created_at, updated_at.
- `instituciones`: id, nombre, tipo (`colegio` | `educacion_superior`), activo.
- `sedes`: id, institucion_id, nombre, direccion, activo.
- `cursos`: id, institucion_id, sede_id, nombre, nivel, activo.
- `asignaturas`: id, institucion_id, nombre, codigo, activo.
- `secciones`: id, institucion_id, sede_id, curso_id, asignatura_id, docente_id, nombre, periodo, activo.
- `matriculas`: id, estudiante_id, seccion_id, estado.
- `docente_seccion`: id, docente_id, seccion_id.
- `proyectos_codigo`: id, estudiante_id, ejercicio_id, titulo, codigo, ast_json, estado, updated_at.
- `proyecto_versiones`: id, proyecto_codigo_id, codigo, created_at.
- `intentos`: id, proyecto_codigo_id, estudiante_id, ejercicio_id, codigo, resultado, errores_json, salida, tiempo_ms, created_at.
- `progreso`: id, estudiante_id, seccion_id, ejercicio_id, estado, porcentaje, puntaje, intentos, tiempo_total, ultima_linea, updated_at.

Índices: `intentos(estudiante_id, ejercicio_id, created_at DESC)`, `progreso(seccion_id, estudiante_id)`, UNIQUE `proyectos_codigo(estudiante_id, ejercicio_id)`, UNIQUE `matriculas(estudiante_id, seccion_id)`.

Seeds:

- super_admin único definido por variables de entorno.
- Institución demo con una sede, una asignatura y una sección para QA.

### Endpoints

Auth:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET  /auth/me`

Instituciones (super_admin):

- `GET|POST /instituciones`
- `GET|PATCH|DELETE /instituciones/:id`
- `GET|POST /instituciones/:id/sedes`

Usuarios (admin del tenant):

- `GET|POST /usuarios`
- `GET|PATCH|DELETE /usuarios/:id`
- `PATCH /usuarios/:id/activo`

Académico (admin):

- CRUD `/cursos`, `/asignaturas`, `/secciones`.
- `POST /secciones/:id/matriculas` (matricular estudiante).
- `POST /secciones/:id/docente` (asignar docente).

Ejercicios (estudiante/docente):

- `GET /ejercicios` (banco filtrable por nivel).
- `GET /ejercicios/:id`.

Progreso (estudiante):

- `GET  /progreso/me`
- `PUT  /proyectos/:ejercicioId/codigo` (autosave).
- `POST /proyectos/:ejercicioId/intentos` (validar y guardar).
- `GET  /proyectos/:ejercicioId` (recuperar último estado).

Ranking:

- `GET /ranking/seccion/:id`

### UI

- Pantalla de login.
- Menú lateral con ítems según rol.
- Panel super_admin: lista y CRUD de instituciones.
- Panel administrador: CRUD académico y de usuarios de su institución.
- Panel docente: lista de sus secciones, lista de estudiantes, ranking de sección.
- Panel estudiante: lista de ejercicios asignados, editor con autosave, indicador de estado, ranking de su sección.
- El editor de 1.0 se reutiliza completo dentro del panel del estudiante.

### Pruebas

- Unit tests por servicio (auth, RBAC, tenant filter).
- Integration tests con `supertest` para todos los endpoints.
- Test E2E de aislamiento: un usuario del tenant A no puede leer/escribir en tenant B.
- Test de sandbox: un programa con loop infinito aborta a los 3s.
- `npm test` cubre `core/` y backend.

### Documentación

- `README.md`: sección de instalación local con SQLite, variables de entorno, seed inicial.
- `CHANGELOG.md`: entrada `2.0.0`.
- `docs/api.md`: lista de endpoints con ejemplos.
- `docs/roles.md`: matriz de permisos por rol.

### Criterios de Aceptación

- super_admin crea una institución desde cero.
- Administrador configura sede, curso, asignatura, sección, docente y estudiantes.
- Docente asigna ejercicios del banco a una sección.
- Estudiante resuelve, cierra el navegador, vuelve y ve su código intacto.
- Ranking básico de la sección se renderiza con datos reales.
- Aislamiento multi-tenant verificado por tests.
- `npm test` verde.

### Restricciones Específicas

- Banco de 245 ejercicios y dialecto 1.0 intactos.
- Editor 1.0 reutilizado tal cual en el panel del estudiante.
- Contraseñas siempre con hash; nunca en texto plano ni en logs.
- Importación CSV de usuarios queda fuera de esta versión (entra en `v2.0.x` si presiona el plazo o se sube a `v2.6.0`).

### Riesgos Específicos

- Aislamiento multi-tenant a nivel app puede fallar con joins. Mitigación: middleware obligatorio + tests E2E de cruzamiento.
- Sandbox server-side abre superficie a DoS. Mitigación: `Worker` + timeout + tope de iteraciones desde el día 1.

---

## v2.1.0 — Lenguaje 2.0: Arreglos y Matrices (`Dimension`)

Tipo: minor. Primera extensión del dialecto 2.0.

### Objetivo

Soportar arreglos y matrices con sintaxis estilo PSeInt sin romper el dialecto 1.0.

### Alcance

- `Dimension nombre[tamaño]` para arreglos.
- `Dimension nombre[filas, columnas]` para matrices.
- Acceso por índice unidimensional `arr[i]` y bidimensional `mat[i, j]`.
- Validación estática y runtime de rangos, tipos y arreglo no dimensionado.
- Inspector de variables (preliminar) muestra arreglos como árbol expandible cuando esté disponible (la pestaña completa llega en `v2.2.0`).
- Autocompletado y ejemplos extendidos.

### Cambios Técnicos

- `core/tokenizer.js`: tokens `Dimension`, `[`, `]`, `,` en contexto de índices.
- `core/parser.js`: nodos `Dimension`, `IndiceArreglo`, `IndiceMatriz`.
- `core/symbol-table.js`: registra forma `{tipo, dimensiones:[n] | [filas, cols]}`.
- `core/validator.js`: nuevas reglas: dimensión positiva, índice numérico, tipo coherente en asignación, arreglo no dimensionado.
- `core/runtime.js`: lectura/escritura por índice; error `IndiceFueraDeRango`, `ArregloNoDimensionado`, `TipoIncompatible`.
- `core/expression-evaluator.js`: soporta `IndiceArreglo` y `IndiceMatriz` como expresiones.
- `frontend/js/app.js`: autocompletado de `Dimension`; ejemplos en sección de aprendizaje.

### Schema, Endpoints

Sin cambios. El AST persistido en `proyectos_codigo.ast_json` aumenta `astVersion`. Migración de versiones antiguas: re-parseo desde el código fuente (verdad).

### UI

- Pestaña de comandos: nueva entrada "Arreglos / `Dimension`".
- Mensajes de error específicos en consola: rango y arreglo no dimensionado.

### Pruebas

- Tests de validador para cada nuevo error.
- Tests de runtime para arreglos, matrices, escritura, lectura, errores.
- Tests con ejemplos completos de los nuevos comandos.
- Re-ejecución de los 245 ejercicios 1.0: salidas idénticas.

### Documentación

- `README.md`: sección "Arreglos y matrices" con sintaxis y ejemplos.
- `CHANGELOG.md`: entrada `2.1.0`.
- Pestaña interna `Comandos` actualizada en el frontend.

### Criterios de Aceptación

- `Dimension v[5]` y `Dimension m[3,4]` validan, ejecutan y reportan errores con `loc` exacta.
- Tests cubren rango, tipo y errores típicos.
- Ejercicios 1.0 siguen pasando.
- Autocompletado sugiere `Dimension` y formas correctas de uso.

### Restricciones Específicas

- No introducir aún paso por referencia (entra en `v2.3.0` con subprocesos).
- No bloquear arreglos sin tipo por defecto: respetar `Definir nombre Como Tipo` después de `Dimension`.

### Riesgos Específicos

- Tokens `[` y `]` pueden colisionar con texto futuro. Mitigación: solo válidos tras identificadores en contexto de índice/dimension.

---

## v2.2.0 — Panel de Pestañas e Inspector de Variables

Tipo: minor. Cambio mayor de UX en el área inferior.

### Objetivo

Convertir la consola actual en un panel con pestañas Consola / Variables / Diagrama, con un inspector de variables vivo durante la ejecución.

### Alcance

- Pestaña Consola: salida, entrada para `Leer`, trazas opcionales, errores runtime (igual que hoy, dentro de la nueva pestaña).
- Pestaña Variables: árbol por proceso activo (en esta versión solo existe el proceso principal) con variables locales, parámetros futuros, arreglos/matrices expandibles, valor actual, tipo, estado de inicialización y resaltado de cambios recientes.
- Pestaña Diagrama: placeholder con mensaje "Disponible en v2.4.0".
- Modo paso a paso visible: el botón de ejecución expone una opción "Paso a paso".
- Persistencia local de la pestaña activa por sesión.

### Cambios Técnicos

- `core/runtime.js`: emite eventos `onStep({linea, scopeSnapshot})`, `onVariableChanged({nombre, valorAnterior, valorNuevo})`, `onScopeEntered`, `onScopeExited`.
- `frontend/js/ui/panel-tabs.js`: contenedor de pestañas.
- `frontend/js/ui/inspector.js`: árbol de variables con expansión/colapso y resaltado de cambios.
- `frontend/css/styles.css`: estilos del panel y del árbol respetando variables `:root`.

### Schema, Endpoints

Sin cambios.

### UI

- Panel inferior reorganizado con tres pestañas.
- Botón "Paso a paso" en la barra del editor.
- Tooltips y leyenda de iconos de tipo (Entero, Real, Caracter, Logico, Arreglo, Matriz).

### Pruebas

- Tests headless del runtime emitiendo eventos en orden correcto.
- Snapshot tests del estado del inspector tras cada paso, en programas representativos (asignación, condicional, ciclo, arreglos).
- Test de regresión visual mínimo (manual o con `playwright` si se introduce, opcional).

### Documentación

- `README.md`: sección "Inspección paso a paso".
- `CHANGELOG.md`: entrada `2.2.0`.
- Guía rápida en la pestaña `Comandos` del frontend.

### Criterios de Aceptación

- Cada paso muestra el árbol correcto y resalta variables modificadas.
- Arreglos y matrices se expanden visualmente.
- Cambiar entre pestañas no interrumpe la ejecución.
- En modo normal, el inspector muestra el estado final.

### Restricciones Específicas

- No mover lógica de runtime al frontend.
- No tocar el dialecto.
- Mantener compatibilidad móvil: en pantallas pequeñas, las pestañas se comportan como acordeón.

### Riesgos Específicos

- Eventos por paso pueden saturar el frontend. Mitigación: throttling y batching cuando hay más de N pasos por segundo.

---

## v2.3.0 — Lenguaje 2.0: SubProceso, Funciones y Call Stack

Tipo: minor. Segunda extensión del dialecto 2.0.

### Objetivo

Programas con varios subprocesos, parámetros, retorno y scopes correctos, visibles en el inspector.

### Alcance

- `SubProceso Nombre(args)` / `FinSubProceso`.
- Alias `Funcion` / `FinFuncion`.
- Retorno mediante variable de retorno antes de `=`: `SubProceso resultado = Sumar(a, b)`.
- Llamadas con y sin retorno.
- Parámetros por valor y por referencia. Arreglos por referencia por defecto.
- Definición de funciones antes o después del bloque `Proceso Principal`.
- Detección de función inexistente, aridad incorrecta y profundidad máxima de recursión.
- Inspector muestra variables agrupadas por proceso activo y permite navegar el call stack.

### Cambios Técnicos

- `core/tokenizer.js`: tokens `SubProceso`, `FinSubProceso`, `Funcion`, `FinFuncion`, `Proceso`, `FinProceso`.
- `core/parser.js`: nodos `SubProceso` (con `params`, `paramsPorReferencia`, `retorno?`, `cuerpo`, `esFuncion`), nodo `Llamar`.
- `core/symbol-table.js`: scope chain por subproceso, lookup ascendente.
- `core/runtime.js`: call stack con frames `{nombre, params, locals, retorno?}`. Detección de profundidad máxima configurable (por defecto 256).
- `core/validator.js`: errores `FuncionNoDefinida`, `AridadIncorrecta`, `RetornoNoAsignado`, `ParametroIncompatible`.
- `frontend/js/ui/inspector.js`: tabs internos por frame del call stack.

### Schema, Endpoints

Sin cambios. `astVersion` sube otra vez; código fuente sigue siendo verdad.

### UI

- Pestaña Variables muestra selector de frame del call stack.
- Pestaña Comandos: nuevas entradas para `SubProceso` y `Funcion`.
- Autocompletado de subprocesos definidos por el estudiante.

### Pruebas

- Tests de scopes anidados, recursión y referencia.
- Tests de errores de llamada.
- Test específico: arreglo por referencia se modifica en el llamador.
- Re-ejecución de los 245 ejercicios 1.0: salidas idénticas.

### Documentación

- `README.md`: sección "Subprocesos y funciones".
- `CHANGELOG.md`: entrada `2.3.0`.

### Criterios de Aceptación

- Programa con tres subprocesos y recursión ejecuta correctamente.
- Parámetros por referencia modifican el arreglo del llamador.
- El inspector navega el call stack y muestra variables del frame seleccionado.
- Errores de llamada apuntan a la línea correcta.

### Restricciones Específicas

- No permitir funciones anidadas dentro de funciones (por simplicidad pedagógica).
- No introducir closures.
- No permitir mismo nombre entre `SubProceso` y variable global.

### Riesgos Específicos

- Recursión profunda puede colgar la pestaña. Mitigación: límite de profundidad y mensaje claro al estudiante.
- Reglas de paso por referencia mal explicadas confunden. Mitigación: documento corto y ejemplos en pestaña `Comandos`.

---

## v2.4.0 — Modo Diagrama Bidireccional

Tipo: minor. Tercera y mayor extensión visual.

### Objetivo

Editor visual basado en AST que modifica el código y se regenera desde código sin destrucción de datos.

### Alcance

- Pestaña Diagrama operativa.
- Generación del diagrama desde el AST del código.
- Edición de nodos del diagrama regenera código solo si el roundtrip es seguro.
- Soporte mínimo: Inicio/Fin, `Definir`, `Asignar`, `Leer`, `Escribir`, `Si`/`Sino`/`FinSi`, `Mientras`, `Repetir`/`HastaQue`, `Para`, `Segun`, llamadas a `SubProceso`/`Funcion`.
- División del área de trabajo: diagrama al 50% del panel disponible cuando se activa.
- Si el código no parsea, la pestaña Diagrama queda en modo lectura con motivo visible.
- Serialización `diagrama_json` opcional como cache derivable.
- Validaciones anti-pérdida: ningún flujo destruye código sin confirmación explícita.

### Cambios Técnicos

- `core/diagram-mapper.js`: funciones `astADiagrama(ast)` y `diagramaAAst(diagrama)` con tests de roundtrip.
- `frontend/js/ui/diagram/`: render del diagrama, edición de nodos, drag opcional.
- `frontend/js/ui/diagram/safety.js`: detección de pérdida y bloqueo de edición.
- Atajo de teclado para alternar foco editor/diagrama.

### Schema

- `proyectos_codigo.diagrama_json` se usa como cache; puede recalcularse desde `codigo`.
- Nueva columna opcional: `diagrama_layout_json` (posiciones del usuario).

### Endpoints

- `PUT /proyectos/:ejercicioId/diagrama` (guarda layout/cache).

### UI

- Pestaña Diagrama activa con panel dividido al 50%.
- Modo lectura con banner cuando hay errores de parseo.
- Diálogos de confirmación cuando una edición pueda perder código (por ejemplo, cambiar la firma de un subproceso).

### Pruebas

- Tests unitarios de `astADiagrama` y `diagramaAAst`: roundtrip exacto del AST en todos los nodos soportados.
- Tests E2E (manual o automatizado) de edición visual: editar nodo `Si` actualiza solo esa rama del código.
- Test de seguridad: si el parseo falla, el código queda intacto.

### Documentación

- `README.md`: sección "Modo diagrama".
- `CHANGELOG.md`: entrada `2.4.0`.

### Criterios de Aceptación

- Editar un nodo `Si` desde el diagrama actualiza el código sin reordenar el resto.
- Roundtrip código → diagrama → código produce el mismo AST.
- Si hay pérdida potencial, la edición se bloquea con mensaje claro.

### Restricciones Específicas

- El código fuente sigue siendo la verdad: nunca se sobrescribe sin confirmación.
- No introducir librerías pesadas de diagrama si se pueden lograr los nodos con SVG/canvas mínimo.

### Riesgos Específicos

- Bidireccionalidad mal implementada destruye trabajo del estudiante. Mitigación: tests de roundtrip estrictos + bloqueo cuando el parseo falla.

---

## v2.5.0 — Reportes, Ranking Configurable y Exportación

Tipo: minor.

### Objetivo

Cubrir la visión institucional con reportes accionables, ranking configurable por institución y exportación a CSV/Excel.

### Alcance

- `ranking_config` con fórmula configurable (JSON) por institución.
- Variables soportadas: ejercicios completados, dificultad, intentos, tiempo de resolución, errores corregidos, rachas, actividades evaluadas, porcentaje de avance.
- Materialización opcional con tabla `rankings`.
- Reportes: avance por estudiante, sección, asignatura; ejercicios más fallados; errores frecuentes; tiempo medio; actividad semanal/mensual.
- Exportación CSV y Excel.
- Filtro permite calcular rankings por sección, asignatura, curso, sede e institución.

### Cambios Técnicos

- `backend/services/ranking.js`: motor que evalúa fórmulas JSON con whitelist de variables.
- `backend/services/reports.js`: queries optimizadas con índices nuevos.
- `backend/exporters/csv.js` y `xlsx.js`.
- `frontend/js/ui/admin/ranking-config.js`: editor de fórmula con vista previa.

### Schema

- `rankings` (id, scope_tipo, scope_id, estudiante_id, puntaje, posicion, calculado_at).
- `ranking_config` (id, institucion_id, nombre, formula_json, visible_estudiante, activo).
- Índices auxiliares para reportes: `intentos(seccion_id, created_at)`, `progreso(asignatura_id)` (vía join cacheado).

### Endpoints

- `GET    /ranking/:scopeTipo/:scopeId`
- `POST   /ranking/recalcular/:scopeTipo/:scopeId`
- `GET|POST|PATCH /ranking-config`
- `GET    /reportes/avance-estudiante`
- `GET    /reportes/avance-seccion`
- `GET    /reportes/ejercicios-fallados`
- `GET    /reportes/errores-frecuentes`
- `GET    /reportes/tiempo-medio`
- `GET    /reportes/exportar?formato=csv|xlsx`

### UI

- Panel administrador: editor visual de fórmula + vista previa con datos reales de prueba.
- Panel docente: dashboards básicos para sus secciones.
- Botones de exportar en cada reporte.

### Pruebas

- Tests de motor de fórmulas con valores límite.
- Tests de queries de reportes con datasets sintéticos.
- Tests de seguridad: estudiante no ve información privada no autorizada.

### Documentación

- `README.md`: sección "Ranking y reportes".
- `CHANGELOG.md`: entrada `2.5.0`.
- `docs/ranking.md`: especificación del lenguaje JSON de fórmulas.

### Criterios de Aceptación

- Cambiar `ranking_config` actualiza el ranking visible.
- Estudiante no ve datos privados.
- Exportaciones CSV y XLSX se abren correctamente en herramientas estándar.

### Restricciones Específicas

- Fórmulas evaluadas con whitelist; nunca con `eval`.
- Rate limit en endpoints de reporte.

### Riesgos Específicos

- Cálculos costosos por request degradan el servicio. Mitigación: cache 5 minutos por scope; materialización por job si la métrica de carga lo justifica.

---

## v2.6.0 — QA Institucional, Seeds de Demo y Hardening

Tipo: minor de cierre.

### Objetivo

Dejar 2.x cerrado: cobertura de pruebas, seeds reproducibles, hardening de seguridad y documentación final.

### Alcance

- Aumentar cobertura unitaria e integración a un umbral acordado (sugerencia: 80% en `core/` y `backend/services/`).
- Pruebas por rol y de aislamiento multi-tenant exhaustivas.
- Pruebas de seguridad: rate limiting, intentos fallidos, expiración de tokens, headers (`helmet`), sanitización de inputs.
- Importación CSV de estudiantes y docentes con validaciones y reporte de errores.
- Seeds de demo: institución modelo con secciones, docentes, estudiantes y ejercicios asignados.
- Guía de instalación para producción (PostgreSQL, variables de entorno, backups).
- README 2.0 final con manuales por rol.

### Cambios Técnicos

- `backend/middleware/security.js`: helmet, rate limit por IP/usuario, CORS estricto.
- `backend/services/csv-import.js`: parsing con validaciones de email, rol y institución.
- `backend/seeds/demo.js`: dataset reproducible.
- `tests/security/`: nuevos tests.

### Schema

Sin cambios estructurales.

### Endpoints

- `POST /usuarios/importar?tipo=estudiante|docente` (CSV).

### UI

- Wizard de importación CSV con vista previa y errores por fila.

### Pruebas

- Suite de seguridad ejecutable con `npm test`.
- Test de seeds: tras `npm run seed:demo`, todos los flujos del MVP funcionan.

### Documentación

- `README.md`: manuales por rol y guía de instalación productiva.
- `CHANGELOG.md`: entrada `2.6.0`.
- `docs/security.md`: superficie revisada y mitigaciones.
- `docs/operacion.md`: backups, monitoreo básico, rotación de tokens.

### Criterios de Aceptación

- `npm test` cubre lenguaje, progreso, roles, ranking y seguridad.
- Seeds reproducibles para demos.
- Documentación cubre super_admin, administrador, docente y estudiante.
- Sin issues críticos abiertos en seguridad.

### Restricciones Específicas

- No introducir nuevas funcionalidades de lenguaje.
- No modificar el dialecto.

### Riesgos Específicos

- Sobrecarga de cobertura artificial. Mitigación: foco en flujos críticos (auth, RBAC, persistencia, sandbox), no en cubrir métodos triviales.

---

## Mapeo MVP → Versiones

| MVP | Versiones que lo cubren |
|---|---|
| MVP 1: base institucional | `v1.1.0` + `v2.0.0` |
| MVP 2: lenguaje y datos | `v2.1.0` + `v2.2.0` |
| MVP 3: subprogramas | `v2.3.0` |
| MVP 4: diagrama y reportes | `v2.4.0` + `v2.5.0` |
| Cierre 2.x | `v2.6.0` |

---

## Restricciones Globales 2.0

- No romper ejercicios actuales.
- No eliminar soporte actual de sintaxis.
- No mezclar lógica de lenguaje con UI.
- No duplicar validaciones entre `frontend/js/app.js` y `core/`.
- No permitir acceso cruzado entre instituciones.
- No guardar contraseñas en texto plano.
- No modificar código del estudiante sin confirmación cuando exista riesgo de pérdida.
- Mantener UI en español.
- Mantener experiencia simple para estudiantes.
- No introducir TypeScript ni frameworks SPA salvo justificación explícita.

## Riesgos Globales y Mitigaciones

- **AST inestable antes del diagrama** → `v1.1.0` cierra con AST versionado y pruebas de roundtrip; `v2.4.0` no comienza si esto no está sólido.
- **Multi-tenant inseguro** → middleware obligatorio en `v2.0.0` + tests E2E de cruzamiento.
- **Ejecución server-side de código del estudiante** → sandbox en `Worker` con timeout y tope de iteraciones desde `v2.0.0`.
- **Migración del intérprete a AST** → `v1.1.0` cierra solo si los 245 ejercicios producen las mismas salidas.
- **Tabla de símbolos plana** → `v1.1.0` introduce scope chain incluso cuando solo hay scope global.
- **Arreglos en múltiples capas** → `v2.1.0` se entrega como bloque cerrado: tokenizer, validador, runtime, autocompletado e inspector preliminar.
- **Ranking en tiempo real** → `v2.0.0` usa fórmula fija; `v2.5.0` agrega cache y materialización opcional.
- **Crecimiento excesivo del modo institucional** → cada versión es entregable por sí misma; nada se agrupa en una sola entrega gigante.

## Norte 2.0

LiteSeInt 2.0 debe sentirse pequeño para el estudiante y completo para la institución. El editor 1.0 sigue siendo el corazón del producto: si abrir LiteSeInt como estudiante deja de ser claro, simple y rápido, la versión 2.0 falló aunque el backend funcione perfecto.
