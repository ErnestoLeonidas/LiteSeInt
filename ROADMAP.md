# Roadmap LiteSeInt 1.0

LiteSeInt debe llegar a la versión 1.0 como una plataforma minimalista para aprender pseudolenguaje desde cero, practicar comandos mediante ejercicios graduados y construir una base sólida para aprender Python.

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

Advertencia importante: la guía usa sintaxis PSeInt clásica en varios ejemplos, como `<-`, `Cadena`, `SiNo`, `DIV` y `MOD`. Para la versión 1.0, todos los ejercicios provenientes de `ejercicios/guia.html` deben adaptarse al lenguaje definido por LiteSeInt. La guía entrega la secuencia pedagógica y los enunciados; la sintaxis final debe ser la del pseudolenguaje que construimos en este proyecto.

## Visión 1.0

LiteSeInt 1.0 debe tener tres áreas principales:

1. Área de programación

   Editor de pseudocódigo, selector de ejemplos, botones de ejecución y consola debajo del editor.

2. Área de ejercicios

   Panel derecho con la ruta de aprendizaje, listado de ejercicios, estado de avance, dificultad y acceso al enunciado.

3. Área de aprendizaje

   Documentación de comandos, ejemplos mínimos, explicación del roadmap del estudiante y relación entre pseudolenguaje y Python.

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

## Roadmap del Estudiante

La ruta de aprendizaje debe enseñar comandos en una secuencia natural.

### Módulo 1: Primeros Algoritmos

Base tomada de EA 1.1.

Objetivo: entender qué es un algoritmo y escribir los primeros programas.

Comandos y conceptos:

- `Proceso` / `FinProceso`
- `Escribir`
- texto entre comillas
- variables
- `Definir`
- tipos `Entero`, `Real`, `Caracter`, `Logico`
- asignación
- operadores aritméticos
- `Leer`

Resultado esperado: el estudiante puede escribir programas simples que leen datos, calculan y muestran resultados.

### Módulo 2: Entrada, Proceso y Salida

Base tomada de EA 1.2.

Objetivo: pensar antes de programar.

Comandos y conceptos:

- análisis E/P/S;
- fórmulas;
- conversión de unidades;
- uso de variables auxiliares;
- orden de operaciones;
- depuración básica leyendo la consola.

Resultado esperado: el estudiante puede transformar un enunciado en entradas, proceso y salida antes de codificar.

### Módulo 3: Decisiones

Base tomada de EA 1.3 y EA 1.6.

Objetivo: tomar decisiones con condiciones simples y anidadas.

Comandos y conceptos:

- `Si`
- `Entonces`
- `Sino`
- `FinSi`
- operadores relacionales;
- operadores lógicos `Y`, `O`, `No`;
- decisiones anidadas;
- validación de casos.

Resultado esperado: el estudiante puede resolver problemas donde el programa cambia de camino según condiciones.

### Módulo 4: Menús y Selección Múltiple

Base tomada de ejercicios con `Segun`.

Objetivo: elegir acciones según una opción.

Comandos y conceptos:

- `Segun`
- casos con `:`
- varios valores por caso;
- `De Otro Modo`
- `FinSegun`
- menús simples.

Resultado esperado: el estudiante puede crear programas con opciones y respuestas diferenciadas.

### Módulo 5: Repetición

Base tomada de EA 1.4.

Objetivo: repetir instrucciones de forma controlada.

Comandos y conceptos:

- `Mientras`
- `Repetir`
- `HastaQue`
- `Para`
- contadores;
- acumuladores;
- centinelas;
- validación con ciclos.

Resultado esperado: el estudiante puede resolver ejercicios que procesan varios datos sin repetir código manualmente.

### Módulo 6: Patrones de Resolución

Base tomada de EA 1.5, EA 1.6 y EA 1.7.

Objetivo: reconocer patrones que luego se repiten en Python.

Patrones:

- sumar acumulados;
- contar casos;
- calcular promedios;
- encontrar mayor valor;
- encontrar menor valor;
- validar mínimos;
- menú persistente con `Mientras`;
- análisis final con condicionales.

Resultado esperado: el estudiante puede leer un enunciado largo, identificar el patrón y construir una solución completa.

### Módulo 7: Puente Hacia Python

Objetivo: mostrar que el pseudolenguaje prepara para Python.

Contenido:

- variable en pseudolenguaje vs variable en Python;
- `Leer` vs `input`;
- `Escribir` vs `print`;
- `Si` vs `if`;
- `Mientras` vs `while`;
- `Para` vs `for`;
- operadores equivalentes;
- indentación como idea de bloque.

Resultado esperado: el estudiante entiende que LiteSeInt no es el destino final, sino una base para escribir código real con menos fricción.

## Hitos del Proyecto Hacia 1.0

### 0.6.5 - Base Educativa

Objetivo: tomar el núcleo ya estabilizado y preparar el producto para integrar aprendizaje guiado.

Tareas:

- Revisar README, CHANGELOG e interfaz para asegurar que la versión visible sea coherente.
- Confirmar comandos soportados por el runtime.
- Confirmar qué sintaxis de la guía no es compatible todavía.
- Definir las reglas obligatorias para adaptar todos los ejercicios de la guía al dialecto LiteSeInt.
- Crear una lista corta de equivalencias:
  - `Cadena` -> `Caracter`;
  - `<-` -> `=`;
  - `SiNo` -> `Sino`;
  - `MOD` -> `mod`;
  - `DIV` -> pendiente de decisión.

Criterios de aceptación:

- Existe una decisión documentada sobre cómo adaptar todos los ejercicios de la guía.
- El alcance de lenguaje usado por los ejercicios 1.0 está claro.

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

### 0.9.0 - Progreso y Experiencia de Estudiante

Objetivo: transformar LiteSeInt en una plataforma de práctica continua.

Tareas:

- Agregar progreso por ejercicio.
- Mostrar avance por módulo.
- Mostrar próximos ejercicios sugeridos.
- Agregar filtros por pendiente/completado.
- Agregar indicadores de dificultad.
- Permitir reiniciar progreso.
- Diseñar una experiencia simple para "continuar donde quedé".

Criterios de aceptación:

- El estudiante puede ver qué ha completado y qué sigue.
- El avance está conectado al roadmap de aprendizaje.
- La interfaz sigue siendo minimalista.

### 0.9.5 - Puente a Python

Objetivo: conectar pseudolenguaje con los conceptos básicos de Python.

Tareas:

- Agregar una sección "Esto en Python sería...".
- Cubrir equivalencias para:
  - salida;
  - entrada;
  - variables;
  - condicionales;
  - ciclos;
  - operadores.
- Mostrar ejemplos comparativos pequeños.
- Evitar convertir LiteSeInt en un traductor automático completo.

Criterios de aceptación:

- El estudiante puede ver la relación conceptual entre pseudolenguaje y Python.
- La sección ayuda a aprender Python sin distraer del objetivo principal.

### 1.0.0 - Plataforma Minimalista de Aprendizaje

Objetivo: publicar una versión estable para aprender pseudolenguaje desde cero.

Tareas:

- Congelar el alcance de comandos soportados.
- Completar layout educativo.
- Completar documentación de comandos.
- Completar roadmap del estudiante.
- Integrar banco de ejercicios adaptado.
- Validar ejercicios principales del recorrido.
- Actualizar README y CHANGELOG.
- Actualizar versión visible a `v1.0.0`.

Criterios de aceptación:

- Una persona puede abrir LiteSeInt sin experiencia previa y comenzar desde el primer módulo.
- Puede aprender comandos, ver ejemplos, elegir ejercicios, programar, ejecutar y avanzar.
- La consola está debajo del editor y es redimensionable.
- El lado derecho muestra ejercicios y progreso.
- Los ejemplos están en un menú desplegable arriba del editor.
- La documentación está disponible dentro de la app.
- El roadmap de aprendizaje usa la secuencia de ejercicios de `guia.html`.

## Plan de Pruebas de Ejercicios

La adaptación de `ejercicios/guia.html` debe formar parte del plan de pruebas de 1.0. No basta con mostrar los ejercicios en la interfaz: hay que comprobar que el material pedagógico se puede usar con el lenguaje real de LiteSeInt.

### Pruebas de Adaptación

Cada ejercicio importado desde `guia.html` debe pasar por una normalización mínima:

- convertir tipos no soportados al tipo LiteSeInt equivalente, por ejemplo `Cadena` -> `Caracter`;
- convertir asignaciones PSeInt clásicas, por ejemplo `<-` -> `=`;
- convertir variantes de palabras clave, por ejemplo `SiNo` -> `Sino`;
- normalizar operadores, por ejemplo `MOD` -> `mod`;
- resolver usos de `DIV` mediante una decisión explícita del lenguaje o una reescritura compatible;
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

### Sintaxis Compatible con la Guía

La guía usa algunos elementos que hoy pueden no coincidir con LiteSeInt. Antes de integrar ejercicios masivamente se debe decidir cómo se convertirán, porque todos los ejercicios visibles en 1.0 deben quedar adaptados al dialecto LiteSeInt:

- aceptar `<-` como alias de asignación o convertirlo a `=`;
- aceptar `Cadena` como alias de `Caracter` o convertirlo;
- aceptar `SiNo` como alias de `Sino` o convertirlo;
- aceptar `MOD` como alias de `mod` o convertirlo;
- implementar `DIV`, reemplazarlo por división/truncamiento o excluir ejercicios que lo requieran.

Recomendación para 1.0: adaptar todos los ejercicios al dialecto LiteSeInt y aceptar solo alias de bajo costo si reducen frustración inicial.

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
- traducción automática completa a Python;
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
- [ ] Sección puente hacia Python.
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
