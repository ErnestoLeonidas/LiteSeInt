/**
 * ============================================================
 *  LiteSeInt.js — Motor de Intérprete de Pseudocódigo v2.0
 * ============================================================
 *  Core independiente de la UI.
 *  Depende de doc_errores.js para validación y tokenización.
 *
 *  Tipos soportados: Entero, Real, Caracter
 *  Instrucciones: Definir, Escribir, Leer, Asignación (<-)
 *
 *  Mejoras v2.0:
 *  - Parser de expresiones con shunting-yard (paréntesis, precedencia)
 *  - Variables con tracking de inicialización
 *  - Validación previa integrada con doc_errores.js
 *  - Errores "Variable no definida" en vez de "Expresión no reconocida"
 * ============================================================
 */

class LiteSeInt {

  /**
   * @param {Object} callbacks
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

    /** @type {Object.<string, {tipo: string, valor: *, inicializada: boolean}>} */
    this.variables = {};

    this.ejecutando = false;
    this.errores = [];
    this.velocidadPausa = 100;
  }

  // ===========================================================
  //  API PÚBLICA
  // ===========================================================

  /**
   * Ejecuta un bloque de pseudocódigo completo.
   * Realiza validación previa con doc_errores.js, luego ejecuta.
   */
  async ejecutar(codigo) {
    this.variables = {};
    this.errores = [];
    this.ejecutando = true;

    // Pre-validation
    const validacion = DocErrores.validarDocumento(codigo);

    if (validacion.errores.length > 0) {
      // Report all static errors and abort
      for (const err of validacion.errores) {
        this.errores.push(err);
        this.callbacks.onError(err.linea, err.mensaje);
      }
      this.ejecutando = false;
      this.callbacks.onFin();
      return {
        exito: false,
        errores: this.errores,
        erroresPorLinea: validacion.erroresPorLinea,
      };
    }

    // Execute line by line
    const lineas = codigo.split('\n');

    for (let i = 0; i < lineas.length; i++) {
      if (!this.ejecutando) break;

      const lineaRaw = lineas[i].trim();
      const linea = DocErrores.stripComment(lineaRaw);

      if (linea === '') continue;

      this.callbacks.onLineaActiva(i);

      try {
        await this._interpretarInstruccion(linea, i);
      } catch (err) {
        const mensaje = err.message || String(err);
        const errorObj = DocErrores.crearError(i, 0, linea.length, 'runtime', mensaje, '');
        this.errores.push(errorObj);
        this.callbacks.onError(i, mensaje);
        break;
      }

      await this._pausa(this.velocidadPausa);
    }

    this.ejecutando = false;
    this.callbacks.onFin();

    return {
      exito: this.errores.length === 0,
      errores: this.errores,
      erroresPorLinea: new Map(),
    };
  }

  detener() {
    this.ejecutando = false;
  }

  getVariables() {
    return { ...this.variables };
  }

  // ===========================================================
  //  DISPATCHER
  // ===========================================================

  async _interpretarInstruccion(linea, lineaIdx) {
    if (/^proceso(\s+\S+)?$/i.test(linea)) return;
    if (/^finproceso$/i.test(linea)) return;
    if (/^definir\s+/i.test(linea)) {
      return this._ejecutarDefinir(linea, lineaIdx);
    }
    if (/^escribir\s+/i.test(linea)) {
      return this._ejecutarEscribir(linea, lineaIdx);
    }
    if (/^leer\s+/i.test(linea)) {
      return await this._ejecutarLeer(linea, lineaIdx);
    }
    if (linea.includes('<-')) {
      return this._ejecutarAsignacion(linea, lineaIdx);
    }
    throw new Error(`Instrucción no reconocida: "${linea}"`);
  }

  // ===========================================================
  //  HANDLERS
  // ===========================================================

  _ejecutarDefinir(linea, lineaIdx) {
    const match = linea.match(/^definir\s+(.+?)\s+como\s+(entero|real|caracter)\s*$/i);
    if (!match) {
      throw new Error('Sintaxis inválida. Use: Definir <var1>, <var2> Como <Entero|Real|Caracter>');
    }

    const listaVars = match[1];
    const tipo = match[2].toLowerCase();
    const nombres = listaVars.split(',').map(n => n.trim().toLowerCase());

    for (const nombre of nombres) {
      if (nombre === '') {
        throw new Error('Nombre de variable vacío en la declaración.');
      }
      if (DocErrores.PALABRAS_RESERVADAS_SET.has(nombre)) {
        throw new Error(`"${nombre}" es una palabra reservada y no puede usarse como variable.`);
      }
      if (this.variables.hasOwnProperty(nombre)) {
        throw new Error(`Variable "${nombre}" ya se encuentra definida.`);
      }

      this.variables[nombre] = {
        tipo,
        valor: this._valorDefault(tipo),
        inicializada: false,
      };
    }
  }

  _ejecutarAsignacion(linea, lineaIdx) {
    const partes = linea.split('<-');
    if (partes.length !== 2) {
      throw new Error('Sintaxis de asignación inválida. Use: variable <- valor');
    }

    const nombre = partes[0].trim().toLowerCase();
    const expresion = partes[1].trim();

    if (!this.variables.hasOwnProperty(nombre)) {
      throw new Error(`Variable "${nombre}" no definida. Use "Definir ${nombre} Como Tipo" primero.`);
    }

    const valor = this._evaluarExpresion(expresion, lineaIdx);
    this.variables[nombre].valor = this._convertirTipo(valor, this.variables[nombre].tipo);
    this.variables[nombre].inicializada = true;
  }

  _ejecutarEscribir(linea, lineaIdx) {
    const contenido = linea.replace(/^escribir\s+/i, '');
    const partes = this._separarPorComas(contenido);
    let salida = '';

    for (const parte of partes) {
      salida += String(this._evaluarExpresion(parte.trim(), lineaIdx));
    }

    this.callbacks.onEscribir(salida);
  }

  async _ejecutarLeer(linea, lineaIdx) {
    const match = linea.match(/^leer\s+(\w+)\s*$/i);
    if (!match) {
      throw new Error('Sintaxis inválida. Use: Leer <variable>');
    }

    const nombre = match[1].toLowerCase();

    if (!this.variables.hasOwnProperty(nombre)) {
      throw new Error(`Variable "${nombre}" no definida. Debe definirla antes de usar Leer.`);
    }

    const valorIngresado = await this.callbacks.onLeer(nombre);

    if (!this.ejecutando) return;

    const tipo = this.variables[nombre].tipo;

    // Validate input matches declared type before accepting
    if (!this._validarEntradaTipo(valorIngresado, tipo)) {
      const tipoLabel = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      throw new Error(
        `El valor ingresado para "${nombre}" no corresponde al tipo ${tipoLabel}.`
      );
    }

    this.variables[nombre].valor = this._convertirTipo(valorIngresado, tipo);
    this.variables[nombre].inicializada = true;

    this.callbacks.onSistema(`  ↳ ${nombre} = ${valorIngresado}`);
  }

  // ===========================================================
  //  EXPRESSION EVALUATOR (Shunting-Yard)
  // ===========================================================

  /**
   * Evaluates an expression string using tokenization + shunting-yard algorithm.
   * Supports: parentheses, +, -, *, /, variables, numbers, strings, concatenation.
   */
  _evaluarExpresion(expr, lineaIdx) {
    const tokens = this._tokenizarExpresion(expr);
    if (tokens.length === 0) {
      throw new Error('Expresión vacía.');
    }

    // Single string literal shortcut
    if (tokens.length === 1 && tokens[0].type === 'string') {
      return tokens[0].value;
    }

    // Shunting-yard
    const outputQueue = [];
    const operatorStack = [];

    const precedencia = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const esOperador = (tk) => tk.type === 'op';

    // Handle unary minus: if '-' appears at start or after '(' or after another operator
    const processedTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      const tk = tokens[i];
      if (tk.type === 'op' && tk.value === '-') {
        const prev = processedTokens[processedTokens.length - 1];
        if (!prev || prev.type === 'op' || prev.type === 'lparen') {
          // Unary minus: convert to (0 - next)
          processedTokens.push({ type: 'number', value: 0 });
          processedTokens.push({ type: 'op', value: '-' });
          continue;
        }
      }
      processedTokens.push(tk);
    }

    for (const tk of processedTokens) {
      if (tk.type === 'number' || tk.type === 'string' || tk.type === 'variable') {
        let val;
        if (tk.type === 'number') {
          val = tk.value;
        } else if (tk.type === 'string') {
          val = tk.value;
        } else {
          // variable
          const nombre = tk.raw.toLowerCase();
          if (!this.variables.hasOwnProperty(nombre)) {
            throw new Error(`Variable "${tk.raw}" no definida.`);
          }
          if (!this.variables[nombre].inicializada) {
            throw new Error(`Variable "${tk.raw}" no inicializada.`);
          }
          val = this.variables[nombre].valor;
        }
        outputQueue.push(val);
      } else if (esOperador(tk)) {
        while (
          operatorStack.length > 0 &&
          esOperador(operatorStack[operatorStack.length - 1]) &&
          precedencia[operatorStack[operatorStack.length - 1].value] >= precedencia[tk.value]
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(tk);
      } else if (tk.type === 'lparen') {
        operatorStack.push(tk);
      } else if (tk.type === 'rparen') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'lparen') {
          outputQueue.push(operatorStack.pop());
        }
        if (operatorStack.length === 0) {
          throw new Error('Paréntesis desbalanceados en la expresión.');
        }
        operatorStack.pop(); // Remove lparen
      }
    }

    while (operatorStack.length > 0) {
      const op = operatorStack.pop();
      if (op.type === 'lparen') {
        throw new Error('Paréntesis desbalanceados en la expresión.');
      }
      outputQueue.push(op);
    }

    // Evaluate RPN
    const evalStack = [];
    for (const item of outputQueue) {
      if (typeof item !== 'object' || item === null) {
        // It's a value (number, string)
        evalStack.push(item);
      } else {
        // It's an operator
        if (evalStack.length < 2) {
          throw new Error('Expresión mal formada.');
        }
        const der = evalStack.pop();
        const izq = evalStack.pop();
        const result = this._aplicarOperador(izq, item.value, der);
        evalStack.push(result);
      }
    }

    if (evalStack.length !== 1) {
      throw new Error('Expresión mal formada.');
    }

    return evalStack[0];
  }

  /**
   * Tokenizes an expression string into typed tokens for the shunting-yard parser.
   */
  _tokenizarExpresion(expr) {
    const tokens = [];
    let i = 0;

    while (i < expr.length) {
      // Skip whitespace
      if (/\s/.test(expr[i])) { i++; continue; }

      // String literal
      if (expr[i] === '"') {
        let j = i + 1;
        while (j < expr.length && expr[j] !== '"') j++;
        if (j < expr.length) j++;
        tokens.push({ type: 'string', value: expr.substring(i + 1, j - 1) });
        i = j;
        continue;
      }

      // Number
      if (/\d/.test(expr[i])) {
        let j = i;
        while (j < expr.length && /\d/.test(expr[j])) j++;
        if (j < expr.length && expr[j] === '.' && /\d/.test(expr[j + 1])) {
          j++;
          while (j < expr.length && /\d/.test(expr[j])) j++;
        }
        const numStr = expr.substring(i, j);
        tokens.push({ type: 'number', value: numStr.includes('.') ? parseFloat(numStr) : parseInt(numStr, 10) });
        i = j;
        continue;
      }

      // Parentheses
      if (expr[i] === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
      if (expr[i] === ')') { tokens.push({ type: 'rparen' }); i++; continue; }

      // Operators
      if ('+-*/'.includes(expr[i])) {
        tokens.push({ type: 'op', value: expr[i] });
        i++;
        continue;
      }

      // Identifier (variable)
      if (/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ_]/.test(expr[i])) {
        let j = i;
        while (j < expr.length && /[\wáéíóúüñÁÉÍÓÚÜÑ]/.test(expr[j])) j++;
        const word = expr.substring(i, j);
        tokens.push({ type: 'variable', raw: word });
        i = j;
        continue;
      }

      throw new Error(`Carácter inesperado en expresión: "${expr[i]}"`);
    }

    return tokens;
  }

  _aplicarOperador(izq, op, der) {
    // String concatenation with +
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
      default:
        throw new Error(`Operador desconocido: "${op}"`);
    }
  }

  // ===========================================================
  //  UTILITIES
  // ===========================================================

  /**
   * Validates that a user-entered string is compatible with the declared type.
   * - Entero: must be a valid integer (digits, optional leading minus)
   * - Real: must be a valid number (integer or decimal, optional leading minus)
   * - Caracter: any text is valid
   * @param {string} valor - raw user input
   * @param {string} tipo - 'entero' | 'real' | 'caracter'
   * @returns {boolean}
   */
  _validarEntradaTipo(valor, tipo) {
    switch (tipo) {
      case 'entero':
        return /^-?\d+$/.test(valor.trim());
      case 'real':
        return /^-?\d+(\.\d+)?$/.test(valor.trim());
      case 'caracter':
        return true;
      default:
        return true;
    }
  }

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

  _valorDefault(tipo) {
    switch (tipo) {
      case 'entero':   return 0;
      case 'real':     return 0.0;
      case 'caracter': return '';
      default:         return null;
    }
  }

  _separarPorComas(texto) {
    const partes = [];
    let actual = '';
    let dentroComillas = false;
    let nivel = 0; // parenthesis depth

    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (c === '"') {
        dentroComillas = !dentroComillas;
        actual += c;
      } else if (!dentroComillas && c === '(') {
        nivel++;
        actual += c;
      } else if (!dentroComillas && c === ')') {
        nivel--;
        actual += c;
      } else if (c === ',' && !dentroComillas && nivel === 0) {
        partes.push(actual);
        actual = '';
      } else {
        actual += c;
      }
    }
    if (actual.trim() !== '') partes.push(actual);
    return partes;
  }

  _pausa(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===========================================================
  //  STATIC HELPERS (backwards compatibility + autocomplete)
  // ===========================================================

  static PALABRAS_RESERVADAS = [
    { texto: 'Definir',  tipo: 'instrucción' },
    { texto: 'Escribir', tipo: 'instrucción' },
    { texto: 'Leer',     tipo: 'instrucción' },
    { texto: 'Como',     tipo: 'palabra clave' },
    { texto: 'Entero',   tipo: 'tipo' },
    { texto: 'Real',     tipo: 'tipo' },
    { texto: 'Caracter', tipo: 'tipo' },
  ];

  static PALABRAS_RESERVADAS_SET = DocErrores.PALABRAS_RESERVADAS_SET;

  static stripComment(linea) {
    return DocErrores.stripComment(linea);
  }

  static extraerVariablesDelCodigo(codigo) {
    return DocErrores.extraerVariablesDelCodigo(codigo);
  }
}
