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
  //  EVALUADOR DE EXPRESIONES (Shunting-Yard)
  // ===========================================================

  _evaluarExpresion(expr, lineaIdx) {
    expr = expr.trim();

    // Operador lógico unario "No <expr>" como prefijo (fuera de strings).
    // Misma semántica que en _evaluarCondicion para mantener consistencia.
    if (/^no\s+/i.test(expr)) {
      const sub = this._evaluarExpresion(expr.replace(/^no\s+/i, '').trim(), lineaIdx);
      return !Boolean(sub);
    }

    const tokens = this._tokenizarExpresion(expr);
    if (tokens.length === 0) {
      throw new Error('Expresión vacía.');
    }

    if (tokens.length === 1 && tokens[0].type === 'string') {
      return tokens[0].value;
    }

    if (tokens.length === 1 && tokens[0].type === 'boolean') {
      return tokens[0].value;
    }

    const outputQueue = [];
    const operatorStack = [];

    const precedencia = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const esOperador = (tk) => tk.type === 'op';

    // Manejo de menos unario
    const processedTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      const tk = tokens[i];
      if (tk.type === 'op' && tk.value === '-') {
        const prev = processedTokens[processedTokens.length - 1];
        if (!prev || prev.type === 'op' || prev.type === 'lparen') {
          processedTokens.push({ type: 'number', value: 0 });
          processedTokens.push({ type: 'op', value: '-' });
          continue;
        }
      }
      processedTokens.push(tk);
    }

    for (const tk of processedTokens) {
      if (tk.type === 'number' || tk.type === 'string' ||
          tk.type === 'variable' || tk.type === 'boolean') {
        let val;
        if (tk.type === 'number' || tk.type === 'string' || tk.type === 'boolean') {
          val = tk.value;
        } else {
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
        operatorStack.pop();
      }
    }

    while (operatorStack.length > 0) {
      const op = operatorStack.pop();
      if (op.type === 'lparen') {
        throw new Error('Paréntesis desbalanceados en la expresión.');
      }
      outputQueue.push(op);
    }

    const evalStack = [];
    for (const item of outputQueue) {
      if (typeof item !== 'object' || item === null) {
        evalStack.push(item);
      } else {
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

  _tokenizarExpresion(expr) {
    const tokens = [];
    let i = 0;

    while (i < expr.length) {
      if (/\s/.test(expr[i])) { i++; continue; }

      if (expr[i] === '"') {
        let j = i + 1;
        while (j < expr.length && expr[j] !== '"') j++;
        if (j < expr.length) j++;
        tokens.push({ type: 'string', value: expr.substring(i + 1, j - 1) });
        i = j;
        continue;
      }

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

      if (expr[i] === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
      if (expr[i] === ')') { tokens.push({ type: 'rparen' }); i++; continue; }

      if ('+-*/'.includes(expr[i])) {
        tokens.push({ type: 'op', value: expr[i] });
        i++;
        continue;
      }

      if (/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ_]/.test(expr[i])) {
        let j = i;
        while (j < expr.length && /[\wáéíóúüñÁÉÍÓÚÜÑ]/.test(expr[j])) j++;
        const word = expr.substring(i, j);
        const lw = word.toLowerCase();
        if (lw === 'verdadero') {
          tokens.push({ type: 'boolean', value: true });
        } else if (lw === 'falso') {
          tokens.push({ type: 'boolean', value: false });
        } else {
          tokens.push({ type: 'variable', raw: word });
        }
        i = j;
        continue;
      }

      throw new Error(`Carácter inesperado en expresión: "${expr[i]}"`);
    }

    return tokens;
  }

  _aplicarOperador(izq, op, der) {
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
  ];

  static PALABRAS_RESERVADAS_SET = DocErrores.PALABRAS_RESERVADAS_SET;

  static stripComment(linea) {
    return DocErrores.stripComment(linea);
  }

  static extraerVariablesDelCodigo(codigo) {
    return DocErrores.extraerVariablesDelCodigo(codigo);
  }
}
