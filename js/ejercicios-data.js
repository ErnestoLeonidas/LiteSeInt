/* ==============================================
   ejercicios-data.js — Banco de ejercicios LiteSeInt v0.8.0
   Ejercicios adaptados desde ejercicios/guia.html al dialecto LiteSeInt.
   Reglas de adaptación documentadas en EJERCICIOS.md.
   ============================================== */

(function (global) {
  'use strict';

  const ESTADOS_VALIDOS = ['adaptado', 'requiere-decision', 'excluido-temporal'];
  const DIFICULTADES_VALIDAS = ['basico', 'intermedio', 'avanzado'];
  const GRADOS_VALIDOS = ['guiado', 'con-pista', 'practica', 'desafio'];

  const EJERCICIOS = [
    // ===== Nivel 0 — Orientación =====
    {
      id: 'ea1-1-001',
      origen: 'guia.html EA 1.1 #1',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 0,
      dificultad: 'basico',
      gradoAyuda: 'guiado',
      titulo: 'Mostrar un saludo fijo',
      conceptos: ['Escribir', 'Proceso'],
      enunciado: 'Crea un programa que muestre el mensaje "Hola, mundo!" en la pantalla. No necesita leer ningún dato del usuario. Es el ejercicio más simple posible: una sola instrucción de salida.',
      entradaProcesoSalida: {
        entrada: '(ninguna — no se lee ningún dato)',
        proceso: 'No hay cálculo. Solo mostrar texto fijo.',
        salida: '"Hola, mundo!" impreso en pantalla'
      },
      salidaEsperada: 'Hola, mundo!',
      pista: 'Escribir muestra texto en consola. Las cadenas de texto van entre comillas dobles.',
      codigoReferencia: 'Proceso saludo\n  Escribir "Hola, mundo!"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-002',
      origen: 'guia.html EA 1.1 #2',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 0,
      dificultad: 'basico',
      gradoAyuda: 'guiado',
      titulo: 'Mostrar tres líneas de texto',
      conceptos: ['Escribir'],
      enunciado: 'Crea un programa que muestre tres líneas de texto fijo: tu nombre, tu carrera y el nombre de la asignatura. Cada dato debe aparecer en una línea separada.',
      entradaProcesoSalida: {
        entrada: '(ninguna)',
        proceso: 'Tres instrucciones Escribir independientes.',
        salida: 'Tres líneas de texto en consola'
      },
      salidaEsperada: 'Nombre: Ana González\nCarrera: Analista Programador\nAsignatura: Fundamentos de Programación',
      pista: 'Cada Escribir produce una nueva línea. Puedes concatenar texto y variables separando con comas.',
      codigoReferencia: 'Proceso mis_datos\n  Escribir "Nombre: Ana González"\n  Escribir "Carrera: Analista Programador"\n  Escribir "Asignatura: Fundamentos de Programación"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    // ===== Nivel 1 — Secuencia y salida =====
    {
      id: 'ea1-1-003',
      origen: 'guia.html EA 1.1 #3',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 1,
      dificultad: 'basico',
      gradoAyuda: 'con-pista',
      titulo: 'Declarar y mostrar una variable entera',
      conceptos: ['Definir', 'Entero', 'asignación', 'Escribir'],
      enunciado: 'Declara una variable entera llamada edad, asígnale el valor 20 directamente en el código (sin leer del usuario) y muéstrala en pantalla.',
      entradaProcesoSalida: {
        entrada: '(ninguna — valor asignado en el código)',
        proceso: 'edad = 20',
        salida: '"Mi edad es: 20"'
      },
      salidaEsperada: 'Mi edad es: 20',
      pista: 'En LiteSeInt el operador de asignación es =. Declara la variable con Definir antes de usarla.',
      codigoReferencia: 'Proceso mostrar_edad\n  Definir edad Como Entero\n  edad = 20\n  Escribir "Mi edad es: ", edad\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    // ===== Nivel 1 — Secuencia y salida (cont.) =====
    {
      id: 'ea1-1-020',
      origen: 'guia.html EA 1.1 #20',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 1,
      dificultad: 'avanzado',
      gradoAyuda: 'desafio',
      titulo: 'Receta para el robot doméstico',
      conceptos: ['Escribir', 'Leer', 'Caracter', 'Entero', 'asignación', 'secuencia'],
      enunciado: 'Modela la rutina matutina de un robot doméstico. Lee el nombre del habitante y ejecuta una secuencia de al menos 6 acciones. Usa una variable numPaso para numerar cada acción.',
      entradaProcesoSalida: {
        entrada: 'Nombre del habitante (Caracter)',
        proceso: 'Secuencia de 6 pasos numerados; numPaso = numPaso + 1 en cada acción',
        salida: 'Lista numerada de acciones del robot en consola'
      },
      salidaEsperada: 'Nombre del habitante:\n=== Robot Doméstico activo ===\nPaso 1: Activando sensores de movimiento...\nPaso 2: Reconocimiento del hogar completado.\nPaso 3: Despertando a: Carlos\nPaso 4: Verificando temperatura del agua...\nPaso 5: Preparando café.\nPaso 6: Desayuno listo. ¡Buen día!',
      pista: 'Inicializa numPaso = 1 antes de la primera acción. Suma 1 con numPaso = numPaso + 1 antes de cada siguiente acción. La palabra "paso" sola es reservada en LiteSeInt.',
      codigoReferencia: 'Proceso robot_domestico\n  Definir habitante Como Caracter\n  Definir numPaso Como Entero\n  Escribir "Nombre del habitante:"\n  Leer habitante\n  Escribir "=== Robot Doméstico activo ==="\n  numPaso = 1\n  Escribir "Paso ", numPaso, ": Activando sensores de movimiento..."\n  numPaso = numPaso + 1\n  Escribir "Paso ", numPaso, ": Reconocimiento del hogar completado."\n  numPaso = numPaso + 1\n  Escribir "Paso ", numPaso, ": Despertando a: ", habitante\n  numPaso = numPaso + 1\n  Escribir "Paso ", numPaso, ": Verificando temperatura del agua..."\n  numPaso = numPaso + 1\n  Escribir "Paso ", numPaso, ": Preparando café."\n  numPaso = numPaso + 1\n  Escribir "Paso ", numPaso, ": Desayuno listo. ¡Buen día!"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    // ===== Nivel 2 — Variables, tipos y entrada =====
    {
      id: 'ea1-1-004',
      origen: 'guia.html EA 1.1 #4',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 2,
      dificultad: 'basico',
      gradoAyuda: 'con-pista',
      titulo: 'Variables de distintos tipos',
      conceptos: ['Definir', 'Entero', 'Real', 'Caracter'],
      enunciado: 'Declara tres variables: nombre (Caracter), edad (Entero) y altura (Real). Asígnales valores fijos y muéstralos con etiquetas descriptivas.',
      entradaProcesoSalida: {
        entrada: '(ninguna — valores asignados en código)',
        proceso: 'nombre = "Pedro"\nedad = 21\naltura = 1.75',
        salida: 'Tres líneas mostrando cada variable con su etiqueta'
      },
      salidaEsperada: 'Nombre: Pedro\nEdad: 21\nAltura: 1.75 m',
      pista: 'Los tres tipos básicos son Entero (sin decimales), Real (con decimales) y Caracter (texto).',
      codigoReferencia: 'Proceso tipos_datos\n  Definir nombre Como Caracter\n  Definir edad Como Entero\n  Definir altura Como Real\n  nombre = "Pedro"\n  edad = 21\n  altura = 1.75\n  Escribir "Nombre: ", nombre\n  Escribir "Edad: ", edad\n  Escribir "Altura: ", altura, " m"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-005',
      origen: 'guia.html EA 1.1 #5',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 2,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Leer el nombre del usuario',
      conceptos: ['Leer', 'Caracter', 'Escribir'],
      enunciado: 'El programa pide el nombre del usuario con un mensaje, lo lee con Leer y muestra un saludo personalizado.',
      entradaProcesoSalida: {
        entrada: 'Nombre del usuario (tipo Caracter)',
        proceso: 'Almacenar el nombre en la variable nombre',
        salida: '"Bienvenido/a, [nombre]!"'
      },
      salidaEsperada: '¿Cuál es tu nombre?\nBienvenido/a, Ana!',
      pista: 'Leer pausa la ejecución hasta que el usuario ingresa un valor en la consola.',
      codigoReferencia: 'Proceso saludo\n  Definir nombre Como Caracter\n  Escribir "¿Cuál es tu nombre?"\n  Leer nombre\n  Escribir "Bienvenido/a, ", nombre, "!"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-006',
      origen: 'guia.html EA 1.1 #6',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 2,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Suma de dos números',
      conceptos: ['Leer', 'Entero', 'asignación', '+'],
      enunciado: 'El programa solicita dos números enteros, calcula su suma y muestra el resultado. Identifica la entrada, el proceso y la salida.',
      entradaProcesoSalida: {
        entrada: 'a, b (enteros)',
        proceso: 'suma = a + b',
        salida: '"La suma es: [suma]"'
      },
      salidaEsperada: 'Ingresa el primer número:\nIngresa el segundo número:\nLa suma es: 12',
      pista: 'Define las variables antes de leerlas. Lee cada número en una instrucción separada.',
      codigoReferencia: 'Proceso suma\n  Definir a, b, total Como Entero\n  Escribir "Ingresa el primer número:"\n  Leer a\n  Escribir "Ingresa el segundo número:"\n  Leer b\n  total = a + b\n  Escribir "La suma es: ", total\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    {
      id: 'ea1-1-007',
      origen: 'guia.html EA 1.1 #7',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 2,
      dificultad: 'basico',
      gradoAyuda: 'con-pista',
      titulo: 'Calcular el doble de un número',
      conceptos: ['Leer', 'Real', '*', 'asignación'],
      enunciado: 'El usuario ingresa un número real. El programa calcula su doble (número × 2) y muestra el resultado.',
      entradaProcesoSalida: {
        entrada: 'Un número real ingresado por el usuario',
        proceso: 'doble = num * 2',
        salida: '"El doble es: " + doble'
      },
      salidaEsperada: 'Ingresa un número:\nEl doble es: 14',
      pista: 'Declara la variable como Real para que acepte decimales. El resultado se guarda en una segunda variable antes de mostrarlo.',
      codigoReferencia: 'Proceso doble_numero\n  Definir num, doble Como Real\n  Escribir "Ingresa un número:"\n  Leer num\n  doble = num * 2\n  Escribir "El doble es: ", doble\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-014',
      origen: 'guia.html EA 1.1 #14',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 2,
      dificultad: 'intermedio',
      gradoAyuda: 'con-pista',
      titulo: 'Calcular el vuelto',
      conceptos: ['Leer', 'Entero', '-', 'asignación'],
      enunciado: 'Lee el precio del producto y el monto pagado por el cliente. Calcula el vuelto (asume que el pago siempre es suficiente) y muestra el resultado.',
      entradaProcesoSalida: {
        entrada: 'Precio del producto (Entero)\nMonto pagado (Entero)',
        proceso: 'vuelto = pagado - precio',
        salida: '"Su vuelto es: $" + vuelto'
      },
      salidaEsperada: 'Precio del producto ($):\nMonto pagado ($):\nSu vuelto es: $1500',
      pista: 'La resta es directa: vuelto = pagado - precio. Guarda el resultado en una variable antes de mostrarlo.',
      codigoReferencia: 'Proceso vuelto\n  Definir precio, pagado, vuelto Como Entero\n  Escribir "Precio del producto ($):"\n  Leer precio\n  Escribir "Monto pagado ($):"\n  Leer pagado\n  vuelto = pagado - precio\n  Escribir "Su vuelto es: $", vuelto\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-016',
      origen: 'guia.html EA 1.1 #16',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 2,
      dificultad: 'intermedio',
      gradoAyuda: 'desafio',
      titulo: 'Intercambiar dos variables',
      conceptos: ['Leer', 'Entero', 'variable auxiliar', 'asignación'],
      enunciado: 'El usuario ingresa dos números enteros A y B. El programa los intercambia usando una variable auxiliar y muestra los valores antes y después del intercambio.',
      entradaProcesoSalida: {
        entrada: 'Número A (Entero)\nNúmero B (Entero)',
        proceso: 'aux = a; a = b; b = aux',
        salida: 'Valores antes y después del intercambio'
      },
      salidaEsperada: 'Ingresa A:\nIngresa B:\nAntes  → A: 10  B: 25\nDespués → A: 25  B: 10',
      pista: 'Si haces a = b directamente, pierdes el valor original de a. Necesitas una tercera variable (aux) para guardar ese valor temporalmente.',
      codigoReferencia: 'Proceso intercambio\n  Definir a, b, aux Como Entero\n  Escribir "Ingresa A:"\n  Leer a\n  Escribir "Ingresa B:"\n  Leer b\n  Escribir "Antes  → A: ", a, "  B: ", b\n  aux = a\n  a = b\n  b = aux\n  Escribir "Después → A: ", a, "  B: ", b\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    // ===== Nivel 3 — Expresiones y E·P·S =====
    {
      id: 'ea1-1-008',
      origen: 'guia.html EA 1.1 #8',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Promedio de tres notas',
      conceptos: ['Leer', 'Real', '+', '/', 'paréntesis'],
      enunciado: 'Lee tres notas de un alumno (reales entre 1.0 y 7.0) y calcula su promedio. Recuerda usar paréntesis para agrupar la suma antes de dividir.',
      entradaProcesoSalida: {
        entrada: 'n1, n2, n3 (reales)',
        proceso: 'promedio = (n1 + n2 + n3) / 3',
        salida: '"Promedio: [valor]"'
      },
      salidaEsperada: 'Ingresa la primera nota:\nIngresa la segunda nota:\nIngresa la tercera nota:\nPromedio: 5.5',
      pista: 'Sin paréntesis, n1 + n2 + n3 / 3 calcula primero n3 / 3, lo que da un resultado equivocado.',
      codigoReferencia: 'Proceso promedio_notas\n  Definir n1, n2, n3, promedio Como Real\n  Escribir "Ingresa la primera nota:"\n  Leer n1\n  Escribir "Ingresa la segunda nota:"\n  Leer n2\n  Escribir "Ingresa la tercera nota:"\n  Leer n3\n  promedio = (n1 + n2 + n3) / 3\n  Escribir "Promedio: ", promedio\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-2-009',
      origen: 'guia.html EA 1.2 #9 (Celsius a Fahrenheit)',
      modulo: 'EA 1.2',
      experiencia: 'Diagramas de Flujo y Pseudocódigo',
      nivelLiteSeInt: 3,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Conversión de Celsius a Fahrenheit',
      conceptos: ['Leer', 'Real', 'fórmula', '*', '/', '+'],
      enunciado: 'El usuario ingresa una temperatura en grados Celsius. Conviértela a Fahrenheit usando F = C * 9 / 5 + 32. Muestra ambos valores.',
      entradaProcesoSalida: {
        entrada: 'celsius (real)',
        proceso: 'fahrenheit = celsius * 9 / 5 + 32',
        salida: '"[C] °C equivalen a [F] °F"'
      },
      salidaEsperada: 'Ingresa los grados Celsius:\n0 °C equivalen a 32 °F',
      pista: 'No necesitas paréntesis: * y / tienen mayor precedencia que +.',
      codigoReferencia: 'Proceso celsius_a_fahrenheit\n  Definir celsius, fahrenheit Como Real\n  Escribir "Ingresa los grados Celsius:"\n  Leer celsius\n  fahrenheit = celsius * 9 / 5 + 32\n  Escribir celsius, " °C equivalen a ", fahrenheit, " °F"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-2-015',
      origen: 'guia.html EA 1.2 (segundos a h:m:s — DIV/MOD adaptado a Trunc)',
      modulo: 'EA 1.2',
      experiencia: 'Diagramas de Flujo y Pseudocódigo',
      nivelLiteSeInt: 3,
      dificultad: 'intermedio',
      gradoAyuda: 'desafio',
      titulo: 'Segundos a horas, minutos y segundos',
      conceptos: ['Leer', 'Entero', 'mod', 'Trunc'],
      enunciado: 'El usuario ingresa una cantidad de segundos totales. El programa los desglosa en horas, minutos y segundos restantes. Usa Trunc para la división entera y mod para el resto.',
      entradaProcesoSalida: {
        entrada: 'totalSegundos (entero)',
        proceso: 'horas = Trunc(total / 3600)\nmin = Trunc((total mod 3600) / 60)\nseg = total mod 60',
        salida: '"H: [h]  M: [m]  S: [s]"'
      },
      salidaEsperada: 'Ingresa total de segundos:\nH: 1  M: 1  S: 5',
      pista: 'En LiteSeInt no existe DIV. Usa Trunc(a / b) para la división entera y mod para el resto.',
      codigoReferencia: 'Proceso segundos_a_hms\n  Definir total, horas, minutos, segundos Como Entero\n  Escribir "Ingresa total de segundos:"\n  Leer total\n  horas = Trunc(total / 3600)\n  minutos = Trunc((total mod 3600) / 60)\n  segundos = total mod 60\n  Escribir "H: ", horas, "  M: ", minutos, "  S: ", segundos\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    {
      id: 'ea1-1-009',
      origen: 'guia.html EA 1.1 #9',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Celsius a Fahrenheit (EA 1.1)',
      conceptos: ['Leer', 'Real', 'fórmula', '*', '/', '+'],
      enunciado: 'El usuario ingresa una temperatura en grados Celsius. Conviértela a Fahrenheit usando F = C × 9 / 5 + 32. Muestra ambos valores.',
      entradaProcesoSalida: {
        entrada: 'Temperatura en Celsius (Real)',
        proceso: 'fahrenheit = celsius * 9 / 5 + 32',
        salida: 'celsius + "°C equivale a " + fahrenheit + "°F"'
      },
      salidaEsperada: 'Temperatura en Celsius:\n100°C equivale a 212°F',
      pista: 'No necesitas paréntesis: * y / tienen mayor precedencia que +, así que la fórmula funciona directo.',
      codigoReferencia: 'Proceso celsius_fahrenheit\n  Definir celsius, fahrenheit Como Real\n  Escribir "Temperatura en Celsius:"\n  Leer celsius\n  fahrenheit = celsius * 9 / 5 + 32\n  Escribir celsius, "°C equivale a ", fahrenheit, "°F"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-010',
      origen: 'guia.html EA 1.1 #10',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Precio con descuento',
      conceptos: ['Leer', 'Real', '-', '*', '/', 'fórmula'],
      enunciado: 'Lee el precio original y el porcentaje de descuento. Calcula el monto del descuento y el precio final con ese descuento aplicado. Muestra ambos resultados.',
      entradaProcesoSalida: {
        entrada: 'Precio original (Real)\nPorcentaje de descuento en % (Real)',
        proceso: 'descuento = precio * pct / 100\nfinal = precio - descuento',
        salida: '"Descuento: $" + descuento\n"Precio final: $" + final'
      },
      salidaEsperada: 'Precio original ($):\nDescuento (%):\nDescuento: $3000\nPrecio final: $17000',
      pista: 'El descuento se calcula como precio * pct / 100. Guarda el resultado intermedio para mostrarlo.',
      codigoReferencia: 'Proceso precio_descuento\n  Definir precio, pct, descuento, final Como Real\n  Escribir "Precio original ($):"\n  Leer precio\n  Escribir "Descuento (%):"\n  Leer pct\n  descuento = precio * pct / 100\n  final = precio - descuento\n  Escribir "Descuento: $", descuento\n  Escribir "Precio final: $", final\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-011',
      origen: 'guia.html EA 1.1 #11',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'intermedio',
      gradoAyuda: 'practica',
      titulo: 'Área y perímetro del rectángulo',
      conceptos: ['Leer', 'Real', '*', '+', 'fórmula', 'geometría'],
      enunciado: 'Solicita el ancho y el alto de un rectángulo. Calcula su área (A = ancho × alto) y su perímetro (P = 2 × (ancho + alto)). Muestra ambos resultados.',
      entradaProcesoSalida: {
        entrada: 'Ancho del rectángulo (Real)\nAlto del rectángulo (Real)',
        proceso: 'area = ancho * alto\nperimetro = 2 * (ancho + alto)',
        salida: '"Área: " + area + " m²"\n"Perímetro: " + perimetro + " m"'
      },
      salidaEsperada: 'Ancho (m):\nAlto (m):\nÁrea: 24 m²\nPerímetro: 20 m',
      pista: 'Los paréntesis en 2 * (ancho + alto) son necesarios: sin ellos solo se multiplicaría alto por 2.',
      codigoReferencia: 'Proceso rectangulo\n  Definir ancho, alto, area, perimetro Como Real\n  Escribir "Ancho (m):"\n  Leer ancho\n  Escribir "Alto (m):"\n  Leer alto\n  area = ancho * alto\n  perimetro = 2 * (ancho + alto)\n  Escribir "Área: ", area, " m²"\n  Escribir "Perímetro: ", perimetro, " m"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-012',
      origen: 'guia.html EA 1.1 #12',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'intermedio',
      gradoAyuda: 'practica',
      titulo: 'Área y perímetro del círculo',
      conceptos: ['Leer', 'Real', '^', '*', 'PI', 'geometría'],
      enunciado: 'Lee el radio de un círculo. Calcula su área (π × r²) y su perímetro (2 × π × r). Define PI = 3.14159 como variable en el código.',
      entradaProcesoSalida: {
        entrada: 'Radio del círculo (Real)\nPI = 3.14159 (definido en código)',
        proceso: 'area = PI * radio ^ 2\nperimetro = 2 * PI * radio',
        salida: '"Área: " + area\n"Perímetro: " + perimetro'
      },
      salidaEsperada: 'Radio del círculo:\nÁrea: 78.53975\nPerímetro: 31.4159',
      pista: 'El operador ^ representa la potencia en LiteSeInt. radio ^ 2 equivale a radio².',
      codigoReferencia: 'Proceso circulo\n  Definir radio, area, perimetro, PI Como Real\n  PI = 3.14159\n  Escribir "Radio del círculo:"\n  Leer radio\n  area = PI * radio ^ 2\n  perimetro = 2 * PI * radio\n  Escribir "Área: ", area\n  Escribir "Perímetro: ", perimetro\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-013',
      origen: 'guia.html EA 1.1 #13',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'intermedio',
      gradoAyuda: 'practica',
      titulo: 'Calcular el IMC',
      conceptos: ['Leer', 'Real', '^', '/', 'fórmula'],
      enunciado: 'Lee el peso en kg y la estatura en metros. Calcula el IMC usando IMC = peso / estatura². Muestra el resultado.',
      entradaProcesoSalida: {
        entrada: 'Peso en kg (Real)\nEstatura en metros (Real)',
        proceso: 'imc = peso / (estatura ^ 2)',
        salida: '"Tu IMC es: " + imc'
      },
      salidaEsperada: 'Peso (kg):\nEstatura (m):\nTu IMC es: 22.8571',
      pista: 'Los paréntesis en (estatura ^ 2) aseguran que la potencia se calcula antes de la división.',
      codigoReferencia: 'Proceso calcular_imc\n  Definir peso, estatura, imc Como Real\n  Escribir "Peso (kg):"\n  Leer peso\n  Escribir "Estatura (m):"\n  Leer estatura\n  imc = peso / (estatura ^ 2)\n  Escribir "Tu IMC es: ", imc\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-015',
      origen: 'guia.html EA 1.1 #15',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'intermedio',
      gradoAyuda: 'practica',
      titulo: 'Velocidad promedio de un viaje',
      conceptos: ['Leer', 'Real', '/', 'fórmula'],
      enunciado: 'El usuario ingresa la distancia recorrida (en km) y el tiempo del viaje (en horas). Calcula la velocidad promedio usando v = distancia / tiempo.',
      entradaProcesoSalida: {
        entrada: 'Distancia en km (Real)\nTiempo en horas (Real)',
        proceso: 'velocidad = distancia / tiempo',
        salida: '"Velocidad promedio: " + velocidad + " km/h"'
      },
      salidaEsperada: 'Distancia recorrida (km):\nTiempo del viaje (horas):\nVelocidad promedio: 80 km/h',
      pista: 'La fórmula es directa: una división entre dos variables leídas del usuario.',
      codigoReferencia: 'Proceso velocidad_promedio\n  Definir distancia, tiempo, velocidad Como Real\n  Escribir "Distancia recorrida (km):"\n  Leer distancia\n  Escribir "Tiempo del viaje (horas):"\n  Leer tiempo\n  velocidad = distancia / tiempo\n  Escribir "Velocidad promedio: ", velocidad, " km/h"\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-017',
      origen: 'guia.html EA 1.1 #17',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'avanzado',
      gradoAyuda: 'desafio',
      titulo: 'Calcular sueldo líquido',
      conceptos: ['Leer', 'Real', '*', '-', 'fórmula', 'desglose'],
      enunciado: 'Lee el sueldo bruto mensual. Calcula el descuento AFP (10%) y el descuento Salud (7%). El sueldo líquido es el bruto menos ambos descuentos. Muestra el desglose completo.',
      entradaProcesoSalida: {
        entrada: 'Sueldo bruto mensual (Real)',
        proceso: 'afp = bruto * 0.10\nsalud = bruto * 0.07\nliquido = bruto - afp - salud',
        salida: 'Desglose: bruto, AFP, salud y líquido'
      },
      salidaEsperada: 'Sueldo bruto ($):\n--- Liquidación ---\nSueldo bruto:  $800000\nDescuento AFP: $80000\nDescuento Sal: $56000\nSueldo líquido: $664000',
      pista: 'Los porcentajes se expresan como decimales: 10% = 0.10, 7% = 0.07. Guarda cada descuento en su propia variable para mostrar el desglose.',
      codigoReferencia: 'Proceso sueldo_liquido\n  Definir bruto, afp, salud, liquido Como Real\n  Escribir "Sueldo bruto ($):"\n  Leer bruto\n  afp = bruto * 0.10\n  salud = bruto * 0.07\n  liquido = bruto - afp - salud\n  Escribir "--- Liquidación ---"\n  Escribir "Sueldo bruto:  $", bruto\n  Escribir "Descuento AFP: $", afp\n  Escribir "Descuento Sal: $", salud\n  Escribir "Sueldo líquido: $", liquido\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-018',
      origen: 'guia.html EA 1.1 #18',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'avanzado',
      gradoAyuda: 'desafio',
      titulo: 'Conversión de segundos a h:m:s (EA 1.1)',
      conceptos: ['Leer', 'Entero', 'mod', 'Trunc', 'fórmula'],
      enunciado: 'El usuario ingresa una cantidad de segundos totales. El programa los desglosa en horas, minutos y segundos restantes. En LiteSeInt no existe DIV: usa Trunc para la división entera y mod para el resto.',
      entradaProcesoSalida: {
        entrada: 'Total de segundos (Entero)',
        proceso: 'horas = Trunc(total / 3600)\nminutos = Trunc((total mod 3600) / 60)\nsegs = total mod 60',
        salida: '"Horas: " + horas\n"Minutos: " + minutos\n"Segundos: " + segs'
      },
      salidaEsperada: 'Total de segundos:\nHoras: 1\nMinutos: 2\nSegundos: 5',
      pista: 'LiteSeInt no tiene DIV. Usa Trunc(a / b) para la parte entera de una división y mod para el resto.',
      codigoReferencia: 'Proceso segundos_a_hms\n  Definir total, horas, minutos, segundos Como Entero\n  Escribir "Total de segundos:"\n  Leer total\n  horas = Trunc(total / 3600)\n  minutos = Trunc((total mod 3600) / 60)\n  segundos = total mod 60\n  Escribir "Horas: ", horas\n  Escribir "Minutos: ", minutos\n  Escribir "Segundos: ", segundos\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-1-019',
      origen: 'guia.html EA 1.1 #19',
      modulo: 'EA 1.1',
      experiencia: 'Introducción a los Algoritmos',
      nivelLiteSeInt: 3,
      dificultad: 'avanzado',
      gradoAyuda: 'desafio',
      titulo: 'Interés simple',
      conceptos: ['Leer', 'Real', '*', '/', '+', 'fórmula financiera'],
      enunciado: 'Lee el capital inicial, la tasa anual (en %) y el tiempo en años. Calcula el interés simple (I = C × (r/100) × t) y el monto final (M = C + I). Muestra ambos.',
      entradaProcesoSalida: {
        entrada: 'Capital C (Real)\nTasa r en % (Real)\nTiempo t en años (Real)',
        proceso: 'interes = capital * (tasa / 100) * tiempo\nmonto = capital + interes',
        salida: '"Interés generado: $" + interes\n"Monto final: $" + monto'
      },
      salidaEsperada: 'Capital inicial ($):\nTasa anual (%):\nPlazo (años):\nInterés generado: $75000\nMonto final: $575000',
      pista: 'Divide la tasa por 100 dentro de la fórmula para convertirla de porcentaje a decimal: capital * (tasa / 100) * tiempo.',
      codigoReferencia: 'Proceso interes_simple\n  Definir capital, tasa, tiempo, interes, monto Como Real\n  Escribir "Capital inicial ($):"\n  Leer capital\n  Escribir "Tasa anual (%):"\n  Leer tasa\n  Escribir "Plazo (años):"\n  Leer tiempo\n  interes = capital * (tasa / 100) * tiempo\n  monto = capital + interes\n  Escribir "Interés generado: $", interes\n  Escribir "Monto final: $", monto\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    // ===== Nivel 4 — Decisiones simples =====
    {
      id: 'ea1-3-001',
      origen: 'guia.html EA 1.3 (mayor de dos)',
      modulo: 'EA 1.3',
      experiencia: 'Estructuras de Decisión',
      nivelLiteSeInt: 4,
      dificultad: 'basico',
      gradoAyuda: 'guiado',
      titulo: 'Mayor de dos números',
      conceptos: ['Si', 'Sino', 'FinSi', '>', '=='],
      enunciado: 'Lee dos números reales. Determina cuál es mayor o si son iguales y muestra el resultado.',
      entradaProcesoSalida: {
        entrada: 'a, b (reales)',
        proceso: 'comparar a y b con > y ==',
        salida: '"El mayor es [n]" o "Son iguales"'
      },
      salidaEsperada: 'Ingresa el primer número:\nIngresa el segundo número:\nEl mayor es 8',
      pista: 'En condiciones se usa == para igualdad. = es solo asignación.',
      codigoReferencia: 'Proceso mayor_dos\n  Definir a, b Como Real\n  Escribir "Ingresa el primer número:"\n  Leer a\n  Escribir "Ingresa el segundo número:"\n  Leer b\n  Si a > b Entonces\n    Escribir "El mayor es ", a\n  Sino\n    Si b > a Entonces\n      Escribir "El mayor es ", b\n    Sino\n      Escribir "Son iguales"\n    FinSi\n  FinSi\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-3-002',
      origen: 'guia.html EA 1.3 (par/impar)',
      modulo: 'EA 1.3',
      experiencia: 'Estructuras de Decisión',
      nivelLiteSeInt: 4,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Par o impar',
      conceptos: ['Si', 'Sino', 'mod', '=='],
      enunciado: 'Lee un número entero y muestra si es par o impar usando el operador mod.',
      entradaProcesoSalida: {
        entrada: 'n (entero)',
        proceso: 'evaluar n mod 2 == 0',
        salida: '"[n] es par" o "[n] es impar"'
      },
      salidaEsperada: 'Ingresa un número entero:\n7 es impar',
      pista: 'Un número es par cuando el resto al dividir por 2 es 0.',
      codigoReferencia: 'Proceso par_impar\n  Definir n Como Entero\n  Escribir "Ingresa un número entero:"\n  Leer n\n  Si n mod 2 == 0 Entonces\n    Escribir n, " es par"\n  Sino\n    Escribir n, " es impar"\n  FinSi\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-3-003',
      origen: 'guia.html EA 1.3 (aprobado/reprobado)',
      modulo: 'EA 1.3',
      experiencia: 'Estructuras de Decisión',
      nivelLiteSeInt: 4,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Aprobado o reprobado',
      conceptos: ['Si', 'Sino', '>=', 'Real'],
      enunciado: 'Lee la nota final de un alumno (real entre 1.0 y 7.0). Muestra "Aprobado" si la nota es mayor o igual a 4.0; en caso contrario muestra "Reprobado".',
      entradaProcesoSalida: {
        entrada: 'nota (real)',
        proceso: 'comparar nota >= 4.0',
        salida: '"Aprobado" o "Reprobado"'
      },
      salidaEsperada: 'Ingresa la nota final:\nAprobado',
      pista: 'En LiteSeInt los reales usan punto decimal (4.0).',
      codigoReferencia: 'Proceso aprobado_reprobado\n  Definir nota Como Real\n  Escribir "Ingresa la nota final:"\n  Leer nota\n  Si nota >= 4.0 Entonces\n    Escribir "Aprobado"\n  Sino\n    Escribir "Reprobado"\n  FinSi\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    // ===== Nivel 5 — Decisiones múltiples =====
    {
      id: 'ea1-3-010',
      origen: 'guia.html EA 1.3 (día de la semana)',
      modulo: 'EA 1.3',
      experiencia: 'Estructuras de Decisión',
      nivelLiteSeInt: 5,
      dificultad: 'intermedio',
      gradoAyuda: 'practica',
      titulo: 'Día de la semana según número',
      conceptos: ['Segun', 'De Otro Modo', 'FinSegun'],
      enunciado: 'Lee un número entre 1 y 7 y muestra el día de la semana correspondiente. Si el número está fuera de rango muestra un mensaje de error.',
      entradaProcesoSalida: {
        entrada: 'dia (entero entre 1 y 7)',
        proceso: 'mapear número a nombre con Segun',
        salida: 'Nombre del día o mensaje de error'
      },
      salidaEsperada: 'Ingresa un número del 1 al 7:\nMiércoles',
      pista: 'Segun acepta varios valores por caso separados por coma (por ejemplo "6, 7:") y un bloque "De Otro Modo:".',
      codigoReferencia: 'Proceso dia_semana\n  Definir dia Como Entero\n  Escribir "Ingresa un número del 1 al 7:"\n  Leer dia\n  Segun dia Hacer\n    1: Escribir "Lunes"\n    2: Escribir "Martes"\n    3: Escribir "Miércoles"\n    4: Escribir "Jueves"\n    5: Escribir "Viernes"\n    6, 7:\n      Escribir "Fin de semana"\n    De Otro Modo:\n      Escribir "Número inválido"\n  FinSegun\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-3-011',
      origen: 'guia.html EA 1.3 (clasificación de notas)',
      modulo: 'EA 1.3',
      experiencia: 'Estructuras de Decisión',
      nivelLiteSeInt: 5,
      dificultad: 'intermedio',
      gradoAyuda: 'desafio',
      titulo: 'Clasificación de nota por rangos',
      conceptos: ['Si anidado', 'Y', 'Real', '>=', '<'],
      enunciado: 'Lee una nota entre 1.0 y 7.0 y clasifícala: 1.0-3.9 Reprobado, 4.0-4.9 Suficiente, 5.0-5.9 Bueno, 6.0-7.0 Excelente.',
      entradaProcesoSalida: {
        entrada: 'nota (real entre 1.0 y 7.0)',
        proceso: 'cadena de Si anidados con rangos',
        salida: 'Clasificación correspondiente'
      },
      salidaEsperada: 'Ingresa la nota:\nBueno',
      pista: 'Puedes usar el operador lógico Y para describir un rango: nota >= 4.0 Y nota < 5.0.',
      codigoReferencia: 'Proceso clasificar_nota\n  Definir nota Como Real\n  Escribir "Ingresa la nota:"\n  Leer nota\n  Si nota >= 6.0 Entonces\n    Escribir "Excelente"\n  Sino\n    Si nota >= 5.0 Entonces\n      Escribir "Bueno"\n    Sino\n      Si nota >= 4.0 Entonces\n        Escribir "Suficiente"\n      Sino\n        Escribir "Reprobado"\n      FinSi\n    FinSi\n  FinSi\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    // ===== Nivel 6 — Repetición controlada =====
    {
      id: 'ea1-4-001',
      origen: 'guia.html EA 1.4 (números 1 al N)',
      modulo: 'EA 1.4',
      experiencia: 'Estructuras de Repetición',
      nivelLiteSeInt: 6,
      dificultad: 'basico',
      gradoAyuda: 'guiado',
      titulo: 'Mostrar los números del 1 al N',
      conceptos: ['Para', 'FinPara'],
      enunciado: 'Lee un entero N positivo y muestra los números del 1 al N usando un ciclo Para.',
      entradaProcesoSalida: {
        entrada: 'n (entero positivo)',
        proceso: 'ciclo Para i de 1 a n',
        salida: 'Una línea por cada número del 1 al N'
      },
      salidaEsperada: '¿Hasta qué número?\n1\n2\n3',
      pista: 'Para acepta paso 1 por defecto: Para i = 1 Hasta n Hacer ... FinPara.',
      codigoReferencia: 'Proceso uno_a_n\n  Definir n, i Como Entero\n  Escribir "¿Hasta qué número?"\n  Leer n\n  Para i = 1 Hasta n Hacer\n    Escribir i\n  FinPara\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-4-002',
      origen: 'guia.html EA 1.4 (tabla de multiplicar)',
      modulo: 'EA 1.4',
      experiencia: 'Estructuras de Repetición',
      nivelLiteSeInt: 6,
      dificultad: 'basico',
      gradoAyuda: 'practica',
      titulo: 'Tabla de multiplicar',
      conceptos: ['Para', 'FinPara', '*'],
      enunciado: 'Lee un entero y muestra su tabla de multiplicar del 1 al 10.',
      entradaProcesoSalida: {
        entrada: 'num (entero)',
        proceso: 'ciclo Para de 1 a 10 mostrando num * i',
        salida: 'Diez líneas con num x i = resultado'
      },
      salidaEsperada: '¿De qué número?\n5 x 1 = 5\n5 x 2 = 10\n... (hasta 5 x 10 = 50)',
      pista: 'Las cadenas literales y las variables se concatenan separándolas con coma en Escribir.',
      codigoReferencia: 'Proceso tabla\n  Definir num, i Como Entero\n  Escribir "¿De qué número?"\n  Leer num\n  Para i = 1 Hasta 10 Hacer\n    Escribir num, " x ", i, " = ", num * i\n  FinPara\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-4-005',
      origen: 'guia.html EA 1.4 (Repetir / HastaQue)',
      modulo: 'EA 1.4',
      experiencia: 'Estructuras de Repetición',
      nivelLiteSeInt: 6,
      dificultad: 'intermedio',
      gradoAyuda: 'practica',
      titulo: 'Validar entrada con Repetir',
      conceptos: ['Repetir', 'HastaQue', '>='],
      enunciado: 'Pide un número entero positivo. Si el usuario ingresa 0 o un número negativo, vuelve a pedirlo. Termina cuando el usuario ingrese un número mayor a 0.',
      entradaProcesoSalida: {
        entrada: 'n (entero, repetido hasta que sea positivo)',
        proceso: 'ciclo Repetir ... HastaQue n > 0',
        salida: '"Número aceptado: [n]"'
      },
      salidaEsperada: 'Ingresa un número positivo:\nNúmero aceptado: 5',
      pista: 'Repetir ejecuta el bloque al menos una vez y termina cuando la condición de HastaQue es verdadera.',
      codigoReferencia: 'Proceso validar_positivo\n  Definir n Como Entero\n  Repetir\n    Escribir "Ingresa un número positivo:"\n    Leer n\n  HastaQue n > 0\n  Escribir "Número aceptado: ", n\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },

    // ===== Nivel 7 — Patrones de procesamiento =====
    {
      id: 'ea1-4-020',
      origen: 'guia.html EA 1.4 (suma de N números)',
      modulo: 'EA 1.4',
      experiencia: 'Estructuras de Repetición',
      nivelLiteSeInt: 7,
      dificultad: 'intermedio',
      gradoAyuda: 'practica',
      titulo: 'Suma de N números (acumulador)',
      conceptos: ['Mientras', 'acumulador', 'contador'],
      enunciado: 'Lee la cantidad N de números a sumar. Luego lee N números enteros y muestra su suma total.',
      entradaProcesoSalida: {
        entrada: 'n (entero, cantidad), seguido por n enteros',
        proceso: 'inicializa suma = 0; en cada iteración suma = suma + valor',
        salida: '"Suma total: [suma]"'
      },
      salidaEsperada: '¿Cuántos números sumar?\nIngresa el número 1:\nIngresa el número 2:\nSuma total: 8',
      pista: 'Un acumulador se inicializa fuera del ciclo y se actualiza dentro: suma = suma + x.',
      codigoReferencia: 'Proceso suma_n\n  Definir n, i, x, suma Como Entero\n  Escribir "¿Cuántos números sumar?"\n  Leer n\n  suma = 0\n  i = 1\n  Mientras i <= n Hacer\n    Escribir "Ingresa el número ", i, ":"\n    Leer x\n    suma = suma + x\n    i = i + 1\n  FinMientras\n  Escribir "Suma total: ", suma\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-4-021',
      origen: 'guia.html EA 1.4 (promedio de N notas)',
      modulo: 'EA 1.4',
      experiencia: 'Estructuras de Repetición',
      nivelLiteSeInt: 7,
      dificultad: 'intermedio',
      gradoAyuda: 'desafio',
      titulo: 'Promedio de N notas',
      conceptos: ['Para', 'acumulador', 'Real', '/'],
      enunciado: 'Lee N notas reales y muestra el promedio. Si N es 0, indica que no hay notas para promediar.',
      entradaProcesoSalida: {
        entrada: 'n (entero), seguido por n reales',
        proceso: 'acumular suma; promedio = suma / n si n > 0',
        salida: '"Promedio: [valor]" o "Sin notas"'
      },
      salidaEsperada: '¿Cuántas notas?\nNota 1:\nNota 2:\nPromedio: 5.5',
      pista: 'Cuida el caso n = 0 antes de dividir, para evitar división por cero.',
      codigoReferencia: 'Proceso promedio_n\n  Definir n, i Como Entero\n  Definir suma, nota, promedio Como Real\n  Escribir "¿Cuántas notas?"\n  Leer n\n  Si n == 0 Entonces\n    Escribir "Sin notas"\n  Sino\n    suma = 0\n    Para i = 1 Hasta n Hacer\n      Escribir "Nota ", i, ":"\n      Leer nota\n      suma = suma + nota\n    FinPara\n    promedio = suma / n\n    Escribir "Promedio: ", promedio\n  FinSi\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    },
    {
      id: 'ea1-4-022',
      origen: 'guia.html EA 1.4 (máximo de N números)',
      modulo: 'EA 1.4',
      experiencia: 'Estructuras de Repetición',
      nivelLiteSeInt: 7,
      dificultad: 'intermedio',
      gradoAyuda: 'desafio',
      titulo: 'Máximo de N números',
      conceptos: ['Para', 'Si', 'máximo'],
      enunciado: 'Lee N números enteros y muestra el mayor de todos. Inicializa el máximo con el primer número leído.',
      entradaProcesoSalida: {
        entrada: 'n (entero >= 1), seguido por n enteros',
        proceso: 'leer el primero como máximo; comparar con cada uno de los siguientes',
        salida: '"Máximo: [valor]"'
      },
      salidaEsperada: '¿Cuántos números?\nIngresa número 1:\nIngresa número 2:\nMáximo: 12',
      pista: 'Inicializa el máximo con el primer valor, no con 0, para que funcione con números negativos.',
      codigoReferencia: 'Proceso maximo_n\n  Definir n, i, x, maximo Como Entero\n  Escribir "¿Cuántos números?"\n  Leer n\n  Escribir "Ingresa número 1:"\n  Leer maximo\n  Para i = 2 Hasta n Hacer\n    Escribir "Ingresa número ", i, ":"\n    Leer x\n    Si x > maximo Entonces\n      maximo = x\n    FinSi\n  FinPara\n  Escribir "Máximo: ", maximo\nFinProceso',
      estadoAdaptacion: 'adaptado',
      motivoExclusion: ''
    }
  ];

  function listarAdaptados() {
    return EJERCICIOS.filter((e) => e.estadoAdaptacion === 'adaptado');
  }

  function porId(id) {
    return EJERCICIOS.find((e) => e.id === id) || null;
  }

  function porNivel(nivel) {
    return EJERCICIOS.filter(
      (e) => e.estadoAdaptacion === 'adaptado' && e.nivelLiteSeInt === nivel,
    );
  }

  global.EjerciciosLiteSeInt = {
    EJERCICIOS,
    ESTADOS_VALIDOS,
    DIFICULTADES_VALIDAS,
    GRADOS_VALIDOS,
    listarAdaptados,
    porId,
    porNivel,
  };
})(typeof window !== 'undefined' ? window : globalThis);
