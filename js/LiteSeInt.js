/**
 * ============================================================
 *  LiteSeInt.js — Motor de Intérprete de Pseudocódigo v2.0
 * ============================================================
 *  Core independiente de la UI.
 *  Depende de doc_errores.js para validación y tokenización.
 *
 *  Tipos soportados: Entero, Real, Caracter, Logico
 *  Instrucciones: Definir, Escribir, Leer, Asignación (=)
 *  Estructuras de control: Si/FinSi, Mientras/FinMientras,
 *    Repetir/HastaQue, Para/FinPara, Segun/FinSegun
 * ============================================================
 */

class LiteSeInt {

  static MAX_ITERACIONES = 100_000;

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

  async ejecutar(codigo) {
    this.variables = {};
    this.errores = [];
    this.ejecutando = true;

    const validacion = DocErrores.validarDocumento(codigo);

    if (validacion.errores.length > 0) {
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

    let nodos;
    try {
      nodos = this._parsear(codigo);
    } catch (err) {
      const mensaje = err.message || String(err);
      const errorObj = DocErrores.crearError(0, 0, 0, 'parse_error', mensaje, '');
      this.errores.push(errorObj);
      this.callbacks.onError(0, mensaje);
      this.ejecutando = false;
      this.callbacks.onFin();
      return { exito: false, errores: this.errores, erroresPorLinea: new Map() };
    }

    try {
      await this._ejecutarBloque(nodos);
    } catch (err) {
      const mensaje = err.message || String(err);
      const lineaErr = err.lineaIdx !== undefined ? err.lineaIdx : 0;
      const errorObj = DocErrores.crearError(lineaErr, 0, 0, 'runtime', mensaje, '');
      this.errores.push(errorObj);
      this.callbacks.onError(lineaErr, mensaje);
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
  //  PARSER — construye AST desde el código fuente
  // ===========================================================

  _parsear(codigo) {
    const lineas = codigo.split('\n');
    const raiz = [];
    // cada frame: { tipo, nodo, parentBloque }
    const stack = [];
    let bloqueActual = raiz;

    for (let i = 0; i < lineas.length; i++) {
      const lineaRaw = lineas[i].trim();
      const linea = DocErrores.stripComment(lineaRaw);
      if (linea === '') continue;

      // Delimitadores de proceso — ignorar
      if (/^proceso(\s+\S+)?$/i.test(linea)) continue;
      if (/^finproceso$/i.test(linea)) continue;

      // ── Si condicion Entonces ──
      if (/^si\s+.+\s+entonces$/i.test(linea)) {
        const condicion = linea.replace(/^si\s+/i, '').replace(/\s+entonces$/i, '').trim();
        const nodo = { tipo: 'si', linea: i, condicion, entonces: [], sino: null };
        if (bloqueActual !== null) bloqueActual.push(nodo);
        stack.push({ tipo: 'si', nodo, parentBloque: bloqueActual });
        bloqueActual = nodo.entonces;
        continue;
      }

      // ── Sino ──
      if (/^sino$/i.test(linea)) {
        const ctx = stack[stack.length - 1];
        if (ctx && ctx.tipo === 'si') {
          ctx.nodo.sino = [];
          bloqueActual = ctx.nodo.sino;
        }
        continue;
      }

      // ── FinSi ──
      if (/^finsi$/i.test(linea)) {
        const ctx = stack.pop();
        bloqueActual = ctx ? ctx.parentBloque : raiz;
        continue;
      }

      // ── Mientras condicion Hacer ──
      if (/^mientras\s+.+\s+hacer$/i.test(linea)) {
        const condicion = linea.replace(/^mientras\s+/i, '').replace(/\s+hacer$/i, '').trim();
        const nodo = { tipo: 'mientras', linea: i, condicion, cuerpo: [] };
        if (bloqueActual !== null) bloqueActual.push(nodo);
        stack.push({ tipo: 'mientras', nodo, parentBloque: bloqueActual });
        bloqueActual = nodo.cuerpo;
        continue;
      }

      // ── FinMientras ──
      if (/^finmientras$/i.test(linea)) {
        const ctx = stack.pop();
        bloqueActual = ctx ? ctx.parentBloque : raiz;
        continue;
      }

      // ── Repetir ──
      if (/^repetir$/i.test(linea)) {
        const nodo = { tipo: 'repetir', linea: i, lineaHastaQue: i, cuerpo: [], condicion: null };
        if (bloqueActual !== null) bloqueActual.push(nodo);
        stack.push({ tipo: 'repetir', nodo, parentBloque: bloqueActual });
        bloqueActual = nodo.cuerpo;
        continue;
      }

      // ── HastaQue condicion (alias: "Hasta Que condicion") ──
      const hqMatch = linea.match(DocErrores.REGEX_HASTAQUE_LINEA);
      if (hqMatch) {
        const condicion = hqMatch[1].trim();
        const ctx = stack[stack.length - 1];
        if (ctx && ctx.tipo === 'repetir') {
          ctx.nodo.condicion = condicion;
          ctx.nodo.lineaHastaQue = i;
          const parentBloque = ctx.parentBloque;
          stack.pop();
          bloqueActual = parentBloque;
        }
        continue;
      }

      // ── Para var = inicio Hasta fin [Con Paso paso] Hacer ──
      const paraMatch = linea.match(
        /^para\s+(\w+)\s*=(?!=)\s*(.+?)\s+hasta\s+(.+?)(?:\s+con\s+paso\s+(.+?))?\s+hacer$/i
      );
      if (paraMatch) {
        const nodo = {
          tipo: 'para',
          linea: i,
          variable: paraMatch[1].toLowerCase(),
          variableOriginal: paraMatch[1],
          desde: paraMatch[2].trim(),
          hasta: paraMatch[3].trim(),
          paso: (paraMatch[4] || '1').trim(),
          cuerpo: [],
        };
        if (bloqueActual !== null) bloqueActual.push(nodo);
        stack.push({ tipo: 'para', nodo, parentBloque: bloqueActual });
        bloqueActual = nodo.cuerpo;
        continue;
      }

      // ── FinPara ──
      if (/^finpara$/i.test(linea)) {
        const ctx = stack.pop();
        bloqueActual = ctx ? ctx.parentBloque : raiz;
        continue;
      }

      // ── Segun variable Hacer ──
      if (/^segun\s+\w+\s+hacer$/i.test(linea)) {
        const varMatch = linea.match(/^segun\s+(\w+)\s+hacer$/i);
        const nodo = {
          tipo: 'segun',
          linea: i,
          variable: varMatch[1].toLowerCase(),
          casos: [],
          otro: null,
        };
        if (bloqueActual !== null) bloqueActual.push(nodo);
        stack.push({ tipo: 'segun', nodo, parentBloque: bloqueActual });
        bloqueActual = null; // espera etiqueta de caso
        continue;
      }

      // ── De Otro Modo: ──
      if (/^de\s+otro\s+modo\s*:$/i.test(linea)) {
        const ctx = stack[stack.length - 1];
        if (ctx && ctx.tipo === 'segun') {
          ctx.nodo.otro = [];
          bloqueActual = ctx.nodo.otro;
        }
        continue;
      }

      // ── FinSegun ──
      if (/^finsegun$/i.test(linea)) {
        const ctx = stack.pop();
        bloqueActual = ctx ? ctx.parentBloque : raiz;
        continue;
      }

      // ── Etiqueta de caso dentro de Segun: "val:" o "val1, val2:" ──
      const ctxTop = stack[stack.length - 1];
      if (ctxTop && ctxTop.tipo === 'segun') {
        const casoMatch = linea.match(/^([^:]+):\s*(.*)$/);
        if (casoMatch) {
          const valores = casoMatch[1].split(',').map(v => v.trim());
          const casoNodo = { valores, cuerpo: [] };
          ctxTop.nodo.casos.push(casoNodo);
          bloqueActual = casoNodo.cuerpo;
          const restLinea = casoMatch[2].trim();
          if (restLinea) {
            const instrNodo = this._crearNodoSimple(restLinea, i);
            if (instrNodo) bloqueActual.push(instrNodo);
          }
          continue;
        }
      }

      // ── Instrucción simple ──
      if (bloqueActual !== null) {
        const nodo = this._crearNodoSimple(linea, i);
        if (nodo) bloqueActual.push(nodo);
      }
    }

    return raiz;
  }

  _crearNodoSimple(linea, lineaIdx) {
    if (/^definir\s+/i.test(linea))  return { tipo: 'definir',    linea: lineaIdx, texto: linea };
    if (/^escribir\s+/i.test(linea)) return { tipo: 'escribir',   linea: lineaIdx, texto: linea };
    if (/^leer\s+/i.test(linea))     return { tipo: 'leer',       linea: lineaIdx, texto: linea };
    if (this._encontrarPosAsignacion(linea) >= 0)
                                      return { tipo: 'asignacion', linea: lineaIdx, texto: linea };
    return { tipo: 'desconocido', linea: lineaIdx, texto: linea };
  }

  // Busca la posición del "=" de asignación respetando strings.
  // Ignora "==", "<=", ">=", "!=" (operadores relacionales).
  _encontrarPosAsignacion(linea) {
    let inStr = false;
    for (let i = 0; i < linea.length; i++) {
      const ch = linea[i];
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '=') {
        const prev = linea[i - 1];
        const next = linea[i + 1];
        if (prev === '=' || prev === '<' || prev === '>' || prev === '!') continue;
        if (next === '=') { i++; continue; }
        return i;
      }
    }
    return -1;
  }

  // ===========================================================
  //  EJECUTOR DE BLOQUES
  // ===========================================================

  async _ejecutarBloque(nodos) {
    for (const nodo of nodos) {
      if (!this.ejecutando) break;
      await this._ejecutarNodo(nodo);
    }
  }

  async _ejecutarNodo(nodo) {
    if (!this.ejecutando) return;
    try {
      switch (nodo.tipo) {
        case 'definir':
          this.callbacks.onLineaActiva(nodo.linea);
          await this._pausa(this.velocidadPausa);
          return this._ejecutarDefinir(nodo.texto, nodo.linea);

        case 'escribir':
          this.callbacks.onLineaActiva(nodo.linea);
          await this._pausa(this.velocidadPausa);
          return this._ejecutarEscribir(nodo.texto, nodo.linea);

        case 'leer':
          this.callbacks.onLineaActiva(nodo.linea);
          return await this._ejecutarLeer(nodo.texto, nodo.linea);

        case 'asignacion':
          this.callbacks.onLineaActiva(nodo.linea);
          await this._pausa(this.velocidadPausa);
          return this._ejecutarAsignacion(nodo.texto, nodo.linea);

        case 'si':
          return await this._ejecutarSi(nodo);

        case 'mientras':
          return await this._ejecutarMientras(nodo);

        case 'repetir':
          return await this._ejecutarRepetir(nodo);

        case 'para':
          return await this._ejecutarPara(nodo);

        case 'segun':
          return await this._ejecutarSegun(nodo);

        case 'desconocido':
          this.callbacks.onLineaActiva(nodo.linea);
          throw new Error(`Instrucción no reconocida: "${nodo.texto}"`);
      }
    } catch (err) {
      if (err.lineaIdx === undefined) err.lineaIdx = nodo.linea;
      throw err;
    }
  }

  // ===========================================================
  //  EJECUTORES DE ESTRUCTURAS
  // ===========================================================

  async _ejecutarSi(nodo) {
    this.callbacks.onLineaActiva(nodo.linea);
    await this._pausa(this.velocidadPausa);
    if (!this.ejecutando) return;

    const cond = this._evaluarCondicion(nodo.condicion, nodo.linea);
    if (cond) {
      await this._ejecutarBloque(nodo.entonces);
    } else if (nodo.sino !== null) {
      await this._ejecutarBloque(nodo.sino);
    }
  }

  async _ejecutarMientras(nodo) {
    let iter = 0;
    while (this.ejecutando) {
      this.callbacks.onLineaActiva(nodo.linea);
      await this._pausa(this.velocidadPausa);
      if (!this.ejecutando) break;

      if (!this._evaluarCondicion(nodo.condicion, nodo.linea)) break;

      await this._ejecutarBloque(nodo.cuerpo);
      iter++;
      if (iter >= LiteSeInt.MAX_ITERACIONES) {
        throw new Error(`Bucle infinito: más de ${LiteSeInt.MAX_ITERACIONES} iteraciones.`);
      }
    }
  }

  async _ejecutarRepetir(nodo) {
    if (nodo.condicion === null) {
      throw new Error('Bloque Repetir sin HastaQue correspondiente.');
    }
    let iter = 0;
    do {
      if (!this.ejecutando) break;
      await this._ejecutarBloque(nodo.cuerpo);
      if (!this.ejecutando) break;

      this.callbacks.onLineaActiva(nodo.lineaHastaQue);
      await this._pausa(this.velocidadPausa);

      iter++;
      if (iter >= LiteSeInt.MAX_ITERACIONES) {
        throw new Error(`Bucle infinito: más de ${LiteSeInt.MAX_ITERACIONES} iteraciones.`);
      }
    } while (this.ejecutando && !this._evaluarCondicion(nodo.condicion, nodo.lineaHastaQue));
  }

  async _ejecutarPara(nodo) {
    const varNombre = nodo.variable;

    if (!this.variables.hasOwnProperty(varNombre)) {
      throw new Error(
        `Variable "${nodo.variableOriginal}" no definida. ` +
        `Use "Definir ${nodo.variableOriginal} Como Entero" antes del Para.`
      );
    }

    const desde = this._evaluarExpresion(nodo.desde, nodo.linea);
    const hasta  = this._evaluarExpresion(nodo.hasta,  nodo.linea);
    const paso   = this._evaluarExpresion(nodo.paso,   nodo.linea);

    if (paso === 0) throw new Error('El paso del bucle Para no puede ser cero.');

    this.variables[varNombre].valor = desde;
    this.variables[varNombre].inicializada = true;

    const avanza = paso > 0
      ? () => this.variables[varNombre].valor <= hasta
      : () => this.variables[varNombre].valor >= hasta;

    let iter = 0;
    while (this.ejecutando && avanza()) {
      this.callbacks.onLineaActiva(nodo.linea);
      await this._pausa(this.velocidadPausa);
      if (!this.ejecutando) break;

      await this._ejecutarBloque(nodo.cuerpo);

      this.variables[varNombre].valor += paso;
      iter++;
      if (iter >= LiteSeInt.MAX_ITERACIONES) {
        throw new Error(`Bucle infinito: más de ${LiteSeInt.MAX_ITERACIONES} iteraciones.`);
      }
    }
  }

  async _ejecutarSegun(nodo) {
    const varNombre = nodo.variable;

    if (!this.variables.hasOwnProperty(varNombre)) {
      throw new Error(`Variable "${varNombre}" no definida.`);
    }
    if (!this.variables[varNombre].inicializada) {
      throw new Error(`Variable "${varNombre}" no inicializada.`);
    }

    const valor = this.variables[varNombre].valor;

    this.callbacks.onLineaActiva(nodo.linea);
    await this._pausa(this.velocidadPausa);
    if (!this.ejecutando) return;

    let ejecutado = false;
    for (const caso of nodo.casos) {
      if (ejecutado) break;
      for (const v of caso.valores) {
        const valorCaso = this._evaluarExpresion(v.trim(), nodo.linea);
        // loose equality para comparar números y strings sin importar tipo
        if (valor == valorCaso) {
          await this._ejecutarBloque(caso.cuerpo);
          ejecutado = true;
          break;
        }
      }
    }

    if (!ejecutado && nodo.otro !== null) {
      await this._ejecutarBloque(nodo.otro);
    }
  }

  // ===========================================================
  //  EVALUADOR DE CONDICIONES
  // ===========================================================

  _evaluarCondicion(condStr, lineaIdx) {
    condStr = condStr.trim();

    // O (OR) — menor precedencia
    const partesO = this._splitByLogOp(condStr, 'O');
    if (partesO.length > 1) {
      for (const p of partesO) {
        if (this._evaluarCondicion(p, lineaIdx)) return true;
      }
      return false;
    }

    // Y (AND)
    const partesY = this._splitByLogOp(condStr, 'Y');
    if (partesY.length > 1) {
      for (const p of partesY) {
        if (!this._evaluarCondicion(p, lineaIdx)) return false;
      }
      return true;
    }

    // No (NOT) — prefijo unario
    if (/^no\s+/i.test(condStr)) {
      return !this._evaluarCondicion(condStr.replace(/^no\s+/i, '').trim(), lineaIdx);
    }

    // Eliminar paréntesis externos
    if (condStr.startsWith('(') && condStr.endsWith(')')) {
      return this._evaluarCondicion(condStr.slice(1, -1), lineaIdx);
    }

    // Operadores relacionales: ==, !=, <=, >=, <>, <, >
    const m = condStr.match(/^(.*?)\s*(==|!=|<=|>=|<>|<|>)\s*(.+)$/);
    if (m) {
      const izq = this._evaluarExpresion(m[1].trim(), lineaIdx);
      const der = this._evaluarExpresion(m[3].trim(), lineaIdx);
      return this._aplicarRelop(izq, m[2], der);
    }

    // Fallback: coerción booleana
    return Boolean(this._evaluarExpresion(condStr, lineaIdx));
  }

  _aplicarRelop(izq, op, der) {
    switch (op) {
      case '==': return izq == der;
      case '!=': return izq != der;
      case '<>': return izq != der;
      case '<':  return izq < der;
      case '>':  return izq > der;
      case '<=': return izq <= der;
      case '>=': return izq >= der;
      default:   throw new Error(`Operador relacional desconocido: "${op}"`);
    }
  }

  // Divide condStr por operador lógico op ('Y' u 'O'), respetando strings y paréntesis
  _splitByLogOp(condStr, op) {
    const result = [];
    let current = '';
    let depth = 0;
    let inStr = false;
    let i = 0;

    while (i < condStr.length) {
      if (condStr[i] === '"') {
        inStr = !inStr;
        current += condStr[i++];
        continue;
      }
      if (inStr) { current += condStr[i++]; continue; }
      if (condStr[i] === '(') { depth++; current += condStr[i++]; continue; }
      if (condStr[i] === ')') { depth--; current += condStr[i++]; continue; }

      if (depth === 0 && condStr[i] === ' ') {
        const ahead = condStr.slice(i + 1);
        const re = new RegExp(`^${op}\\s+`, 'i');
        const match = ahead.match(re);
        if (match) {
          result.push(current.trim());
          current = '';
          i += 1 + match[0].length;
          continue;
        }
      }
      current += condStr[i++];
    }
    if (current.trim()) result.push(current.trim());
    return result.length >= 2 ? result : [condStr];
  }

  // ===========================================================
  //  HANDLERS (lógica interna sin cambios)
  // ===========================================================

  _ejecutarDefinir(linea, lineaIdx) {
    const match = linea.match(/^definir\s+(.+?)\s+como\s+(entero|real|caracter|logico)\s*$/i);
    if (!match) {
      throw new Error('Sintaxis inválida. Use: Definir <var1>, <var2> Como <Entero|Real|Caracter|Logico>');
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
    const pos = this._encontrarPosAsignacion(linea);
    if (pos < 0) {
      throw new Error('Sintaxis de asignación inválida. Use: variable = valor');
    }

    const nombre = linea.substring(0, pos).trim().toLowerCase();
    const expresion = linea.substring(pos + 1).trim();

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
      salida += this._formatearSalida(this._evaluarExpresion(parte.trim(), lineaIdx));
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
  //  EVALUADOR DE EXPRESIONES
  //
  //  Pipeline en cuatro etapas (cada una es un helper aislado):
  //
  //    1) _tokenizarExpresion  →  tokens crudos
  //    2) _normalizarTokens    →  resuelve menos unario y simétricos
  //    3) _parsearRPN          →  Shunting-Yard con metadata de operadores
  //                               y soporte de llamadas a funciones
  //    4) _evaluarRPN          →  recorre la cola en notación postfija
  //
  //  La metadata de operadores binarios vive en LiteSeInt._OPERADORES.
  //  El registro de funciones nativas vive en LiteSeInt._FUNCIONES_NATIVAS.
  //  En 0.5.0 el registro está vacío; 0.5.1 (Abs, Redon, Trunc, mod, ^)
  //  y 0.5.2 (Longitud, Mayusculas, Minusculas) sólo deben tocar esas
  //  tablas para extender el lenguaje.
  // ===========================================================

  _evaluarExpresion(expr, lineaIdx) {
    expr = expr.trim();
    if (expr === '') throw new Error('Expresión vacía.');

    // Operador lógico unario "No <expr>" como prefijo (fuera de strings).
    // Se resuelve en este nivel para mantener una semántica consistente
    // con _evaluarCondicion sin contaminar el pipeline aritmético.
    if (/^no\s+/i.test(expr)) {
      const sub = this._evaluarExpresion(expr.replace(/^no\s+/i, '').trim(), lineaIdx);
      return !Boolean(sub);
    }

    const tokens       = this._tokenizarExpresion(expr);
    const normalizados = this._normalizarTokens(tokens);
    const rpn          = this._parsearRPN(normalizados);
    return this._evaluarRPN(rpn, lineaIdx);
  }

  // ── Etapa 1: Tokenización ────────────────────────────────
  //
  // Reconoce: números (enteros y reales), cadenas con comillas dobles,
  // booleanos (Verdadero / Falso), variables, llamadas a función
  // (Identificador seguido de "("), operadores aritméticos, paréntesis
  // y comas.
  //
  // El reconocimiento del patrón Identificador(...) se hace aquí con
  // look-ahead — el parser sólo necesita decidir cómo combinarlos.
  _tokenizarExpresion(expr) {
    const tokens = [];
    let i = 0;

    while (i < expr.length) {
      if (/\s/.test(expr[i])) { i++; continue; }

      // Cadena
      if (expr[i] === '"') {
        let j = i + 1;
        while (j < expr.length && expr[j] !== '"') j++;
        if (j >= expr.length) {
          throw new Error('Texto sin cerrar con comillas dobles.');
        }
        tokens.push({ tipo: 'cadena', valor: expr.substring(i + 1, j) });
        i = j + 1;
        continue;
      }

      // Número
      if (/\d/.test(expr[i])) {
        let j = i;
        while (j < expr.length && /\d/.test(expr[j])) j++;
        if (j < expr.length && expr[j] === '.' && /\d/.test(expr[j + 1])) {
          j++;
          while (j < expr.length && /\d/.test(expr[j])) j++;
        }
        const numStr = expr.substring(i, j);
        tokens.push({
          tipo: 'numero',
          valor: numStr.includes('.') ? parseFloat(numStr) : parseInt(numStr, 10),
        });
        i = j;
        continue;
      }

      if (expr[i] === '(') { tokens.push({ tipo: 'lparen' }); i++; continue; }
      if (expr[i] === ')') { tokens.push({ tipo: 'rparen' }); i++; continue; }
      if (expr[i] === ',') { tokens.push({ tipo: 'coma'   }); i++; continue; }

      if ('+-*/^'.includes(expr[i])) {
        tokens.push({ tipo: 'op', valor: expr[i] });
        i++;
        continue;
      }

      // Identificador, booleano o llamada a función
      if (/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ_]/.test(expr[i])) {
        let j = i;
        while (j < expr.length && /[\wáéíóúüñÁÉÍÓÚÜÑ]/.test(expr[j])) j++;
        const palabra = expr.substring(i, j);
        const lw = palabra.toLowerCase();

        if (lw === 'verdadero') {
          tokens.push({ tipo: 'booleano', valor: true });
        } else if (lw === 'falso') {
          tokens.push({ tipo: 'booleano', valor: false });
        } else if (lw === 'mod') {
          // Operador binario en forma de palabra. Se trata como cualquier
          // otro operador para que el shunting-yard aplique precedencia.
          tokens.push({ tipo: 'op', valor: 'mod' });
        } else {
          // Look-ahead: si lo sigue "(" (con o sin espacios), es una
          // llamada a función. El "(" se mantiene como token aparte
          // para que el parser arme la lista de argumentos.
          let k = j;
          while (k < expr.length && /\s/.test(expr[k])) k++;
          if (k < expr.length && expr[k] === '(') {
            tokens.push({ tipo: 'funcion', nombre: palabra });
          } else {
            tokens.push({ tipo: 'variable', nombre: palabra });
          }
        }
        i = j;
        continue;
      }

      throw new Error(`Carácter inesperado en expresión: "${expr[i]}".`);
    }

    return tokens;
  }

  // ── Etapa 2: Normalización ───────────────────────────────
  //
  // Único caso por ahora: convertir el menos unario en "0 - x" para
  // que el parser binario funcione sin reglas especiales.
  // (Cuando 0.5.1 agregue potencia, este es el lugar donde sumar
  // soporte para "+x" si se decidiera tratarlo como unario.)
  _normalizarTokens(tokens) {
    const out = [];
    for (const tk of tokens) {
      if (tk.tipo === 'op' && tk.valor === '-') {
        const prev = out[out.length - 1];
        const enInicio = !prev;
        const trasOperador = prev && (
          prev.tipo === 'op' || prev.tipo === 'lparen' || prev.tipo === 'coma'
        );
        if (enInicio || trasOperador) {
          out.push({ tipo: 'numero', valor: 0 });
        }
      }
      out.push(tk);
    }
    return out;
  }

  // ── Etapa 3: Parseo a RPN (Shunting-Yard) ────────────────
  //
  // Maneja precedencia y asociatividad consultando _OPERADORES,
  // y soporta llamadas a función con cualquier aridad. El resultado
  // es una cola en notación postfija que el evaluador puede recorrer
  // linealmente.
  _parsearRPN(tokens) {
    const output      = [];
    const operadores  = []; // pila de operadores / lparen / funcion
    const argCount    = []; // arity stack: cuántos argumentos vistos
    const argSeen     = []; // ¿hubo contenido en el argumento actual?

    const popHastaLparen = () => {
      while (operadores.length > 0 && operadores[operadores.length - 1].tipo !== 'lparen') {
        output.push(operadores.pop());
      }
      if (operadores.length === 0) {
        throw new Error('Paréntesis desbalanceados: falta "(" en la expresión.');
      }
    };

    let prev = null;

    for (const tk of tokens) {
      if (tk.tipo === 'numero' || tk.tipo === 'cadena' ||
          tk.tipo === 'booleano' || tk.tipo === 'variable') {
        output.push(tk);
        if (argSeen.length > 0) argSeen[argSeen.length - 1] = true;
      }
      else if (tk.tipo === 'funcion') {
        operadores.push(tk);
      }
      else if (tk.tipo === 'op') {
        const meta = LiteSeInt._OPERADORES[tk.valor];
        if (!meta) throw new Error(`Operador desconocido: "${tk.valor}".`);
        if (!prev || prev.tipo === 'op' || prev.tipo === 'lparen' || prev.tipo === 'coma') {
          throw new Error(`Operador "${tk.valor}" en posición inválida.`);
        }
        while (operadores.length > 0) {
          const top = operadores[operadores.length - 1];
          if (top.tipo !== 'op') break;
          const topMeta = LiteSeInt._OPERADORES[top.valor];
          const desplazaIzq = meta.asociatividad === 'izq' && topMeta.precedencia >= meta.precedencia;
          const desplazaDer = meta.asociatividad === 'der' && topMeta.precedencia >  meta.precedencia;
          if (desplazaIzq || desplazaDer) output.push(operadores.pop());
          else break;
        }
        operadores.push(tk);
      }
      else if (tk.tipo === 'lparen') {
        operadores.push(tk);
        const debajo = operadores[operadores.length - 2];
        if (debajo && debajo.tipo === 'funcion') {
          argCount.push(0);
          argSeen.push(false);
        }
      }
      else if (tk.tipo === 'coma') {
        if (argSeen.length === 0) {
          throw new Error('Coma inesperada fuera de una llamada a función.');
        }
        popHastaLparen();
        if (!argSeen[argSeen.length - 1]) {
          // El nombre de la función vive justo debajo del lparen actual.
          const lparenIdx = operadores.length - 1;
          const fnTok = operadores[lparenIdx - 1];
          const nombreFn = fnTok && fnTok.tipo === 'funcion' ? fnTok.nombre : null;
          throw new Error(
            nombreFn
              ? `Argumento vacío antes de "," en la llamada a "${nombreFn}".`
              : 'Argumento vacío antes de "," en la llamada a función.'
          );
        }
        argCount[argCount.length - 1]++;
        argSeen[argSeen.length - 1] = false;
      }
      else if (tk.tipo === 'rparen') {
        popHastaLparen();
        operadores.pop(); // descarta "("
        const top = operadores[operadores.length - 1];
        if (top && top.tipo === 'funcion') {
          const huboArg = argSeen.pop();
          let n = argCount.pop();
          if (n > 0 && !huboArg) {
            throw new Error(`Argumento vacío antes de ")" en la llamada a "${top.nombre}".`);
          }
          if (huboArg) n++;
          operadores.pop();
          output.push({ tipo: 'funcion', nombre: top.nombre, aridad: n });
          // El valor producido por esta llamada cuenta como contenido
          // del argumento del posible call exterior (llamadas anidadas).
          if (argSeen.length > 0) argSeen[argSeen.length - 1] = true;
        }
      }
      prev = tk;
    }

    if (prev && prev.tipo === 'op') {
      throw new Error(`Falta operando después de "${prev.valor}".`);
    }

    while (operadores.length > 0) {
      const top = operadores.pop();
      if (top.tipo === 'lparen') {
        throw new Error('Paréntesis desbalanceados: falta ")" en la expresión.');
      }
      if (top.tipo === 'funcion') {
        throw new Error(`Llamada a "${top.nombre}" sin cerrar con ")".`);
      }
      output.push(top);
    }

    return output;
  }

  // ── Etapa 4: Evaluación de la RPN ────────────────────────
  //
  // Recorre la cola postfija aplicando operadores y funciones.
  // Es el único punto donde se materializa el valor de una variable,
  // se invoca una función nativa o se aplica un operador binario.
  _evaluarRPN(rpn, lineaIdx) {
    if (rpn.length === 0) throw new Error('Expresión vacía.');

    const stack = [];

    for (const tk of rpn) {
      if (tk.tipo === 'numero' || tk.tipo === 'cadena' || tk.tipo === 'booleano') {
        stack.push(tk.valor);
      }
      else if (tk.tipo === 'variable') {
        const key = tk.nombre.toLowerCase();
        if (!this.variables.hasOwnProperty(key)) {
          throw new Error(`Variable "${tk.nombre}" no definida.`);
        }
        if (!this.variables[key].inicializada) {
          throw new Error(`Variable "${tk.nombre}" no inicializada.`);
        }
        stack.push(this.variables[key].valor);
      }
      else if (tk.tipo === 'op') {
        if (stack.length < 2) {
          throw new Error(`Expresión mal formada cerca de "${tk.valor}".`);
        }
        const der = stack.pop();
        const izq = stack.pop();
        const meta = LiteSeInt._OPERADORES[tk.valor];
        stack.push(meta.aplicar(izq, der));
      }
      else if (tk.tipo === 'funcion') {
        const fn = LiteSeInt._FUNCIONES_NATIVAS[tk.nombre.toLowerCase()];
        if (!fn) {
          throw new Error(`Función "${tk.nombre}" no reconocida.`);
        }
        if (stack.length < tk.aridad) {
          throw new Error(`Llamada a "${tk.nombre}" mal formada.`);
        }
        if (tk.aridad < fn.aridadMin || tk.aridad > fn.aridadMax) {
          const esperados = fn.aridadMin === fn.aridadMax
            ? `${fn.aridadMin}`
            : `${fn.aridadMin} a ${fn.aridadMax}`;
          throw new Error(
            `La función "${tk.nombre}" espera ${esperados} argumento(s), recibió ${tk.aridad}.`
          );
        }
        const args = new Array(tk.aridad);
        for (let i = tk.aridad - 1; i >= 0; i--) args[i] = stack.pop();
        stack.push(fn.aplicar(args, { lineaIdx, runtime: this }));
      }
    }

    if (stack.length !== 1) throw new Error('Expresión mal formada.');
    return stack[0];
  }

  // ===========================================================
  //  UTILIDADES
  // ===========================================================

  _validarEntradaTipo(valor, tipo) {
    switch (tipo) {
      case 'entero':
        return /^-?\d+$/.test(valor.trim());
      case 'real':
        return /^-?\d+(\.\d+)?$/.test(valor.trim());
      case 'caracter':
        return true;
      case 'logico': {
        const v = String(valor).trim().toLowerCase();
        return v === 'verdadero' || v === 'falso' || v === 'true' || v === 'false';
      }
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
      case 'logico': {
        if (typeof valor === 'boolean') return valor;
        const v = String(valor).trim().toLowerCase();
        if (v === 'verdadero' || v === 'true')  return true;
        if (v === 'falso'     || v === 'false') return false;
        throw new Error(`No se puede convertir "${valor}" a Logico.`);
      }
      default:
        return valor;
    }
  }

  _valorDefault(tipo) {
    switch (tipo) {
      case 'entero':   return 0;
      case 'real':     return 0.0;
      case 'caracter': return '';
      case 'logico':   return false;
      default:         return null;
    }
  }

  // Formatea el valor para Escribir. Los booleanos se muestran como
  // "Verdadero" / "Falso" (forma oficial del lenguaje), no "true"/"false".
  _formatearSalida(v) {
    if (v === true)  return 'Verdadero';
    if (v === false) return 'Falso';
    return String(v);
  }

  _separarPorComas(texto) {
    const partes = [];
    let actual = '';
    let dentroComillas = false;
    let nivel = 0;

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
  //  STATIC HELPERS (compatibilidad + autocompletado)
  // ===========================================================

  // ===========================================================
  //  TABLAS DE METADATA DEL EVALUADOR
  // ===========================================================
  //
  // Operadores binarios. Centralizar la metadata aquí permite que
  // 0.5.1 agregue `mod` y potencia tocando sólo esta tabla y el
  // tokenizador, sin volver a tocar el shunting-yard.
  static _OPERADORES = {
    '+': {
      precedencia: 1,
      asociatividad: 'izq',
      aplicar: (a, b) => {
        if (typeof a === 'string' || typeof b === 'string') {
          return String(a) + String(b);
        }
        return a + b;
      },
    },
    '-': {
      precedencia: 1,
      asociatividad: 'izq',
      aplicar: (a, b) => {
        if (typeof a === 'string' || typeof b === 'string') {
          throw new Error('Operación aritmética "-" no válida con cadenas.');
        }
        return a - b;
      },
    },
    '*': {
      precedencia: 2,
      asociatividad: 'izq',
      aplicar: (a, b) => {
        if (typeof a === 'string' || typeof b === 'string') {
          throw new Error('Operación aritmética "*" no válida con cadenas.');
        }
        return a * b;
      },
    },
    '/': {
      precedencia: 2,
      asociatividad: 'izq',
      aplicar: (a, b) => {
        if (typeof a === 'string' || typeof b === 'string') {
          throw new Error('Operación aritmética "/" no válida con cadenas.');
        }
        if (b === 0) throw new Error('División por cero.');
        return a / b;
      },
    },
    'mod': {
      precedencia: 2,
      asociatividad: 'izq',
      aplicar: (a, b) => {
        if (typeof a !== 'number' || typeof b !== 'number') {
          throw new Error('Operador "mod" requiere operandos numéricos.');
        }
        if (b === 0) throw new Error('División por cero en operación "mod".');
        return a % b;
      },
    },
    '^': {
      precedencia: 3,
      asociatividad: 'der',
      aplicar: (a, b) => {
        if (typeof a !== 'number' || typeof b !== 'number') {
          throw new Error('Operador "^" requiere operandos numéricos.');
        }
        return Math.pow(a, b);
      },
    },
  };

  // Registro de funciones nativas. Forma esperada de cada entrada:
  //
  //   nombre: { aridadMin, aridadMax, aplicar(args, ctx) }
  //
  // donde `args` es el arreglo de argumentos ya evaluados y `ctx`
  // expone `{ lineaIdx, runtime }` por si una función necesitara
  // contexto extra al lanzar errores. Las claves se almacenan en
  // minúsculas; el evaluador normaliza el nombre antes de buscar.
  static _FUNCIONES_NATIVAS = {
    abs: {
      aridadMin: 1,
      aridadMax: 1,
      aplicar: (args) => {
        const x = args[0];
        if (typeof x !== 'number') {
          throw new Error('La función "Abs" requiere un argumento numérico.');
        }
        return Math.abs(x);
      },
    },
    redon: {
      aridadMin: 1,
      aridadMax: 1,
      aplicar: (args) => {
        const x = args[0];
        if (typeof x !== 'number') {
          throw new Error('La función "Redon" requiere un argumento numérico.');
        }
        return Math.round(x);
      },
    },
    trunc: {
      aridadMin: 1,
      aridadMax: 1,
      aplicar: (args) => {
        const x = args[0];
        if (typeof x !== 'number') {
          throw new Error('La función "Trunc" requiere un argumento numérico.');
        }
        return Math.trunc(x);
      },
    },
    longitud: {
      aridadMin: 1,
      aridadMax: 1,
      aplicar: (args) => {
        const x = args[0];
        if (typeof x !== 'string') {
          throw new Error('La función "Longitud" requiere un argumento de tipo Caracter.');
        }
        return x.length;
      },
    },
    mayusculas: {
      aridadMin: 1,
      aridadMax: 1,
      aplicar: (args) => {
        const x = args[0];
        if (typeof x !== 'string') {
          throw new Error('La función "Mayusculas" requiere un argumento de tipo Caracter.');
        }
        return x.toUpperCase();
      },
    },
    minusculas: {
      aridadMin: 1,
      aridadMax: 1,
      aplicar: (args) => {
        const x = args[0];
        if (typeof x !== 'string') {
          throw new Error('La función "Minusculas" requiere un argumento de tipo Caracter.');
        }
        return x.toLowerCase();
      },
    },
  };

  static PALABRAS_RESERVADAS = [
    { texto: 'Definir',     tipo: 'instrucción' },
    { texto: 'Escribir',    tipo: 'instrucción' },
    { texto: 'Leer',        tipo: 'instrucción' },
    { texto: 'Como',        tipo: 'palabra clave' },
    { texto: 'Entero',      tipo: 'tipo' },
    { texto: 'Real',        tipo: 'tipo' },
    { texto: 'Caracter',    tipo: 'tipo' },
    { texto: 'Logico',      tipo: 'tipo' },
    { texto: 'Verdadero',   tipo: 'literal' },
    { texto: 'Falso',       tipo: 'literal' },
    { texto: 'Si',          tipo: 'estructura' },
    { texto: 'Entonces',    tipo: 'palabra clave' },
    { texto: 'Sino',        tipo: 'estructura' },
    { texto: 'FinSi',       tipo: 'estructura' },
    { texto: 'Mientras',    tipo: 'estructura' },
    { texto: 'Hacer',       tipo: 'palabra clave' },
    { texto: 'FinMientras', tipo: 'estructura' },
    { texto: 'Repetir',     tipo: 'estructura' },
    { texto: 'HastaQue',    tipo: 'estructura' },
    { texto: 'Para',        tipo: 'estructura' },
    { texto: 'Hasta',       tipo: 'palabra clave' },
    { texto: 'Con',         tipo: 'palabra clave' },
    { texto: 'Paso',        tipo: 'palabra clave' },
    { texto: 'FinPara',     tipo: 'estructura' },
    { texto: 'Segun',       tipo: 'estructura' },
    { texto: 'FinSegun',    tipo: 'estructura' },
    { texto: 'mod',         tipo: 'operador' },
    { texto: 'Abs',         tipo: 'función' },
    { texto: 'Redon',       tipo: 'función' },
    { texto: 'Trunc',       tipo: 'función' },
    { texto: 'Longitud',    tipo: 'función' },
    { texto: 'Mayusculas',  tipo: 'función' },
    { texto: 'Minusculas',  tipo: 'función' },
  ];

  static PALABRAS_RESERVADAS_SET = DocErrores.PALABRAS_RESERVADAS_SET;

  static stripComment(linea) {
    return DocErrores.stripComment(linea);
  }

  static extraerVariablesDelCodigo(codigo) {
    return DocErrores.extraerVariablesDelCodigo(codigo);
  }
}
