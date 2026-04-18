# PLAN DE TRABAJO — LiteSeInt: Estructuras de Control
# Para ejecutar con Claude Code

## Contexto
Proyecto: LiteSeInt — intérprete de pseudocódigo educativo en el navegador.
Archivos clave: `doc_errores.js`, `LiteSeInt.js`, `index.html`, `styles.css`, `CHANGELOG.md`, `README.md`
Estado actual: `Definir`, `Escribir`, `Leer`, asignación `<-`, expresiones con precedencia. Sin estructuras de bloque.
Objetivo: integrar `Si/FinSi`, `Mientras/FinMientras`, `Repetir/HastaQue`, `Para/FinPara`, `Segun/FinSegun`.

## Instrucciones generales para Claude Code

- Leer CLAUDE.md antes de tocar cualquier archivo.
- Respetar las capas: validación estática en `doc_errores.js`, semántica de ejecución en `LiteSeInt.js`, presentación en `index.html`.
- Hacer un commit lógico por etapa completada.
- Verificar manualmente cada etapa con los casos de prueba indicados antes de pasar a la siguiente.
- No modificar la API pública de LiteSeInt (callbacks, `ejecutar()`, `detener()`, `getVariables()`).
- No romper los ejemplos precargados existentes.

---

## ETAPA 0 — Refactor del motor a ejecución por bloques (AST)

### Objetivo
Reemplazar el loop plano de `LiteSeInt.js` por un pipeline parser + ejecutor recursivo. Sin esto, ninguna estructura de bloque es posible.

### Archivos a modificar
- `LiteSeInt.js` únicamente.

### Tarea 0.1 — Definir estructura de nodos AST

Agregar internamente en `LiteSeInt.js` los tipos de nodo que el parser va a producir:

```
{ tipo: 'definir',    linea, raw }
{ tipo: 'escribir',   linea, raw }
{ tipo: 'leer',       linea, raw }
{ tipo: 'asignar',    linea, raw }
{ tipo: 'proceso',    linea, raw }
{ tipo: 'finproceso', linea, raw }
{ tipo: 'si',         linea, condicion, entonces: [nodos], sino: [nodos] }
{ tipo: 'mientras',   linea, condicion, cuerpo: [nodos] }
{ tipo: 'repetir',    linea, cuerpo: [nodos], condicion }
{ tipo: 'para',       linea, variable, inicio, fin, paso, cuerpo: [nodos] }
{ tipo: 'segun',      linea, variable, casos: [{valores, cuerpo}], porDefecto: [nodos] }
```

### Tarea 0.2 — Implementar `_parsear(codigo)`

Nuevo método privado en `LiteSeInt`. Convierte el string de código en un array de nodos usando una pila para manejar bloques anidados.

Algoritmo:
1. Split por `\n`, strip comments con `DocErrores.stripComment()`.
2. Iterar líneas. Cada línea se tokeniza con `DocErrores.tokenizarLinea()` para detectar el tipo.
3. Palabras que abren bloque: `Si...Entonces`, `Mientras...Hacer`, `Repetir`, `Para...Hacer`, `Segun...Hacer`.
4. Palabras que cierran bloque: `FinSi`, `FinMientras`, `HastaQue`, `FinPara`, `FinSegun`.
5. Palabra de rama: `Sino`.
6. Usar una pila (`stack`) de frames. Cada frame tiene `{tipo, nodo, rama_activa}`.
7. Al abrir bloque: push frame. Al cerrar: pop frame y adjuntar el nodo al padre.
8. Instrucciones planas: adjuntar al array activo (`stack.top.rama_activa` o raíz).

Si el parser encuentra un cierre sin apertura correspondiente o el documento termina con pila no vacía, lanzar un error descriptivo con número de línea.

### Tarea 0.3 — Implementar `_ejecutarBloque(nodos)`

Nuevo método privado async. Itera un array de nodos y despacha según `nodo.tipo`.

```javascript
async _ejecutarBloque(nodos) {
  for (const nodo of nodos) {
    if (!this.ejecutando) break;
    this.callbacks.onLineaActiva(nodo.linea);
    await this._ejecutarNodo(nodo);
    await this._pausa(this.velocidadPausa);
  }
}
```

### Tarea 0.4 — Refactorizar `ejecutar()`

Reemplazar el loop plano existente por:
1. Validación estática con `DocErrores.validarDocumento()` (ya existe, no cambiar).
2. `const ast = this._parsear(codigo)`.
3. `await this._ejecutarBloque(ast)`.

Los handlers existentes (`_ejecutarDefinir`, `_ejecutarEscribir`, `_ejecutarLeer`, `_ejecutarAsignacion`) se convierten en casos dentro de `_ejecutarNodo(nodo)` en vez de llamarse desde el dispatcher de texto. No cambiar su lógica interna.

### Verificación Etapa 0
Ejecutar los 4 ejemplos precargados (Hola Mundo, Saludo, Notas, Multi-variable). Deben funcionar exactamente igual que antes. Si alguno falla, la etapa no está lista.

---

## ETAPA 1 — Si / Entonces / Sino / FinSi

### Sintaxis objetivo
```
Si <condicion> Entonces
  <instrucciones>
Sino
  <instrucciones>
FinSi
```
`Sino` es opcional.

### Archivos a modificar
`doc_errores.js`, `LiteSeInt.js`, `index.html`

### Tarea 1.1 — doc_errores.js: palabras reservadas

Agregar al `PALABRAS_RESERVADAS_SET`: `'si'`, `'entonces'`, `'sino'`, `'finsi'`.

### Tarea 1.2 — doc_errores.js: validación de bloques balanceados

Agregar una segunda pasada en `validarDocumento()` que use una pila para verificar que cada bloque que abre tenga su cierre correspondiente. Errores a detectar:
- `FinSi` sin `Si` previo abierto.
- Documento termina con `Si` sin cerrar.
- `Sino` sin `Si` abierto.

Usar `crearError()` con el número de línea exacto del token problemático.

### Tarea 1.3 — doc_errores.js: validar línea `Si`

En `validarLinea()`, agregar caso `'si'`:
- Debe tener tokens de condición antes de `Entonces`.
- `Entonces` debe estar presente en la misma línea.
- Si faltan, emitir error descriptivo.

### Tarea 1.4 — LiteSeInt.js: evaluador de condiciones

Nuevo método `_evaluarCondicion(expr, lineaIdx)`. Extiende el evaluador de expresiones existente con:

Operadores relacionales (agregar al tokenizador de expresiones):
- `=`  → igualdad
- `<>` → desigualdad
- `<`, `>`, `<=`, `>=` → comparación numérica

Operadores lógicos (tratar como operadores de menor precedencia):
- `Y` / `y` → AND lógico (precedencia 0)
- `O` / `o` → OR lógico (precedencia 0, menor que Y)
- `No` / `no` → NOT unario

Resultado: retorna `true` o `false` (booleano JavaScript).

Precedencia completa de menor a mayor: `O` < `Y` < `No` < relacionales < aritméticos.

### Tarea 1.5 — LiteSeInt.js: ejecutar nodo Si

```javascript
case 'si': {
  const condicion = this._evaluarCondicion(nodo.condicion, nodo.linea);
  if (condicion) {
    await this._ejecutarBloque(nodo.entonces);
  } else if (nodo.sino.length > 0) {
    await this._ejecutarBloque(nodo.sino);
  }
  break;
}
```

### Tarea 1.6 — LiteSeInt.js: parser — reconocer Si

En `_parsear()`, detectar línea que comienza con `Si` (case-insensitive) y contiene `Entonces`:
- Extraer la condición: texto entre `Si` y `Entonces`.
- Crear nodo `si`, push frame `{tipo:'si', nodo, rama: 'entonces'}`.
- Al encontrar `Sino`: cambiar `frame.rama` a `'sino'`.
- Al encontrar `FinSi`: pop frame, adjuntar nodo al padre.

### Tarea 1.7 — index.html: resaltado y autocompletado

Agregar al syntax highlight: `si`, `entonces`, `sino`, `finsi` con clase `sh-keyword`.

Agregar al array `LiteSeInt.PALABRAS_RESERVADAS`:
```javascript
{ texto: 'Si',       tipo: 'condicional' },
{ texto: 'Entonces', tipo: 'palabra clave' },
{ texto: 'Sino',     tipo: 'palabra clave' },
{ texto: 'FinSi',    tipo: 'cierre' },
```

### Tarea 1.8 — Nuevo ejemplo: Mayor de dos números

```
// Determina el mayor de dos números
Definir a, b Como Real
Escribir "Ingresa el primer número:"
Leer a
Escribir "Ingresa el segundo número:"
Leer b
Si a > b Entonces
  Escribir "El mayor es: ", a
Sino
  Escribir "El mayor es: ", b
FinSi
```

Agregar como `data-ejemplo="mayor"` en `index.html` con su botón en la barra de ejemplos.

### Verificación Etapa 1

- `Si 5 > 3 Entonces` → entra al bloque Entonces.
- `Si 1 > 10 Entonces` → entra al Sino (si existe), o no hace nada.
- `Si` sin `Entonces` → error en validación estática.
- `FinSi` sin `Si` → error en validación.
- `Si` anidado dentro de otro `Si` → funciona correctamente.
- Ejemplos precargados anteriores siguen funcionando.

---

## ETAPA 2 — Mientras / Hacer / FinMientras

### Sintaxis objetivo
```
Mientras <condicion> Hacer
  <instrucciones>
FinMientras
```

### Archivos a modificar
`doc_errores.js`, `LiteSeInt.js`, `index.html`

### Tarea 2.1 — doc_errores.js: palabras reservadas

Agregar: `'mientras'`, `'hacer'`, `'finmientras'`.

### Tarea 2.2 — doc_errores.js: validación de bloques

Extender la pila de validación de bloques (de Etapa 1.2) para incluir `Mientras/FinMientras`.
Errores: `FinMientras` sin `Mientras`, `Mientras` sin cerrar.

### Tarea 2.3 — doc_errores.js: validar línea `Mientras`

Caso `'mientras'` en `validarLinea()`:
- Debe tener condición entre `Mientras` y `Hacer`.
- `Hacer` debe estar en la misma línea.

### Tarea 2.4 — LiteSeInt.js: constante de protección contra ciclos infinitos

```javascript
static MAX_ITERACIONES = 100_000;
```

### Tarea 2.5 — LiteSeInt.js: ejecutar nodo Mientras

```javascript
case 'mientras': {
  let iteraciones = 0;
  while (this._evaluarCondicion(nodo.condicion, nodo.linea)) {
    if (!this.ejecutando) break;
    if (++iteraciones > LiteSeInt.MAX_ITERACIONES) {
      throw new Error('Posible ciclo infinito: se superaron 100.000 iteraciones en Mientras.');
    }
    await this._ejecutarBloque(nodo.cuerpo);
  }
  break;
}
```

### Tarea 2.6 — LiteSeInt.js: parser — reconocer Mientras

Detectar línea que comienza con `Mientras` y contiene `Hacer`. Extraer condición. Push frame `{tipo:'mientras', nodo}`. Al encontrar `FinMientras`: pop, adjuntar al padre.

### Tarea 2.7 — index.html: resaltado y autocompletado

Agregar: `Mientras`, `Hacer`, `FinMientras` al highlight y autocompletado.

### Tarea 2.8 — Nuevo ejemplo: Contador

```
// Cuenta del 1 al 5
Definir contador Como Entero
contador <- 1
Mientras contador <= 5 Hacer
  Escribir "Número: ", contador
  contador <- contador + 1
FinMientras
```

Agregar como `data-ejemplo="contador"`.

### Verificación Etapa 2

- Ciclo que itera 5 veces funciona y muestra los valores.
- Condición falsa desde el inicio: cuerpo no se ejecuta.
- Ciclo de 100.001 iteraciones: lanza error descriptivo.
- `FinMientras` huérfano: error estático.
- `Si` dentro de `Mientras` y viceversa: anidamiento correcto.

---

## ETAPA 3 — Repetir / Hasta Que

### Sintaxis objetivo
```
Repetir
  <instrucciones>
Hasta Que <condicion>
```
Semántica: ejecuta al menos una vez. Repite mientras la condición sea FALSA. Sale cuando es VERDADERA.

### Archivos a modificar
`doc_errores.js`, `LiteSeInt.js`, `index.html`

### Tarea 3.1 — doc_errores.js: palabras reservadas

Agregar: `'repetir'`, `'hasta'`, `'que'`.

Nota: `'que'` es parte de `Hasta Que`. En el tokenizador puede ser un identificador; lo que importa es que el validador lo trate como cierre de `Repetir` cuando aparece `Hasta` seguido de `Que`.

### Tarea 3.2 — doc_errores.js: validación de bloques

Extender la pila para `Repetir / HastaQue`.
Errores: `Hasta Que` sin `Repetir`, `Repetir` sin cerrar.

### Tarea 3.3 — doc_errores.js: validar cierre `Hasta Que`

Cuando la línea comienza con `Hasta` y el siguiente token significativo es `Que`:
- Debe haber condición después de `Que`.
- Si no hay condición, error.

### Tarea 3.4 — LiteSeInt.js: ejecutar nodo Repetir

```javascript
case 'repetir': {
  let iteraciones = 0;
  do {
    if (!this.ejecutando) break;
    if (++iteraciones > LiteSeInt.MAX_ITERACIONES) {
      throw new Error('Posible ciclo infinito: se superaron 100.000 iteraciones en Repetir.');
    }
    await this._ejecutarBloque(nodo.cuerpo);
  } while (!this._evaluarCondicion(nodo.condicion, nodo.linea));
  break;
}
```

### Tarea 3.5 — LiteSeInt.js: parser — reconocer Repetir

Línea `Repetir` sola: push frame `{tipo:'repetir', nodo}`.
Línea `Hasta Que <condicion>`: extraer condición, asignarla al nodo del frame, pop, adjuntar al padre.

### Tarea 3.6 — index.html: resaltado y autocompletado

Agregar: `Repetir`, `Hasta`, `HastaQue` al highlight. En el autocompletado agregar `Repetir` como instrucción y `Hasta Que` como plantilla.

### Tarea 3.7 — Actualizar ejemplo: cambiar `contador` a usar Repetir

Agregar ejemplo separado `data-ejemplo="menu_simple"` que use `Repetir/HastaQue` para validar entrada.

### Verificación Etapa 3

- Cuerpo se ejecuta al menos una vez aunque condición sea verdadera desde el inicio.
- Sale correctamente cuando condición se vuelve verdadera.
- `Hasta Que` sin `Repetir`: error estático.
- Anidamiento con `Si` dentro de `Repetir`: funciona.

---

## ETAPA 4 — Para / Hasta / Con Paso / FinPara

### Sintaxis objetivo
```
Para <variable> <- <inicio> Hasta <fin> Con Paso <paso> Hacer
  <instrucciones>
FinPara
```
`Con Paso <paso>` es opcional. Si se omite, paso = 1.

### Archivos a modificar
`doc_errores.js`, `LiteSeInt.js`, `index.html`

### Tarea 4.1 — doc_errores.js: palabras reservadas

Agregar: `'para'`, `'con'`, `'paso'`, `'finpara'`.
`'hasta'` ya se agregó en Etapa 3; verificar que no haya conflicto con `HastaQue`.

### Tarea 4.2 — doc_errores.js: validación de bloques

Extender pila para `Para / FinPara`.

### Tarea 4.3 — doc_errores.js: validar línea `Para`

Patrón esperado: `Para <ident> <- <expr_inicio> Hasta <expr_fin> [Con Paso <expr_paso>] Hacer`

Validar:
- El primer token después de `Para` es un identificador.
- El identificador está en la tabla de símbolos como `Entero` o `Real`. Si no está definido, emitir `variable_no_definida`.
- El operador `<-` está presente.
- `Hasta` está presente.
- `Hacer` es el último token significativo de la línea.

### Tarea 4.4 — LiteSeInt.js: ejecutar nodo Para

```javascript
case 'para': {
  const inicio = this._evaluarExpresion(nodo.inicio, nodo.linea);
  const fin    = this._evaluarExpresion(nodo.fin, nodo.linea);
  const paso   = nodo.paso
    ? this._evaluarExpresion(nodo.paso, nodo.linea)
    : 1;
  const nombre = nodo.variable.toLowerCase();
  
  if (!this.variables.hasOwnProperty(nombre)) {
    throw new Error(`Variable "${nodo.variable}" no definida. Use "Definir ${nodo.variable} Como Entero" antes del Para.`);
  }
  
  this.variables[nombre].valor = inicio;
  this.variables[nombre].inicializada = true;
  
  let iteraciones = 0;
  const condicion = paso > 0
    ? () => this.variables[nombre].valor <= fin
    : () => this.variables[nombre].valor >= fin;
  
  while (condicion()) {
    if (!this.ejecutando) break;
    if (++iteraciones > LiteSeInt.MAX_ITERACIONES) {
      throw new Error('Posible ciclo infinito: se superaron 100.000 iteraciones en Para.');
    }
    await this._ejecutarBloque(nodo.cuerpo);
    this.variables[nombre].valor += paso;
  }
  break;
}
```

### Tarea 4.5 — LiteSeInt.js: parser — reconocer Para

Línea `Para <var> <- <inicio> Hasta <fin> [Con Paso <paso>] Hacer`:
- Extraer `variable`, `inicio`, `fin`, `paso` (opcional) como strings de expresión.
- Push frame. Al encontrar `FinPara`: pop, adjuntar.

El parser extrae substrings entre las palabras clave, no evalúa las expresiones — eso lo hace el ejecutor.

### Tarea 4.6 — index.html: resaltado y autocompletado

Agregar: `Para`, `FinPara`, `Con`, `Paso`. En autocompletado, `Para` como instrucción con plantilla.

### Tarea 4.7 — Nuevo ejemplo: Tabla de multiplicar

```
// Tabla de multiplicar
Definir n, i, resultado Como Entero
Escribir "¿De qué número quieres la tabla?"
Leer n
Para i <- 1 Hasta 10 Con Paso 1 Hacer
  resultado <- n * i
  Escribir n, " x ", i, " = ", resultado
FinPara
```

Agregar como `data-ejemplo="tabla"`.

### Verificación Etapa 4

- `Para i <- 1 Hasta 5 Hacer` itera 5 veces (i = 1, 2, 3, 4, 5).
- `Con Paso 2`: itera con valores 1, 3, 5, 7...
- Paso negativo: `Para i <- 10 Hasta 1 Con Paso -1 Hacer` cuenta hacia atrás.
- Variable no definida: error estático antes de ejecutar.
- `FinPara` huérfano: error estático.

---

## ETAPA 5 — Segun / Hacer / De Otro Modo / FinSegun

### Sintaxis objetivo
```
Segun <variable> Hacer
  <valor1>: <instrucciones>
  <valor2>, <valor3>: <instrucciones>
  De Otro Modo:
    <instrucciones>
FinSegun
```

### Archivos a modificar
`doc_errores.js`, `LiteSeInt.js`, `index.html`

### Tarea 5.1 — doc_errores.js: palabras reservadas

Agregar: `'segun'`, `'finsegun'`, `'de'`, `'otro'`, `'modo'`.

### Tarea 5.2 — doc_errores.js: validación de bloques

Extender pila para `Segun / FinSegun`.

### Tarea 5.3 — doc_errores.js: validar línea `Segun`

Patrón: `Segun <variable> Hacer`.
- El token entre `Segun` y `Hacer` debe ser un identificador definido en la tabla.
- `Hacer` debe ser el último token.

### Tarea 5.4 — LiteSeInt.js: ejecutar nodo Segun

```javascript
case 'segun': {
  const nombre = nodo.variable.toLowerCase();
  if (!this.variables.hasOwnProperty(nombre)) {
    throw new Error(`Variable "${nodo.variable}" no definida.`);
  }
  if (!this.variables[nombre].inicializada) {
    throw new Error(`Variable "${nodo.variable}" no inicializada.`);
  }
  const valor = this.variables[nombre].valor;
  let ejecutado = false;
  for (const caso of nodo.casos) {
    if (caso.valores.includes(valor) || caso.valores.map(String).includes(String(valor))) {
      await this._ejecutarBloque(caso.cuerpo);
      ejecutado = true;
      break;
    }
  }
  if (!ejecutado && nodo.porDefecto.length > 0) {
    await this._ejecutarBloque(nodo.porDefecto);
  }
  break;
}
```

### Tarea 5.5 — LiteSeInt.js: parser — reconocer Segun

El parser de `Segun` es el más complejo porque los casos tienen su propia sintaxis (`valor:` o `v1, v2:`).

Estrategia:
- Al entrar en frame `segun`, las líneas que contienen `:` al final (o después de valores numéricos) son encabezados de caso.
- Detectar `De Otro Modo:` como caso especial (porDefecto).
- Instrucciones entre encabezados de caso se adjuntan al caso activo.

Parseo de encabezado de caso:
```
<val1> [, <val2> ...]:
```
Extraer los valores como números o strings, separados por coma antes del `:`.

### Tarea 5.6 — index.html: resaltado y autocompletado

Agregar: `Segun`, `FinSegun`, `De Otro Modo` al highlight y autocompletado.

### Tarea 5.7 — Nuevo ejemplo: Día de la semana

```
// Nombre del día según número
Definir dia Como Entero
Escribir "Ingresa un número del 1 al 7:"
Leer dia
Segun dia Hacer
  1: Escribir "Lunes"
  2: Escribir "Martes"
  3: Escribir "Miércoles"
  4: Escribir "Jueves"
  5: Escribir "Viernes"
  6: Escribir "Sábado"
  7: Escribir "Domingo"
  De Otro Modo:
    Escribir "Número fuera de rango"
FinSegun
```

Agregar como `data-ejemplo="diasemana"`.

### Verificación Etapa 5

- Valor coincide con un caso: ejecuta ese cuerpo y no los demás.
- Valores múltiples en un caso (`2, 3:`): ambos disparan el mismo bloque.
- Sin coincidencia y con `De Otro Modo`: ejecuta el bloque por defecto.
- Sin coincidencia y sin `De Otro Modo`: no hace nada (sin error).
- Variable no inicializada: error de runtime.

---

## ETAPA 6 — Actualización de documentación

### Tarea 6.1 — README.md

Actualizar la tabla de instrucciones soportadas con todas las nuevas estructuras.
Agregar sección de operadores de condición (`=`, `<>`, `<`, `>`, `<=`, `>=`, `Y`, `O`, `No`).

### Tarea 6.2 — CHANGELOG.md

Agregar entrada `[0.2.0]` con fecha de implementación.
Documentar cada estructura como ítem en `### Agregado`.
Documentar el refactor a AST en `### Cambiado`.

### Tarea 6.3 — CLAUDE.md

Actualizar la sección `## Language Model of the Project` con las nuevas instrucciones y operadores.
Actualizar la lista de palabras reservadas.

---

## Resumen de palabras reservadas nuevas

Agregar a `PALABRAS_RESERVADAS_SET` en `doc_errores.js`:

```
si, entonces, sino, finsi,
mientras, hacer, finmientras,
repetir, hasta, que,
para, con, paso, finpara,
segun, finsegun, de, otro, modo
```

Y a `LiteSeInt.PALABRAS_RESERVADAS` (para autocompletado):

```javascript
{ texto: 'Si',          tipo: 'condicional' },
{ texto: 'Entonces',    tipo: 'palabra clave' },
{ texto: 'Sino',        tipo: 'palabra clave' },
{ texto: 'FinSi',       tipo: 'cierre' },
{ texto: 'Mientras',    tipo: 'ciclo' },
{ texto: 'Hacer',       tipo: 'palabra clave' },
{ texto: 'FinMientras', tipo: 'cierre' },
{ texto: 'Repetir',     tipo: 'ciclo' },
{ texto: 'HastaQue',    tipo: 'cierre' },
{ texto: 'Para',        tipo: 'ciclo' },
{ texto: 'FinPara',     tipo: 'cierre' },
{ texto: 'Segun',       tipo: 'selección' },
{ texto: 'FinSegun',    tipo: 'cierre' },
```

---

## Casos de prueba de regresión (correr al final de cada etapa)

```
// Caso 1: Ejemplo Hola Mundo (no debe romperse)
Proceso test
  Escribir "Hola mundo"
FinProceso

// Caso 2: Ejemplo Saludo con Leer (no debe romperse)
// (igual al ejemplo precargado)

// Caso 3: Si anidado dentro de Mientras
Proceso test
  Definir i Como Entero
  i <- 0
  Mientras i < 3 Hacer
    Si i = 1 Entonces
      Escribir "Es uno"
    Sino
      Escribir "No es uno: ", i
    FinSi
    i <- i + 1
  FinMientras
FinProceso

// Caso 4: Para con Si adentro
Proceso test
  Definir i Como Entero
  Para i <- 1 Hasta 5 Con Paso 1 Hacer
    Si i = 3 Entonces
      Escribir "Tres!"
    Sino
      Escribir i
    FinSi
  FinPara
FinProceso

// Caso 5: Repetir hasta que el usuario ingrese 0
Proceso test
  Definir n Como Entero
  Repetir
    Escribir "Ingresa un número (0 para salir):"
    Leer n
  Hasta Que n = 0
  Escribir "Saliste."
FinProceso
```

---

## Definición de done por etapa

Una etapa está completa cuando:
1. Los casos de prueba de esa etapa pasan sin error.
2. Los casos de regresión de etapas anteriores siguen pasando.
3. Los errores estáticos (bloques desbalanceados, sintaxis inválida) se muestran correctamente en el editor.
4. Las nuevas palabras clave aparecen con color en el syntax highlight.
5. Las nuevas instrucciones aparecen en el autocompletado.
6. CHANGELOG.md está actualizado.
