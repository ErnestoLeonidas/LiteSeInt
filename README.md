# LiteSeInt

**LiteSeInt** es un intérprete web de pseudocódigo inspirado en PSeInt y orientado a fines educativos. Permite escribir programas en un editor integrado, validarlos en tiempo real y ejecutarlos directamente en el navegador, sin instalación ni proceso de compilación.

El proyecto separa la lógica del intérprete de la interfaz visual, lo que facilita su mantenimiento, evolución y reutilización.

## Estado actual

- Versión visible en la app: `v1.7.0`
- Demo en GitHub Pages: <https://ernestoleonidas.github.io/LiteSeInt/>
- Layout educativo: editor arriba, **panel inferior con pestañas** (Consola / Variables / Diagrama) redimensionable verticalmente y **panel de aprendizaje integrado** redimensionable horizontalmente con ejercicios, documentación de comandos, ruta del estudiante y errores comunes.
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
- **Panel inferior con pestañas** (Consola / Variables / Diagrama), redimensionable verticalmente (la altura se persiste en `localStorage`).
- **Inspector de variables** en la pestaña Variables: muestra nombre, tipo, valor y estado de cada variable en tiempo real durante la ejecución. Arreglos y matrices son expandibles por índice.
- Panel de aprendizaje redimensionable horizontalmente para ampliar o reducir el área útil del editor.
- **Panel de aprendizaje** con banco de ejercicios, documentación de comandos (17 entradas: instrucciones, tipos, operadores, estructuras de control y funciones), ruta del estudiante y guía de errores comunes sin depender de internet.
- **Banco de ejercicios** con filtros por nivel/dificultad/estado, detalle con enunciado, E·P·S dentro de la pista, salida esperada, acceso al código de referencia con confirmación previa y **progreso local** persistente (`pendiente` / `en curso` / `completado`).
- Selector de **ejemplos en menú desplegable**, agrupados por concepto (primeros programas, variables, expresiones, condicionales, ciclos, `Segun`), con confirmación solo cuando el editor ya usa un proceso no genérico.
- Importación y descarga de archivos `.psc`; la descarga exige un nombre de proceso válido y al menos una instrucción real.
- Confirmación previa en acciones que reemplazan el contenido del editor: borrado de editor, importación `.psc`, ejemplos con proceso no genérico y código de referencia.
- Tooltips compactos en acciones de editor/consola y diálogos de confirmación adaptados al estilo visual de LiteSeInt.
- Resaltado de sintaxis y guías visuales de indentación.
- Validación estática con errores por línea, badge visual y tooltip descriptivo.
- Consola integrada con entrada inline para instrucciones `Leer`.
- Ejecución con resaltado de la línea activa.
- Botones para ejecutar, detener, limpiar, importar y descargar código `.psc`.
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

### Arreglos y matrices (v1.6.0)

`Dimension` declara arreglos unidimensionales o matrices bidimensionales. Los índices son 1-basados (el primer elemento es `arr[1]`).

| Instrucción | Ejemplo |
|---|---|
| Declarar arreglo 1D | `Dimension arr[5]` |
| Declarar matriz 2D | `Dimension mat[3, 4]` |
| Asignar elemento | `arr[2] = 10` |
| Leer elemento | `Leer mat[1, 1]` |
| Leer en expresión | `Escribir arr[i]` |

`Dimension` puede aparecer antes o después de `Definir`; ambos deben declararse antes de cualquier acceso por índice. El tipo del arreglo se fija con `Definir`.

```txt
Proceso ejemplo
Dimension notas[5]
Definir notas Como Entero
Definir i, suma Como Entero

Para i = 1 Hasta 5 Hacer
  Leer notas[i]
FinPara

suma = 0
Para i = 1 Hasta 5 Hacer
  suma = suma + notas[i]
FinPara
Escribir "Promedio: ", suma / 5
FinProceso
```

### Subprocesos y funciones (v1.8.0)

Se pueden definir subprocesos (sin valor de retorno) y funciones (con valor de retorno) fuera del bloque `Proceso`:

```txt
SubProceso Saludar(nombre Como Caracter)
  Escribir "Hola, ", nombre
FinSubProceso

Funcion res = Cuadrado(n Como Entero)
  res = n * n
FinFuncion

Proceso ejemplo
  Llamar Saludar("Mundo")
  Definir r Como Entero
  r = Cuadrado(5)
  Escribir r
FinProceso
```

**Parámetros:**
- Por defecto se pasan **por valor** (copia).
- Se puede forzar paso **por referencia** con el prefijo `Por Referencia`:
  ```txt
  SubProceso Duplicar(Por Referencia n Como Entero)
    n = n * 2
  FinSubProceso
  ```
- Los **arreglos** se pasan siempre por referencia (se comparte el objeto `datos`).

**Recursividad:** soportada con límite de profundidad de llamada de 256 frames.

**Invocación:**
- Como instrucción: `Llamar Nombre(args)`.
- Como expresión (funciones con retorno): `r = NombreFuncion(args)`.

### Diagrama NS bidireccional (v1.9.0)

La pestaña **Diagrama** del panel inferior muestra un diagrama de Nassi-Shneiderman (NS) del código activo, generado al vuelo desde el AST. El diagrama se actualiza cada vez que se abre la pestaña.

El diagrama es **bidireccional**: hacer clic en cualquier bloque con cursor de texto (condiciones de `Si`, `Mientras`, `Repetir`, `Segun`; textos de instrucciones) abre un campo de edición inline. Al presionar Enter o hacer clic fuera, el código del editor se actualiza automáticamente y la validación estática se ejecuta.

### No soportado (aún pendiente)
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
├── roadmap_backend.md
├── package.json
├── css/
│   └── styles.css
├── core/
│   ├── tokenizer.js
│   ├── symbol-table.js
│   ├── validator.js
│   ├── doc_errores.js
│   ├── ast.js
│   ├── parser.js
│   ├── expression-evaluator.js
│   └── LiteSeInt.js
├── shared/
│   └── ast-contract.md
├── js/
│   ├── app.js
│   └── ejercicios-data.js
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
- [core/tokenizer.js](core/tokenizer.js): tokenización por línea, constantes léxicas, helpers (`stripComment`, `crearError`).
- [core/symbol-table.js](core/symbol-table.js): `TablaSimbolos` y `ScopeChain` (cadena de scopes, en `v1.1.0` solo scope global).
- [core/validator.js](core/validator.js): validación estática del documento completo y reglas `validar*`.
- [core/doc_errores.js](core/doc_errores.js): aggregator que reexpone el contrato público `DocErrores`.
- [core/ast.js](core/ast.js): nodos del AST, `AST_VERSION` y helpers de serialización.
- [core/parser.js](core/parser.js): `parsearPrograma(codigo)` construye el AST.
- [core/expression-evaluator.js](core/expression-evaluator.js): pipeline aritmético y condicional + tablas de operadores y funciones nativas.
- [core/LiteSeInt.js](core/LiteSeInt.js): runtime — recorre el AST y orquesta callbacks de I/O.
- [shared/ast-contract.md](shared/ast-contract.md): especificación pública del AST.
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

A la fecha `v1.0.0`, el banco contiene 245 ejercicios adaptados, cargados desde `json/N1.json` a `json/N7.json` mediante `js/ejercicios-data.js`. En la app quedan visibles N1–N7. La regla de calidad se mantiene: **todo ejercicio visible debe estar adaptado** al dialecto LiteSeInt, pasar la validación estática y mantener un formato de referencia legible. Detalles en [`EJERCICIOS.md`](EJERCICIOS.md).

## Documentación integrada

El panel de aprendizaje incluye vistas internas para:

- **Comandos**: guía de la sintaxis soportada, explicación de uso, ejemplo mínimo, errores típicos y ejercicios recomendados por comando.
- **Ruta**: recorrido N1–N7 con objetivo pedagógico, foco de trabajo, avance local, ejercicios sugeridos y criterios para saber cuándo avanzar.
- **Errores**: explicación por síntoma, causa, corrección y ejemplo para errores comunes como variable no definida, variable no inicializada, cierres faltantes, ciclos infinitos, sintaxis PSeInt no soportada, cadenas sin cerrar y diferencia entre `=` y `==`.

La documentación está embebida en la app y no requiere conexión a internet.

## Guía de comandos

La referencia de comandos cubre el subconjunto congelado para 1.0:

- estructura de programa: `Proceso`, `FinProceso` y comentarios `//`;
- datos: `Definir`, asignación con `=`, `Leer` y `Escribir`;
- decisiones: `Si`, `Sino`, `FinSi`, `Segun`, casos y `De Otro Modo`;
- repetición: `Mientras`, `Repetir`, `HastaQue`, `Para`;
- expresiones: operadores aritméticos, relacionales, lógicos y funciones nativas.

Cada entrada de la guía responde cuatro preguntas: qué hace el comando, cuándo conviene usarlo, cuál es su sintaxis canónica y qué errores debe evitar el estudiante.

## Ruta de desarrollo hacia v1.0.0

El proyecto ya cuenta con editor, consola inferior, validación estática, banco de 245 ejercicios adaptados, progreso local y documentación integrada. La versión 1.0 es este producto; el cierre hacia `v1.0.0` se concentra en estabilización y preparación de release:

- mantener README, CHANGELOG, EJERCICIOS y ROADMAP alineados con el estado real;
- probar el material pedagógico integrado: ejercicios, comandos, ruta y errores;
- revisar el flujo completo de estudiante en escritorio y móvil;
- mantener los ejercicios visibles pasando `npm test`;
- actualizar `README.md`, `CHANGELOG.md` y versión visible al cerrar cada revisión.

## Pruebas

```bash
npm test
```

Las pruebas cargan los módulos de `core/` (`tokenizer`, `symbol-table`, `validator`, `doc_errores`, `ast`, `parser`, `expression-evaluator`, `LiteSeInt`), `js/ejercicios-data.js` y datos pedagógicos de `js/app.js` en Node.js para validar tokenización, validación estática, AST, parser, runtime, banco de ejercicios, documentación interna y regresiones del flujo `Detener`.

## Arquitectura general

```txt
index.html
  ├── css/styles.css
  └── js/app.js
       ├── usa core/doc_errores.js para validación y ayudas del editor
       ├── usa core/LiteSeInt.js para interpretar y ejecutar
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

- Mantener la interfaz educativa actual: editor, consola inferior y panel de aprendizaje.
- Consolidar los 245 ejercicios adaptados al dialecto LiteSeInt.
- Mejorar la documentación de comandos, ruta y errores dentro de la app.
- Mostrar progreso claro por nivel y ejercicio.
- Mantener el cierre de 1.0 enfocado en LiteSeInt: comandos, rutas, errores y ejercicios.

El detalle del front y el editor está en [ROADMAP.md](ROADMAP.md); el del servidor en [roadmap_backend.md](roadmap_backend.md). Los ejercicios, en [EJERCICIOS.md](EJERCICIOS.md).

## Licencia

Proyecto educativo de uso libre.
