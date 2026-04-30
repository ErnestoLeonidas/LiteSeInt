# Ejercicios — Adaptación al dialecto LiteSeInt

Este documento define cómo se adaptan los ejercicios de `ejercicios/guia.html` al lenguaje LiteSeInt para llegar a la versión 1.0. Se introdujo en **v0.6.5** y debe mantenerse junto al `ROADMAP.md`.

`ejercicios/guia.html` es la fuente pedagógica del proyecto: sus ejercicios, su secuencia y sus niveles guían la integración futura. Su sintaxis no es la fuente de verdad del lenguaje. La fuente de verdad del lenguaje es `README.md` (matriz de compatibilidad de v0.6.0).

## Decisión de producto

Para 1.0, **los ejercicios se adaptan a LiteSeInt**. LiteSeInt no debe crecer sin control para aceptar todo lo que aparezca en la guía. Si un ejercicio requiere algo fuera de alcance, queda marcado como "requiere adaptación" o "excluido temporalmente", no visible como ejercicio listo.

## Estructura del banco de ejercicios LiteSeInt

El banco contiene **245 ejercicios** distribuidos en 7 niveles (N1–N7). Cada nivel tiene su propio archivo JSON en `json/N*.json` y corresponde a una Experiencia de Aprendizaje original de `guia.html`.

| Nivel | Archivo | EA de origen | Título | Cant. | Visible en app |
|---|---|---|---|---|---|
| N1 | `json/N1.json` | EA 1.1 | Introducción a los Algoritmos | 20 | Sí |
| N2 | `json/N2.json` | EA 1.2 | Diagramas de Flujo y Pseudocódigo | 40 | Sí |
| N3 | `json/N3.json` | EA 1.3 | Estructuras de Decisión | 40 | Sí |
| N4 | `json/N4.json` | EA 1.4 | Estructuras de Repetición | 60 | Sí |
| N5 | `json/N5.json` | EA 1.5 | Desafíos | 15 | Sí |
| N6 | `json/N6.json` | EA 1.6 | Tipo Prueba Parte 1 | 40 | No (evaluación futura) |
| N7 | `json/N7.json` | EA 1.7 | Tipo Prueba Parte 2 | 30 | No (evaluación futura) |

N6 y N7 se cargan pero no aparecen en el banco visible de la app (`NIVELES_VISIBLES = [1, 2, 3, 4, 5]` en `js/app.js`).

Distribución por dificultad: 91 básicos, 84 intermedios, 70 avanzados.

## Nueva estructura de aprendizaje LiteSeInt

La ruta de aprendizaje de LiteSeInt **no copia de forma literal** la estructura de EA de `guia.html`. La guía funciona como banco de ejercicios y referencia de complejidad, pero LiteSeInt organiza el avance por conceptos, autonomía y transferencia hacia Python.

La estructura se basa en dos decisiones pedagógicas:

1. El estudiante no debe partir siempre desde una pantalla en blanco.
2. Cada concepto debe pasar por una progresión: observar, ejecutar, investigar, modificar y crear.

### Ciclo de trabajo por ejercicio

Cada ejercicio integrado debe clasificarse según la actividad principal que propone:

| Etapa | Acción | Propósito |
|---|---|---|
| Observar | Leer un ejemplo corto y predecir la salida. | Reducir ansiedad inicial y enfocar la atención en qué hace el programa. |
| Ejecutar | Correr el código y comparar con la predicción. | Confirmar o corregir el modelo mental del estudiante. |
| Investigar | Identificar variables, comandos, condiciones, ciclos o patrones. | Entender la estructura del programa antes de escribir desde cero. |
| Modificar | Cambiar una parte acotada del programa. | Transferir gradualmente responsabilidad al estudiante. |
| Crear | Resolver un problema nuevo con el mismo concepto. | Practicar autonomía y consolidar el aprendizaje. |

### Niveles de aprendizaje

Los 245 ejercicios del banco están distribuidos en 7 niveles. Los niveles visibles en la app son N1–N5; N6 y N7 están preparados como evaluación futura.

| Nivel | Nombre | Conceptos principales | Visible |
|---|---|---|---|
| N1 | Introducción a los Algoritmos | `Proceso`, `FinProceso`, `Escribir`, `Definir`, `Leer`, asignación, tipos | Sí |
| N2 | Diagramas de Flujo y Pseudocódigo | E·P·S, fórmulas, operadores, secuencias, conversiones | Sí |
| N3 | Estructuras de Decisión | `Si`/`Sino`, `Si` anidado, `Segun`, operadores lógicos | Sí |
| N4 | Estructuras de Repetición | `Mientras`, `Para`, `Repetir`, contador, acumulador | Sí |
| N5 | Desafíos | Combinación libre de los conceptos anteriores | Sí |
| N6 | Tipo Prueba Parte 1 | `Si` anidado al estilo del parcial | No |
| N7 | Tipo Prueba Parte 2 | Menú de 3 opciones, ciclo `Mientras`, contador y acumulador | No |

### Grados de ayuda

Además del nivel conceptual, cada ejercicio visible en la app debe indicar el grado de ayuda:

| Grado | Nombre | Criterio |
|---|---|---|
| 1 | Guiado | El estudiante predice, ejecuta o analiza código dado. |
| 2 | Con pista | El estudiante modifica una parte pequeña o completa una línea. |
| 3 | Práctica | El estudiante resuelve un ejercicio similar con pistas mínimas. |
| 4 | Desafío | El estudiante crea una solución completa a partir del enunciado. |

Esta clasificación permite que dos ejercicios del mismo tema tengan dificultad distinta. Por ejemplo, un ejercicio de `Mientras` puede ser guiado si solo se analiza un contador, o desafío si pide construir un menú con acumuladores.

### Campos mínimos para cada ejercicio adaptado

Cuando se extraigan ejercicios desde `guia.html`, cada ejercicio adaptado debe guardar al menos:

| Campo | Descripción |
|---|---|
| `id` | Identificador estable del ejercicio. |
| `origen` | Referencia al ejercicio original en `guia.html` cuando exista. |
| `nivelLiteSeInt` | Nivel 1-7 de la ruta LiteSeInt (N1–N7). |
| `gradoAyuda` | Guiado, con pista, práctica o desafío. |
| `conceptos` | Comandos o patrones que practica. |
| `dificultad` | Básico, intermedio o avanzado. |
| `enunciado` | Enunciado adaptado al lenguaje LiteSeInt. |
| `entradaProcesoSalida` | E/P/S cuando aplique. |
| `salidaEsperada` | Salida o comportamiento esperado. |
| `codigoReferencia` | Solución adaptada al dialecto LiteSeInt, oculta por defecto. |
| `estadoAdaptacion` | Pendiente, adaptado, requiere decisión o excluido temporalmente. |
| `motivoExclusion` | Obligatorio si el ejercicio queda excluido. |

### Regla de selección para 1.0

Aunque `guia.html` contenga 245 ejercicios, la versión 1.0 no necesita mostrar todos desde el primer día si eso debilita la calidad. La regla es:

- todo ejercicio visible debe estar adaptado y probado;
- todo ejercicio no adaptado debe permanecer oculto;
- los ejercicios ocultos deben quedar registrados como pendientes, requieren decisión o excluidos temporalmente;
- cada nivel de aprendizaje debe tener al menos ejercicios guiados, de práctica y de desafío antes de considerarse completo.

## Reglas obligatorias de adaptación

Las siguientes reglas son **obligatorias** al integrar cualquier ejercicio al dialecto LiteSeInt. No se debe agregar alias ni sintaxis nueva al lenguaje solo porque aparezca en `guia.html`.

### Sustituciones directas

| En `guia.html` (PSeInt) | En LiteSeInt | Notas |
|---|---|---|
| `Cadena` | `Caracter` | Tipo string. Aproximadamente 271 ocurrencias en la guía. |
| `<-` | `=` | Operador de asignación. Aproximadamente 981 ocurrencias en la guía. |
| `SiNo` | `Sino` | Rama alternativa. Aproximadamente 276 ocurrencias en la guía. |
| `MOD` | `mod` | Operador resto. Aproximadamente 20 ocurrencias en la guía. |
| `;` al final de instrucción | eliminar | LiteSeInt no usa terminador de sentencia. |
| `=` como comparador en condición | `==` | LiteSeInt exige `==` para igualdad. |

### Construcciones que requieren reescritura

| Construcción de PSeInt | Acción en LiteSeInt |
|---|---|
| `DIV` (división entera) | Reescribir usando `/` y `Trunc(...)`. Ej.: `c = a DIV b` ⟶ `c = Trunc(a / b)`. Si la reescritura altera el objetivo pedagógico, marcar el ejercicio como **excluido temporalmente** hasta decidir si se introduce `DIV` en una versión futura. |
| `Escribir Sin Saltar` | LiteSeInt no soporta salida sin salto. Concatenar la línea con comas o marcar como **excluido temporalmente**. |
| `Leer x, y` (varias variables en una línea) | Convertir a `Leer x` + `Leer y` (una variable por línea). |

### Construcciones fuera de alcance en v0.6.x

Los ejercicios que requieran cualquiera de estas construcciones deben marcarse como **excluidos temporalmente**:

- `Dimension` y arreglos.
- `SubProceso` / `FinSubProceso`.
- `Funcion` definida por el usuario.
- Ejercicios con `Limpiar Pantalla`, lectura de archivos o cualquier I/O fuera de `Leer` / `Escribir`.

Si una versión posterior incorpora alguna de estas, los ejercicios bloqueados deben revisarse y reactivarse.

### Lo que **no** se hace en v0.6.5

- No se introduce ningún alias en LiteSeInt para `Cadena`, `<-`, `SiNo`, `MOD` o `DIV`. Esas formas se convierten en el código del ejercicio o el ejercicio queda excluido.
- No se cambia la estructura visual de `ejercicios/guia.html`.
- No se mueve la consola debajo del editor (eso pertenece a 0.7.0).
- No se implementa el panel derecho de ejercicios.
- No se convierten los 245 ejercicios completos en esta fase.

## Plan de pruebas para ejercicios adaptados

La adaptación de ejercicios es parte del plan de pruebas, **no** una tarea informal. Cada ejercicio integrado debe cumplir los seis criterios siguientes antes de declararse listo:

1. **Conversión de sintaxis**: ningún token de `Cadena`, `<-`, `SiNo`, `MOD`, `DIV`, `;` final ni `=` como comparador queda en el código.
2. **Validación estática**: `DocErrores.validarDocumento(codigo)` devuelve `errores: []` para el código adaptado.
3. **Ejecución**: el runtime ejecuta el ejercicio sin lanzar errores no esperados (división por cero, entrada inválida, etc. son aceptables si el ejercicio los espera).
4. **Salida esperada**: cuando la guía declara una salida de ejemplo, la salida del runtime debe coincidir línea por línea, considerando que los booleanos se imprimen como `Verdadero`/`Falso`.
5. **Cobertura pedagógica por comando**: cada comando o concepto que el ejercicio pretende enseñar debe aparecer en el código adaptado. Si la conversión obliga a eliminarlo (ej. ejercicios que enseñan `DIV`), el ejercicio se excluye en lugar de degradarse silenciosamente.
6. **Criterio de exclusión documentada**: si el ejercicio no puede adaptarse, queda registrado en la tabla de seguimiento con motivo y enlace al concepto bloqueante.

Estos criterios deben quedar reflejados en `tests/run-tests.js` en una suite dedicada cuando se integren los primeros ejercicios. v0.6.5 deja el contrato definido pero no agrega los tests masivos: los irá sumando 0.7.0 y siguientes a medida que cada lote se adapte.

## Seguimiento

Toda integración futura de ejercicios debe alimentar la tabla siguiente. La invariante es: **el 100% de los ejercicios visibles en la app deben estar adaptados o explícitamente excluidos**. No puede haber ejercicios visibles en estado intermedio.

| EA | Total | Adaptados | Requieren decisión | Excluidos temporales |
|---|---|---|---|---|
| 1.1 | 20 | 20 | 0 | 0 |
| 1.2 | 40 | 40 | 0 | 0 |
| 1.3 | 40 | 40 | 0 | 0 |
| 1.4 | 60 | 60 | 0 | 0 |
| 1.5 | 15 | 15 | 0 | 0 |
| 1.6 | 40 | 40 | 0 | 0 |
| 1.7 | 30 | 30 | 0 | 0 |
| **Total** | **245** | **245** | **0** | **0** |

Notas de adaptación:
- EA 1.1 #9 (Celsius a Fahrenheit): también existe como `ea1-2-009` (atribuido erróneamente a EA 1.2). El `ea1-1-009` usa el origen correcto.
- EA 1.1 #18 (Segundos a h:m:s): también existe como `ea1-2-015`. El `ea1-1-018` usa el origen correcto (EA 1.1). DIV/MOD adaptados a `Trunc`/`mod`.
- EA 1.1 #20: la variable `paso` es reservada en LiteSeInt (por `Con Paso` de `Para`); se renombra a `numPaso` en el código de referencia.

A **v.0.8.4** el banco mantiene **245 ejercicios adaptados** desde `ejercicios/guia.html`, reorganizados en `json/N1.json` a `json/N7.json`. `js/ejercicios-data.js` es el punto único de carga del banco y consume esos JSON normalizados para exponer `EjerciciosLiteSeInt` al panel derecho. Los `codigoReferencia` mantienen formato consistente: 2 espacios por nivel, comas con espacio en declaraciones, bloques de declaraciones separados del cuerpo y cálculos separados de entrada/salida.

Pendiente: optimizar los JSON de **EA 1.6** y **EA 1.7**. Aunque sus ejercicios ya están normalizados y pasan validación estática, requieren una revisión de calidad pedagógica para reducir repetición, mejorar enunciados/pistas y ajustar progresión.

Distribución actual por nivel LiteSeInt:

| Nivel | Tema | Adaptados |
|---|---|---:|
| 0 | Orientación | 2 |
| 1 | Secuencia y salida | 1 |
| 2 | Variables, tipos y entrada | 7 |
| 3 | Expresiones y E·P·S | 50 |
| 4 | Decisiones simples | 33 |
| 5 | Decisiones múltiples | 7 |
| 6 | Repetición controlada | 21 |
| 7 | Patrones de procesamiento | 39 |
| 8 | Programas integradores | 85 |
| 9 | Puente Python | 0 |

Criterio de publicación: todo ejercicio visible debe pasar la validación estática; cada ejercicio conserva enunciado, E·P·S, salida esperada, pista y código de referencia adaptado al dialecto LiteSeInt.

### Cobertura pedagógica por comando

Esta tabla rastrea qué módulos del lenguaje LiteSeInt cubre la guía. Se completa a medida que los ejercicios se adaptan.

| Comando / concepto | EA donde aparece | Estado de cobertura |
|---|---|---|
| `Escribir` | 1.1 – 1.7 | pendiente |
| `Definir`, tipos, asignación `=` | 1.1 – 1.7 | pendiente |
| `Leer` | 1.1 – 1.7 | pendiente |
| Operadores `+ - * / mod ^` | 1.2 – 1.7 | pendiente |
| `Si` / `Sino` / `FinSi` | 1.3, 1.6 | pendiente |
| `Segun` | 1.3 | pendiente |
| `Mientras` | 1.4, 1.7 | pendiente |
| `Para` | 1.4 | pendiente |
| `Repetir` / `HastaQue` | 1.4 | pendiente |
| Operadores lógicos `Y O No` | 1.3, 1.6 | pendiente |
| Funciones nativas `Abs Redon Trunc Longitud Mayusculas Minusculas` | 1.2, 1.5 | pendiente |
| `DIV` (no soportado) | 1.2, 1.5 | excluido — reescribir con `Trunc(a / b)` o excluir ejercicio |

## Cómo registrar un ejercicio adaptado

Cuando un ejercicio se integre, agregar una fila a la tabla "Seguimiento" sumando `1` en la columna correspondiente y, si el ejercicio fue excluido, anotar el motivo en una nota al pie referenciando el `id` del ejercicio (ej. `EA 1.2 #19 — usa DIV, excluido temporalmente`).
