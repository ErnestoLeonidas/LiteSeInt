# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [0.1.2] — 2026-04-17

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

---

## [0.1.1] — 2026-04-17

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
- Modal overlay (`input-overlay`) para la instrucción `Leer` — reemplazado por input inline en consola.

---

## [0.1.0] — 2026-04-17

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
