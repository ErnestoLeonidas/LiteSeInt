# Roadmap LiteSeInt — Front y Editor: de v1.1 a v2.0

Este roadmap describe **únicamente el frontend y el editor** de LiteSeInt. El front se construye de forma **autónoma, sin necesidad del backend**: cada versión es entregable, demoable y mantiene la app funcionando abriendo `index.html`.

El trabajo de servidor (cuentas, multi-tenant, persistencia, actividades, ranking, reportes) vive en un track separado: **`roadmap_backend.md`**.

> En `v2.0.0` LiteSeInt será la plataforma educativa institucional. El front llega hasta `v1.9.0` como editor completo y autónomo; de `v1.9.0` a `v2.0.0` se valida la **integración con `backend v1.0.0`**, que debe estar listo para ese punto.

## Índice de la Ruta (Front)

| Versión | Tipo | Tema | Estado |
|---|---|---|---|
| `v1.1.0` | minor | Reestructura interna y AST explícito | Entregado (estado actual) |
| `v1.1.x` | patch | Mantenimiento del editor | Abierto a parches no disruptivos |
| `v1.6.0` | minor | Lenguaje — Arreglos y matrices (`Dimension`) | Planificado |
| `v1.7.0` | minor | Panel de pestañas e inspector de variables | Planificado |
| `v1.8.0` | minor | Lenguaje — `SubProceso`/`Funcion` y call stack | Planificado |
| `v1.9.0` | minor | Diagrama bidireccional | Planificado |
| `v2.0.0` | major | Integración con `backend v1.0.0` y release institucional (capa front) | Planificado |

> **Sobre la numeración.** Los números `v1.2.0`–`v1.5.0` pertenecen al track del backend (ver `roadmap_backend.md`); por eso el front salta de `v1.1.0` a `v1.6.0`. Se conserva la numeración histórica para no romper la correspondencia con el CHANGELOG, los tags y la planificación previa. Los dos tracks comparten una sola línea de versiones `v1.1.0` → `v2.0.0`, repartida por área.

> **Relación con el backend.** Hasta `v1.9.0` el front no depende del servidor. `backend v1.0.0` avanza en paralelo en su propio track y **debe estar listo cuando el front cierre `v1.9.0`**. La integración (cliente HTTP, login, paneles por rol, persistencia, actividades, ranking) se ensambla y valida entre `v1.9.0` y `v2.0.0`.

---

## Estado Base: v1.1.0 (actual)

Sitio estático con HTML, CSS y JavaScript vanilla. El motor ya está reorganizado en `core/` como capas reutilizables desde el navegador y desde Node, con AST explícito y versionado.

- `index.html`: shell visual y carga de scripts.
- `css/styles.css`: sistema visual y responsive.
- `js/app.js`: controlador de UI, editor, consola, autocompletado, ejemplos y estado visual.
- `core/tokenizer.js`: capa léxica (`TK`, tokenización por línea, reservadas/tipos/nativas, contexto de cursor, `stripComment`).
- `core/symbol-table.js`: `TablaSimbolos` y `ScopeChain` (solo scope global hoy; preparado para subprocesos).
- `core/validator.js`: validador estático y reglas `validar*` con `loc:{linea,columnaInicio,columnaFin}`.
- `core/doc_errores.js`: agregador del contrato público `DocErrores.{...}`.
- `core/ast.js`: factories de nodos, `AST_VERSION` y helpers JSON. Contrato en `shared/ast-contract.md`.
- `core/parser.js`: `parsearPrograma(codigo)` produce el AST `Programa`.
- `core/expression-evaluator.js`: shunting-yard, evaluador de condiciones y tablas de operadores/nativas (mixin sobre `LiteSeInt.prototype`).
- `core/LiteSeInt.js`: runtime que recorre el AST; estado de ejecución, callbacks y errores en tiempo de ejecución.
- `js/ejercicios-data.js` y `json/N1.json`–`json/N7.json`: banco de 245 ejercicios.
- `tests/run-tests.js`: suite de regresión (validador, parser, AST, runtime, banco).

Dialecto congelado en `v1.1.0`: `Definir`, `Escribir`, `Leer`, `=`, `//`, tipos `Entero`/`Real`/`Caracter`/`Logico`, literales `Verdadero`/`Falso`, expresiones aritméticas con precedencia, relacionales (`==`, `!=`, `<>`, `<`, `>`, `<=`, `>=`), lógicos (`Y`, `O`, `No`) y control completo (`Si/Sino/FinSi`, `Mientras/FinMientras`, `Repetir/HastaQue`, `Para/FinPara`, `Segun/De Otro Modo/FinSegun`).

`v1.1.x` queda abierto a parches puntuales (typos, accesibilidad, ajustes responsive) que no introduzcan cambios de dialecto ni dependan del backend.

## Decisiones de Arquitectura (Front)

- `core/` no depende de DOM, jQuery, Bootstrap ni estado de UI. Importable desde navegador y desde Node.
- AST explícito y versionado (`AST_VERSION`) como contrato compartido entre validador, runtime y, más adelante, el diagrama.
- El **código fuente es la verdad**; AST y diagrama son derivados/cache.
- Frontend en HTML + Bootstrap 5.3 + JavaScript vanilla + jQuery. Sin frameworks SPA ni TypeScript salvo justificación explícita.
- UI siempre en español.
- Respeto estricto de las fronteras de capa descritas en `CLAUDE.md` (léxico en tokenizer, validación estática en validator, semántica en runtime/expression-evaluator, UI en `js/app.js`).
- Sin acoplar el editor al servidor: toda interacción con backend pasa por una capa cliente aislada que se introduce recién en `v2.0.0`.

---

## v1.6.0 — Lenguaje: Arreglos y Matrices (`Dimension`)

Tipo: minor. Primera extensión del dialecto.

### Objetivo

Soportar arreglos y matrices con sintaxis estilo PSeInt sin romper el dialecto de `v1.1.0`.

### Alcance

- `Dimension nombre[tamaño]` para arreglos.
- `Dimension nombre[filas, columnas]` para matrices.
- Acceso por índice unidimensional `arr[i]` y bidimensional `mat[i, j]`.
- Validación estática y runtime de rangos, tipos y arreglo no dimensionado.
- Autocompletado y ejemplos extendidos.

### Cambios Técnicos

- `core/tokenizer.js`: tokens `Dimension`, `[`, `]`, `,` en contexto de índices.
- `core/ast.js` + `shared/ast-contract.md`: nodos `Dimension`, `IndiceArreglo`, `IndiceMatriz`; sube `AST_VERSION`.
- `core/symbol-table.js`: registra forma `{tipo, dimensiones:[n] | [filas, cols]}`.
- `core/validator.js`: reglas nuevas — dimensión positiva, índice numérico, tipo coherente, arreglo no dimensionado.
- `core/parser.js`: emite los nuevos nodos.
- `core/LiteSeInt.js`: lectura/escritura por índice; errores `IndiceFueraDeRango`, `ArregloNoDimensionado`, `TipoIncompatible`.
- `core/expression-evaluator.js`: soporta accesos por índice como expresiones.
- `js/app.js`: autocompletado de `Dimension` y ejemplos.

### Pruebas

- Tests de validador para cada error nuevo.
- Tests de runtime para arreglos, matrices y errores típicos.
- Re-ejecución de los 245 ejercicios de `v1.1.0`: salidas idénticas.
- Roundtrip de serialización/deserialización del AST con los nodos nuevos.

### Documentación

- `README.md`: sección "Arreglos y matrices".
- `CHANGELOG.md`: entrada `1.6.0`.
- Pestaña interna `Comandos` del frontend actualizada.

### Criterios de Aceptación

- `Dimension v[5]` y `Dimension m[3,4]` validan, ejecutan y reportan errores con `loc` exacta.
- Tests cubren rango, tipo y errores típicos.
- Ejercicios de `v1.1.0` siguen pasando.

### Restricciones Específicas

- No introducir aún paso por referencia (entra en `v1.8.0` con subprocesos).
- Respetar `Definir nombre Como Tipo` después de `Dimension`.
- Sin dependencia del backend.

### Riesgos Específicos

- Tokens `[` y `]` pueden colisionar con texto futuro. Mitigación: válidos solo tras identificadores en contexto de índice/dimension.

---

## v1.7.0 — Panel de Pestañas e Inspector de Variables

Tipo: minor. Cambio mayor de UX en el área inferior.

### Objetivo

Convertir la consola actual en un panel con pestañas Consola / Variables / Diagrama y un inspector de variables vivo durante la ejecución.

### Alcance

- Pestaña Consola: salida, entrada para `Leer`, trazas opcionales, errores runtime (igual que hoy).
- Pestaña Variables: árbol por proceso activo (en esta versión solo el principal) con variables, valor actual, tipo, estado de inicialización, arreglos/matrices expandibles y resaltado de cambios recientes.
- Pestaña Diagrama: placeholder con mensaje "Disponible en v1.9.0".
- Modo paso a paso visible en la barra del editor.

### Cambios Técnicos

- `core/LiteSeInt.js`: emite eventos `onStep({linea, scopeSnapshot})`, `onVariableChanged({nombre, valorAnterior, valorNuevo})`, `onScopeEntered`, `onScopeExited`.
- `js/app.js`: contenedor de pestañas e integración del inspector.
- `css/styles.css`: estilos del panel y del árbol respetando variables `:root`.

### Pruebas

- Tests headless del runtime emitiendo eventos en el orden correcto.
- Snapshots del inspector tras cada paso en programas con asignación, condicional, ciclo y arreglos.

### Documentación

- `README.md`: sección "Inspección paso a paso".
- `CHANGELOG.md`: entrada `1.7.0`.

### Criterios de Aceptación

- Cada paso muestra el árbol correcto y resalta variables modificadas.
- Arreglos y matrices se expanden visualmente.
- En modo normal, el inspector muestra el estado final.
- Las pestañas se comportan como acordeón en pantallas pequeñas.

### Restricciones Específicas

- No mover lógica de runtime al frontend; los eventos salen del `core/`.
- No tocar el dialecto.
- Sin dependencia del backend.

### Riesgos Específicos

- Eventos por paso pueden saturar el frontend. Mitigación: throttling y batching por encima de N pasos por segundo.

---

## v1.8.0 — Lenguaje: SubProceso, Funciones y Call Stack

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
- `core/ast.js` + `shared/ast-contract.md`: nodos `SubProceso` (`params`, `paramsPorReferencia`, `retorno?`, `cuerpo`, `esFuncion`) y `Llamar`; sube `AST_VERSION`.
- `core/parser.js`: emite los nuevos nodos.
- `core/symbol-table.js`: scope chain real con lookup ascendente.
- `core/LiteSeInt.js`: call stack con frames; profundidad máxima configurable (256 por defecto).
- `core/validator.js`: errores `FuncionNoDefinida`, `AridadIncorrecta`, `RetornoNoAsignado`, `ParametroIncompatible`.
- `js/app.js`: selector de frame en el inspector y autocompletado de subprocesos definidos por el estudiante.

### Pruebas

- Tests de scopes anidados, recursión y paso por referencia.
- Tests de errores de llamada.
- Test específico: arreglo por referencia se modifica en el llamador.
- Re-ejecución de los 245 ejercicios de `v1.1.0`: salidas idénticas.

### Documentación

- `README.md`: sección "Subprocesos y funciones".
- `CHANGELOG.md`: entrada `1.8.0`.

### Criterios de Aceptación

- Programa con tres subprocesos y recursión ejecuta correctamente.
- Parámetros por referencia modifican el arreglo del llamador.
- El inspector navega el call stack y muestra variables del frame seleccionado.
- Errores de llamada apuntan a la línea correcta.

### Restricciones Específicas

- No permitir funciones anidadas dentro de funciones.
- No introducir closures.
- No permitir mismo nombre entre `SubProceso` y variable global.
- Sin dependencia del backend.

### Riesgos Específicos

- Recursión profunda puede colgar la pestaña. Mitigación: límite de profundidad y mensaje claro al estudiante.

---

## v1.9.0 — Diagrama Bidireccional

Tipo: minor. Última pieza de editor antes del cierre 2.0. **Checkpoint: `backend v1.0.0` debe estar listo al completar esta versión.**

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
- `js/app.js` (o `js/diagram/`): render, edición y atajos del diagrama.
- Detección de pérdida y bloqueo de edición destructiva.
- Atajo de teclado para alternar foco editor/diagrama.

### Pruebas

- Tests unitarios de roundtrip exacto del AST en todos los nodos soportados.
- Tests de seguridad: si el parseo falla, el código queda intacto.
- Test manual: editar un nodo `Si` actualiza solo esa rama del código.

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
- Sin dependencia del backend (la persistencia del diagrama se conecta en `v2.0.0`).

### Riesgos Específicos

- Bidireccionalidad mal implementada destruye trabajo del estudiante. Mitigación: tests de roundtrip estrictos + bloqueo cuando el parseo falla.

---

## v2.0.0 — Integración con Backend v1.0.0 y Release Institucional (capa front)

Tipo: major. Cierre de la ruta. Aquí el editor autónomo se conecta con `backend v1.0.0` (ver `roadmap_backend.md`).

### Objetivo

Ensamblar y validar la integración entre el editor completo (`v1.9.0`) y el backend institucional (`backend v1.0.0`): login real por rol, persistencia de código, actividades, ranking y reportes consumidos desde la UI, sin perder la simplicidad del editor 1.x.

### Alcance (lado front)

- Capa cliente HTTP aislada (`js/services/api.js`) con manejo de refresh de sesión.
- Pantalla de login y menú dinámico por rol.
- Paneles por rol que consumen el backend: super_admin, administrador, docente, estudiante.
- Editor integrado con autosave, badges de estado, historial e intentos.
- Vistas de actividades asignadas y ranking de la sección.
- Editor de fórmula de ranking, dashboards de reportes e importación CSV (paneles admin).
- El editor 1.x sigue accesible y funcional incluso sin sesión.

### Cambios Técnicos (lado front)

- `js/services/api.js`: cliente HTTP único; nunca duplica reglas de lenguaje del `core/`.
- `js/ui/login.js`, `js/ui/menu.js`: autenticación y navegación por rol.
- `js/ui/estudiante/`, `js/ui/docente/`, `js/ui/admin/`: paneles que consumen los endpoints del backend.
- Integración del editor existente con autosave y estado de avance.
- Pestaña Diagrama: persistencia de `diagrama_json`/layout vía backend.

### Pruebas

- Tests E2E de integración front↔backend para los flujos críticos (login, autosave, reanudación, actividad, ranking).
- Verificación de que el editor 1.x funciona idéntico con y sin sesión.
- Re-ejecución de los 245 ejercicios: salidas idénticas.

### Documentación

- `README.md`: manuales por rol y guía de integración.
- `CHANGELOG.md`: entrada `2.0.0` consolidada.

### Criterios de Aceptación

- Login real por rol funcionando contra `backend v1.0.0`.
- Estudiante resuelve ejercicios y guarda progreso; al volver retoma exactamente.
- Docente asigna ejercicios; estudiante los ve y aparece en el ranking.
- Reportes e importación CSV operan desde los paneles admin.
- `Dimension`, `SubProceso`/`Funcion`, inspector de variables y diagrama bidireccional siguen funcionando.
- El editor sigue sintiéndose simple para el estudiante.

### Restricciones Específicas

- No introducir nuevas funcionalidades de lenguaje en este cierre.
- No modificar el dialecto.
- No mover validación ni lógica de lenguaje al backend ni a la capa de servicios.
- Toda lógica de servidor vive en el track de `roadmap_backend.md`.

### Riesgos Específicos

- Acoplar la UI al backend puede degradar la experiencia del editor autónomo. Mitigación: capa cliente aislada y modo sin sesión siempre funcional.

---

## Restricciones Globales (Front)

- No romper ejercicios actuales ni eliminar sintaxis soportada.
- No mezclar lógica de lenguaje con UI.
- No duplicar validaciones entre `js/app.js` y `core/`.
- Mantener la UI en español.
- Mantener la experiencia simple para estudiantes.
- No introducir TypeScript ni frameworks SPA salvo justificación explícita.
- El front debe poder construirse y demostrarse **sin backend** hasta `v1.9.0`.

## Riesgos Globales y Mitigaciones (Front)

- **AST inestable antes del diagrama** → el AST versionado y los tests de roundtrip se mantienen sólidos desde `v1.1.0`; `v1.9.0` no comienza si esto no está firme.
- **Migración del intérprete a AST** → ya cerrada en `v1.1.0`; cada extensión de lenguaje re-verifica salidas idénticas en los 245 ejercicios.
- **Tabla de símbolos plana** → el scope chain ya existe (solo global) para no rehacer todo en `v1.8.0`.
- **Arreglos en múltiples capas** → `v1.6.0` se entrega como bloque cerrado: tokenizer, validador, runtime, autocompletado.
- **Eventos del inspector** → `v1.7.0` usa throttling/batching para no saturar la UI.
- **Dependencia del backend** → el front avanza autónomo hasta `v1.9.0`; la integración se aísla en una capa de servicios introducida en `v2.0.0`.

## Norte 2.0

El editor 1.x sigue siendo el corazón del producto. LiteSeInt debe sentirse pequeño para el estudiante y completo para la institución: si abrir LiteSeInt como estudiante deja de ser claro, simple y rápido en cualquier punto de la ruta, esa versión no debería liberarse. El backend nunca debe estorbar al editor.
