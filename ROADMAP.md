# Roadmap LiteSeInt: de v1.0 a v2.0

LiteSeInt cerró su versión `v1.0.0` como editor educativo de pseudolenguaje, estático, sin backend y con dialecto congelado. Este roadmap describe la **ruta de desarrollo** que lleva al proyecto desde ese punto hasta `v2.0.0`, su próxima versión mayor: la plataforma educativa institucional para colegios y educación superior.

> En `v2.0.0` LiteSeInt será una plataforma institucional con cuentas, cursos, secciones, progreso, ranking y herramientas avanzadas (arreglos, subprocesos, inspector de variables y diagrama bidireccional), preservando el editor educativo de 1.0 y sin romper el banco de 245 ejercicios.

La ruta se divide en versiones intermedias `v1.1.0` a `v1.9.0`. Cada versión es entregable, demoable y mantiene la app funcionando. `v2.0.0` es el cierre institucional completo, no un MVP suelto.

## Índice de la Ruta

| Versión | Tipo | Tema | Estado |
|---|---|---|---|
| `v1.0.x` | patch | Mantenimiento del editor 1.0 | Abierto a parches no disruptivos |
| `v1.1.0` | minor | Reestructura interna y AST explícito | Planificado |
| `v1.2.0` | minor | Backend base, login y RBAC | Planificado |
| `v1.3.0` | minor | Multi-tenant y modelo académico | Planificado |
| `v1.4.0` | minor | Persistencia de código y reanudación | Planificado |
| `v1.5.0` | minor | Actividades asignables y ranking básico | Planificado |
| `v1.6.0` | minor | Lenguaje 2.0 — Arreglos (`Dimension`) | Planificado |
| `v1.7.0` | minor | Panel de pestañas e inspector de variables | Planificado |
| `v1.8.0` | minor | Lenguaje 2.0 — `SubProceso`/`Funcion` y call stack | Planificado |
| `v1.9.0` | minor | Diagrama bidireccional | Planificado |
| `v2.0.0` | major | Release institucional: reportes, ranking configurable, hardening, demos | Planificado |

---

## Estado Base: v1.0.0

- Sitio estático con HTML, CSS y JavaScript vanilla.
- `index.html` como shell visual; `css/styles.css` como sistema visual y responsive.
- `js/app.js` como controlador de UI.
- `js/doc_errores.js` como tokenizador, validador estático, tabla de símbolos y helpers.
- `js/LiteSeInt.js` como parser, runtime y evaluador de expresiones.
- `js/ejercicios-data.js` y `json/N1.json`-`json/N7.json` como banco de 245 ejercicios.
- `tests/run-tests.js` como suite de regresión.
- Dialecto LiteSeInt congelado: `Definir`, `Escribir`, `Leer`, `=`, `//`, tipos `Entero`/`Real`/`Caracter`/`Logico`, control completo y operadores en español.

`v1.0.x` queda abierto a parches puntuales (typos, accesibilidad, ajustes responsive) que no introduzcan backend ni cambios de dialecto.

## Promesa 2.0

LiteSeInt 2.0 debe responder, además de las preguntas que ya respondía 1.0:

1. ¿Quién está practicando y cómo va?
2. ¿Qué ejercicio asigno y a qué sección?
3. ¿Cómo recupero el trabajo del estudiante en cualquier momento?
4. ¿Qué pasa adentro del programa cuando se ejecuta?

## Decisiones de Arquitectura para la Ruta 2.0

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

Estructura objetivo de carpetas (alcanzada al cerrar `v1.1.0` y completada en `v1.2.0`):

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

- Reorganizar el repositorio a monorepo con `core/`, `frontend/`, `backend/` (esqueleto vacío), `shared/` y `tests/`.
- Convertir `js/doc_errores.js` y `js/LiteSeInt.js` a ES modules en `core/`.
- Mantener shim `window.DocErrores` y `window.LiteSeInt` en `frontend/` para compatibilidad.
- Producir AST explícito en parser; runtime ejecuta sobre AST.
- Introducir scope chain en la tabla de símbolos aunque solo exista el global.

### Cambios Técnicos

- `core/tokenizer.js`: extraído de `doc_errores.js`. Sin cambios de tokens.
- `core/validator.js`: extraído de `doc_errores.js`. Conserva mensajes y `loc:{linea,columnaInicio,columnaFin}`.
- `core/parser.js`: nuevo. Construye AST a partir de tokens.
- `core/ast.js`: define nodos `Programa`, `Definir`, `Asignar`, `Leer`, `Escribir`, `Si`, `Mientras`, `Para`, `Repetir`, `Segun`, `Llamar`, `SubProceso`, `Dimension` con `loc` en cada nodo y `astVersion: 2`.
- `core/runtime.js`: extraído. Recorre AST en lugar de re-parsear por línea.
- `core/expression-evaluator.js`: extraído. Sin cambios semánticos.
- `core/symbol-table.js`: nuevo, con scope chain (solo global por ahora).
- `frontend/index.html`, `frontend/js/app.js`: ajustados a las nuevas rutas. Shim conserva globales.
- `tests/run-tests.js`: importa desde `core/` vía ESM.
- `shared/ast-contract.md`: especificación de nodos.

### Pruebas

- `npm test` verde con la nueva organización.
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
- No se rompen rutas públicas existentes (GitHub Pages sigue funcionando).

### Riesgos Específicos

- Cambio de runtime por línea a runtime sobre AST puede romper ejercicios. Mitigación: cierre condicionado a salidas idénticas en los 245 ejercicios.

---

## v1.2.0 — Backend Base, Login y RBAC

Tipo: minor. Primera aparición del backend.

### Objetivo

Levantar la API protegida con autenticación y control por rol, lista para que próximas versiones agreguen modelo académico encima.

### Alcance

- Bootstrap `backend/` con Express + Prisma + Zod.
- Roles `SUPER_ADMIN`, `ADMINISTRADOR`, `DOCENTE`, `ESTUDIANTE`.
- Auth con JWT corto + refresh token httpOnly.
- Hash argon2id, rate limit en login y headers de seguridad con `helmet`.
- Pantalla de login en frontend y menú dinámico por rol con secciones aún vacías.
- Seed inicial con super_admin único.

### Cambios Técnicos

- `backend/server.js`: bootstrap con CORS, helmet, rate limit.
- `backend/middleware/auth.js`, `backend/middleware/rbac.js`.
- `backend/routes/auth.js`, `backend/controllers/auth.js`.
- `backend/services/passwords.js` (argon2id).
- `frontend/js/services/api.js`: cliente HTTP con manejo de refresh.
- `frontend/js/ui/login.js`, `frontend/js/ui/menu.js`.
- `tests/api/auth.test.js` con `supertest`.

### Schema (migración inicial)

- `usuarios`: id, nombre, email UNIQUE, password_hash, rol, activo, created_at, updated_at. (Aún sin `institucion_id`; entra en `v1.3.0`).

### Endpoints

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET  /auth/me`

### UI

- Pantalla de login.
- Menú lateral por rol con ítems placeholder ("Próximamente").
- Editor 1.0 sigue accesible como sección visible para todos los roles autenticados.

### Pruebas

- Tests de login, expiración, refresh y bloqueo por rate limit.
- Tests de RBAC: middleware autoriza/rechaza según rol.

### Documentación

- `README.md`: sección "Instalación local", variables de entorno, primer super_admin.
- `CHANGELOG.md`: entrada `1.2.0`.
- `docs/api.md`: contrato de auth.
- `docs/roles.md`: matriz de permisos inicial.

### Criterios de Aceptación

- super_admin puede iniciar sesión y consumir endpoints protegidos.
- Tokens expiran y refrescan correctamente.
- Tests E2E confirman que un rol no puede acceder a endpoints fuera de su alcance.
- El editor 1.0 funciona igual sin login.

### Restricciones Específicas

- No persistir contraseñas en texto plano ni loguearlas.
- No exponer endpoints de dominio antes de tener middleware de tenant (entra en `v1.3.0`).

### Riesgos Específicos

- Implementar refresh tokens mal puede dejar sesiones vulnerables. Mitigación: cookie httpOnly + rotación + revocación al logout.

---

## v1.3.0 — Multi-tenant y Modelo Académico

Tipo: minor. La plataforma se vuelve institucional.

### Objetivo

Que un super_admin cree instituciones y un administrador configure el modelo académico completo de la suya, con aislamiento estricto.

### Alcance

- Multi-tenant con `institucion_id` en toda tabla de dominio.
- Middleware obligatorio de aislamiento por tenant.
- CRUD de institución, sede, curso, asignatura, sección.
- Gestión de usuarios institucionales (administradores, docentes, estudiantes).
- Matrícula estudiante-sección y asignación docente-sección.

### Cambios Técnicos

- Migración: `institucion_id` y `sede_id` en `usuarios`.
- `backend/middleware/tenant.js`: extension Prisma que inyecta `institucion_id`.
- `backend/routes/instituciones.js`, `sedes.js`, `cursos.js`, `asignaturas.js`, `secciones.js`, `usuarios.js`.
- `frontend/js/ui/admin/`: paneles de CRUD académico y de usuarios.

### Schema (migraciones)

- `instituciones`: id, nombre, tipo (`colegio` | `educacion_superior`), activo.
- `sedes`: id, institucion_id, nombre, direccion, activo.
- `cursos`: id, institucion_id, sede_id, nombre, nivel, activo.
- `asignaturas`: id, institucion_id, nombre, codigo, activo.
- `secciones`: id, institucion_id, sede_id, curso_id, asignatura_id, docente_id, nombre, periodo, activo.
- `matriculas`: id, estudiante_id, seccion_id, estado. UNIQUE `(estudiante_id, seccion_id)`.
- `docente_seccion`: id, docente_id, seccion_id.
- Alteración: `usuarios.institucion_id`, `usuarios.sede_id`.

### Endpoints

- CRUD `/instituciones`, `/instituciones/:id/sedes`.
- CRUD `/cursos`, `/asignaturas`, `/secciones`.
- CRUD `/usuarios` (admin del tenant).
- `POST /secciones/:id/matriculas`, `POST /secciones/:id/docente`.

### UI

- Panel super_admin: lista y CRUD de instituciones.
- Panel administrador: árbol institución → sede → curso → asignatura → sección con CRUD por nivel.
- Panel docente: lista de sus secciones con estudiantes (sin progreso aún).
- Panel estudiante: lista de secciones donde está matriculado (sin ejercicios asignados aún).

### Pruebas

- Tests E2E de aislamiento: un usuario del tenant A no lee/escribe en B.
- Tests de CRUD por rol.
- Tests de matrícula y asignación.

### Documentación

- `README.md`: sección "Configurar una institución".
- `CHANGELOG.md`: entrada `1.3.0`.

### Criterios de Aceptación

- super_admin crea una institución desde cero.
- Administrador configura sede, curso, asignatura, sección, docente y estudiantes.
- Tests E2E confirman aislamiento estricto.
- Editor 1.0 sigue funcionando para usuarios autenticados.

### Restricciones Específicas

- Toda query de dominio pasa por el middleware de tenant; no se permiten queries directas sin filtro.
- Nada de borrado físico para instituciones/sedes en producción; usar `activo=false`.

### Riesgos Específicos

- Joins olvidados pueden saltar el aislamiento. Mitigación: extension Prisma central + tests E2E de cruzamiento.

---

## v1.4.0 — Persistencia de Código y Reanudación

Tipo: minor. El editor empieza a guardar progreso real.

### Objetivo

Que el estudiante resuelva ejercicios del banco actual desde su panel, con autosave, historial e intentos persistidos, y que pueda cerrar y volver sin perder nada.

### Alcance

- Guardado automático del código por estudiante y ejercicio.
- Historial de versiones del código.
- Registro de intentos de ejecución/validación.
- Estado de avance por ejercicio: pendiente, en curso, completado, revisado.
- Reanudación exacta del último estado.
- Sandbox server-side para validar entregas.

### Cambios Técnicos

- `backend/services/sandbox.js`: ejecuta `core/runtime.js` en `Worker` con `AbortController`, timeout 3s y tope de iteraciones.
- `backend/routes/proyectos.js`: autosave, intento, recuperación.
- `backend/services/progreso.js`: cálculo de estado y porcentaje.
- `frontend/js/ui/estudiante/`: integración del editor 1.0 con autosave y badges de estado.

### Schema (migraciones)

- `proyectos_codigo`: id, estudiante_id, ejercicio_id, titulo, codigo, ast_json, estado, updated_at. UNIQUE `(estudiante_id, ejercicio_id)`.
- `proyecto_versiones`: id, proyecto_codigo_id, codigo, created_at.
- `intentos`: id, proyecto_codigo_id, estudiante_id, ejercicio_id, codigo, resultado, errores_json, salida, tiempo_ms, created_at. Index `(estudiante_id, ejercicio_id, created_at DESC)`.
- `progreso`: id, estudiante_id, seccion_id, ejercicio_id, estado, porcentaje, puntaje, intentos, tiempo_total, ultima_linea, updated_at. Index `(seccion_id, estudiante_id)`.

### Endpoints

- `GET  /ejercicios` (banco filtrable por nivel).
- `GET  /ejercicios/:id`.
- `PUT  /proyectos/:ejercicioId/codigo` (autosave).
- `POST /proyectos/:ejercicioId/intentos`.
- `GET  /proyectos/:ejercicioId` (último estado + historial corto).
- `GET  /progreso/me`.

### UI

- Panel estudiante: lista de ejercicios del banco con badge de estado.
- Editor con autosave silencioso e indicador "Guardado".
- Vista de historial de versiones.
- Vista de intentos con resultado y salida.

### Pruebas

- Test de sandbox: programa con loop infinito aborta a los 3s.
- Test de reanudación: cerrar/volver mantiene código exacto.
- Test de historial: cada autosave significativo crea versión.
- Test de aislamiento: estudiante no lee proyectos de otros.

### Documentación

- `README.md`: sección "Resolver ejercicios".
- `CHANGELOG.md`: entrada `1.4.0`.

### Criterios de Aceptación

- Estudiante cierra navegador y al volver ve su código exactamente.
- Sandbox aborta loops infinitos.
- Historial e intentos quedan accesibles.
- Banco 1.0 intacto y dialecto inalterado.

### Restricciones Específicas

- No introducir nuevas funcionalidades de lenguaje.
- No alterar el banco de ejercicios.

### Riesgos Específicos

- Autosave excesivo puede saturar la base. Mitigación: debounce + guardar versión solo ante cambios significativos (delta o intervalo mínimo).

---

## v1.5.0 — Actividades Asignables y Ranking Básico

Tipo: minor. Aparece la dimensión docente.

### Objetivo

Que un docente cree actividades, asigne ejercicios a su sección y vea un ranking básico. El estudiante ve su lista de tareas y su posición.

### Alcance

- Actividades creadas por docentes con fecha de inicio y cierre, dificultad y puntaje.
- Ejercicios asignables a una sección dentro de una actividad.
- Solución de referencia y casos de prueba opcionales.
- Ranking básico por sección con fórmula fija (ejercicios completados + dificultad + tiempo).
- Vista de ranking respeta permisos: estudiante no ve datos privados.

### Cambios Técnicos

- `backend/routes/actividades.js`: CRUD para docente.
- `backend/services/ranking.js`: cálculo on-demand con cache 5 min en memoria.
- `frontend/js/ui/docente/actividades.js`: gestión de actividades.
- `frontend/js/ui/estudiante/tareas.js`: lista de actividades vigentes.
- `frontend/js/ui/estudiante/ranking.js`: posición y top de la sección.

### Schema (migraciones)

- `actividades`: id, institucion_id, asignatura_id, seccion_id, docente_id, titulo, descripcion, fecha_inicio, fecha_cierre, puntaje, visible.
- `actividad_ejercicios`: id, actividad_id, ejercicio_id, orden, puntaje.
- Alteración: `progreso.actividad_id` (nullable). `proyectos_codigo.actividad_id` (nullable).

### Endpoints

- CRUD `/actividades` (docente).
- `POST /actividades/:id/ejercicios` (asignar).
- `GET  /actividades/me` (estudiante: actividades asignadas).
- `GET  /ranking/seccion/:id`.

### UI

- Panel docente: crear actividad, asignar ejercicios, ver progreso por estudiante.
- Panel estudiante: actividades vigentes con fechas y puntaje, ranking de su sección.
- Editor: indicador de actividad activa cuando aplica.

### Pruebas

- Tests de creación y vencimiento de actividades.
- Tests de ranking con dataset sintético.
- Tests de visibilidad por rol.

### Documentación

- `README.md`: sección "Asignar ejercicios y ver progreso".
- `CHANGELOG.md`: entrada `1.5.0`.

### Criterios de Aceptación

- Docente asigna ejercicios; estudiante los ve en su panel.
- Ranking se renderiza con datos reales y respeta permisos.
- Fechas de cierre cierran efectivamente la entrega.

### Restricciones Específicas

- Ranking aún no es configurable por institución (eso entra en `v2.0.0`).
- Calificación automática avanzada queda fuera; los casos de prueba opcionales solo validan ejecución/salida básica.

### Riesgos Específicos

- Ranking en tiempo real puede ser costoso. Mitigación: cache 5 min por scope.

---

## v1.6.0 — Lenguaje 2.0: Arreglos y Matrices (`Dimension`)

Tipo: minor. Primera extensión del dialecto.

### Objetivo

Soportar arreglos y matrices con sintaxis estilo PSeInt sin romper el dialecto 1.0.

### Alcance

- `Dimension nombre[tamaño]` para arreglos.
- `Dimension nombre[filas, columnas]` para matrices.
- Acceso por índice unidimensional `arr[i]` y bidimensional `mat[i, j]`.
- Validación estática y runtime de rangos, tipos y arreglo no dimensionado.
- Autocompletado y ejemplos extendidos.

### Cambios Técnicos

- `core/tokenizer.js`: tokens `Dimension`, `[`, `]`, `,` en contexto de índices.
- `core/parser.js`: nodos `Dimension`, `IndiceArreglo`, `IndiceMatriz`.
- `core/symbol-table.js`: registra forma `{tipo, dimensiones:[n] | [filas, cols]}`.
- `core/validator.js`: nuevas reglas: dimensión positiva, índice numérico, tipo coherente, arreglo no dimensionado.
- `core/runtime.js`: lectura/escritura por índice; errores `IndiceFueraDeRango`, `ArregloNoDimensionado`, `TipoIncompatible`.
- `core/expression-evaluator.js`: soporta accesos como expresiones.
- `frontend/js/app.js`: autocompletado de `Dimension` y ejemplos.
- AST sube `astVersion`. Migración: re-parseo desde `codigo` (verdad).

### Pruebas

- Tests de validador para cada nuevo error.
- Tests de runtime para arreglos, matrices y errores típicos.
- Re-ejecución de los 245 ejercicios 1.0: salidas idénticas.

### Documentación

- `README.md`: sección "Arreglos y matrices".
- `CHANGELOG.md`: entrada `1.6.0`.
- Pestaña interna `Comandos` actualizada en el frontend.

### Criterios de Aceptación

- `Dimension v[5]` y `Dimension m[3,4]` validan, ejecutan y reportan errores con `loc` exacta.
- Tests cubren rango, tipo y errores típicos.
- Ejercicios 1.0 siguen pasando.

### Restricciones Específicas

- No introducir aún paso por referencia (entra en `v1.8.0` con subprocesos).
- Respetar `Definir nombre Como Tipo` después de `Dimension`.

### Riesgos Específicos

- Tokens `[` y `]` pueden colisionar con texto futuro. Mitigación: solo válidos tras identificadores en contexto de índice/dimension.

---

## v1.7.0 — Panel de Pestañas e Inspector de Variables

Tipo: minor. Cambio mayor de UX en el área inferior.

### Objetivo

Convertir la consola actual en un panel con pestañas Consola / Variables / Diagrama y un inspector de variables vivo durante la ejecución.

### Alcance

- Pestaña Consola: salida, entrada para `Leer`, trazas opcionales, errores runtime (igual que hoy).
- Pestaña Variables: árbol por proceso activo (en esta versión solo proceso principal) con variables locales, valor actual, tipo, estado de inicialización, arreglos/matrices expandibles y resaltado de cambios recientes.
- Pestaña Diagrama: placeholder con mensaje "Disponible en v1.9.0".
- Modo paso a paso visible en la barra del editor.

### Cambios Técnicos

- `core/runtime.js`: emite eventos `onStep({linea, scopeSnapshot})`, `onVariableChanged({nombre, valorAnterior, valorNuevo})`, `onScopeEntered`, `onScopeExited`.
- `frontend/js/ui/panel-tabs.js`: contenedor de pestañas.
- `frontend/js/ui/inspector.js`: árbol de variables con expansión/colapso.
- `frontend/css/styles.css`: estilos del panel y árbol respetando variables `:root`.

### Pruebas

- Tests headless del runtime emitiendo eventos en orden correcto.
- Snapshots del inspector tras cada paso en programas con asignación, condicional, ciclo y arreglos.

### Documentación

- `README.md`: sección "Inspección paso a paso".
- `CHANGELOG.md`: entrada `1.7.0`.

### Criterios de Aceptación

- Cada paso muestra el árbol correcto y resalta variables modificadas.
- Arreglos y matrices se expanden visualmente.
- En modo normal, el inspector muestra el estado final.
- Pestañas se comportan como acordeón en pantallas pequeñas.

### Restricciones Específicas

- No mover lógica de runtime al frontend.
- No tocar el dialecto.

### Riesgos Específicos

- Eventos por paso pueden saturar el frontend. Mitigación: throttling y batching por encima de N pasos por segundo.

---

## v1.8.0 — Lenguaje 2.0: SubProceso, Funciones y Call Stack

Tipo: minor. Segunda extensión del dialecto.

### Objetivo

Programas con varios subprocesos, parámetros, retorno y scopes correctos, visibles en el inspector.

### Alcance

- `SubProceso Nombre(args)` / `FinSubProceso`.
- Alias `Funcion` / `FinFuncion`.
- Retorno mediante variable de retorno antes de `=`: `SubProceso resultado = Sumar(a, b)`.
- Llamadas con y sin retorno.
- Parámetros por valor y por referencia. Arreglos por referencia por defecto.
- Definición antes o después de `Proceso Principal`.
- Detección de función inexistente, aridad incorrecta y profundidad máxima de recursión.
- Inspector con tabs internos por frame del call stack.

### Cambios Técnicos

- `core/tokenizer.js`: tokens `SubProceso`, `FinSubProceso`, `Funcion`, `FinFuncion`, `Proceso`, `FinProceso`.
- `core/parser.js`: nodos `SubProceso` (`params`, `paramsPorReferencia`, `retorno?`, `cuerpo`, `esFuncion`) y `Llamar`.
- `core/symbol-table.js`: scope chain real con lookup ascendente.
- `core/runtime.js`: call stack con frames; profundidad máxima configurable (256 por defecto).
- `core/validator.js`: errores `FuncionNoDefinida`, `AridadIncorrecta`, `RetornoNoAsignado`, `ParametroIncompatible`.
- `frontend/js/ui/inspector.js`: selector de frame.
- `frontend/js/app.js`: autocompletado de subprocesos definidos por el estudiante.

### Pruebas

- Tests de scopes anidados, recursión y referencia.
- Tests de errores de llamada.
- Test específico: arreglo por referencia se modifica en el llamador.
- Re-ejecución de los 245 ejercicios 1.0: salidas idénticas.

### Documentación

- `README.md`: sección "Subprocesos y funciones".
- `CHANGELOG.md`: entrada `1.8.0`.

### Criterios de Aceptación

- Programa con tres subprocesos y recursión ejecuta correctamente.
- Parámetros por referencia modifican el arreglo del llamador.
- Inspector navega el call stack y muestra variables del frame seleccionado.
- Errores de llamada apuntan a la línea correcta.

### Restricciones Específicas

- No permitir funciones anidadas dentro de funciones.
- No introducir closures.
- No permitir mismo nombre entre `SubProceso` y variable global.

### Riesgos Específicos

- Recursión profunda puede colgar la pestaña. Mitigación: límite de profundidad y mensaje claro al estudiante.

---

## v1.9.0 — Diagrama Bidireccional

Tipo: minor. Última pieza visual antes del cierre 2.0.

### Objetivo

Editor visual basado en AST que modifica el código y se regenera desde código sin destrucción de datos.

### Alcance

- Pestaña Diagrama operativa.
- Generación del diagrama desde el AST del código.
- Edición de nodos del diagrama regenera código solo si el roundtrip es seguro.
- Soporte mínimo: Inicio/Fin, `Definir`, `Asignar`, `Leer`, `Escribir`, `Si`/`Sino`/`FinSi`, `Mientras`, `Repetir`/`HastaQue`, `Para`, `Segun`, llamadas a `SubProceso`/`Funcion`.
- División del área de trabajo: diagrama al 50% del panel disponible cuando se activa.
- Si el código no parsea, modo lectura con motivo visible.
- Serialización `diagrama_json` opcional como cache derivable.
- Validaciones anti-pérdida: ningún flujo destruye código sin confirmación explícita.

### Cambios Técnicos

- `core/diagram-mapper.js`: `astADiagrama(ast)` y `diagramaAAst(diagrama)` con tests de roundtrip.
- `frontend/js/ui/diagram/`: render, edición, atajos.
- `frontend/js/ui/diagram/safety.js`: detección de pérdida y bloqueo.
- Atajo de teclado para alternar foco editor/diagrama.

### Schema

- Alteración: `proyectos_codigo.diagrama_json` y opcional `diagrama_layout_json`.

### Endpoints

- `PUT /proyectos/:ejercicioId/diagrama` (cache + layout).

### UI

- Pestaña Diagrama activa con panel dividido al 50%.
- Banner de modo lectura cuando hay errores de parseo.
- Diálogos de confirmación cuando una edición pueda perder código.

### Pruebas

- Tests unitarios de roundtrip exacto del AST en todos los nodos soportados.
- Tests de seguridad: si el parseo falla, el código queda intacto.
- Test E2E manual: editar nodo `Si` actualiza solo esa rama del código.

### Documentación

- `README.md`: sección "Modo diagrama".
- `CHANGELOG.md`: entrada `1.9.0`.

### Criterios de Aceptación

- Editar un nodo `Si` desde el diagrama actualiza el código sin reordenar el resto.
- Roundtrip código → diagrama → código produce el mismo AST.
- Si hay pérdida potencial, la edición se bloquea con mensaje claro.

### Restricciones Específicas

- El código fuente sigue siendo la verdad: nunca se sobrescribe sin confirmación.
- No introducir librerías pesadas si SVG/canvas mínimo alcanza.

### Riesgos Específicos

- Bidireccionalidad mal implementada destruye trabajo del estudiante. Mitigación: tests de roundtrip estrictos + bloqueo cuando el parseo falla.

---

## v2.0.0 — Release Institucional

Tipo: major. Cierre de la ruta y publicación oficial 2.0.

### Objetivo

Empaquetar todo lo construido entre `v1.1.0` y `v1.9.0` como release institucional listo para demos en colegios y educación superior, con reportes, ranking configurable, importación masiva de usuarios, hardening de seguridad, manuales por rol y seeds reproducibles.

### Alcance

- Ranking configurable por institución con fórmula JSON.
- Reportes para administradores y docentes con exportación CSV/Excel.
- Importación CSV de estudiantes y docentes con validaciones y reporte de errores.
- Hardening de seguridad: rate limiting fino, expiración y rotación de tokens, sanitización de inputs, headers reforzados, auditoría de eventos sensibles.
- Cobertura de pruebas elevada y suite de seguridad propia.
- Seeds de demo: institución modelo con secciones, docentes, estudiantes y ejercicios asignados.
- Documentación 2.0 completa con manuales por rol.
- Bump de versión visible y tag de release.

### Cambios Técnicos

- `backend/services/ranking.js`: motor que evalúa fórmulas JSON con whitelist (sin `eval`).
- `backend/services/reports.js`: queries optimizadas; vistas materializadas opcionales.
- `backend/exporters/csv.js` y `xlsx.js`.
- `backend/services/csv-import.js`: parsing con validaciones por fila.
- `backend/middleware/security.js`: helmet endurecido, rate limit por IP/usuario, CORS estricto.
- `backend/services/audit.js`: log de eventos sensibles (login, cambios de rol, exportaciones).
- `frontend/js/ui/admin/ranking-config.js`: editor de fórmula con vista previa.
- `frontend/js/ui/admin/reports/`: dashboards y exportadores.
- `frontend/js/ui/admin/import-csv.js`: wizard con preview y errores por fila.
- `backend/seeds/demo.js`: dataset reproducible.

### Schema (migraciones)

- `rankings`: id, scope_tipo, scope_id, estudiante_id, puntaje, posicion, calculado_at.
- `ranking_config`: id, institucion_id, nombre, formula_json, visible_estudiante, activo.
- `auditoria`: id, usuario_id, institucion_id, accion, payload_json, ip, created_at.
- Índices auxiliares para reportes: `intentos(seccion_id, created_at)`, vistas o materializaciones según métricas reales.

### Endpoints

- `GET    /ranking/:scopeTipo/:scopeId` (sección, asignatura, curso, sede, institución).
- `POST   /ranking/recalcular/:scopeTipo/:scopeId`.
- `GET|POST|PATCH /ranking-config`.
- `GET    /reportes/avance-estudiante`.
- `GET    /reportes/avance-seccion`.
- `GET    /reportes/avance-asignatura`.
- `GET    /reportes/ejercicios-fallados`.
- `GET    /reportes/errores-frecuentes`.
- `GET    /reportes/tiempo-medio`.
- `GET    /reportes/exportar?formato=csv|xlsx`.
- `POST   /usuarios/importar?tipo=estudiante|docente`.

### UI

- Panel administrador: editor visual de fórmula de ranking + vista previa con datos reales de prueba; wizard de importación CSV; dashboards de reportes con exportación.
- Panel docente: dashboards básicos para sus secciones.
- Panel super_admin: métricas globales por institución.
- Manual contextual visible desde el menú según rol.

### Pruebas

- Suite de seguridad con `npm test`.
- Tests de fórmulas con valores límite y queries de reportes con datasets sintéticos.
- Test de seeds: tras `npm run seed:demo`, todos los flujos del MVP funcionan.
- Tests de aislamiento exhaustivos por rol.
- Cobertura objetivo: 80% en `core/` y `backend/services/`.

### Documentación

- `README.md`: manuales por rol, guía de instalación productiva, backups, rotación de tokens.
- `CHANGELOG.md`: entrada `2.0.0` consolidada.
- `docs/api.md`: contrato completo.
- `docs/ranking.md`: especificación de fórmulas JSON.
- `docs/security.md`: superficie revisada y mitigaciones.
- `docs/operacion.md`: backups, monitoreo básico, rotación de tokens.

### Criterios de Aceptación

- Existe login real por rol.
- super_admin crea instituciones; administrador configura sede, curso, asignatura, sección, docente y estudiantes.
- Docente asigna ejercicios a una sección.
- Estudiante resuelve ejercicios y guarda progreso; al volver retoma exactamente.
- Ranking por sección, asignatura, curso, sede e institución, configurable por fórmula JSON.
- `Dimension`, arreglos y matrices funcionan.
- `SubProceso`/`Funcion` funcionan.
- Consola organizada en pestañas; Variables muestra árbol por proceso; Diagrama es bidireccional.
- Reportes exportan CSV/Excel correctos.
- Suite de pruebas cubre lenguaje, progreso, roles, ranking y seguridad.
- Documentación 2.0 completa.
- Seeds de demo reproducibles.

### Restricciones Específicas

- No introducir nuevas funcionalidades de lenguaje en este cierre.
- No modificar el dialecto.
- Fórmulas de ranking evaluadas con whitelist; nunca con `eval`.

### Riesgos Específicos

- Sobrecarga de cobertura artificial. Mitigación: foco en flujos críticos (auth, RBAC, persistencia, sandbox), no en métodos triviales.
- Reportes pesados pueden degradar el servicio. Mitigación: rate limit + cache + materialización solo si la métrica de carga lo justifica.

---

## Restricciones Globales para la Ruta 2.0

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

- **AST inestable antes del diagrama** → `v1.1.0` cierra con AST versionado y pruebas de roundtrip; `v1.9.0` no comienza si esto no está sólido.
- **Multi-tenant inseguro** → `v1.3.0` introduce middleware obligatorio + tests E2E de cruzamiento desde el primer commit institucional.
- **Ejecución server-side de código del estudiante** → sandbox en `Worker` con timeout y tope de iteraciones desde `v1.4.0`.
- **Migración del intérprete a AST** → `v1.1.0` cierra solo si los 245 ejercicios producen las mismas salidas.
- **Tabla de símbolos plana** → `v1.1.0` introduce scope chain incluso cuando solo hay scope global, para no rehacer todo en `v1.8.0`.
- **Arreglos en múltiples capas** → `v1.6.0` se entrega como bloque cerrado: tokenizer, validador, runtime, autocompletado.
- **Ranking en tiempo real** → `v1.5.0` usa fórmula fija con cache; `v2.0.0` agrega configuración y materialización opcional.
- **Crecimiento excesivo del modo institucional** → cada minor entre `v1.1.0` y `v1.9.0` es entregable por sí mismo; `v2.0.0` solo empaqueta y endurece.

## Norte 2.0

LiteSeInt 2.0 debe sentirse pequeño para el estudiante y completo para la institución. El editor 1.0 sigue siendo el corazón del producto: si abrir LiteSeInt como estudiante deja de ser claro, simple y rápido en cualquier punto de la ruta, esa versión no debería liberarse.
