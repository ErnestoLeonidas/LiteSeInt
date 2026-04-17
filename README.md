# PseudoCode — Intérprete de Pseudocódigo Web

**PseudoCode** es un intérprete de pseudocódigo ejecutable en navegador, orientado a fines educativos. Permite escribir instrucciones básicas estilo PSeInt, ejecutarlas línea por línea y ver los resultados en una consola visual integrada.

El motor de interpretación se llama **LiteSeInt** y está separado de la interfaz, lo que facilita su mantenimiento, testing y reutilización.

---

## Características

- Editor de pseudocódigo con numeración de líneas y resaltado de sintaxis.
- Consola de salida integrada con entrada inline para `Leer`.
- Ejecución paso a paso con indicador visual `>` en la línea activa.
- Autocompletado de palabras reservadas y variables del usuario.
- Soporte de comentarios con `//` (inline y línea completa).
- Indicadores de error con badge `!` y tooltip descriptivo junto a la línea.
- Ejemplos precargados listos para ejecutar.

## Instrucciones soportadas

| Instrucción | Formato | Ejemplo |
|---|---|---|
| Definir | `Definir var1, var2 Como Tipo` | `Definir nombre, apellido Como Caracter` |
| Asignar | `variable <- expresión` | `total <- nota1 + nota2` |
| Escribir | `Escribir expr1, expr2, ...` | `Escribir "Hola, ", nombre` |
| Leer | `Leer variable` | `Leer edad` |
| Comentario | `// texto` | `// esto es un comentario` |

## Tipos de datos

| Tipo | Valor por defecto | Ejemplo |
|---|---|---|
| Entero | `0` | `Definir edad Como Entero` |
| Real | `0.0` | `Definir nota Como Real` |
| Caracter | `""` | `Definir nombre Como Caracter` |

## Tecnologías

- HTML5
- CSS3
- JavaScript vanilla (motor LiteSeInt)
- Bootstrap 5.3.3 (layout y tooltips)
- jQuery 3.7.1 (manipulación DOM de la UI)

No se usan frameworks ni librerías externas para la lógica del intérprete.

## Estructura de archivos

```
├── index.html      # Interfaz completa (HTML + CSS + JS de UI)
├── LiteSeInt.js    # Motor del intérprete (clase independiente)
├── README.md
└── CHANGELOG.md
```

## Uso rápido

1. Descarga `index.html` y `LiteSeInt.js` en la misma carpeta.
2. Abre `index.html` en cualquier navegador moderno.
3. Escribe pseudocódigo en el editor o selecciona un ejemplo.
4. Presiona **▶ Ejecutar**.

## Arquitectura

```
┌─────────────┐         callbacks          ┌──────────────┐
│             │  onEscribir, onLeer, ...   │              │
│  index.html │◄──────────────────────────►│ LiteSeInt.js │
│  (UI Layer) │   ejecutar(), detener()    │   (Core)     │
│             │                            │              │
└─────────────┘                            └──────────────┘
```

**LiteSeInt** recibe callbacks al instanciarse y no depende del DOM. La UI conecta esos callbacks a la consola HTML, el input inline y los indicadores visuales del editor.

## Ejemplo de pseudocódigo

```
// Programa de saludo
Definir nombre Como Caracter
Escribir "¿Cómo te llamas?"
Leer nombre
Escribir "¡Hola, ", nombre, "! Bienvenido."
```

## Roadmap

- Condicionales: `Si / Entonces / SiNo / FinSi`
- Ciclos: `Mientras / FinMientras`, `Para / FinPara`
- Arreglos: `Dimension`
- Exportar / importar archivos `.psc`
- Historial de ejecuciones
- Modo paso a paso con controles avanzados

## Licencia

Proyecto educativo de uso libre.
