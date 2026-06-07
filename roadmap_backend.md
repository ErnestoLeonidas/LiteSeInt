# Roadmap LiteSeInt — Backend: hacia backend v1.0.0

Este roadmap describe **únicamente el backend** de LiteSeInt: cuentas, control de acceso, multi-tenant, persistencia de código, actividades, ranking, reportes y hardening. El frontend y el editor viven en un track separado: **`ROADMAP.md`**.

> El front se construye de forma autónoma hasta su versión `v1.9.0` (último feature de editor: diagrama bidireccional). **`backend v1.0.0` debe estar listo en ese punto.** La integración front↔backend se ensambla y valida entre el front `v1.9.0` y el front `v2.0.0`.

## Índice de la Ruta (Backend)

| Versión | Tema | Estado |
|---|---|---|
| `backend v0.1.0` | Bootstrap, login y RBAC | Planificado |
| `backend v0.2.0` | Multi-tenant y modelo académico | Planificado |
| `backend v0.3.0` | Persistencia de código, sandbox y reanudación | Planificado |
| `backend v0.4.0` | Actividades asignables y ranking básico | Planificado |
| `backend v1.0.0` | Release institucional: reportes, ranking configurable, hardening, seeds | Planificado |

### Correspondencia con el front

| Front | Backend que debe existir |
|---|---|
| `v1.6.0`–`v1.9.0` (editor autónomo) | Avanza en paralelo; el front no lo necesita aún |
| **Cierre de front `v1.9.0`** | **`backend v1.0.0` listo** |
| `v1.9.0` → `v2.0.0` (integración) | `backend v1.0.0` consumido y validado por la UI |

> **Sobre la numeración.** Front y backend comparten una sola línea de versiones `v1.1.0` → `v2.0.0`, repartida por área: el front ocupa `v1.1.0` y `v1.6.0`–`v1.9.0`; el backend ocupa `v1.2.0`–`v1.5.0`. Para evitar confusión, el backend etiqueta sus entregables con su propia secuencia interna `backend v0.1.0` → `backend v1.0.0`, cuyo cierre coincide con el front `v1.9.0`. Ambos convergen en el `v2.0.0` conjunto.

---

## Decisiones de Arquitectura (Backend)

- Stack: Node 20 + Express + Prisma. SQLite en desarrollo, PostgreSQL en producción.
- Validación de entrada con Zod.
- Auth: JWT de acceso corto + refresh token httpOnly. Hash con argon2id (alternativa bcrypt).
- Multi-tenant con `institucion_id` en toda tabla de dominio y middleware obligatorio de aislamiento.
- Rankings on-demand con cache hasta tener volumen real.
- El **código fuente del estudiante es la verdad**; AST y diagrama son derivados/cache.
- Reutiliza `core/` (tokenizer, validator, parser, runtime) como ES modules importados desde Node — **sin duplicar reglas de lenguaje**. El backend no reimplementa el intérprete.
- Tests con `node:test` + `supertest`.

Estructura objetivo de carpetas del backend:

```
/LiteSeInt
├── core/                (compartido, importado desde Node — no se modifica aquí)
├── shared/              ast-contract.md, roles.js, errors.js
└── backend/
    ├── server.js
    ├── routes/
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── middleware/
    ├── database/        schema.prisma, migrations/
    ├── seeds/
    └── exporters/
```

> El esqueleto vacío de `backend/` (más un shim de compatibilidad si hiciera falta) se crea al iniciar `backend v0.1.0`. Nada de esto bloquea el desarrollo del front.

---

## backend v0.1.0 — Bootstrap, Login y RBAC

### Objetivo

Levantar la API protegida con autenticación y control por rol, lista para que las siguientes versiones agreguen el modelo académico encima.

### Alcance

- Bootstrap `backend/` con Express + Prisma + Zod.
- Roles `SUPER_ADMIN`, `ADMINISTRADOR`, `DOCENTE`, `ESTUDIANTE`.
- Auth con JWT corto + refresh token httpOnly.
- Hash argon2id, rate limit en login y headers de seguridad con `helmet`.
- Seed inicial con un super_admin único.

### Cambios Técnicos

- `backend/server.js`: bootstrap con CORS, helmet, rate limit.
- `backend/middleware/auth.js`, `backend/middleware/rbac.js`.
- `backend/routes/auth.js`, `backend/controllers/auth.js`.
- `backend/services/passwords.js` (argon2id).
- `tests/api/auth.test.js` con `supertest`.

### Schema (migración inicial)

- `usuarios`: id, nombre, email UNIQUE, password_hash, rol, activo, created_at, updated_at. (Aún sin `institucion_id`; entra en `backend v0.2.0`).

### Endpoints

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET  /auth/me`

### Pruebas

- Tests de login, expiración, refresh y bloqueo por rate limit.
- Tests de RBAC: el middleware autoriza/rechaza según rol.

### Documentación

- `README.md`: sección "Instalación local", variables de entorno, primer super_admin.
- `docs/api.md`: contrato de auth.
- `docs/roles.md`: matriz de permisos inicial.

### Criterios de Aceptación

- super_admin inicia sesión y consume endpoints protegidos.
- Tokens expiran y refrescan correctamente.
- Tests confirman que un rol no accede a endpoints fuera de su alcance.

### Restricciones Específicas

- No persistir contraseñas en texto plano ni loguearlas.
- No exponer endpoints de dominio antes de tener middleware de tenant (entra en `backend v0.2.0`).

### Riesgos Específicos

- Refresh tokens mal implementados dejan sesiones vulnerables. Mitigación: cookie httpOnly + rotación + revocación al logout.

---

## backend v0.2.0 — Multi-tenant y Modelo Académico

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

### Pruebas

- Tests E2E de aislamiento: un usuario del tenant A no lee/escribe en B.
- Tests de CRUD por rol.
- Tests de matrícula y asignación.

### Documentación

- `README.md`: sección "Configurar una institución".

### Criterios de Aceptación

- super_admin crea una institución desde cero.
- Administrador configura sede, curso, asignatura, sección, docente y estudiantes.
- Tests E2E confirman aislamiento estricto.

### Restricciones Específicas

- Toda query de dominio pasa por el middleware de tenant; no se permiten queries directas sin filtro.
- Nada de borrado físico para instituciones/sedes en producción; usar `activo=false`.

### Riesgos Específicos

- Joins olvidados pueden saltar el aislamiento. Mitigación: extension Prisma central + tests E2E de cruzamiento.

---

## backend v0.3.0 — Persistencia de Código, Sandbox y Reanudación

### Objetivo

Que el estudiante resuelva ejercicios del banco actual con autosave, historial e intentos persistidos, y pueda cerrar y volver sin perder nada. Validación server-side segura.

### Alcance

- Guardado automático del código por estudiante y ejercicio.
- Historial de versiones del código.
- Registro de intentos de ejecución/validación.
- Estado de avance por ejercicio: pendiente, en curso, completado, revisado.
- Reanudación exacta del último estado.
- Sandbox server-side para validar entregas.

### Cambios Técnicos

- `backend/services/sandbox.js`: ejecuta `core/LiteSeInt.js` en `Worker` con `AbortController`, timeout 3s y tope de iteraciones.
- `backend/routes/proyectos.js`: autosave, intento, recuperación.
- `backend/services/progreso.js`: cálculo de estado y porcentaje.

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

### Pruebas

- Test de sandbox: programa con loop infinito aborta a los 3s.
- Test de reanudación: cerrar/volver mantiene el código exacto.
- Test de historial: cada autosave significativo crea versión.
- Test de aislamiento: estudiante no lee proyectos de otros.

### Documentación

- `README.md`: sección "Resolver ejercicios".

### Criterios de Aceptación

- El estudiante cierra el navegador y al volver ve su código exactamente.
- El sandbox aborta loops infinitos.
- Historial e intentos quedan accesibles.
- Banco intacto y dialecto inalterado.

### Restricciones Específicas

- No introducir nuevas funcionalidades de lenguaje (eso es del track del front).
- No alterar el banco de ejercicios.

### Riesgos Específicos

- Autosave excesivo puede saturar la base. Mitigación: debounce + guardar versión solo ante cambios significativos (delta o intervalo mínimo).

---

## backend v0.4.0 — Actividades Asignables y Ranking Básico

### Objetivo

Que un docente cree actividades, asigne ejercicios a su sección y vea un ranking básico. El estudiante recibe su lista de tareas y su posición.

### Alcance

- Actividades creadas por docentes con fecha de inicio y cierre, dificultad y puntaje.
- Ejercicios asignables a una sección dentro de una actividad.
- Solución de referencia y casos de prueba opcionales.
- Ranking básico por sección con fórmula fija (ejercicios completados + dificultad + tiempo).
- Visibilidad por rol: el estudiante no ve datos privados.

### Cambios Técnicos

- `backend/routes/actividades.js`: CRUD para docente.
- `backend/services/ranking.js`: cálculo on-demand con cache 5 min en memoria.

### Schema (migraciones)

- `actividades`: id, institucion_id, asignatura_id, seccion_id, docente_id, titulo, descripcion, fecha_inicio, fecha_cierre, puntaje, visible.
- `actividad_ejercicios`: id, actividad_id, ejercicio_id, orden, puntaje.
- Alteración: `progreso.actividad_id` (nullable). `proyectos_codigo.actividad_id` (nullable).

### Endpoints

- CRUD `/actividades` (docente).
- `POST /actividades/:id/ejercicios` (asignar).
- `GET  /actividades/me` (estudiante: actividades asignadas).
- `GET  /ranking/seccion/:id`.

### Pruebas

- Tests de creación y vencimiento de actividades.
- Tests de ranking con dataset sintético.
- Tests de visibilidad por rol.

### Documentación

- `README.md`: sección "Asignar ejercicios y ver progreso".

### Criterios de Aceptación

- Docente asigna ejercicios; el estudiante los recibe.
- Ranking se calcula con datos reales y respeta permisos.
- Las fechas de cierre cierran efectivamente la entrega.

### Restricciones Específicas

- Ranking aún no configurable por institución (eso entra en `backend v1.0.0`).
- Calificación automática avanzada queda fuera; los casos de prueba opcionales solo validan ejecución/salida básica.

### Riesgos Específicos

- Ranking en tiempo real puede ser costoso. Mitigación: cache 5 min por scope.

---

## backend v1.0.0 — Release Institucional

Versión objetivo del backend. **Debe estar lista cuando el front cierre su `v1.9.0`.** Empaqueta y endurece todo lo anterior.

### Objetivo

Entregar el backend institucional listo para integrarse con la UI y para demos en colegios y educación superior: reportes, ranking configurable, importación masiva de usuarios, hardening de seguridad y seeds reproducibles.

### Alcance

- Ranking configurable por institución con fórmula JSON.
- Reportes para administradores y docentes con exportación CSV/Excel.
- Importación CSV de estudiantes y docentes con validaciones y reporte de errores.
- Hardening: rate limiting fino, expiración y rotación de tokens, sanitización de inputs, headers reforzados, auditoría de eventos sensibles.
- Cobertura de pruebas elevada y suite de seguridad propia.
- Seeds de demo: institución modelo con secciones, docentes, estudiantes y ejercicios asignados.

### Cambios Técnicos

- `backend/services/ranking.js`: motor que evalúa fórmulas JSON con whitelist (sin `eval`).
- `backend/services/reports.js`: queries optimizadas; vistas materializadas opcionales.
- `backend/exporters/csv.js` y `xlsx.js`.
- `backend/services/csv-import.js`: parsing con validaciones por fila.
- `backend/middleware/security.js`: helmet endurecido, rate limit por IP/usuario, CORS estricto.
- `backend/services/audit.js`: log de eventos sensibles (login, cambios de rol, exportaciones).
- `backend/seeds/demo.js`: dataset reproducible.

### Schema (migraciones)

- `rankings`: id, scope_tipo, scope_id, estudiante_id, puntaje, posicion, calculado_at.
- `ranking_config`: id, institucion_id, nombre, formula_json, visible_estudiante, activo.
- `auditoria`: id, usuario_id, institucion_id, accion, payload_json, ip, created_at.
- Índices auxiliares para reportes: `intentos(seccion_id, created_at)`, vistas o materializaciones según métricas reales.
- Alteración (cache de diagrama, opcional): `proyectos_codigo.diagrama_json`, `proyectos_codigo.diagrama_layout_json`.

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
- `PUT    /proyectos/:ejercicioId/diagrama` (cache + layout, opcional).

### Pruebas

- Suite de seguridad con `npm test`.
- Tests de fórmulas con valores límite y queries de reportes con datasets sintéticos.
- Test de seeds: tras `npm run seed:demo`, todos los flujos del MVP funcionan.
- Tests de aislamiento exhaustivos por rol.
- Cobertura objetivo: 80% en `backend/services/`.

### Documentación

- `README.md`: guía de instalación productiva, backups, rotación de tokens.
- `docs/api.md`: contrato completo.
- `docs/ranking.md`: especificación de fórmulas JSON.
- `docs/security.md`: superficie revisada y mitigaciones.
- `docs/operacion.md`: backups, monitoreo básico, rotación de tokens.

### Criterios de Aceptación

- Login real por rol; super_admin crea instituciones; administrador configura el modelo académico.
- Docente asigna ejercicios a una sección.
- Estudiante resuelve ejercicios y guarda progreso; al volver retoma exactamente.
- Ranking por sección, asignatura, curso, sede e institución, configurable por fórmula JSON.
- Reportes exportan CSV/Excel correctos.
- Suite de pruebas cubre auth, RBAC, persistencia, sandbox, ranking y seguridad.
- Seeds de demo reproducibles.
- **La API está lista para ser consumida por el front en su integración `v1.9.0` → `v2.0.0`.**

### Restricciones Específicas

- No introducir funcionalidades de lenguaje ni modificar el dialecto (eso es del track del front).
- Fórmulas de ranking evaluadas con whitelist; nunca con `eval`.
- No reimplementar el intérprete: reutilizar `core/`.

### Riesgos Específicos

- Sobrecarga de cobertura artificial. Mitigación: foco en flujos críticos (auth, RBAC, persistencia, sandbox), no en métodos triviales.
- Reportes pesados pueden degradar el servicio. Mitigación: rate limit + cache + materialización solo si la carga real lo justifica.

---

## Restricciones Globales (Backend)

- No permitir acceso cruzado entre instituciones.
- No guardar contraseñas en texto plano.
- No mezclar lógica de lenguaje con backend: el `core/` es la única fuente del intérprete.
- No duplicar validaciones de lenguaje en el servidor.
- No modificar código del estudiante sin confirmación cuando exista riesgo de pérdida.
- Mantener mensajes y UI asociada en español.

## Riesgos Globales y Mitigaciones (Backend)

- **Multi-tenant inseguro** → middleware obligatorio + tests E2E de cruzamiento desde el primer commit institucional (`backend v0.2.0`).
- **Ejecución server-side de código del estudiante** → sandbox en `Worker` con timeout y tope de iteraciones desde `backend v0.3.0`.
- **Ranking en tiempo real** → fórmula fija con cache en `backend v0.4.0`; configuración y materialización opcional en `backend v1.0.0`.
- **Desfase con el front** → `backend v1.0.0` es un gate duro: si no está listo al cerrar el front `v1.9.0`, la integración `v1.9.0` → `v2.0.0` no comienza.

## Norte

El backend existe para sostener la dimensión institucional sin estorbar al editor. El front debe poder construirse y demostrarse sin servidor hasta su `v1.9.0`; el backend se integra recién en la fase final. Si la presencia del backend complica la experiencia del estudiante en el editor, la integración está mal hecha.
