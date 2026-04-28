# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [v.0.8.2] — 2026-04-28

Consolidación del banco de ejercicios. Esta versión mueve la fuente real de ejercicios a JSON normalizados por EA y deja `js/ejercicios-data.js` como cargador único del banco.

### Agregado
- **245 ejercicios adaptados y visibles**: los archivos `json/EA 1.1.json` a `json/EA 1.7.json` quedan en el formato normalizado del banco (`id`, `origen`, `modulo`, `experiencia`, `nivelLiteSeInt`, `dificultad`, `gradoAyuda`, `titulo`, `conceptos`, `enunciado`, `entradaProcesoSalida`, `salidaEsperada`, `pista`, `codigoReferencia`, `estadoAdaptacion`, `motivoExclusion`).
- **Carga centralizada desde JSON**: `js/ejercicios-data.js` ahora define las rutas de las EAs, carga los JSON con `fetch`, instala el banco y expone `EjerciciosLiteSeInt`.

### Cambiado
- **`index.html`**: carga `js/ejercicios-data.js` antes de `js/app.js`.
- **`js/app.js`**: deja de conocer las rutas JSON y delega la carga en `EjerciciosLiteSeInt.cargarDesdeJson()`.
- **`tests/run-tests.js`**: las pruebas instalan el banco desde los JSON, alineadas con el flujo de la app.
- **Documentación**: `README.md` y `EJERCICIOS.md` reflejan que el banco visible contiene 245 ejercicios adaptados.
- **Versión visible**: `vv.0.8.2`.

### Pendiente
- Optimizar los JSON de **EA 1.6** y **EA 1.7**: aunque están normalizados y pasan validación estática, todavía requieren revisión pedagógica para reducir repetición, mejorar enunciados/pistas y ajustar progresión.

## [0.8.0] — 2026-04-26

Cierre de la fase "Banco de Ejercicios Integrado". Esta versión reemplaza los placeholders del panel derecho por un banco real de ejercicios navegable, derivado de `ejercicios/guia.html` y adaptado al dialecto LiteSeInt. No cambia el lenguaje ni el runtime.

### Agregado
- **`js/ejercicios-data.js`**: nueva fuente de datos del banco de ejercicios. Expone `EjerciciosLiteSeInt` con `EJERCICIOS`, helpers (`listarAdaptados`, `porId`, `porNivel`) y constantes (`ESTADOS_VALIDOS`, `DIFICULTADES_VALIDAS`, `GRADOS_VALIDOS`).
- **Primer lote de 20 ejercicios adaptados** desde `ejercicios/guia.html`, cubriendo los niveles 0-7 de la ruta LiteSeInt: orientación (2), secuencia/salida (1), variables/entrada (3), expresiones y E·P·S (3), decisiones simples (3), decisiones múltiples (2), repetición controlada (3) y patrones de procesamiento (3). Cada ejercicio normaliza los campos definidos en `EJERCICIOS.md` (`id`, `origen`, `modulo`, `experiencia`, `nivelLiteSeInt`, `dificultad`, `gradoAyuda`, `titulo`, `conceptos`, `enunciado`, `entradaProcesoSalida`, `salidaEsperada`, `pista`, `codigoReferencia`, `estadoAdaptacion`, `motivoExclusion`).
- **Panel derecho navegable**: filtros por **nivel**, **dificultad** y **estado**; resumen de progreso (completados/en curso/total); listado con badge de nivel, dificultad y estado; detalle del ejercicio con tags, enunciado, conceptos, entrada/proceso/salida, salida esperada y pista colapsable.
- **Acciones por ejercicio**: botón "Cargar plantilla" (genera un esqueleto `Proceso ... FinProceso` con el título como nombre) y botón "Ver código de referencia" (carga la solución adaptada). Ambos confirman antes de sobrescribir el editor si tiene contenido distinto del placeholder.
- **Progreso local persistente**: cada ejercicio puede marcarse como `pendiente`, `en curso` o `completado`. El estado se guarda en `localStorage` bajo la clave `liteseint:exerciseProgress` y persiste al recargar la página.
- **Pruebas del banco** (`tests/run-tests.js`): seis nuevas pruebas que validan ids únicos, presencia de campos obligatorios, valores permitidos para estado/dificultad/grado de ayuda, ausencia de sintaxis prohibida (`<-`, `Cadena`, `SiNo`, `MOD`, `DIV`, `;` final) en `codigoReferencia`, paso por `DocErrores.validarDocumento` para todos los códigos adaptados, y que todo ejercicio visible esté en estado `adaptado`.

### Cambiado
- **`index.html`**: el panel derecho deja de mostrar el listado de niveles 0-9 con placeholders "próximamente" y pasa a mostrar el banco con filtros + lista + detalle. La cabecera del panel ahora se titula `Ejercicios`. Se carga `js/ejercicios-data.js` antes de `js/app.js`.
- **`js/app.js`**: las funciones `NIVELES_APRENDIZAJE`, `renderizarNivelesAprendizaje`, `mostrarDetalleNivel` y `seleccionarNivel` se reemplazan por la familia del banco: `cargarProgreso`/`guardarProgreso`/`estadoEjercicio`/`setEstadoEjercicio`, `aplicarFiltros`, `renderizarListaEjercicios`, `renderizarResumenProgreso`, `mostrarDetalleEjercicio`, `cargarPlantillaEjercicio`, `cargarCodigoReferencia`, `seleccionarEjercicio` e `inicializarBancoEjercicios`.
- **`css/styles.css`**: nueva sección "EXERCISE BANK" con estilos para `.ej-filters`, `.ej-list`, `.ej-item`, `.ej-detail`, `.ej-tag`, `.ej-eps`, `.ej-salida`, `.ej-pista`, `.ej-actions`, `.ej-btn`, `.ej-btn-estado` y `.ej-progress-summary`. Reusa las variables existentes (`--accent`, `--warning`, `--danger`, `--border-color`, etc.).
- **`EJERCICIOS.md`**: tabla de seguimiento actualizada con la integración real (20 adaptados de 245), distribución por nivel del primer lote y criterios usados para la selección.
- **`README.md`**: nueva sección "Banco de ejercicios" describiendo filtros, detalle, plantilla, código de referencia y progreso local.
- **Versión visible**: `v0.8.0`.

### Compatibilidad
- Sin cambios en el lenguaje, en `js/doc_errores.js` ni en `js/LiteSeInt.js`. Los programas válidos en `v0.7.0` siguen ejecutándose igual.
- El flujo `Leer` y `inputResolver` se preserva: el input inline aparece dentro de la consola, debajo del editor.
- Los 11 ejemplos del selector superior se conservan sin cambios.

### Fuera de alcance de v0.8.0
- No se integran los 245 ejercicios completos. Permanecen 225 como pendientes (no visibles). La regla de calidad manda: todo ejercicio visible debe estar adaptado y probado.
- No se implementa documentación interna de comandos en la app (eso pertenece a 0.8.5).
- No se implementa "Roadmap del estudiante" extendido más allá de los filtros del banco (0.9.0).
- No se valida automáticamente si la solución del estudiante es correcta. El progreso es manual (pendiente / en curso / completado).
- No se introduce alias en LiteSeInt para `Cadena`, `<-`, `SiNo`, `MOD` ni `DIV`. La sintaxis del lenguaje no cambia.
- No se agrega backend, login ni dependencias pesadas.

## [0.7.0] — 2026-04-26

Cierre de la fase "Nuevo layout de aprendizaje". Esta versión reorganiza la pantalla principal para que LiteSeInt empiece a sentirse como una plataforma de aprendizaje, sin tocar el lenguaje ni el runtime.

### Agregado
- **Layout en dos columnas**: columna izquierda con editor y consola apilados; columna derecha reservada al panel de aprendizaje.
- **Consola debajo del editor**: la salida de `Escribir`, los errores, los mensajes de sistema y el input inline de `Leer` ahora ocurren bajo el editor, no al costado.
- **Consola redimensionable**: nuevo divisor `console-resize-handle` que permite arrastrar para ajustar la altura de la consola con el ratón o con `↑/↓` cuando el divisor tiene foco. La altura se persiste en `localStorage` (`liteseint:consoleHeight`).
- **Panel derecho de aprendizaje**: nueva columna `learning-panel` con los **niveles 0-9** (`Orientación`, `Secuencia y salida`, `Variables, tipos y entrada`, `Expresiones y E·P·S`, `Decisiones simples`, `Decisiones múltiples`, `Repetición controlada`, `Patrones de procesamiento`, `Programas integradores`, `Puente hacia Python`). Cada nivel muestra estado "próximamente", resumen y conceptos asociados al seleccionarlo. Aviso explícito de que los ejercicios se integrarán adaptados al dialecto LiteSeInt según `EJERCICIOS.md`.
- **Menú desplegable de ejemplos**: la barra horizontal de botones se reemplazó por un `<select>` en la cabecera del editor, con los ejemplos agrupados en `optgroup` por concepto (Primeros programas, Variables y entrada/salida, Expresiones y funciones, Condicionales, Ciclos, `Segun`).

### Cambiado
- **`index.html`**: nueva jerarquía `main-container` → `workspace-column` (`editor-panel` + `console-resize-handle` + `console-panel`) + `learning-panel`. La cabecera del editor ahora aloja el selector de ejemplos junto a `Descargar` y `Borrar`.
- **`css/styles.css`**: nuevas variables (`--learning-panel-w`, `--console-min-h`, `--console-default-h`, `--resize-handle-h`), estilos para `.workspace-column`, `.console-resize-handle`, `.learning-panel` y `.ejemplos-select`. Se elimina la regla `.example-bar`/`.example-btn`.
- **`js/app.js`**: catálogo `NIVELES_APRENDIZAJE`, helpers `renderizarNivelesAprendizaje`, `seleccionarNivel`, `mostrarDetalleNivel`, `aplicarAlturaConsola`, `inicializarResizeConsola`, `cargarAlturaConsolaPersistida` y `guardarAlturaConsola`. El binding `.example-btn` se reemplaza por `change` sobre `#ejemplosSelect` que reusa `cargarEjemplo`.
- **Versión visible**: `v0.7.0`.

### Responsive
- En anchos `≤ 768px` la columna derecha se apila debajo del workspace, puede colapsarse desde su cabecera y la consola conserva el comportamiento previo de toggle desde la cabecera. El divisor de redimensionado se oculta en móvil.
- En anchos `≤ 1024px` el panel derecho se reduce a `240px` para no comprimir el editor.

### Compatibilidad
- Sin cambios en el lenguaje, en `js/doc_errores.js` ni en `js/LiteSeInt.js`. Los programas válidos en `v0.6.5` siguen ejecutándose igual.
- El flujo `Leer` y `inputResolver` se preserva: el input inline aparece dentro de la consola, debajo del editor.
- El listado de ejemplos no cambió: los 11 ejemplos previos siguen disponibles desde el dropdown.

### Fuera de alcance de v0.7.0
- No se integran los 245 ejercicios de `ejercicios/guia.html`. El panel derecho muestra solo placeholders por nivel.
- No se implementa progreso persistente por ejercicio.
- No se agrega documentación de comandos en la app (eso pertenece a 0.8.5).
- No se agrega el puente a Python (eso pertenece a 0.9.5).

## [0.6.5] — 2026-04-26

Cierre de la fase "Base educativa". Esta versión es **documental**: no cambia el lenguaje ni el runtime. Deja por escrito cómo se adaptarán los 245 ejercicios de `ejercicios/guia.html` al dialecto LiteSeInt y qué se va a probar antes de declarar un ejercicio integrado.

### Agregado
- **`EJERCICIOS.md`**: nuevo documento que define la estructura pedagógica de la guía (7 EA × 245 ejercicios), las reglas obligatorias de adaptación (`Cadena` → `Caracter`, `<-` → `=`, `SiNo` → `Sino`, `MOD` → `mod`, `DIV` → `Trunc(a / b)` o exclusión, `;` final → eliminar, `=` como comparador → `==`), el plan de pruebas (6 criterios por ejercicio) y la tabla de seguimiento (adaptados / requieren decisión / excluidos temporales).
- **Nueva estructura de aprendizaje LiteSeInt**: se propone una ruta propia para 1.0, independiente de la numeración original de la guía: orientación, secuencia/salida, variables/entrada, expresiones/E·P·S, decisiones, decisiones múltiples, repetición, patrones, programas con menú y puente hacia Python.
- **Grados de ayuda por ejercicio**: se documenta una progresión de actividades guiado → con pista → práctica → desafío, para evitar que el estudiante parta siempre desde una pantalla en blanco.
- **`ROADMAP.md`**: hito `0.6.5 - Base Educativa` con criterios de aceptación y referencia explícita a `EJERCICIOS.md`. Se deja registrada la invariante "el 100% de los ejercicios visibles deben estar adaptados o explícitamente excluidos".
- **`README.md`**: enlace a `EJERCICIOS.md` desde el bloque de estado actual.

### Decisión
- **No se introducen alias** en LiteSeInt para `Cadena`, `<-`, `SiNo`, `MOD` o `DIV`. La sintaxis de `ejercicios/guia.html` no es la fuente de verdad del lenguaje. Cada ejercicio debe convertirse o quedar marcado como excluido temporal.

### Cambiado
- **Versión visible**: `v0.6.5`.

### Compatibilidad
- Sin cambios en runtime, validador o autocompletado. Los programas válidos en `v0.6.0` siguen ejecutándose igual.

### Fuera de alcance de v0.6.5
- No se mueve la consola debajo del editor (eso es 0.7.0).
- No se rediseña el layout principal.
- No se implementa el panel derecho de ejercicios.
- No se convierten los 245 ejercicios — esta fase deja la decisión y el contrato de pruebas por escrito.

## [0.6.0] — 2026-04-26

Cierre de la fase "Congelar el núcleo del lenguaje". Esta versión declara, documenta y estabiliza el subconjunto mínimo del lenguaje que será la base de la versión 1.0. No agrega nuevas estructuras: ordena lo existente y deja explícito qué queda fuera de alcance.

### Agregado
- **Matriz de compatibilidad en `README.md`**: nueva sección que enumera estructura del programa, instrucciones, tipos, operadores, funciones nativas, estructuras de control, variantes aceptadas y construcciones explícitamente no soportadas en v0.6.0.
- **Sintaxis canónica documentada** para cada instrucción soportada: `Proceso/FinProceso`, `Definir`, asignación con `=`, `Escribir`, `Leer`, `Si/Sino/FinSi`, `Mientras/FinMientras`, `Repetir/HastaQue`, `Para/FinPara`, `Segun/De Otro Modo/FinSegun` y comentarios `//`.
- **Mensaje pedagógico para construcciones fuera de alcance**: nuevo tipo de error `fuera_de_alcance` reportado por `js/doc_errores.js` cuando aparece como primer token `Dimension`, `Dimensionar`, `SubProceso`, `FinSubProceso`, `Funcion` o `FinFuncion`. El mensaje aclara que esa construcción no está soportada en LiteSeInt v0.6.0 sin pretender implementarla.

### Cambiado
- **Lista de palabras reservadas para autocompletado (`LiteSeInt.PALABRAS_RESERVADAS`)**: se completó con `Proceso`, `FinProceso`, `Y`, `O` y `No` para alinearla con el conjunto que ya reconocía el validador y el resaltado.
- **README**: se reorganizó la sección de lenguaje en torno a la matriz de compatibilidad y se añadió `Proceso ... FinProceso` a los ejemplos cortos.
- **Versión visible**: `v0.6.0`.

### Compatibilidad
- Los programas válidos en `v0.5.x` siguen ejecutándose igual. No se agregaron operadores, funciones nativas ni estructuras nuevas. La precedencia de operadores, el comportamiento de `Abs`, `Redon`, `Trunc`, `Longitud`, `Mayusculas`, `Minusculas`, `mod` y `^`, y la sintaxis de cada estructura de control se conservan sin cambios.

### Fuera de alcance de v0.6.0
- `Dimension` y arreglos.
- `SubProceso` / `FinSubProceso`.
- Funciones definidas por el usuario.
- Diagramas, exportadores, editor multiarchivo y persistencia de proyectos.

## [0.5.5]

### Agregado
- **Deshacer y rehacer en el editor**: se agregó historial propio para `Ctrl+Z` / `Cmd+Z` y rehacer con `Ctrl+Y` o `Ctrl+Shift+Z`, cubriendo escritura normal y cambios programáticos como autocompletado, tabulación, borrar todo y carga de ejemplos.

### Cambiado
- **Versión visible**: `v0.5.5`.

## [0.5.4]

### Agregado
- **Pruebas de regresión sin dependencias**: nueva suite `npm test` en `tests/run-tests.js` para validar reglas del lenguaje, ejecución y detención.

### Cambiado
- **`Segun` con expresión**: el runtime ahora acepta expresiones en la cabecera, alineándose con la documentación y la validación estática.
- **Operadores lógicos en expresiones**: `Y`, `O` y `No` funcionan dentro de asignaciones lógicas además de condiciones.
- **Ejecución detenida**: el runtime reporta `detenido` y la UI evita mostrar `Fin de ejecución` cuando el usuario detiene durante un `Leer`.
- **Validación de documento y bloques**: el validador detecta ausencia de `Proceso`/`FinProceso` y cierres cruzados entre bloques anidados.
- **Dependencias externas**: se retiraron Bootstrap Icons y Lucide porque no estaban en uso.

## [0.5.3] — 2026-04-25

Corrección focalizada del pipeline de expresiones para que el menos unario deje de degradarse al workaround `0 - x` y respete la precedencia real en expresiones compuestas.

### Cambiado
- **Pipeline de expresiones en `LiteSeInt.js`**: el `-` prefijo ahora se normaliza como operador unario dedicado en lugar de reescribirse como resta binaria. El shunting-yard y la evaluación RPN distinguen operadores por aridad para resolver correctamente operandos negativos dentro de expresiones y llamadas.
- **Precedencia explícita del menos unario**: `^` queda por encima del menos unario, y el menos unario por encima de `*`, `/` y `mod`. Esto deja consistentes casos como `2 ^ -3`, `-3 ^ 2` y `(-3) ^ 2`.
- **Ejemplo `numerico` y documentación**: ahora muestran operandos negativos en expresiones compuestas sin paréntesis de workaround.
- **Versión visible**: `v0.5.3`.

### Corregido
- **Operandos negativos después de operadores**: `2 * -3`, `2 / -3`, `2 ^ -3`, `2 mod -3` y `2 - -3` vuelven a evaluarse con el valor correcto.
- **Funciones con expresiones negativas compuestas**: llamadas como `Abs(2 * -3)` ya no pierden precedencia ni devuelven resultados truncados por el viejo hack de `0 - x`.
- **Mensajes de error en cierres mal formados**: expresiones como `Abs(-)` o `(-)` ahora reportan la falta de operando de forma más puntual alrededor de `)` y de la llamada involucrada.

### Compatibilidad
- **Validación estática y runtime**: ambos siguen aceptando la misma sintaxis válida para `-3`, `(-3)`, `Abs(-3.5)`, `Redon(-3.6)` y `Trunc(-3.6)`, sin cambios de alcance fuera de `v0.5.3`.

## [0.5.2] — 2026-04-25

Cierre de la serie `0.5.x`. Suma funciones nativas de texto, mejora mensajes de error en torno a llamadas y enriquece ejemplos y documentación, sin invadir el alcance de `0.6.x` (validación en vivo).

### Agregado
- **Función nativa `Longitud(texto)`**: devuelve la cantidad de caracteres del argumento. Acepta variables de tipo `Caracter` y literales de texto.
- **Función nativa `Mayusculas(texto)`**: devuelve el texto convertido a mayúsculas.
- **Función nativa `Minusculas(texto)`**: devuelve el texto convertido a minúsculas.
- **Ejemplo precargado `texto`**: nuevo botón en la barra de ejemplos que combina `Longitud`, `Mayusculas` y `Minusculas`, incluyendo una llamada anidada (`Longitud(Mayusculas(nombre))`).
- **Autocompletado**: se sugieren `Longitud`, `Mayusculas` y `Minusculas` con badge `función`.

### Cambiado
- **Tabla `LiteSeInt._FUNCIONES_NATIVAS`**: se completa con `longitud`, `mayusculas` y `minusculas` siguiendo la firma `{ aridadMin, aridadMax, aplicar(args, ctx) }` definida en `0.5.0`. Las funciones de texto exigen tipo `Caracter` y reportan un mensaje específico si reciben otro tipo.
- **Validador estático (`js/doc_errores.js`)**: el conjunto `FUNCIONES_NATIVAS_SET` incorpora las tres funciones nuevas para que no se reporten como `Función no reconocida`.
- **Mensaje de error mejorado al usar un nombre de función nativa sin `(`**: en lugar de `Variable "Longitud" no definida.`, ahora se reporta `Falta "(" para llamar a la función "Longitud".` con el rango exacto del identificador (nuevo tipo de error `llamada_sin_parentesis`).
- **Mensaje de error mejorado al dejar un argumento vacío antes de `,`**: ahora incluye el nombre de la función involucrada (`Argumento vacío antes de "," en la llamada a "Longitud".`).
- **Versión visible**: `v0.5.2`.

### Corregido
- **Llamadas anidadas a funciones nativas**: el parser de expresiones contaba la aridad de la llamada exterior como `0` cuando un argumento era a su vez una llamada (`Longitud(Mayusculas(nombre))` se reportaba como `La función "Longitud" espera 1 argumento(s), recibió 0.`). El valor producido por la llamada interna ahora se marca como contenido del argumento exterior, habilitando anidación arbitraria sin paréntesis adicionales.

### Compatibilidad
- Los programas válidos en `v0.5.0` y `v0.5.1` siguen ejecutándose igual. La precedencia de operadores y el comportamiento de `Abs`, `Redon`, `Trunc`, `mod` y `^` no cambian. Los ejemplos `hola`, `notas`, `multivar`, `mayor`, `contador`, `tabla`, `logico`, `diasemana` y `numerico` siguen funcionando sin cambios.

## [0.5.1] — 2026-04-25

Primera ampliación visible del nuevo motor de expresiones preparado en `0.5.0`. Agrega operadores aritméticos adicionales y funciones nativas numéricas, sin invadir el alcance de `0.5.2` (funciones de texto).

### Agregado
- **Operador `mod`**: calcula el resto de la división entre dos valores numéricos. Misma precedencia que `*` y `/`, asociatividad a la izquierda. Reporta error claro si los operandos no son numéricos o si el divisor es `0`.
- **Operador `^` (potencia)**: precedencia mayor que `*`, `/` y `mod`, asociatividad a la derecha (`2 ^ 3 ^ 2` evalúa como `2 ^ (3 ^ 2)`). Acepta exponentes enteros y reales.
- **Función nativa `Abs(x)`**: valor absoluto de un número.
- **Función nativa `Redon(x)`**: redondeo al entero más cercano.
- **Función nativa `Trunc(x)`**: trunca la parte decimal.
- **Ejemplo precargado `numerico`**: nuevo botón en la barra de ejemplos que demuestra `mod`, `^`, `Abs`, `Redon` y `Trunc` en una misma ejecución.
- **Autocompletado**: se sugieren `mod`, `Abs`, `Redon` y `Trunc` con sus tipos visibles (`operador` / `función`).

### Cambiado
- **Tabla `LiteSeInt._OPERADORES`**: incorpora `mod` (precedencia 2, izquierda) y `^` (precedencia 3, derecha) con sus reglas de evaluación y mensajes de error específicos.
- **Tabla `LiteSeInt._FUNCIONES_NATIVAS`**: pasa de estar vacía a registrar `abs`, `redon` y `trunc` con la firma `{ aridadMin, aridadMax, aplicar(args, ctx) }` definida en `0.5.0`. La validación de aridad y de tipos sigue siendo responsabilidad del runtime.
- **Tokenizador estático (`js/doc_errores.js`)**: reconoce `^` como `OPERATOR` y `mod` como `KEYWORD` aceptado dentro de expresiones (`KEYWORDS_EXPR_OK`). El conjunto `FUNCIONES_NATIVAS_SET` lista `abs`, `redon` y `trunc` para que el validador no marque como "Función no reconocida" lo que el runtime ya implementa.
- **Resaltado de sintaxis**: hereda automáticamente el comportamiento del tokenizador, por lo que `^` se pinta como operador y `mod` como palabra reservada sin reglas adicionales.
- **Versión visible**: `v0.5.1`.

### Compatibilidad
- Los programas válidos en `v0.5.0` siguen ejecutándose igual. La precedencia de `+`, `-`, `*`, `/` no cambia y los nuevos operadores se sitúan en niveles superiores sin alterar la asociatividad de los anteriores. Los ejemplos `hola`, `notas`, `multivar`, `mayor`, `contador`, `tabla`, `logico` y `diasemana` siguen funcionando sin cambios.

## [0.5.0] — 2026-04-25

Versión de base arquitectónica. El usuario final ve pocos cambios visibles: el objetivo es ordenar el motor de expresiones para que `0.5.1` (operadores `mod`, potencia, funciones numéricas `Abs`, `Redon`, `Trunc`) y `0.5.2` (funciones de texto `Longitud`, `Mayusculas`, `Minusculas`) se puedan implementar con menos fricción.

### Interno
- **Pipeline de expresiones por etapas**: el evaluador en `js/LiteSeInt.js` se separó en cuatro helpers reconocibles — `_tokenizarExpresion`, `_normalizarTokens`, `_parsearRPN` y `_evaluarRPN` — sustituyendo la función monolítica anterior. Cada etapa tiene una responsabilidad acotada y se puede extender sin tocar las demás.
- **Metadata de operadores centralizada**: nueva tabla `LiteSeInt._OPERADORES` con `precedencia`, `asociatividad` y `aplicar` por operador. Agregar `mod` o potencia en `0.5.1` se reduce a sumar entradas a esta tabla y al tokenizador.
- **Registro de funciones nativas preparado**: nuevo `LiteSeInt._FUNCIONES_NATIVAS` (vacío en esta versión) con la firma `{ aridadMin, aridadMax, aplicar(args, ctx) }`. El evaluador ya invoca este registro y aplica validación de aridad.
- **Reconocimiento de llamadas a función**: el tokenizador de expresiones detecta el patrón `Identificador(args)` con look-ahead y emite un token `funcion` que el parser convierte en una entrada postfija con su aridad. Soporta cero, uno o múltiples argumentos.
- **Detección espejo en el validador estático**: `js/doc_errores.js` reconoce el mismo patrón y lo reporta como `Función "X" no reconocida` en lugar de `Variable "X" no definida`. El conjunto `FUNCIONES_NATIVAS_SET` queda vacío a propósito — no se "aprueba" ninguna función que el runtime aún no implemente.
- **Lista de expresiones de `Escribir` respeta paréntesis**: `validarListaExpresiones` ahora separa por comas sólo en el nivel exterior, dejando que comas internas sean argumentos de una llamada a función válida en el futuro.

### Cambiado
- **Errores de expresión más precisos**: paréntesis desbalanceados distinguen entre falta de `(` y falta de `)`; los operadores en posición inválida y los operandos faltantes (`a = 1 +`) reportan mensajes específicos; las llamadas a función abiertas y los argumentos vacíos en una llamada (`f(a,)`, `f(a, ,b)`) tienen sus propios mensajes.
- **Versión visible**: `v0.5.0`.

### Compatibilidad
- Los programas válidos en `v0.4.0` siguen ejecutándose igual. La precedencia de `+`, `-`, `*`, `/` no cambia; el menos unario, el operador `No`, los literales `Verdadero`/`Falso`, las cadenas y la concatenación con `+` se comportan idéntico. Los ejemplos precargados (`hola`, `notas`, `multivar`, `mayor`, `contador`, `tabla`, `logico`, `diasemana`) siguen funcionando sin cambios.

## [0.4.0] — 2026-04-24

### Agregado
- **Tipo `Logico`**: nuevo tipo de dato primitivo con valor por defecto `Falso`. Soportado en `Definir`, asignación, `Leer`, `Escribir` y en condiciones de `Si`, `Mientras`, `Repetir/HastaQue` y `Para`.
- **Literales booleanos `Verdadero` y `Falso`**: reconocidos por el tokenizador, validados como literales en expresiones y evaluados nativamente en el runtime.
- **Operador `No` en expresiones**: ya se aceptaba en condiciones; ahora también en el lado derecho de asignaciones (p. ej. `activo = No activo`).
- **Ejemplo precargado `logico`**: nuevo botón en la barra de ejemplos que demuestra el uso de `Logico`, `Verdadero`, `Falso`, `Y` y `No`.
- **Autocompletado**: se sugieren `Logico`, `Verdadero` y `Falso`.

### Cambiado
- **`Escribir` para booleanos**: los valores `true`/`false` del runtime se imprimen como `Verdadero`/`Falso` para mantener consistencia visual con la sintaxis del lenguaje.
- **Mensajes de error de `Definir`**: mencionan `Logico` además de `Entero`, `Real` y `Caracter`.
- **Versión visible**: `v0.4.0`.

## [0.3.4] — 2026-04-24

### Corregido
- **Inconsistencia en `Segun / FinSegun`**: el parser aceptaba casos inline (`1: Escribir "Lunes"`, `2, 3: Escribir "Otro"`) pero la validación estática los marcaba como `caso_texto_extra`. Todo caso inline válido fallaba al validar. Ahora validador y parser aceptan la misma sintaxis.

### Cambiado
- **Sintaxis oficial de `Segun`**: casos multilínea, inline (una instrucción tras `:`) y con varios valores separados por coma son todos soportados oficialmente. `De Otro Modo:` sigue siendo solo multilínea.
- **Detección de etiqueta de caso centralizada**: nuevo helper `DocErrores.detectarEtiquetaCaso(sig)` (token-based) reutilizado por el validador de línea y por el validador estructural de `Segun`, evitando reglas duplicadas.

### Interno
- **Ejemplo `diasemana`** actualizado para demostrar casos inline y casos con varios valores.

## [0.3.3] — 2026-04-24

### Corregido
- **Inconsistencia en `Repetir / HastaQue`**: el parser reconocía solo `HastaQue` (una palabra) y el validador solo `Hasta Que` (dos palabras), por lo que todo bloque válido fallaba en una capa u otra. Ahora ambas capas aceptan las dos formas.

### Cambiado
- **Sintaxis oficial**: `Repetir ... HastaQue condicion`. Se acepta `Hasta Que` como alias. La detección se centraliza en `DocErrores.REGEX_HASTAQUE_LINEA` (regex, para el parser) y `DocErrores.detectarHastaQue(sig)` (token-based, para el validador).
- **Mensajes de error de Repetir/HastaQue**: se unifican usando la forma oficial `HastaQue` en los textos mostrados al usuario.

## [0.3.2] — 2026-04-22

### Cambiado
- **Operador de asignación ahora es `=`**: se reemplazó `<-` por `=` como único operador de asignación en todo el lenguaje. Se actualizaron tokenizador, validador estático, ejecutor, ejemplos y documentación.
- **Operadores relacionales sin ambigüedad**: en condiciones se requiere `==` para igualdad (antes se aceptaba `=`). Quedan válidos `==`, `!=`, `<>`, `<`, `>`, `<=`, `>=`.

### Eliminado
- **Operador `<-`**: deja de reconocerse como asignación en todo el sistema (tokenizador, ejecutor, ejemplos y documentación).

## [0.3.1] — 2026-04-21

### Agregado
- **Validación estructural para bloques `Si / Sino / FinSi`**: se incorporó validación estática del bloque condicional completo, incluyendo condición obligatoria, uso correcto de `Entonces`, detección de `Sino` duplicado, cierres faltantes con `FinSi` y ramas vacías.
- **Validación estructural para bloques `Segun / De Otro Modo / FinSegun`**: ahora se valida la cabecera con `Hacer`, los casos con `:`, valores duplicados, bloques vacíos, uso correcto de `De Otro Modo` y cierre obligatorio con `FinSegun`.
- **Validación estructural para bloques `Mientras / FinMientras`**: se añadió validación de condición, presencia de `Hacer`, detección de bloques vacíos y control de cierres correctos con `FinMientras`.
- **Nuevas palabras reservadas del lenguaje**: se amplió el analizador para reconocer las estructuras `Si`, `Entonces`, `Sino`, `FinSi`, `Segun`, `Hacer`, `De Otro Modo`, `FinSegun`, `Mientras`, `FinMientras`, `Repetir`, `Hasta` y `Que`.
- **Validación de operadores de comparación en condiciones**: las condiciones de `Si`, `Mientras` y `Hasta Que` ahora aceptan únicamente `==`, `<>`, `<`, `>`, `<=`, `>=` y `!=`, marcando como error cualquier operador no permitido.

### Corregido
- **Errores más precisos en estructuras de control**: ahora se reportan mensajes específicos para condiciones faltantes, bloques vacíos, cierres ausentes, texto extra en sentencias de control y uso inválido de operadores comparativos.
- **Soporte de anidación validada**: los bloques de control ahora pueden validarse correctamente cuando están anidados, evitando falsos positivos en cierres y estructuras internas.

## [0.3.0] - 2026-04-19

### Cambiado

- **Controlador UI extraído a `js/app.js`**: toda la lógica de interfaz que antes vivía embebida en `index.html` ahora se carga desde un archivo JavaScript dedicado, dejando la estructura HTML más limpia y preparada para seguir creciendo.
- **Estructura de assets reorganizada**: `LiteSeInt.js`, `doc_errores.js` y `styles.css` se movieron a carpetas `js/` y `css/`, alineando la base del proyecto con una organización más mantenible.
- **Carga de scripts y estilos actualizada**: `index.html` ahora referencia rutas externas (`css/styles.css`, `js/doc_errores.js`, `js/LiteSeInt.js`, `js/app.js`) en lugar de depender de bloques inline extensos.
- **Versión** actualizada a `v0.3.0` en la interfaz.

### Interno

- **Separación de responsabilidades reforzada**: la capa de presentación queda mejor delimitada entre marcado, estilos, motor, validación y controlador UI, facilitando mantenimiento, depuración y futuras iteraciones.

---

## [0.2.1] - 2026-04-19

### Cambiado

- **Sistema de guías de indentación reforzado**: el render de indentado del editor ahora mide `line-height`, `padding`, `tab-size` y ancho real de carácter desde el DOM en lugar de depender de valores fijos.
- **Render de guías más estable**: las líneas de indentación ahora se dibujan como segmentos continuos y se recalculan correctamente al hacer scroll, redimensionar la ventana o terminar de cargar las fuentes.
- **Lógica visual de indentación unificada**: las líneas activas e inactivas comparten la misma regla para mostrar indentadores parciales, evitando que desaparezcan antes de tiempo al borrar espacios o al mover el cursor dentro del texto.
- **Geometría del editor ajustada**: el editor pasó a usar `padding-top/right/bottom: 8px` y `padding-left: 16px`, manteniendo alineadas las capas de syntax highlight, subrayados, overlays y autocompletado.
- **Indicador de versión reubicado**: la versión visible de la app se movió del header al footer, fijada en la esquina inferior derecha sin desplazar el crédito centrado.
- **Versión** actualizada a `v0.2.1` en la interfaz.

### Corregido

- **Desfase de guías al hacer scroll**: las guías de indentación ya no pierden posición al desplazarse vertical u horizontalmente dentro del editor.
- **Persistencia de indentadores parciales**: una línea con espacios residuales antes del texto conserva su guía visible aunque no complete exactamente un múltiplo de indentación.
- **Resaltado activo de indentación**: las guías activas ahora se apagan solo cuando el cursor sale realmente del bloque visual de indentación y ya no se extienden indebidamente dentro del texto.

---

## [0.2.0] - 2026-04-18

### Agregado

- **Estructuras de control completas**: el intérprete ahora soporta `Si/Entonces/Sino/FinSi`, `Mientras/Hacer/FinMientras`, `Repetir/HastaQue`, `Para/Hasta/Con Paso/Hacer/FinPara` y `Segun/De Otro Modo/FinSegun`, incluyendo anidamiento arbitrario.
- **Motor AST**: `LiteSeInt.js` fue refactorizado a un pipeline de dos fases: `_parsear()` construye un árbol de nodos y `_ejecutarBloque()` los recorre recursivamente, reemplazando el loop plano anterior.
- **Evaluador de condiciones**: nuevo método `_evaluarCondicion()` con soporte para operadores relacionales (`=`, `<>`, `<`, `>`, `<=`, `>=`) y lógicos (`Y`, `O`, `No`), con correcta precedencia y cortocircuito.
- **Validación de balance de bloques**: `validarDocumento()` realiza un segundo pase para detectar bloques sin cerrar o cierres sin apertura (`Si` sin `FinSi`, etc.), reportando el error en la línea exacta.
- **Nuevos ejemplos**: Mayor de dos (Si/FinSi), Contador (Mientras/FinMientras), Tabla de multiplicar (Para/FinPara), Día de semana (Segun/FinSegun).
- **Límite de iteraciones**: constante `MAX_ITERACIONES = 100 000` que aborta bucles infinitos con mensaje descriptivo.
- **Token `COLON`** en el tokenizador de `doc_errores.js` para reconocer etiquetas de caso en `Segun`.
- **Nuevas palabras reservadas**: `Si`, `Entonces`, `Sino`, `FinSi`, `Mientras`, `Hacer`, `FinMientras`, `Repetir`, `HastaQue`, `Para`, `Hasta`, `Con`, `Paso`, `FinPara`, `Segun`, `FinSegun`, `Y`, `O`, `No`, `De`, `Otro`, `Modo` - reconocidas por el tokenizador, resaltadas por el editor y excluidas del autocompletado de variables.

### Cambiado

- **`LiteSeInt.PALABRAS_RESERVADAS`** ampliado con todas las nuevas palabras clave, disponibles en el autocompletado con tipo `estructura` o `palabra clave`.
- **`validarLinea`** acepta sin errores todas las líneas de control de flujo (cabeceras de Si, Mientras, Para, Segun, etiquetas de caso, etc.).
- **Versión** actualizada a `v0.2.0` en el header de la app.

---

## [0.1.4] - 2026-04-18

### Agregado

- **Botón "Descargar .psc"**: se añadió una acción para exportar el pseudocódigo actual del editor como archivo `.psc`, facilitando guardar y compartir programas escritos en LiteSeInt.
- **Soporte para `Proceso` y `FinProceso`**: ahora el intérprete reconoce estas etiquetas como delimitadores del programa, mejorando la compatibilidad con la sintaxis habitual de PSeInt.

### Cambiado

- **Alineación de paneles ajustada**: el panel del editor y la consola ahora tienen altura exactamente igual, con un espaciador en la consola que iguala la altura de la barra de ejemplos del editor.
- **Altura de headers unificada**: `.panel-header` y `.console-header` comparten ahora la misma altura fija (`--header-panel-h: 32px`), garantizando alineación visual perfecta.
- **Botón "Borrar todo" redimensionado**: ahora utiliza la misma clase y tamaño que el botón "Borrar" de la consola, mejorando la consistencia visual.

### Corregido

- **Detención de ejecución en limpiar**: los botones "Borrar" y "Borrar todo" ahora detienen la ejecución del código si está en marcha, evitando comportamientos inesperados al limpiar durante la ejecución.

---

## [0.1.3] - 2026-04-17

### Agregado

- **Módulo central de validación `doc_errores.js`**: se incorporó una nueva capa dedicada al análisis, validación, tabla de símbolos, generación de errores por rango exacto y utilidades para decoraciones del editor, desacoplada tanto de la UI como del motor de ejecución.
- **Tokenización formal por línea**: el sistema ahora reconoce tokens como palabras reservadas, identificadores, strings, números, operadores, asignación `<-`, comas, paréntesis, comentarios, espacios y caracteres desconocidos.
- **Tabla de símbolos con tracking de inicialización**: las variables pasan a manejar tipo, existencia e inicialización real, permitiendo distinguir entre variable definida, no definida y no inicializada.
- **Decoraciones de error por token exacto**: se añadió una capa visual específica para subrayados rojos debajo del fragmento exacto con error, separada del resaltado de sintaxis.
- **Helper de contexto de cursor**: se agregó lógica reutilizable para detectar si el cursor está dentro de un string o un comentario, mejorando el comportamiento del autocompletado.
- **Validación estructurada por línea y documento**: se implementaron funciones reutilizables para validar una línea o el documento completo y devolver errores agrupados por línea con columna inicial y final.

### Cambiado

- **Motor `LiteSeInt.js` refactorizado para depender de `doc_errores.js`**: la ejecución ahora realiza validación previa centralizada antes de interpretar el código, evitando duplicación de reglas entre motor y editor.
- **Evaluador de expresiones reemplazado por parser con shunting-yard**: las expresiones ahora soportan correctamente paréntesis, precedencia de operadores, números, variables, strings, concatenación con `+` y validación de paréntesis desbalanceados.
- **Asignaciones y lecturas ahora inicializan variables de forma explícita**: `Leer` y `<-` marcan la variable como inicializada en vez de asumir que el valor por defecto equivale a una inicialización válida.
- **Validación de `Definir` fortalecida**: ahora detecta tipos inválidos, texto sobrante, nombres faltantes, comas mal ubicadas, palabras reservadas usadas como variables y duplicados en la misma línea o en líneas posteriores.
- **Manejo de `Escribir` mejorado**: las expresiones separadas por coma se validan de forma estructurada y cada identificador se comprueba contra la tabla de símbolos.
- **Autocompletado contextual**: las sugerencias ahora se bloquean correctamente dentro de strings y comentarios, usando análisis del contexto real de la línea en vez de reglas superficiales.
- **Resaltado de sintaxis actualizado**: el operador `<-` pasa a tener una clase visual separada (`sh-assign`) y se pinta con color blanco para distinguirlo del resto de operadores.
- **Branding de la aplicación actualizado a LiteSeInt**: se renombró la app en la interfaz para alinearla con el nombre del motor.
- **UX de errores visuales ajustada**: el destacado rojo de errores queda reservado al flujo de ejecución y se limpia al editar, al limpiar consola o al reiniciar el contenido, evitando errores "pegados" sobre código ya modificado.
- **Toolbar y layout reorganizados**: los botones principales se centran visualmente, el botón Detener adquiere un estilo diferenciado, el botón Limpiar consola se integra al panel de consola y el layout general se ajusta mejor al viewport.
- **Editor con menor cantidad inicial de líneas**: el mínimo visual del editor se reduce para iniciar con 10 líneas en lugar de 20.
- **Footer inferior integrado**: se agregó un pie de app discreto con crédito visible al autor.

### Corregido

- **Variables no definidas ahora informan el error correcto**: expresiones como `Escribir nombres` dejan de reportarse como "expresión no reconocida" y pasan a mostrarse como `Variable "nombres" no definida.`.
- **Variables no inicializadas ya no pueden imprimirse**: si una variable fue declarada pero nunca recibió valor, `Escribir` ahora genera `Variable "X" no inicializada.` en tiempo de ejecución.
- **Errores múltiples por línea**: una misma línea puede acumular varios errores simultáneos, incluyendo combinación de coma inválida y variable duplicada en `Definir`.
- **Subrayado preciso de tokens inválidos**: además del mensaje en consola, ahora se subrayan exactamente símbolos conflictivos como comas incorrectas o variables duplicadas.
- **Separación correcta entre syntax highlight y capa de error**: se evitó mezclar el HTML del resaltado con el HTML de decoraciones, reduciendo errores de render y facilitando mantenimiento.
- **Flujo visual de error más consistente**: los badges, tooltips, overlays y subrayados se limpian y reconstruyen de forma controlada, evitando residuos visuales tras editar o reiniciar.

### Interno

- **API estática del motor mantenida por compatibilidad**: `LiteSeInt` sigue exponiendo helpers como `stripComment()` y `extraerVariablesDelCodigo()`, pero ahora delegando en `doc_errores.js`.
- **Conversión uniforme de errores a decoraciones**: se añadieron helpers para transformar errores en estructuras útiles para subrayado y tooltips por línea.
- **Mayor desacoplamiento entre core y UI**: la interfaz consume resultados del analizador en vez de reimplementar reglas de validación en handlers del editor.

## [0.1.2] - 2026-04-17

### Agregado

- **Comentarios con `//`**: todo lo que aparece después de `//` (fuera de strings) se ignora en la ejecución. Los comentarios se renderizan en gris itálica en el editor.
- **Resaltado de sintaxis completo**: capa visual (`#syntaxLayer`) superpuesta al textarea que colorea palabras reservadas (rosa), strings (amarillo), variables (azul), números (verde menta), operadores (gris) y comentarios (gris itálica).
- **Autocompletado de variables del usuario**: las variables declaradas con `Definir` se detectan dinámicamente y aparecen como sugerencias en el dropdown, etiquetadas como `variable`.
- **Indicador `>`**: cuando una línea se está ejecutando aparece `>` en verde junto al número de línea; cuando hay error aparece `>` en rojo.
- **Método estático `LiteSeInt.stripComment()`**: elimina comentarios inline respetando strings entrecomillados.
- **Método estático `LiteSeInt.extraerVariablesDelCodigo()`**: escanea el código y retorna las variables definidas, para uso del autocompletado.
- Comentarios de ejemplo en los programas precargados.

### Cambiado

- **Opacidad de resaltado aumentada ~30%**: `--exec-highlight-bg` y `--error-highlight-bg` pasaron de `0.08` a `0.16`, haciendo más visibles las líneas en ejecución y con error.
- **Tooltip de error reubicado**: el badge `!` se movió del gutter al costado derecho de la línea de código (dentro del overlay), con tooltip Bootstrap en dirección `left`.
- El autocompletado ahora se desactiva automáticamente cuando el cursor está dentro de un comentario.
- El textarea del editor ahora tiene `color: transparent` y el texto visible proviene exclusivamente de la capa de syntax highlight.
- Gutter ampliado de 50px a 58px para acomodar el indicador `>`.

### Corregido

- El motor ahora procesa correctamente líneas con comentarios inline (ej: `x <- 10 // asignación`) sin fallar en la interpretación.
- Se corrigió un desfase visual en el editor: al escribir o autocompletar variables, el texto podía renderizarse una línea más abajo por un salto de línea extra en la capa de resaltado de sintaxis.

---

## [0.1.1] - 2026-04-17

### Agregado

- **Separación del core en `LiteSeInt.js`**: clase independiente de la UI que expone `ejecutar()`, `detener()`, `getVariables()` y se comunica con la interfaz a través de callbacks (`onEscribir`, `onLeer`, `onError`, `onLineaActiva`, `onSistema`, `onFin`).
- **Input inline en consola**: la instrucción `Leer` ahora muestra un campo de texto directamente en la consola con prompt `? variable:` y botón `↵`, reemplazando el modal overlay anterior.
- **Definir múltiples variables por línea**: soporte para `Definir a, b, c Como Tipo` separando nombres por coma.
- **Resaltado de línea en ejecución**: la línea activa se destaca con fondo verde pastel (`#b8f0c8`) tanto en el gutter como en el área del editor.
- **Badge de error con tooltip**: botón circular rojo `!` que aparece junto a la línea con error, con tooltip de Bootstrap mostrando el mensaje descriptivo.
- Ejemplo precargado "Multi-variable".
- Botón "Detener" para interrumpir la ejecución.
- Indicador de estado en toolbar (`Ejecutando...`, `Listo`, `Error`, `Detenido`).

### Cambiado

- **Tipo `Cadena` renombrado a `Caracter`**: en toda la lógica del motor, palabras reservadas y autocompletado.
- Los eventos de los botones se registran con jQuery `.on()` en lugar de atributos `onclick` inline.
- La capa de overlays y el fondo del editor se separaron en elementos independientes (`editor-bg-layer`, `editor-line-overlays`).

### Eliminado

- Modal overlay (`input-overlay`) para la instrucción `Leer` - reemplazado por input inline en consola.

---

## [0.1.0] - 2026-04-17

### Agregado

- **Editor de pseudocódigo**: textarea con numeración de líneas, placeholder descriptivo y soporte para Tab (inserta 2 espacios).
- **Consola de salida**: panel HTML donde se muestran los mensajes de `Escribir`, errores y mensajes del sistema.
- **Botón Ejecutar**: inicia la interpretación completa del código línea por línea.
- **Botón Limpiar consola** y **Limpiar todo**.
- **Instrucción `Definir`**: declara variables con tipo (`Entero`, `Real`, `Cadena`) y valor por defecto.
- **Instrucción de asignación `<-`**: asigna valores a variables previamente definidas.
- **Instrucción `Escribir`**: imprime en consola strings, números y variables. Soporta múltiples expresiones separadas por coma.
- **Instrucción `Leer`**: pausa la ejecución con `async/await` y muestra un modal para capturar la entrada del usuario.
- **Evaluador de expresiones básico**: soporta literals de string, enteros, reales, variables y operaciones aritméticas simples (`+`, `-`, `*`, `/`), incluyendo concatenación de strings con `+`.
- **Autocompletado básico**: sugiere palabras reservadas (`Definir`, `Escribir`, `Leer`, `Como`, `Entero`, `Real`, `Cadena`) al escribir 2+ caracteres, navegable con flechas y seleccionable con Tab/Enter.
- **Ejecución paso a paso visual**: pausa de 80ms entre líneas para que el usuario vea el progreso.
- **Tres ejemplos precargados**: Hola Mundo, Saludo, Notas.
- Interfaz con tema oscuro estilo terminal, tipografía JetBrains Mono y fondo con grid sutil.
- Diseño responsive para pantallas móviles.
- Stack: HTML5, CSS3, Bootstrap 5.3.3, jQuery 3.7.1, JavaScript vanilla.
