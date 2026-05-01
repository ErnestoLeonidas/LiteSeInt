# Roadmap LiteSeInt 1.0

LiteSeInt debe llegar a la versión 1.0 como una plataforma minimalista para aprender pseudolenguaje desde cero, practicar comandos mediante ejercicios graduados y consolidar una experiencia educativa clara dentro del propio pseudolenguaje.

La promesa del proyecto es simple:

> LiteSeInt permite programar en pseudolenguaje, aprender los comandos y ejercitar con una ruta progresiva.

La versión 1.0 no debe intentar ser un clon completo de PSeInt. Debe ser una herramienta clara para estudiantes: escribir código, ejecutar, equivocarse con mensajes comprensibles, consultar documentación, elegir ejercicios y avanzar por una ruta de aprendizaje.

## Punto de Partida: v0.6.5

Este roadmap parte desde `v0.6.5` como base de planificación hacia `v1.0`.

Estado esperado de la línea `0.6.x`:

- Núcleo del lenguaje ya definido y documentado.
- Editor funcional con validación, resaltado y ejecución.
- Consola integrada con soporte para `Leer`.
- Ejemplos incluidos.
- Mensajes pedagógicos para construcciones fuera de alcance.
- Base minimalista en HTML, CSS y JavaScript vanilla.

La prioridad desde `v0.6.5` deja de ser solo "cerrar lenguaje" y pasa a ser "convertir LiteSeInt en una experiencia completa de aprendizaje".

## Fuente Pedagógica: `ejercicios/guia.html`

El archivo `ejercicios/guia.html` se revisó como referencia pedagógica. Su estructura visual no debe copiarse literalmente; lo importante es su banco de ejercicios, la complejidad gradual y la secuencia de comandos que enseña.

La guía contiene:

- 245 ejercicios.
- 7 experiencias de aprendizaje.
- Niveles `básico`, `intermedio` y `avanzado`.
- Enunciados, etiquetas, entradas/procesos/salidas, ejemplos de consola y código de referencia.

Distribución detectada:

| EA | Tema | Ejercicios |
|---|---|---:|
| 1.1 | Introducción a los algoritmos | 20 |
| 1.2 | Diagramas de flujo y pseudocódigo | 40 |
| 1.3 | Estructuras de decisión | 40 |
| 1.4 | Estructuras de repetición | 60 |
| 1.5 | Desafíos | 15 |
| 1.6 | Ejercicio tipo prueba parte 1: decisión anidada | 40 |
| 1.7 | Ejercicio tipo prueba parte 2: menú, `Mientras`, contador y acumulador | 30 |

Comandos y conceptos más frecuentes en la guía:

- `Leer`
- `Escribir`
- `Definir`
- variables y tipos
- aritmética y fórmulas
- `Si` / `Sino` / `FinSi`
- `Segun` / `De Otro Modo` / `FinSegun`
- `Mientras`
- `Repetir` / `HastaQue`
- `Para`
- contadores
- acumuladores
- promedios
- máximos y mínimos
- menús
- validación de entrada

Advertencia importante: la guía usa sintaxis PSeInt clásica en varios ejemplos, como `<-`, `Cadena`, `SiNo`, `DIV` y `MOD`. Esa sintaxis no define el lenguaje de LiteSeInt. Para la versión 1.0, todos los ejercicios provenientes de `ejercicios/guia.html` deben adaptarse al lenguaje ya definido por LiteSeInt. La guía entrega la secuencia pedagógica y los enunciados; la sintaxis final debe ser la del pseudolenguaje que construimos en este proyecto.

## Visión 1.0

LiteSeInt 1.0 debe tener tres áreas principales:

1. Área de programación

   Editor de pseudocódigo, selector de ejemplos, botones de ejecución y consola debajo del editor.

2. Área de ejercicios

   Panel derecho con la ruta de aprendizaje, listado de ejercicios, estado de avance, dificultad y acceso al enunciado.

3. Área de aprendizaje

   Documentación de comandos, ejemplos mínimos, explicación del roadmap del estudiante y guía de errores comunes.

El estudiante debe poder iniciar sin saber programar:

1. Leer qué comando está aprendiendo.
2. Ver un ejemplo pequeño.
3. Elegir un ejercicio relacionado.
4. Resolverlo en el editor.
5. Ejecutarlo.
6. Comparar con la salida esperada.
7. Marcar progreso.
8. Avanzar al siguiente concepto.

## Diseño de Pantalla Objetivo

### Editor y Consola

- El editor debe quedar como área principal de escritura.
- La consola debe moverse debajo del editor.
- La consola debe poder redimensionarse verticalmente para ampliar o reducir el área visible del editor.
- En escritorio, editor y consola deben formar una columna de trabajo cómoda.
- En móvil, consola y editor deben apilarse sin ocultar botones esenciales.

### Panel Derecho de Ejercicios

- El lado derecho debe usarse para mostrar el listado de ejercicios derivados de `ejercicios/guia.html`.
- El panel debe permitir filtrar o navegar por:
  - experiencia de aprendizaje;
  - comando o concepto;
  - dificultad;
  - ejercicios pendientes/completados.
- Al seleccionar un ejercicio, el panel debe mostrar:
  - título;
  - dificultad;
  - conceptos;
  - enunciado;
  - entrada/proceso/salida cuando exista;
  - salida esperada;
  - pista opcional;
  - botón para cargar plantilla o ejemplo si aplica.

### Ejemplos

- Los ejemplos ya no deben ocupar espacio lateral principal.
- Deben moverse a un menú desplegable arriba del editor.
- El menú debe agrupar ejemplos por concepto:
  - primeros programas;
  - variables y tipos;
  - entrada/salida;
  - condicionales;
  - ciclos;
  - `Segun`;
  - funciones nativas.

### Documentación y Roadmap del Estudiante

- Debe existir una sección accesible desde la interfaz para consultar documentación.
- La documentación debe cubrir todos los comandos soportados.
- Cada comando debe incluir:
  - sintaxis;
  - explicación breve;
  - ejemplo mínimo;
  - errores comunes;
  - ejercicios relacionados.
- El roadmap de aprendizaje debe usar los ejercicios de `guia.html` como secuencia base.

## Estructura de Aprendizaje LiteSeInt

La ruta del estudiante no debe copiar mecánicamente las EA de `guia.html`. La guía es un banco de ejercicios y una referencia de complejidad; LiteSeInt debe proponer una secuencia propia basada en progresión cognitiva: leer programas pequeños, ejecutarlos, investigarlos, modificarlos y recién después crear soluciones desde cero.

Cada módulo debe organizarse con el ciclo:

1. **Observar**: leer un ejemplo corto y predecir su salida.
2. **Ejecutar**: correr el programa y comparar con la predicción.
3. **Investigar**: identificar variables, comandos, condiciones, ciclos o patrones.
4. **Modificar**: cambiar valores, mensajes o reglas pequeñas.
5. **Crear**: resolver un ejercicio nuevo con el mismo concepto.

Esta estructura usa los ejercicios de `guia.html`, pero los reagrupa por concepto y por autonomía esperada del estudiante.

### Nivel 0: Orientación

Objetivo: entender la interfaz y el flujo mínimo de trabajo.

Aprendizajes:

- qué es LiteSeInt;
- dónde se escribe código;
- cómo se ejecuta;
- cómo leer la consola;
- cómo interpretar errores;
- cómo cargar ejemplos;
- cómo marcar avance cuando exista progreso.

Ejercicios sugeridos:

- ejercicios muy breves de salida fija y lectura simple desde EA 1.1.

Resultado esperado: el estudiante puede abrir la app, ejecutar un ejemplo y reconocer editor, consola, documentación y ejercicios.

### Nivel 1: Secuencia y Salida

Objetivo: escribir programas lineales simples.

Comandos:

- `Proceso` / `FinProceso`;
- `Escribir`;
- comentarios `//`.

Conceptos:

- instrucción;
- orden de ejecución;
- salida en consola;
- texto entre comillas.

Ejercicios sugeridos:

- ejercicios de saludo, datos personales y salida estructurada de EA 1.1.

Resultado esperado: el estudiante entiende que un programa ejecuta instrucciones en orden.

### Nivel 2: Variables, Tipos y Entrada

Objetivo: guardar datos y leer información del usuario.

Comandos:

- `Definir`;
- asignación con `=`;
- `Leer`;
- `Escribir` con variables.

Tipos:

- `Entero`;
- `Real`;
- `Caracter`;
- `Logico`.

Ejercicios sugeridos:

- ejercicios de edad, nombre, notas, precios, conversiones simples y datos personales de EA 1.1 y EA 1.2.

Resultado esperado: el estudiante puede declarar variables, asignar valores, leer datos y mostrarlos.

### Nivel 3: Expresiones y E/P/S

Objetivo: transformar enunciados en entrada, proceso y salida antes de codificar.

Comandos y conceptos:

- operadores `+`, `-`, `*`, `/`, `mod`, `^`;
- paréntesis;
- fórmulas;
- variables auxiliares;
- funciones nativas numéricas y de texto cuando correspondan.

Ejercicios sugeridos:

- ejercicios de promedio, descuentos, conversión de unidades, geometría y cálculos de EA 1.2.

Resultado esperado: el estudiante puede leer un problema, identificar sus datos de entrada, definir el cálculo y producir una salida clara.

### Nivel 4: Decisiones Simples

Objetivo: hacer que el programa elija entre caminos.

Comandos:

- `Si`;
- `Entonces`;
- `Sino`;
- `FinSi`.

Conceptos:

- operadores relacionales;
- igualdad con `==`;
- comparación;
- decisión binaria;
- validación simple.

Ejercicios sugeridos:

- ejercicios básicos de mayoría de edad, aprobación, descuentos, clasificación y comparación de EA 1.3.

Resultado esperado: el estudiante puede resolver problemas con una condición principal.

### Nivel 5: Decisiones Múltiples y Anidadas

Objetivo: resolver reglas con más de un caso.

Comandos:

- `Si` anidado;
- `Segun`;
- `De Otro Modo`;
- `FinSegun`;
- operadores lógicos `Y`, `O`, `No`.

Conceptos:

- clasificación;
- rangos;
- reglas compuestas;
- menú simple no persistente;
- validación de opciones.

Ejercicios sugeridos:

- ejercicios intermedios y avanzados de EA 1.3 y ejercicios de decisión anidada de EA 1.6.

Resultado esperado: el estudiante puede elegir entre varios caminos y ordenar reglas de decisión sin confundirse.

### Nivel 6: Repetición Controlada

Objetivo: repetir instrucciones sin duplicar código.

Comandos:

- `Mientras`;
- `Repetir`;
- `HastaQue`;
- `Para`.

Conceptos:

- contador;
- condición de término;
- actualización;
- centinela;
- validación repetida.

Ejercicios sugeridos:

- ejercicios de números del 1 al 10, conteo descendente, repetir hasta condición, tablas y recorridos de EA 1.4.

Resultado esperado: el estudiante puede elegir el ciclo adecuado para repetir una acción.

### Nivel 7: Patrones de Procesamiento

Objetivo: reconocer estructuras reutilizables que aparecen en muchos problemas.

Patrones:

- contador;
- acumulador;
- promedio;
- máximo;
- mínimo;
- contador condicional;
- totalización;
- validación de mínimos.

Ejercicios sugeridos:

- ejercicios de ciclos intermedios y avanzados de EA 1.4, desafíos de EA 1.5 y problemas tipo prueba de EA 1.7.

Resultado esperado: el estudiante deja de resolver por memoria y empieza a identificar patrones transferibles.

### Nivel 8: Programas Integradores con Menú

Objetivo: construir programas completos con estado y flujo persistente.

Comandos y conceptos:

- menú de opciones;
- `Mientras` persistente;
- `Segun` o `Si` para elegir opción;
- contadores y acumuladores;
- análisis final;
- validación de opción inválida.

Ejercicios sugeridos:

- ejercicios tipo prueba parte 2 de EA 1.7 y desafíos seleccionados de EA 1.5.

Resultado esperado: el estudiante puede resolver problemas largos con varias opciones y acumulación de datos.

## Organización por Autonomía

Cada nivel debe tener ejercicios con cuatro grados de ayuda:

| Grado | Nombre | Qué hace el estudiante |
|---|---|---|
| 1 | Guiado | Lee un programa, predice la salida y lo ejecuta. |
| 2 | Con pista | Completa o modifica una parte pequeña. |
| 3 | Práctica | Resuelve un ejercicio similar con menos ayuda. |
| 4 | Desafío | Crea una solución nueva con el mismo patrón. |

Esta organización evita que todos los ejercicios sean simplemente "escribe desde cero". Primero reduce la carga cognitiva, luego transfiere la responsabilidad al estudiante.

## Hitos del Proyecto Hacia 1.0

### 0.6.5 - Base Educativa

Objetivo: tomar el núcleo ya estabilizado y preparar el producto para integrar aprendizaje guiado.

Tareas:

- Revisar README, CHANGELOG e interfaz para asegurar que la versión visible sea coherente.
- Confirmar comandos soportados por el runtime, validador y autocompletado.
- Confirmar qué sintaxis de la guía no es compatible todavía.
- Definir las reglas obligatorias para adaptar todos los ejercicios de la guía al dialecto LiteSeInt.
- Proponer una estructura de aprendizaje propia para LiteSeInt, basada en conceptos y grados de autonomía, no en copiar literalmente la ruta de `guia.html`.
- Crear una lista corta de equivalencias:
  - `Cadena` -> `Caracter`;
  - `<-` -> `=`;
  - `SiNo` -> `Sino`;
  - `MOD` -> `mod`;
  - `DIV` -> reescritura con sintaxis soportada o exclusión temporal del ejercicio.
- Documentar todo lo anterior en [`EJERCICIOS.md`](EJERCICIOS.md), incluyendo plan de pruebas y tabla de seguimiento.
- No introducir alias en LiteSeInt para `Cadena`, `<-`, `SiNo`, `MOD` o `DIV`.

Criterios de aceptación:

- Existe una decisión documentada sobre cómo adaptar todos los ejercicios de la guía.
- El alcance de lenguaje usado por los ejercicios 1.0 está claro.
- Existe un plan de pruebas para ejercicios adaptados.
- Existe una estructura de aprendizaje LiteSeInt con niveles, criterios de avance y grados de ayuda.
- La invariante "100% de ejercicios visibles adaptados o excluidos" queda explícita.

### 0.7.0 - Nuevo Layout de Aprendizaje

Objetivo: reorganizar la interfaz para que el estudiante programe y practique en la misma pantalla.

Tareas:

- Mover la consola debajo del editor.
- Hacer la consola redimensionable verticalmente.
- Reservar el panel derecho para ejercicios.
- Mover ejemplos a un menú desplegable arriba del editor.
- Mantener acciones principales visibles:
  - ejecutar;
  - detener;
  - limpiar;
  - descargar;
  - seleccionar ejemplo.
- Revisar comportamiento responsive.

Criterios de aceptación:

- La pantalla principal muestra editor + consola abajo + panel derecho de ejercicios.
- El área del editor se puede ampliar reduciendo la consola.
- Los ejemplos se cargan desde un menú superior.

### 0.8.0 - Banco de Ejercicios Integrado

Objetivo: convertir la guía en un banco navegable dentro de LiteSeInt.

Tareas:

- Extraer los ejercicios de `ejercicios/guia.html` a una fuente de datos mantenible.
- Normalizar campos:
  - id;
  - módulo;
  - experiencia;
  - dificultad;
  - título;
  - conceptos;
  - enunciado;
  - entrada/proceso/salida;
  - salida esperada;
  - pista;
  - solución o código de referencia opcional.
- Adaptar todos los ejercicios de `ejercicios/guia.html` al dialecto LiteSeInt.
- Verificar que los enunciados, pistas, salidas esperadas y soluciones de referencia no usen comandos fuera del lenguaje LiteSeInt 1.0.
- Mostrar ejercicios en el panel derecho.
- Permitir marcar ejercicios como completados.
- Guardar progreso localmente en el navegador.

Criterios de aceptación:

- El estudiante puede navegar ejercicios por módulo o dificultad.
- Al seleccionar un ejercicio, ve enunciado y salida esperada.
- El progreso se conserva al recargar la página.
- Todos los ejercicios importados tienen sintaxis, tipos y comandos compatibles con LiteSeInt.

### 0.8.5 - Documentación Integrada

Objetivo: que cualquier estudiante pueda aprender los comandos sin salir de la app.

Tareas:

- Crear documentación interna de comandos.
- Agregar ejemplos mínimos por comando.
- Asociar comandos con ejercicios recomendados.
- Agregar una vista de "Roadmap del estudiante".
- Incluir errores comunes:
  - variable no definida;
  - variable no inicializada;
  - falta `FinSi`;
  - falta `FinMientras`;
  - uso de sintaxis PSeInt no soportada;
  - confusión entre `=` y `==`.

Criterios de aceptación:

- Cada comando soportado tiene documentación visible.
- Cada módulo de aprendizaje apunta a ejercicios concretos.
- La documentación no depende de internet.

### 0.8.6 - Pulido de Interfaz de Aprendizaje

Objetivo: compactar la experiencia de práctica y dejar las acciones principales más claras.

Estado: completado el 2026-05-01.

Cambios cerrados:

- Controles de ejecución movidos al header de consola.
- Acciones de limpiar, trazas y descarga convertidas a botones con iconos.
- Toggle de trazas para ocultar o mostrar mensajes internos de consola.
- Pestañas `Ejercicios`, `Comandos`, `Rutas` y `Errores` movidas al header del panel de aprendizaje.
- Filtros de nivel, dificultad y estado reorganizados en la parte superior del banco.
- Detalle de ejercicio reorganizado con tags, conceptos, enunciado, pista y E/P/S.
- Acceso al código de referencia concentrado en el botón de ojo, con confirmación previa.
- README actualizado con estado `v0.8.6` y enlace a GitHub Pages.

Criterios cumplidos:

- La interfaz queda más compacta para practicar.
- Las acciones destructivas o de reemplazo de editor requieren confirmación.
- La consola permite ocultar ruido interno sin perder la posibilidad de depurar.

### 0.8.7 - Documentación Pedagógica y Ruta 1.0

Objetivo: mejorar la calidad de las guías internas y dejar más explícito el camino restante hacia `v1.0.0`.

Estado: completado el 2026-05-01.

Cambios cerrados:

- Vista `Comandos` ampliada con explicación de uso, ejemplo mínimo, errores típicos y ejercicios asociados.
- Vista `Errores` ampliada con síntoma, causa, corrección y ejemplo compatible con LiteSeInt.
- Nuevos errores documentados: ciclo infinito, texto sin cerrar y paréntesis o argumentos incompletos.
- Vista `Ruta` ampliada con objetivo, foco y siguiente paso para cada nivel N1-N7.
- Bloque "Lo que falta para v1.0.0" agregado dentro de la ruta de la app.
- Detalle de ejercicios mejorado: `ej-enunciado` aparece como sección propia y agrega orientación según grado de ayuda.
- Textos de `.learning-tab` aumentados de tamaño y peso visual para mejorar legibilidad.
- README y CHANGELOG actualizados a `v0.8.7`.
- Versión visible actualizada a `v0.8.7`.

Criterios cumplidos:

- Un estudiante puede consultar comandos con contexto, no solo sintaxis.
- La documentación de errores ayuda a reconocer el problema antes de corregirlo.
- La ruta hacia `v1.0.0` distingue estado actual, pendientes bloqueantes y mejoras posteriores.
- La app mantiene 245 ejercicios adaptados y las pruebas siguen pasando.

### 0.8.8 - Mejora de Comandos

Objetivo: convertir la vista `Comandos` en una guía pedagógica suficiente para llegar a 1.0.

La versión 1.0 no requiere nuevos comandos ni conexiones externas. El lenguaje ya está definido; lo que falta es explicar mejor cada construcción soportada.

Tareas:

- Revisar todos los comandos existentes en `DOC_COMANDOS`.
- Mejorar la explicación de cada comando con lenguaje directo para principiantes.
- Separar claramente:
  - qué hace;
  - cuándo usarlo;
  - sintaxis canónica;
  - ejemplo mínimo;
  - errores típicos;
  - ejercicios recomendados.
- Agregar ejemplos más representativos para estructuras de control y funciones nativas.
- Verificar que todos los ejemplos de comandos pasen el dialecto LiteSeInt vigente.
- Mantener el alcance cerrado: no se agregan alias ni sintaxis nueva.

Criterios de aceptación:

- Cada comando soportado puede aprenderse desde la app sin abrir documentación externa.
- Cada entrada evita ambigüedades con PSeInt clásico.
- Los ejemplos son cortos, ejecutables y compatibles con el validador.

### 0.8.9 - Mejora de Rutas

Objetivo: convertir la vista `Ruta` en una guía clara de avance por niveles N1-N7.

La ruta de 1.0 es lo que LiteSeInt ya tiene: ejercicios adaptados, progreso local, niveles visibles y práctica dentro de la app. No se agrega un nivel nuevo ni una etapa externa.

Tareas:

- Revisar los nombres y objetivos de N1-N7.
- Mejorar la descripción del foco de cada nivel.
- Indicar qué debe dominar el estudiante antes de avanzar.
- Asociar mejores ejercicios iniciales, de práctica y de desafío por nivel.
- Mostrar el avance local con una lectura pedagógica simple.
- Alinear la ruta visible con el banco real de 245 ejercicios adaptados.
- Eliminar toda referencia a niveles o etapas que no pertenecen al recorrido real de LiteSeInt.

Criterios de aceptación:

- El estudiante entiende qué estudiar ahora, qué viene después y cuándo avanzar.
- La ruta describe el producto real, no una expansión futura.
- La progresión se mantiene dentro de LiteSeInt y su banco de ejercicios.

### 0.9.0 - Mejora de Errores

Objetivo: convertir la vista `Errores` en una guía práctica para diagnosticar y corregir problemas frecuentes.

El validador y el runtime ya entregan mensajes pedagógicos. Esta fase no cambia el lenguaje; mejora cómo se documentan, agrupan y explican los errores.

Tareas:

- Revisar `DOC_ERRORES_COMUNES` y cubrir los errores más frecuentes del estudiante inicial.
- Mantener para cada error:
  - síntoma;
  - causa;
  - corrección;
  - ejemplo incorrecto cuando aporte claridad;
  - ejemplo corregido.
- Incluir errores de estructura: `Proceso`, `FinProceso`, cierres cruzados y bloques sin cerrar.
- Incluir errores de expresiones: `= / ==`, paréntesis, argumentos vacíos y operadores incompletos.
- Incluir errores de variables: no definida, no inicializada, tipo incompatible y palabra reservada.
- Incluir errores de ciclos: condición que no cambia, `HastaQue` faltante y paso cero.
- Revisar que la guía de errores coincida con mensajes reales de `doc_errores.js` y `LiteSeInt.js`.

Criterios de aceptación:

- El estudiante puede pasar de un mensaje de error a una corrección concreta.
- Los ejemplos de error son breves y reproducibles.
- La documentación no promete errores que la app no detecta.

### 1.0.0 - Plataforma Minimalista de Aprendizaje

Objetivo: publicar como estable lo que LiteSeInt ya es: una plataforma minimalista para aprender pseudolenguaje con editor, consola, ejercicios, comandos, rutas y errores integrados.

Estado esperado al cerrar 1.0:

- Lenguaje base congelado y documentado.
- Editor, validación, ejecución y consola inferior implementados.
- Panel de aprendizaje integrado con ejercicios, comandos, ruta y errores.
- Banco de 245 ejercicios adaptados desde `guia.html` y cargado desde `json/N1.json` a `json/N7.json`.
- Progreso local por ejercicio disponible en la interfaz.
- Guía de comandos mejorada.
- Ruta N1-N7 mejorada.
- Guía de errores mejorada.

Tareas finales:

- Validar que `npm test` pase.
- Revisar README, CHANGELOG, EJERCICIOS y ROADMAP para que describan el alcance real.
- Confirmar que no queden referencias a conexiones externas como objetivo de producto.
- Actualizar versión visible a `v1.0.0`.

Criterios de aceptación:

- Una persona puede abrir LiteSeInt sin experiencia previa y comenzar desde el primer nivel.
- Puede aprender comandos, elegir ejercicios, programar, ejecutar, corregir errores y avanzar.
- La app no promete integraciones ni puentes externos.
- La documentación interna cubre comandos, rutas y errores con calidad suficiente para 1.0.

## Plan de Pruebas de Ejercicios

La adaptación de `ejercicios/guia.html` debe formar parte del plan de pruebas de 1.0. No basta con mostrar los ejercicios en la interfaz: hay que comprobar que el material pedagógico se puede usar con el lenguaje real de LiteSeInt.

### Pruebas de Adaptación

Cada ejercicio importado desde `guia.html` debe pasar por una normalización mínima:

- convertir tipos no soportados al tipo LiteSeInt equivalente, por ejemplo `Cadena` -> `Caracter`;
- convertir asignaciones PSeInt clásicas, por ejemplo `<-` -> `=`;
- convertir variantes de palabras clave, por ejemplo `SiNo` -> `Sino`;
- normalizar operadores, por ejemplo `MOD` -> `mod`;
- resolver usos de `DIV` mediante reescritura compatible con LiteSeInt o exclusión temporal del ejercicio;
- eliminar o marcar como fuera de alcance cualquier construcción no soportada.

### Pruebas de Compatibilidad

Para cada ejercicio adaptado:

- el código de referencia, si existe, debe pasar la validación estática de LiteSeInt;
- el código de referencia debe ejecutar sin errores de sintaxis;
- las entradas de ejemplo deben poder ingresarse por consola;
- la salida obtenida debe coincidir razonablemente con la salida esperada del ejercicio;
- los comandos usados deben estar documentados;
- los conceptos del ejercicio deben mapear a un módulo del roadmap del estudiante.

### Pruebas de Cobertura Pedagógica

La suite de pruebas o checklist manual debe asegurar que existan ejercicios adaptados para:

- `Escribir`;
- `Definir`;
- asignación;
- `Leer`;
- tipos `Entero`, `Real`, `Caracter` y `Logico`;
- operadores aritméticos;
- operadores relacionales;
- operadores lógicos;
- `Si` / `Sino` / `FinSi`;
- `Segun` / `De Otro Modo` / `FinSegun`;
- `Mientras` / `FinMientras`;
- `Repetir` / `HastaQue`;
- `Para` / `FinPara`;
- contadores;
- acumuladores;
- promedios;
- máximos y mínimos;
- menús.

### Criterio de Salida

Para considerar lista la integración de ejercicios en 1.0:

- el 100% de los ejercicios importados debe estar adaptado al dialecto LiteSeInt o marcado explícitamente como excluido;
- ningún ejercicio visible para el estudiante debe requerir sintaxis no soportada;
- los ejercicios principales de cada módulo deben estar probados con ejecución real;
- las diferencias entre salida esperada y salida real deben estar documentadas o corregidas.

## Decisiones Pendientes

### Sintaxis de la Guía Que Debe Convertirse

La guía usa elementos que no pertenecen al lenguaje LiteSeInt. Antes de integrar ejercicios masivamente se debe definir cómo se convertirán, porque todos los ejercicios visibles en 1.0 deben quedar adaptados al dialecto LiteSeInt. La sintaxis de `guia.html` no debe agregarse al lenguaje solo por aparecer en la guía.

- convertir `<-` a `=`;
- convertir `Cadena` a `Caracter`;
- convertir `SiNo` a `Sino`;
- convertir `MOD` a `mod`;
- reescribir `DIV` usando sintaxis soportada o excluir temporalmente los ejercicios que lo requieran.

Regla para 1.0: adaptar todos los ejercicios al dialecto LiteSeInt. No se deben agregar alias ni sintaxis nueva solo para calzar con `guia.html`, salvo que el roadmap cambie explícitamente el alcance del lenguaje.

### Soluciones Visibles

La guía incluye código de referencia. Para aprendizaje conviene decidir si:

- se oculta por defecto;
- se muestra como pista final;
- se divide en pasos;
- se usa solo internamente para validar o comparar.

Recomendación para 1.0: mostrar enunciado y salida esperada primero; dejar solución como ayuda opcional para no eliminar el esfuerzo de resolver.

### Validación de Progreso

Para 1.0, el progreso puede ser manual:

- pendiente;
- en curso;
- completado.

La validación automática de soluciones puede quedar para una versión posterior, salvo checks simples de ejecución sin error.

## Alcance de Lenguaje Para 1.0

Debe mantenerse pequeño y alineado con los ejercicios iniciales:

- `Proceso` / `FinProceso`
- `Definir`
- `Leer`
- `Escribir`
- asignación
- tipos `Entero`, `Real`, `Caracter`, `Logico`
- operadores aritméticos
- operadores relacionales
- operadores lógicos
- `Si` / `Sino` / `FinSi`
- `Segun` / `De Otro Modo` / `FinSegun`
- `Mientras` / `FinMientras`
- `Repetir` / `HastaQue`
- `Para` / `FinPara`
- funciones nativas básicas ya soportadas

Fuera de alcance para 1.0:

- arreglos con `Dimension`;
- matrices;
- `SubProceso`;
- funciones definidas por usuario;
- proyectos multiarchivo;
- traducción automática a otros lenguajes;
- corrección automática avanzada de ejercicios.

## Checklist de Salida 1.0

- [ ] Consola debajo del editor.
- [ ] Consola redimensionable.
- [ ] Panel derecho con ejercicios.
- [ ] Ejemplos en menú desplegable superior.
- [ ] Banco de ejercicios extraído desde `guia.html` o fuente equivalente.
- [ ] 100% de ejercicios visibles adaptados al dialecto LiteSeInt.
- [ ] Plan de pruebas de ejercicios ejecutado.
- [ ] Ejercicios incompatibles excluidos o documentados explícitamente.
- [ ] Roadmap del estudiante visible.
- [ ] Documentación integrada de comandos.
- [ ] Progreso local por ejercicio.
- [ ] Filtros por módulo, dificultad y estado.
- [ ] README actualizado.
- [ ] CHANGELOG actualizado.
- [ ] Versión visible `v1.0.0`.
- [ ] Pruebas del runtime pasan.
- [ ] Revisión manual de flujo completo: aprender, elegir ejercicio, programar, ejecutar, marcar avance.

## Norte del Proyecto

LiteSeInt 1.0 debe ser una herramienta de aprendizaje, no solo un intérprete.

La experiencia debe responder tres preguntas del estudiante:

1. ¿Qué comando estoy aprendiendo?
2. ¿Cómo se usa?
3. ¿Qué ejercicio hago ahora para practicarlo?

Si la app logra eso con una interfaz simple, un lenguaje pequeño y ejercicios bien secuenciados, la versión 1.0 estará cumpliendo su propósito.
