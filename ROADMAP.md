# Roadmap LiteSeInt: de v0.9.0 a v1.0.0

LiteSeInt ya está en fase de cierre hacia `v1.0.0`. La versión 1.0 no debe ampliar el lenguaje ni convertirse en un clon completo de PSeInt: debe publicar como estable una plataforma minimalista para aprender pseudolenguaje con editor, consola, ejercicios, ruta, comandos y guía de errores integrados.

La promesa del producto queda así:

> LiteSeInt permite escribir, ejecutar, aprender y practicar pseudolenguaje desde el navegador, con una ruta progresiva y sin depender de instalación, backend ni internet.

## Estado Base: v0.9.0

La revisión del proyecto muestra que `v0.9.0` ya contiene el núcleo esperado para 1.0. La revisión documental `v0.9.1` deja ese estado alineado en README, CHANGELOG, EJERCICIOS y ROADMAP.

- Editor web con resaltado, autocompletado, validación estática y ejecución.
- Consola inferior redimensionable con entrada inline para `Leer`.
- Panel de aprendizaje con pestañas de `Ejercicios`, `Comandos`, `Ruta` y `Errores`.
- Banco de 245 ejercicios adaptados desde `ejercicios/guia.html`, cargados desde `json/N1.json` a `json/N7.json`.
- Niveles N1-N7 visibles en la app.
- Progreso local por ejercicio mediante `localStorage`.
- Guía de comandos con 17 entradas.
- Guía de errores con 16 entradas agrupadas por `Estructura`, `Variables`, `Expresiones` y `Ciclos`.
- Ruta N1-N7 con objetivos, requisitos, comandos clave y progreso.
- Suite de pruebas Node.js ejecutable con `npm test`.
- Versión visible actual: `v0.9.1`.

El cierre hacia 1.0 es principalmente de estabilización, consistencia documental, pruebas de flujo completo y pulido educativo. No se recomienda agregar nuevas construcciones del lenguaje antes de 1.0.

## Alcance de v1.0.0

### Dentro de Alcance

- Congelar el dialecto LiteSeInt actual.
- Consolidar la experiencia educativa integrada.
- Verificar que los 245 ejercicios visibles estén adaptados, sean navegables y tengan código de referencia validable.
- Alinear README, CHANGELOG, EJERCICIOS y ROADMAP con el estado real de la app.
- Revisar el flujo completo de estudiante: elegir nivel, leer comando, resolver ejercicio, ejecutar, corregir error y marcar progreso.
- Actualizar la versión visible a `v1.0.0`.

### Fuera de Alcance

- Agregar alias de PSeInt clásico como `<-`, `Cadena`, `SiNo`, `MOD` o `DIV`.
- Incorporar arreglos, matrices, `SubProceso`, funciones de usuario o proyectos multiarchivo.
- Implementar corrección automática avanzada de ejercicios.
- Agregar backend, login, nube, base de datos o sincronización de progreso.
- Traducir código a otros lenguajes.
- Cambiar el stack vanilla HTML/CSS/JavaScript.

## Hitos Propuestos

### v0.9.1 - Auditoría de Consistencia

Objetivo: eliminar contradicciones entre documentación, código y experiencia visible.

Estado: completado.

Tareas:

- Revisar `README.md`, `EJERCICIOS.md`, `CHANGELOG.md` y `ROADMAP.md` para que todos describan el mismo estado.
- Corregir referencias antiguas a niveles no visibles, hitos ya completados o versiones previas.
- Confirmar que la app, README y changelog declaran `v0.9.0` como base actual.
- Verificar que el alcance 1.0 no prometa integraciones externas ni lenguaje futuro.
- Revisar textos visibles en la pestaña `Ruta` para que no hablen de pendientes ya resueltos.

Criterios de aceptación:

- No quedan contradicciones conocidas entre documentación y código.
- La ruta pública hacia 1.0 parte explícitamente desde `v0.9.0`.
- Los documentos distinguen con claridad entre lo ya implementado y lo pendiente.

### v0.9.2 - Pruebas de Material Pedagógico

Objetivo: subir la confianza sobre ejercicios, comandos y errores antes de declarar estabilidad.

Tareas:

- Ejecutar `npm test` y mantener la suite en verde.
- Agregar, si hace falta, una prueba que confirme que los 245 ejercicios adaptados están cargados desde `N1` a `N7`.
- Verificar que todos los IDs recomendados en `DOC_COMANDOS` existan en el banco real.
- Verificar que los ejemplos de `DOC_COMANDOS` y `DOC_ERRORES_COMUNES` sigan pasando validación cuando corresponda.
- Revisar una muestra manual por nivel: al menos 2 ejercicios por N1-N7, incluyendo uno guiado y uno de desafío cuando existan.

Criterios de aceptación:

- `npm test` pasa.
- Los 245 ejercicios adaptados siguen validando estáticamente.
- Ningún comando recomienda ejercicios inexistentes.
- La documentación interna no muestra ejemplos incompatibles con el dialecto LiteSeInt.

### v0.9.3 - Revisión UX de Flujo Completo

Objetivo: asegurar que una persona principiante pueda usar LiteSeInt sin explicación externa.

Tareas:

- Probar el flujo desde cero:
  - abrir la app;
  - cargar un ejemplo;
  - ejecutar;
  - elegir un ejercicio;
  - leer la pista;
  - escribir una solución;
  - provocar y corregir un error;
  - marcar progreso.
- Revisar responsive en escritorio y móvil.
- Confirmar que acciones que reemplazan código tengan confirmación.
- Revisar que el panel de aprendizaje sea legible y no tape acciones principales.
- Confirmar que la consola inferior mantiene entrada, salida, errores y trazas de forma comprensible.

Criterios de aceptación:

- El flujo completo puede completarse sin abrir archivos externos.
- La interfaz no oculta botones esenciales en pantallas pequeñas.
- La guía de errores ayuda a corregir al menos los errores típicos documentados.

### v0.9.4 - Preparación de Release

Objetivo: dejar el repositorio listo para etiquetar `v1.0.0`.

Tareas:

- Actualizar `CHANGELOG.md` con una entrada de pre-release o preparación 1.0.
- Revisar README para que el estado actual no contenga datos obsoletos.
- Revisar `EJERCICIOS.md` para que la tabla de niveles coincida con N1-N7 visibles.
- Confirmar que `index.html` es suficiente para uso local sin build.
- Revisar links relativos y referencias a GitHub Pages.
- Confirmar que no hay archivos temporales o artefactos sueltos que deban entrar al release.

Criterios de aceptación:

- La documentación está lista para usuario final.
- No hay pendientes bloqueantes documentales.
- El repositorio queda limpio para el cambio de versión.

### v1.0.0 - Release Estable

Objetivo: publicar LiteSeInt como plataforma minimalista estable de aprendizaje de pseudolenguaje.

Tareas:

- Cambiar la versión visible en la app a `v1.0.0`.
- Agregar entrada `1.0.0` en `CHANGELOG.md`.
- Actualizar README con estado `v1.0.0`.
- Ejecutar `npm test`.
- Hacer revisión manual final del flujo de aprendizaje.
- Crear tag de release si el flujo de trabajo del proyecto lo usa.

Criterios de aceptación:

- Una persona puede aprender comandos, elegir ejercicios, ejecutar código, leer errores y avanzar por N1-N7.
- Los 245 ejercicios visibles están adaptados al dialecto LiteSeInt.
- La documentación integrada cubre comandos, ruta y errores sin depender de internet.
- El lenguaje 1.0 está congelado y documentado.
- La versión visible muestra `v1.0.0`.
- La suite de pruebas pasa.

## Checklist de Salida 1.0

- [ ] README alineado con `v1.0.0`.
- [ ] CHANGELOG contiene entrada `1.0.0`.
- [ ] EJERCICIOS describe N1-N7 como visibles.
- [ ] ROADMAP describe el cierre desde `v0.9.0`.
- [ ] Versión visible en `index.html` actualizada a `v1.0.0`.
- [ ] `npm test` pasa.
- [ ] Banco de 245 ejercicios cargado desde `json/N1.json` a `json/N7.json`.
- [ ] Todos los ejercicios visibles tienen `estadoAdaptacion: adaptado`.
- [ ] Códigos de referencia no usan sintaxis prohibida: `<-`, `Cadena`, `SiNo`, `MOD`, `DIV`.
- [ ] IDs de ejercicios recomendados por comandos existen.
- [ ] Ejemplos de comandos validan.
- [ ] Ejemplos corregidos de errores validan cuando corresponde.
- [ ] Flujo manual de estudiante revisado en escritorio.
- [ ] Flujo manual de estudiante revisado en móvil.
- [ ] Acciones de reemplazo de editor piden confirmación.
- [ ] Progreso local persiste tras recargar.
- [ ] No se prometen funcionalidades fuera de alcance para 1.0.

## Riesgos Antes de 1.0

### Documentación Desalineada

Riesgo: algunos documentos pueden conservar información de versiones anteriores.

Mitigación: revisar README, EJERCICIOS, CHANGELOG y ROADMAP en una pasada dedicada antes del release.

### Ejercicios Válidos Pero Pedagógicamente Irregulares

Riesgo: que el código de referencia valide, pero algunos enunciados, pistas o salidas esperadas no guíen bien al estudiante.

Mitigación: hacer revisión manual por muestra en N1-N7 y priorizar ejercicios iniciales, guiados y de desafío.

### Alcance Creciente

Riesgo: agregar comandos o compatibilidad PSeInt clásica justo antes de 1.0.

Mitigación: mantener 1.0 como release de consolidación. Toda expansión de lenguaje debe pasar a 1.1 o posterior.

### Validación Automática de Soluciones

Riesgo: que el usuario espere que LiteSeInt califique automáticamente cada ejercicio.

Mitigación: documentar con claridad que en 1.0 el progreso es manual y que la app valida ejecución/sintaxis, no equivalencia completa de soluciones.

## Después de 1.0

Estas ideas no bloquean el release estable:

- Validación automática simple por salida esperada en ejercicios seleccionados.
- Modo práctica guiada con pasos desbloqueables.
- Más pruebas automatizadas para documentación interna.
- Exportación/importación de progreso local.
- Mejoras de accesibilidad y navegación por teclado.
- Revisión pedagógica profunda de ejercicios avanzados N6-N7.
- Nuevos bancos de ejercicios, manteniendo el dialecto LiteSeInt estable.

## Norte del Proyecto

LiteSeInt 1.0 debe sentirse pequeño, claro y completo.

La experiencia debe responder tres preguntas del estudiante:

1. ¿Qué estoy aprendiendo?
2. ¿Cómo se usa?
3. ¿Qué ejercicio hago ahora?

Si la app permite responder esas preguntas, escribir código, ejecutar, equivocarse con mensajes comprensibles y avanzar por N1-N7, entonces `v1.0.0` está lista.
