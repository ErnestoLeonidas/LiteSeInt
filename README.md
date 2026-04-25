# LiteSeInt

**LiteSeInt** es un intérprete web de pseudocódigo inspirado en PSeInt y orientado a fines educativos. Permite escribir programas en un editor integrado, validarlos en tiempo real y ejecutarlos directamente en el navegador, sin instalación ni proceso de compilación.

El proyecto separa la lógica del intérprete de la interfaz visual, lo que facilita su mantenimiento, evolución y reutilización.

## Estado actual

- Versión visible en la app: `v0.5.3`
- Ejecución completamente en el navegador
- Sin build step ni backend
- Proyecto basado en HTML, CSS y JavaScript vanilla

## Características

- Editor de pseudocódigo con numeración de líneas.
- Resaltado de sintaxis y guías visuales de indentación.
- Validación estática con errores por línea, badge visual y tooltip descriptivo.
- Consola integrada con entrada inline para instrucciones `Leer`.
- Ejecución con resaltado de la línea activa.
- Botones para ejecutar, detener, limpiar y descargar el código como `.psc`.
- Autocompletado de palabras reservadas, tipos, literales y variables definidas por el usuario.
- Estructura inicial `Proceso ... FinProceso` protegida en la experiencia de edición.
- Ejemplos precargados para probar el lenguaje rápidamente.
- Soporte para comentarios con `//` en línea completa o al final de una instrucción.

## Lenguaje soportado

### Instrucciones básicas

| Instrucción | Sintaxis | Ejemplo |
|---|---|---|
| Definir | `Definir var1, var2 Como Tipo` | `Definir nombre Como Caracter` |
| Asignación | `variable = expresion` | `total = nota1 + nota2` |
| Escribir | `Escribir expr1, expr2, ...` | `Escribir "Hola, ", nombre` |
| Leer | `Leer variable` | `Leer edad` |
| Comentario | `// texto` | `// esto es un comentario` |

### Estructuras de control

| Estructura | Sintaxis |
|---|---|
| Condicional | `Si condicion Entonces ... FinSi` |
| Condicional con alternativa | `Si condicion Entonces ... Sino ... FinSi` |
| Bucle `Mientras` | `Mientras condicion Hacer ... FinMientras` |
| Bucle `Repetir` | `Repetir ... HastaQue condicion` |
| Alias aceptado | `Hasta Que condicion` |
| Bucle `Para` | `Para var = inicio Hasta fin [Con Paso n] Hacer ... FinPara` |
| `Segun` | `Segun expresion Hacer ... FinSegun` |

### Operadores

**Aritméticos**

`+`, `-`, `*`, `/`, `mod`, `^`

- `mod` calcula el resto de una división entre dos valores numéricos.
- `^` es el operador de potencia (`base ^ exponente`) y es asociativo a la derecha.
- La precedencia, de mayor a menor, es: `^` > `*`, `/`, `mod` > `+`, `-`.
- El menos unario funciona al inicio de una expresión y también después de otro operador, `(` o `,`. Su precedencia es menor que `^` y mayor que `*`, `/` y `mod`, así que `2 ^ -3` produce `0.125` y `-3 ^ 2` se interpreta como `-(3 ^ 2)`.

**Relacionales**

`==`, `!=`, `<>`, `<`, `>`, `<=`, `>=`

**Lógicos**

`Y`, `O`, `No`

### Funciones nativas

**Numéricas**

| Función | Descripción | Ejemplo | Resultado |
|---|---|---|---|
| `Abs(x)` | Valor absoluto de un número | `Abs(-3.5)` | `3.5` |
| `Redon(x)` | Redondea al entero más cercano | `Redon(3.6)` | `4` |
| `Trunc(x)` | Trunca la parte decimal | `Trunc(3.9)` | `3` |

**De texto**

| Función | Descripción | Ejemplo | Resultado |
|---|---|---|---|
| `Longitud(texto)` | Cantidad de caracteres del texto | `Longitud("hola")` | `4` |
| `Mayusculas(texto)` | Convierte el texto a mayúsculas | `Mayusculas("hola")` | `"HOLA"` |
| `Minusculas(texto)` | Convierte el texto a minúsculas | `Minusculas("HOLA")` | `"hola"` |

Las funciones de texto requieren un argumento de tipo `Caracter`. Las funciones numéricas requieren un argumento numérico (`Entero` o `Real`). Las llamadas pueden anidarse, por ejemplo:

```txt
Definir nombre Como Caracter
Definir largo Como Entero

nombre = "LiteSeInt"
largo = Longitud(Mayusculas(nombre))
Escribir "Largo: ", largo
```

Ejemplo combinando los nuevos operadores y funciones:

```txt
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
Escribir "2 * -3 = ", 2 * -3
Escribir "2 ^ -3 = ", 2 ^ -3
Escribir "Abs(2 * -3) = ", Abs(2 * -3)
```

### Tipos de datos

| Tipo | Valor por defecto |
|---|---|
| `Entero` | `0` |
| `Real` | `0.0` |
| `Caracter` | `""` |
| `Logico` | `Falso` |

### Tipo `Logico`

LiteSeInt soporta el tipo `Logico` con los literales `Verdadero` y `Falso`.

- Puede declararse con `Definir`.
- Puede leerse con `Leer`.
- Puede imprimirse con `Escribir`.
- Puede usarse en condiciones y expresiones.
- La negación `No` funciona tanto en condiciones como en asignaciones.

Ejemplo:

```txt
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
- Bootstrap Icons `1.11.3`
- jQuery `3.7.1`
- SweetAlert2
- Lucide
- Google Fonts (`JetBrains Mono` y `Space Mono`)

La lógica del intérprete no depende de frameworks de frontend.

## Estructura del proyecto

```txt
.
├── index.html
├── README.md
├── CHANGELOG.md
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── doc_errores.js
    └── LiteSeInt.js
```

### Archivos principales

- [index.html](/Users/ernestoleonidas/Documents/Guaren/LiteSeInt/index.html): estructura de la interfaz y carga de dependencias.
- [css/styles.css](/Users/ernestoleonidas/Documents/Guaren/LiteSeInt/css/styles.css): estilos de la aplicación.
- [js/app.js](/Users/ernestoleonidas/Documents/Guaren/LiteSeInt/js/app.js): controlador de interfaz, consola, editor, autocompletado y ejemplos.
- [js/doc_errores.js](/Users/ernestoleonidas/Documents/Guaren/LiteSeInt/js/doc_errores.js): tokenización, validación estática, decoraciones y tabla de símbolos.
- [js/LiteSeInt.js](/Users/ernestoleonidas/Documents/Guaren/LiteSeInt/js/LiteSeInt.js): parser, AST, ejecución y evaluación de expresiones/condiciones.

## Uso rápido

1. Clona o descarga este repositorio.
2. Abre [index.html](/Users/ernestoleonidas/Documents/Guaren/LiteSeInt/index.html) en un navegador moderno.
3. Escribe pseudocódigo o carga uno de los ejemplos.
4. Presiona `Ejecutar`.
5. Si el programa usa `Leer`, responde desde la consola integrada.

## Arquitectura general

```txt
index.html
  ├── css/styles.css
  └── js/app.js
       ├── usa js/doc_errores.js para validación y ayudas del editor
       └── usa js/LiteSeInt.js para interpretar y ejecutar
```

### Responsabilidades

- `LiteSeInt.js`
  Parser del pseudocódigo, construcción del AST, ejecución por bloques y evaluación de expresiones.

- `doc_errores.js`
  Tokenización, validación estructural del documento, detección de errores y soporte para autocompletado.

- `app.js`
  Integración con la UI: editor, consola, ejemplos, descargas y estados visuales de ejecución/error.

## Hoja de ruta

- Soporte para arreglos con `Dimension`
- Funciones definidas por el usuario
- Historial de ejecuciones
- Mejoras al modo paso a paso

## Licencia

Proyecto educativo de uso libre.
