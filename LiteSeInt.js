/**
 * ============================================================
 *  LiteSeInt.js — Motor de Intérprete de Pseudocódigo v1.1
 * ============================================================
 *  Core independiente de la UI.
 *  Expone la clase LiteSeInt que recibe callbacks para
 *  interactuar con cualquier interfaz.
 *
 *  Tipos soportados: Entero, Real, Caracter
 *  Instrucciones: Definir, Escribir, Leer, Asignación (<-)
 * ============================================================
 */

class LiteSeInt {

  /**
   * @param {Object} callbacks - Funciones que conectan el motor con la UI
   * @param {Function} callbacks.onEscribir    - (texto: string) => void
   * @param {Function} callbacks.onLeer        - (nombreVar: string) => Promise<string>
   * @param {Function} callbacks.onError       - (numLinea: number, mensaje: string) => void
   * @param {Function} callbacks.onLineaActiva - (numLinea: number) => void
   * @param {Function} callbacks.onSistema     - (texto: string) => void
   * @param {Function} callbacks.onFin         - () => void
   */
  constructor(callbacks = {}) {
    this.callbacks = {
      onEscribir:    callbacks.onEscribir    || (() => {}),
      onLeer:        callbacks.onLeer        || (() => Promise.resolve('')),
      onError:       callbacks.onError       || (() => {}),
      onLineaActiva: callbacks.onLineaActiva || (() => {}),
      onSistema:     callbacks.onSistema     || (() => {}),
      onFin:         callbacks.onFin         || (() => {}),
    };

    /** @type {Object.<string, {tipo: string, valor: *}>} */
    this.variables = {};

    /** Flag para detener ejecución externamente */
    this.ejecutando = false;

    /** Errores recopilados durante la ejecución: [{linea, mensaje}] */
    this.errores = [];

    /** Velocidad de pausa entre líneas (ms) */
    this.velocidadPausa = 100;
  }

  // ===========================================================
  //  API PÚBLICA
  // ===========================================================

  /**
   * Ejecuta un bloque de pseudocódigo completo.
   * @param {string} codigo - Texto completo del editor
   * @returns {Promise<{exito: boolean, errores: Array}>}
   */
  async ejecutar(codigo) {
    this.variables = {};
    this.errores = [];
    this.ejecutando = true;

    const lineas = codigo.split('\n');

    for (let i = 0; i < lineas.length; i++) {
      if (!this.ejecutando) break;

      const linea = lineas[i].trim();

      // Ignorar líneas vacías y comentarios
      if (linea === '' || linea.startsWith('//')) continue;

      // Notificar línea activa
      this.callbacks.onLineaActiva(i);

      try {
        await this._interpretarInstruccion(linea, i + 1);
      } catch (err) {
        const mensaje = err.message || String(err);
        this.errores.push({ linea: i, numLinea: i + 1, mensaje });
        this.callbacks.onError(i, mensaje);
        break;
      }

      // Pausa para visualización paso a paso
      await this._pausa(this.velocidadPausa);
    }

    this.ejecutando = false;
    this.callbacks.onFin();

    return {
      exito: this.errores.length === 0,
      errores: this.errores,
    };
  }

  /**
   * Detiene la ejecución en curso.
   */
  detener() {
    this.ejecutando = false;
  }

  /**
   * Retorna una copia del estado actual de variables.
   * @returns {Object}
   */
  getVariables() {
    return { ...this.variables };
  }

  // ===========================================================
  //  DISPATCHER DE INSTRUCCIONES
  // ===========================================================

  /**
   * Detecta el tipo de instrucción y delega al handler.
   * @private
   */
  async _interpretarInstruccion(linea, numLinea) {

    // --- DEFINIR ---
    if (/^definir\s+/i.test(linea)) {
      return this._ejecutarDefinir(linea, numLinea);
    }

    // --- ESCRIBIR ---
    if (/^escribir\s+/i.test(linea)) {
      return this._ejecutarEscribir(linea, numLinea);
    }

    // --- LEER ---
    if (/^leer\s+/i.test(linea)) {
      return await this._ejecutarLeer(linea, numLinea);
    }

    // --- ASIGNACIÓN (variable <- valor) ---
    if (linea.includes('<-')) {
      return this._ejecutarAsignacion(linea, numLinea);
    }

    throw new Error(`Instrucción no reconocida: "${linea}"`);
  }

  // ===========================================================
  //  HANDLERS DE INSTRUCCIONES
  // ===========================================================

  /**
   * Definir var1, var2, ... Como Tipo
   * Soporta múltiples variables separadas por comas.
   */
  _ejecutarDefinir(linea, numLinea) {
    // Formato: Definir a, b, c Como Tipo
    const match = linea.match(/^definir\s+(.+?)\s+como\s+(entero|real|caracter)\s*$/i);
    if (!match) {
      throw new Error(
        'Sintaxis inválida. Use: Definir <var1>, <var2> Como <Entero|Real|Caracter>'
      );
    }

    const listaVars = match[1];
    const tipo = match[2].toLowerCase();

    // Separar nombres por coma
    const nombres = listaVars.split(',').map(n => n.trim().toLowerCase());

    for (const nombre of nombres) {
      if (nombre === '') {
        throw new Error('Nombre de variable vacío en la declaración.');
      }
      if (!/^\w+$/.test(nombre)) {
        throw new Error(`Nombre de variable inválido: "${nombre}"`);
      }
      if (LiteSeInt.PALABRAS_RESERVADAS_SET.has(nombre)) {
        throw new Error(`"${nombre}" es una palabra reservada y no puede usarse como variable.`);
      }

      this.variables[nombre] = {
        tipo,
        valor: this._valorDefault(tipo),
      };
    }
  }

  /**
   * variable <- expresión
   */
  _ejecutarAsignacion(linea, numLinea) {
    const partes = linea.split('<-');
    if (partes.length !== 2) {
      throw new Error('Sintaxis de asignación inválida. Use: variable <- valor');
    }

    const nombre = partes[0].trim().toLowerCase();
    const expresion = partes[1].trim();

    if (!this.variables.hasOwnProperty(nombre)) {
      throw new Error(
        `Variable "${nombre}" no definida. Use "Definir ${nombre} Como Tipo" primero.`
      );
    }

    const valor = this._evaluarExpresion(expresion, numLinea);
    this.variables[nombre].valor = this._convertirTipo(valor, this.variables[nombre].tipo);
  }

  /**
   * Escribir expr1, expr2, ...
   * Soporta múltiples expresiones separadas por comas, concatenadas en una sola salida.
   */
  _ejecutarEscribir(linea, numLinea) {
    const contenido = linea.replace(/^escribir\s+/i, '');
    const partes = this._separarPorComas(contenido);
    let salida = '';

    for (const parte of partes) {
      salida += String(this._evaluarExpresion(parte.trim(), numLinea));
    }

    this.callbacks.onEscribir(salida);
  }

  /**
   * Leer variable
   * Pausa la ejecución hasta que la UI entregue un valor.
   */
  async _ejecutarLeer(linea, numLinea) {
    const match = linea.match(/^leer\s+(\w+)\s*$/i);
    if (!match) {
      throw new Error('Sintaxis inválida. Use: Leer <variable>');
    }

    const nombre = match[1].toLowerCase();

    if (!this.variables.hasOwnProperty(nombre)) {
      throw new Error(
        `Variable "${nombre}" no definida. Debe definirla antes de usar Leer.`
      );
    }

    // Delegar la entrada al callback de la UI
    const valorIngresado = await this.callbacks.onLeer(nombre);

    if (!this.ejecutando) return; // Se detuvo mientras esperaba

    this.variables[nombre].valor = this._convertirTipo(
      valorIngresado,
      this.variables[nombre].tipo
    );

    this.callbacks.onSistema(`  ↳ ${nombre} = ${valorIngresado}`);
  }

  // ===========================================================
  //  EVALUADOR DE EXPRESIONES
  // ===========================================================

  /**
   * Evalúa una expresión simple:
   *  - String literal: "texto"
   *  - Número entero: 42
   *  - Número real: 3.14
   *  - Variable
   *  - Aritmética básica: a + b, a - b, a * b, a / b
   */
  _evaluarExpresion(expr, numLinea) {
    expr = expr.trim();

    // String literal
    if (/^".*"$/.test(expr)) {
      return expr.slice(1, -1);
    }

    // Entero
    if (/^-?\d+$/.test(expr)) {
      return parseInt(expr, 10);
    }

    // Real
    if (/^-?\d+\.\d+$/.test(expr)) {
      return parseFloat(expr);
    }

    // Expresión aritmética simple (a op b)
    const opMatch = expr.match(/^(.+?)\s*([+\-*/])\s*(.+)$/);
    if (opMatch) {
      const izq = this._evaluarExpresion(opMatch[1], numLinea);
      const op  = opMatch[2];
      const der = this._evaluarExpresion(opMatch[3], numLinea);

      // Concatenación de cadenas con +
      if (typeof izq === 'string' || typeof der === 'string') {
        if (op === '+') return String(izq) + String(der);
        throw new Error('Operación aritmética no válida con cadenas.');
      }

      switch (op) {
        case '+': return izq + der;
        case '-': return izq - der;
        case '*': return izq * der;
        case '/':
          if (der === 0) throw new Error('División por cero.');
          return izq / der;
      }
    }

    // Variable
    const nombre = expr.toLowerCase();
    if (this.variables.hasOwnProperty(nombre)) {
      return this.variables[nombre].valor;
    }

    throw new Error(`Expresión no reconocida: "${expr}"`);
  }

  // ===========================================================
  //  UTILIDADES INTERNAS
  // ===========================================================

  /**
   * Convierte un valor al tipo esperado de la variable.
   */
  _convertirTipo(valor, tipo) {
    switch (tipo) {
      case 'entero': {
        const n = parseInt(valor, 10);
        if (isNaN(n)) throw new Error(`No se puede convertir "${valor}" a Entero.`);
        return n;
      }
      case 'real': {
        const n = parseFloat(valor);
        if (isNaN(n)) throw new Error(`No se puede convertir "${valor}" a Real.`);
        return n;
      }
      case 'caracter':
        return String(valor);
      default:
        return valor;
    }
  }

  /**
   * Valor por defecto según tipo.
   */
  _valorDefault(tipo) {
    switch (tipo) {
      case 'entero':  return 0;
      case 'real':    return 0.0;
      case 'caracter': return '';
      default:        return null;
    }
  }

  /**
   * Separa texto por comas, respetando strings entre comillas.
   */
  _separarPorComas(texto) {
    const partes = [];
    let actual = '';
    let dentroComillas = false;

    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (c === '"') {
        dentroComillas = !dentroComillas;
        actual += c;
      } else if (c === ',' && !dentroComillas) {
        partes.push(actual);
        actual = '';
      } else {
        actual += c;
      }
    }
    if (actual.trim() !== '') partes.push(actual);
    return partes;
  }

  /**
   * Pausa de ejecución.
   */
  _pausa(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===========================================================
  //  CONSTANTES ESTÁTICAS
  // ===========================================================

  /** Palabras reservadas del lenguaje */
  static PALABRAS_RESERVADAS = [
    { texto: 'Definir',  tipo: 'instrucción' },
    { texto: 'Escribir', tipo: 'instrucción' },
    { texto: 'Leer',     tipo: 'instrucción' },
    { texto: 'Como',     tipo: 'palabra clave' },
    { texto: 'Entero',   tipo: 'tipo' },
    { texto: 'Real',     tipo: 'tipo' },
    { texto: 'Caracter', tipo: 'tipo' },
  ];

  /** Set para validación rápida */
  static PALABRAS_RESERVADAS_SET = new Set(
    ['definir', 'escribir', 'leer', 'como', 'entero', 'real', 'caracter']
  );
}
