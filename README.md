# LiteSeInt — Interprete de Pseudocodigo Web

**LiteSeInt** es un interprete de pseudocodigo ejecutable en navegador, orientado a fines educativos. Permite escribir instrucciones estilo PSeInt, ejecutarlas y ver los resultados en una consola visual integrada.

El motor de interpretacion es independiente de la interfaz, lo que facilita su mantenimiento y reutilizacion.

---

## Caracteristicas

- Editor de pseudocodigo con numeracion de lineas y resaltado de sintaxis.
- Consola de salida integrada con entrada inline para `Leer`.
- Ejecucion paso a paso con indicador visual `>` en la linea activa.
- Autocompletado de palabras reservadas y variables del usuario.
- Soporte de comentarios con `//` (inline y linea completa).
- Indicadores de error con badge `!` y tooltip descriptivo junto a la linea.
- Estructura Proceso/FinProceso protegida contra edicion accidental.
- Exportar el pseudocodigo como archivo `.psc`.
- Ejemplos precargados listos para ejecutar.

## Instrucciones soportadas

| Instruccion | Formato | Ejemplo |
|---|---|---|
| Definir | `Definir var1, var2 Como Tipo` | `Definir nombre Como Caracter` |
| Asignar | `variable <- expresion` | `total <- nota1 + nota2` |
| Escribir | `Escribir expr1, expr2, ...` | `Escribir "Hola, ", nombre` |
| Leer | `Leer variable` | `Leer edad` |
| Comentario | `// texto` | `// esto es un comentario` |

## Estructuras de control

| Estructura | Sintaxis |
|---|---|
| Condicional | `Si condicion Entonces ... FinSi` |
| Condicional con sino | `Si condicion Entonces ... Sino ... FinSi` |
| Bucle Mientras | `Mientras condicion Hacer ... FinMientras` |
| Bucle Repetir | `Repetir ... HastaQue condicion` |
| Bucle Para | `Para var <- inicio Hasta fin [Con Paso n] Hacer ... FinPara` |
| Segun | `Segun variable Hacer ... FinSegun` |

### Operadores relacionales

`=`, `<>`, `<`, `>`, `<=`, `>=`

### Operadores logicos

`Y` (AND), `O` (OR), `No` (NOT)

### Ejemplo: Si/FinSi

```
Definir a, b Como Real
Leer a
Leer b
Si a > b Entonces
  Escribir "El mayor es: ", a
Sino
  Escribir "El mayor es: ", b
FinSi
```

### Ejemplo: Mientras/FinMientras

```
Definir i, suma Como Entero
i <- 1
suma <- 0
Mientras i <= 10 Hacer
  suma <- suma + i
  i <- i + 1
FinMientras
Escribir "Suma: ", suma
```

### Ejemplo: Para/FinPara

```
Definir i Como Entero
Para i <- 1 Hasta 10 Hacer
  Escribir i
FinPara
```

### Ejemplo: Segun/FinSegun

```
Definir dia Como Entero
Leer dia
Segun dia Hacer
  1: Escribir "Lunes"
  2: Escribir "Martes"
  De Otro Modo:
    Escribir "Otro dia"
FinSegun
```

## Tipos de datos

| Tipo | Valor por defecto |
|---|---|
| Entero | `0` |
| Real | `0.0` |
| Caracter | `""` |

## Tecnologias

- HTML5, CSS3, JavaScript vanilla
- Bootstrap 5.3.3 (layout y tooltips)
- jQuery 3.7.1 (DOM de la UI)

No se usan frameworks ni librerias externas para la logica del interprete.

## Estructura de archivos

```
index.html        # Interfaz completa (HTML + CSS + JS de UI)
LiteSeInt.js      # Motor del interprete (parser + ejecutor AST)
doc_errores.js    # Tokenizador, validacion estatica, tabla de simbolos
styles.css        # Estilos
README.md
CHANGELOG.md
```

## Uso rapido

1. Descarga `index.html`, `LiteSeInt.js`, `doc_errores.js` y `styles.css` en la misma carpeta.
2. Abre `index.html` en cualquier navegador moderno.
3. Escribe pseudocodigo en el editor o selecciona un ejemplo.
4. Presiona **Ejecutar**.

## Arquitectura

```
index.html (UI)
    |-- LiteSeInt.js (parser + ejecutor)
    |       |-- _parsear()       construye AST
    |       |-- _ejecutarBloque() recorre nodos recursivamente
    |       |-- _evaluarCondicion() operadores relacionales y logicos
    |       |-- _evaluarExpresion() shunting-yard
    |
    |-- doc_errores.js (analisis estatico)
            |-- tokenizarLinea()
            |-- validarDocumento()  incluye balance de bloques
            |-- TablaSimbolos
```

## Roadmap

- Arreglos: `Dimension`
- Funciones de usuario
- Historial de ejecuciones
- Modo paso a paso con controles avanzados

## Licencia

Proyecto educativo de uso libre.
