# LiteSeInt

**LiteSeInt** es un intérprete web de pseudocódigo inspirado en PSeInt y orientado a fines educativos. Permite escribir programas en un editor integrado, validarlos en tiempo real y ejecutarlos directamente en el navegador, sin instalación ni proceso de compilación.

El proyecto separa la lógica del intérprete de la interfaz visual, lo que facilita su mantenimiento, evolución y reutilización.

## Estado actual

- Versión visible en la app: `v0.8.6`
- Demo en GitHub Pages: <https://ernestoleonidas.github.io/LiteSeInt/>
- Layout educativo: editor arriba, **consola debajo del editor** (redimensionable verticalmente) y **panel de aprendizaje integrado** con ejercicios, documentación de comandos, ruta del estudiante y errores comunes.
- **245 ejercicios adaptados** desde `ejercicios/guia.html` al dialecto LiteSeInt, cargados desde archivos JSON normalizados `N1`–`N7`, con validación estática automática y formato de código de referencia consistente.
- Ejemplos accesibles desde un menú desplegable en la cabecera del editor, agrupados por concepto.
- Núcleo del lenguaje congelado para 1.0 (ver "Matriz de compatibilidad").
- Reglas de adaptación de ejercicios documentadas en [`EJERCICIOS.md`](EJERCICIOS.md).
- Estructura de aprendizaje LiteSeInt 1.0 en [`EJERCICIOS.md`](EJERCICIOS.md): niveles N1–N7, grados de ayuda y progresión desde observar código hasta crear soluciones.
- Ejecución completamente en el navegador
- Sin build step ni backend
- Proyecto basado en HTML, CSS y JavaScript vanilla

## Características

- Editor de pseudocódigo con numeración de líneas.
- Consola **debajo del editor**, redimensionable verticalmente (la altura se persiste en `localStorage`).
- **Panel de aprendizaje** con banco de ejercicios, documentación de comandos, ruta del estudiante y guía de errores comunes sin depender de internet.
- **Banco de ejercicios** con filtros por nivel/dificultad/estado, detalle con enunciado, E·P·S dentro de la pista, salida esperada, acceso al código de referencia con confirmación previa y **progreso local** persistente (`pendiente` / `en curso` / `completado`).
- Selector de **ejemplos en menú desplegable**, agrupados por concepto (primeros programas, variables, expresiones, condicionales, ciclos, `Segun`).
- Resaltado de sintaxis y guías visuales de indentación.
- Validación estática con errores por línea, badge visual y tooltip descriptivo.
- Consola integrada con entrada inline para instrucciones `Leer`.
- Ejecución con resaltado de la línea activa.
- Botones para ejecutar, detener, limpiar y descargar el código como `.psc`.
- Autocompletado de palabras reservadas, tipos, literales y variables definidas por el usuario.
- Deshacer cambios del editor con `Ctrl+Z` o `Cmd+Z`.
- Estructura inicial `Proceso ... FinProceso` protegida en la experiencia de edición.
- Soporte para comentarios con `//` en línea completa o al final de una instrucción.

## Matriz de compatibilidad (v0.6.0)

LiteSeInt v0.6.0 declara y congela el subconjunto mínimo del lenguaje que será la base de la versión 1.0. La meta del proyecto **no** es portar PSeInt completo, sino ofrecer un núcleo pequeño, predecible y bien probado.

### Estructura del programa

| Construcción | Sintaxis canónica |
|---|---|
| Encabezado | `Proceso nombre_proceso` |
| Cierre | `FinProceso` |
| Comentario | `// texto` |

Todo programa válido empieza con `Proceso nombre` y termina con `FinProceso`. Los comentarios `//` son válidos en una línea completa o al final de una instrucción.

### Instrucciones básicas

| Instrucción | Sintaxis canónica | Ejemplo |
|---|---|---|
| Declaración | `Definir var1[, var2, ...] Como Entero\|Real\|Caracter\|Logico` | `Definir nombre Como Caracter` |
| Asignación | `variable = expresion` | `total = nota1 + nota2` |
| Salida | `Escribir expr1[, expr2, ...]` | `Escribir "Hola, ", nombre` |
| Entrada | `Leer variable` | `Leer edad` |

### Estructuras de control

| Estructura | Sintaxis canónica |
|---|---|
| Condicional | `Si condicion Entonces ... FinSi` |
| Condicional con alternativa | `Si condicion Entonces ... Sino ... FinSi` |
| Bucle `Mientras` | `Mientras condicion Hacer ... FinMientras` |
| Bucle `Repetir` | `Repetir ... HastaQue condicion` |
| Bucle `Para` | `Para var = inicio Hasta fin [Con Paso paso] Hacer ... FinPara` |
| Selección múltiple | `Segun expresion Hacer` + casos `valor:` + `De Otro Modo:` + `FinSegun` |

### Tipos

| Tipo | Valor por defecto | Literales |
|---|---|---|
| `Entero` | `0` | `0`, `1`, `-3`, `42` |
| `Real` | `0.0` | `3.14`, `-2.5`, `0.0` |
| `Caracter` | `""` | `"texto"` (comillas dobles) |
| `Logico` | `Falso` | `Verdadero`, `Falso` |

### Operadores

| Categoría | Operadores |
|---|---|
| Aritméticos | `+`, `-`, `*`, `/`, `mod`, `^` |
| Relacionales | `==`, `!=`, `<>`, `<`, `>`, `<=`, `>=` |
| Lógicos | `Y`, `O`, `No` |

### Funciones nativas

| Función | Tipo de argumento | Resultado |
|---|---|---|
| `Abs(x)` | numérico | valor absoluto |
| `Redon(x)` | numérico | redondeo al entero más cercano |
| `Trunc(x)` | numérico | trunca la parte decimal |
| `Longitud(t)` | `Caracter` | cantidad de caracteres |
| `Mayusculas(t)` | `Caracter` | texto en mayúsculas |
| `Minusculas(t)` | `Caracter` | texto en minúsculas |

### Variantes aceptadas

- `HastaQue condicion` y `Hasta Que condicion` (alias) son ambos válidos para cerrar `Repetir`.
- Las palabras clave son **insensibles a mayúsculas/minúsculas** (`Definir`, `definir` y `DEFINIR` son equivalentes). Los nombres de variables se comparan normalizados a minúsculas.
- Las cadenas se delimitan **solo con comillas dobles** (`"texto"`).
- Los números reales usan **punto decimal** (`3.14`).
- Los nombres de variables admiten letras (incluyendo `áéíóúüñ`), dígitos y `_`. No pueden empezar por dígito ni coincidir con una palabra reservada.
- Una línea `Definir` puede declarar múltiples variables del mismo tipo separadas por coma.
- Los casos en `Segun` aceptan: caso multilínea, caso inline (`1: Escribir "Lunes"`) y varios valores por caso (`3, 4, 5: Escribir "..."`).

### No soportado en v0.6.0

Las siguientes construcciones de PSeInt **no** están soportadas en LiteSeInt v0.6.0 y emiten un mensaje pedagógico cuando aparecen:

- `Dimension` y arreglos.
- `SubProceso` / `FinSubProceso`.
- Funciones definidas por el usuario (`Funcion` / `FinFuncion`).
- Diagramas de flujo.
- Exportación a otros lenguajes.
- Editor multiarchivo.
- Persistencia de proyectos.
- Operador de asignación `<-` (en LiteSeInt la asignación es `=`).
- `=` como comparador en condiciones (en LiteSeInt la igualdad es `==`).

### Detalles de operadores

- `mod` calcula el resto de una división entre dos valores numéricos.
- `^` es el operador de potencia (`base ^ exponente`) y es asociativo a la derecha.
- La precedencia, de mayor a menor, es: `^` > menos unario > `*`, `/`, `mod` > `+`, `-`.
- El menos unario funciona al inicio de una expresión y también después de otro operador, `(` o `,`. `2 ^ -3` produce `0.125` y `-3 ^ 2` se interpreta como `-(3 ^ 2)`.

### Detalles de funciones nativas

Las funciones de texto requieren un argumento de tipo `Caracter`. Las funciones numéricas requieren un argumento numérico (`Entero` o `Real`). Las llamadas pueden anidarse:

```txt
Proceso ejemplo
Definir nombre Como Caracter
Definir largo Como Entero

nombre = "LiteSeInt"
largo = Longitud(Mayusculas(nombre))
Escribir "Largo: ", largo
FinProceso
```

Ejemplo combinando operadores y funciones numéricas:

```txt
Proceso ejemplo
Definir n Como Entero
Definir potencia Como Real

Leer n
Si n mod 2 == 0 Entonces
  Escribir n, " es par"
Sino
  Escribir n, " es impar"
FinSi

potencia = 2 ^ n
Escribir "2 elevado a ", n, " = ", potencia
Escribir "Distancia al origen: ", Abs(n)
FinProceso
```

### Tipo `Logico`

LiteSeInt soporta el tipo `Logico` con los literales `Verdadero` y `Falso`.

- Puede declararse con `Definir`.
- Puede leerse con `Leer`.
- Puede imprimirse con `Escribir`.
- Puede usarse en condiciones y expresiones.
- La negación `No` funciona tanto en condiciones como en asignaciones.

Ejemplo:

```txt
Proceso ejemplo
Definir activo, permitido Como Logico

activo = Verdadero
permitido = Falso

Si activo Y No permitido Entonces
  Escribir "Acceso parcial"
Sino
  Escribir "Otro estado"
FinSi

permitido = No permitido
Escribir "permitido ahora vale: ", permitido
FinProceso
```

Cuando se imprime un booleano, la salida se muestra como `Verdadero` o `Falso`, no como `true` o `false`.

### `Segun`

La estructura `Segun` admite:

- Casos inline: `1: Escribir "Lunes"`
- Casos multilínea
- Varios valores por caso separados por coma
- Bloque `De Otro Modo:`

Ejemplo:

```txt
Proceso ejemplo
Definir dia Como Entero
Leer dia

Segun dia Hacer
  1: Escribir "Lunes"
  2: Escribir "Martes"
  3, 4, 5:
    Escribir "Mitad de semana"
  De Otro Modo:
    Escribir "Otro día"
FinSegun
FinProceso
```

## Ejemplos incluidos

La interfaz carga ejemplos listos para ejecutar:

- `Hola Mundo`
- `Saludo`
- `Notas`
- `Multi-variable`
- `Mayor de dos`
- `Contador`
- `Tabla`
- `Día de semana`
- `Lógico`
- `Numérico`
- `Texto`

## Tecnologías

- HTML5
- CSS3
- JavaScript vanilla
- Bootstrap `5.3.3`
- jQuery `3.7.1`
- SweetAlert2
- Google Fonts (`JetBrains Mono` y `Space Mono`)
- Node.js para pruebas locales

La lógica del intérprete no depende de frameworks de frontend.

## Estructura del proyecto

```txt
.
├── index.html
├── README.md
├── CHANGELOG.md
├── EJERCICIOS.md
├── ROADMAP.md
├── package.json
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── doc_errores.js
│   ├── ejercicios-data.js
│   └── LiteSeInt.js
├── ejercicios/
│   └── guia.html
└── tests/
    └── run-tests.js
```

Árbol de pruebas:

```txt
tests/
└── run-tests.js
```

### Archivos principales

- [index.html](index.html): estructura de la interfaz y carga de dependencias.
- [css/styles.css](css/styles.css): estilos de la aplicación.
- [js/app.js](js/app.js): controlador de interfaz, consola, editor, autocompletado, ejemplos y banco de ejercicios.
- [js/doc_errores.js](js/doc_errores.js): tokenización, validación estática, decoraciones y tabla de símbolos.
- [js/LiteSeInt.js](js/LiteSeInt.js): parser, AST, ejecución y evaluación de expresiones/condiciones.
- [js/ejercicios-data.js](js/ejercicios-data.js): banco de ejercicios adaptados al dialecto LiteSeInt (fuente de datos del panel de aprendizaje).
- [tests/run-tests.js](tests/run-tests.js): pruebas de regresión del lenguaje y del banco de ejercicios.

## Uso rápido

1. Clona o descarga este repositorio.
2. Abre [index.html](index.html) en un navegador moderno, o usa la demo publicada en <https://ernestoleonidas.github.io/LiteSeInt/>.
3. Escribe pseudocódigo o carga uno de los ejemplos.
4. Presiona `Ejecutar`.
5. Si el programa usa `Leer`, responde desde la consola integrada.

## Banco de ejercicios

El panel de aprendizaje muestra el banco de ejercicios adaptados desde `ejercicios/guia.html`. Permite:

- **Filtrar** por nivel LiteSeInt visible (N1–N7), dificultad (`básico`/`intermedio`/`avanzado`) y estado de progreso (`pendiente`/`en curso`/`completado`).
- **Ver el detalle** de un ejercicio: enunciado, conceptos, entrada/proceso/salida, salida esperada y pista colapsable.
- **Ver el código de referencia** adaptado desde el detalle del ejercicio, con confirmación previa para no sobrescribir el editor.
- **Marcar progreso** manualmente como `pendiente`, `en curso` o `completado`. El estado se guarda en `localStorage` (`liteseint:exerciseProgress`) y persiste al recargar la página.

A la fecha v0.8.6, el banco contiene 245 ejercicios adaptados, cargados desde `json/N1.json` a `json/N7.json` mediante `js/ejercicios-data.js`. En la app quedan visibles N1–N7. La regla de calidad se mantiene: **todo ejercicio visible debe estar adaptado** al dialecto LiteSeInt, pasar la validación estática y mantener un formato de referencia legible. Detalles en [`EJERCICIOS.md`](EJERCICIOS.md).

## Documentación integrada

Desde `v0.8.5`, el panel de aprendizaje incluye vistas internas para:

- **Comandos**: referencia rápida de la sintaxis soportada, ejemplos mínimos y ejercicios recomendados por comando.
- **Ruta**: recorrido N1–N7 con avance local y ejercicios iniciales sugeridos para cada nivel.
- **Errores**: explicación de errores comunes como variable no definida, variable no inicializada, cierres faltantes, sintaxis PSeInt no soportada y diferencia entre `=` y `==`.

La documentación está embebida en la app y no requiere conexión a internet.

## Pruebas

```bash
npm test
```

Las pruebas cargan `doc_errores.js` y `LiteSeInt.js` en Node.js para validar reglas del lenguaje, ejecución y regresiones del flujo `Detener`.

## Arquitectura general

```txt
index.html
  ├── css/styles.css
  └── js/app.js
       ├── usa js/doc_errores.js para validación y ayudas del editor
       ├── usa js/LiteSeInt.js para interpretar y ejecutar
       └── usa js/ejercicios-data.js como fuente del banco de ejercicios
```

### Responsabilidades

- `LiteSeInt.js`
  Parser del pseudocódigo, construcción del AST, ejecución por bloques y evaluación de expresiones.

- `doc_errores.js`
  Tokenización, validación estructural del documento, detección de errores y soporte para autocompletado.

- `app.js`
  Integración con la UI: editor, consola, ejemplos, descargas y estados visuales de ejecución/error.

## Hoja de ruta

La ruta hacia 1.0 prioriza la experiencia educativa:

- Reorganizar la interfaz para usar editor + consola inferior + panel de aprendizaje.
- Integrar ejercicios adaptados al dialecto LiteSeInt.
- Agregar documentación de comandos dentro de la app.
- Mostrar progreso del estudiante por nivel y ejercicio.
- Conectar los conceptos de pseudolenguaje con Python.

El detalle está en [ROADMAP.md](ROADMAP.md) y [EJERCICIOS.md](EJERCICIOS.md).

## Licencia

Proyecto educativo de uso libre.
