# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

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
