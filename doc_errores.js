/**
 * ============================================================
 *  doc_errores.js — Capa de Análisis, Validación y Errores
 * ============================================================
 *  Responsable de:
 *  - Tokenización por línea
 *  - Validación estática del código completo
 *  - Tabla de símbolos (variables definidas, inicializadas)
 *  - Detección de errores con rango exacto (columna inicio/fin)
 *  - Helpers para autocomplete y decoraciones del editor
 *
 *  NO depende de la UI ni del motor de ejecución.
 * ============================================================
 */

// ─────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────

const PALABRAS_RESERVADAS_SET = new Set(
  ['definir', 'escribir', 'leer', 'como', 'entero', 'real', 'caracter', 'proceso', 'finproceso']
);

const TIPOS_VALIDOS = new Set(['entero', 'real', 'caracter']);

// ─────────────────────────────────────────────
//  TOKEN TYPES
// ─────────────────────────────────────────────

const TK = Object.freeze({
  KEYWORD:          'keyword',
  IDENTIFIER:       'identifier',
  STRING:           'string',
  STRING_UNCLOSED:  'string_unclosed',   // opening " without closing "
  NUMBER:           'number',
  OPERATOR:         'operator',          // + - * /
  ASSIGN:           'assign',            // <-
  COMMA:            'comma',
  LPAREN:           'lparen',
  RPAREN:           'rparen',
  COMMENT:          'comment',
  WHITESPACE:       'whitespace',
  UNKNOWN:          'unknown',
});

// ─────────────────────────────────────────────
//  TOKENIZER
// ─────────────────────────────────────────────

/**
 * Tokeniza una línea de pseudocódigo.
 * Respeta strings entre comillas y comentarios // fuera de strings.
 *
 * Regla de string sin cerrar:
 * - Si se abre " y no se cierra antes del fin de línea, se emite STRING_UNCLOSED.
 * - Si dentro del texto sin cerrar aparece //, se trata como comentario
 *   (el string sin cerrar termina justo antes del //).
 *
 * @param {string} linea - texto crudo de la línea
 * @returns {Array<{type: string, value: string, col: number, end: number}>}
 */
function tokenizarLinea(linea) {
  const tokens = [];
  let i = 0;

  while (i < linea.length) {
    const start = i;

    // ── Whitespace ──
    if (/\s/.test(linea[i])) {
      while (i < linea.length && /\s/.test(linea[i])) i++;
      tokens.push({ type: TK.WHITESPACE, value: linea.substring(start, i), col: start, end: i });
      continue;
    }

    // ── Comment // ──
    if (linea[i] === '/' && linea[i + 1] === '/') {
      const value = linea.substring(i);
      tokens.push({ type: TK.COMMENT, value, col: start, end: linea.length });
      i = linea.length;
      continue;
    }

    // ── String literal "..." or unclosed string ──
    if (linea[i] === '"') {
      let j = i + 1;
      let foundClose = false;
      let commentInside = -1;

      while (j < linea.length) {
        if (linea[j] === '"') {
          foundClose = true;
          j++; // include closing quote
          break;
        }
        // Check for // inside an unclosed string candidate
        if (linea[j] === '/' && linea[j + 1] === '/') {
          commentInside = j;
          break;
        }
        j++;
      }

      if (foundClose) {
        // Normal closed string
        tokens.push({ type: TK.STRING, value: linea.substring(i, j), col: start, end: j });
        i = j;
      } else if (commentInside >= 0) {
        // Unclosed string that runs into a // — treat the string as unclosed up to //,
        // then the rest is a comment.
        tokens.push({ type: TK.STRING_UNCLOSED, value: linea.substring(i, commentInside), col: start, end: commentInside });
        // Now emit the comment
        tokens.push({ type: TK.COMMENT, value: linea.substring(commentInside), col: commentInside, end: linea.length });
        i = linea.length;
      } else {
        // Unclosed string to end of line
        tokens.push({ type: TK.STRING_UNCLOSED, value: linea.substring(i), col: start, end: linea.length });
        i = linea.length;
      }
      continue;
    }

    // ── Assignment operator <- ──
    if (linea[i] === '<' && linea[i + 1] === '-') {
      tokens.push({ type: TK.ASSIGN, value: '<-', col: start, end: start + 2 });
      i += 2;
      continue;
    }

    // ── Arithmetic operators ──
    if ('+-*/'.includes(linea[i])) {
      tokens.push({ type: TK.OPERATOR, value: linea[i], col: start, end: start + 1 });
      i++;
      continue;
    }

    // ── Comparison-like: < or > alone (not part of <-) ──
    if (linea[i] === '<' || linea[i] === '>') {
      tokens.push({ type: TK.OPERATOR, value: linea[i], col: start, end: start + 1 });
      i++;
      continue;
    }

    // ── Parentheses ──
    if (linea[i] === '(') {
      tokens.push({ type: TK.LPAREN, value: '(', col: start, end: start + 1 });
      i++;
      continue;
    }
    if (linea[i] === ')') {
      tokens.push({ type: TK.RPAREN, value: ')', col: start, end: start + 1 });
      i++;
      continue;
    }

    // ── Comma ──
    if (linea[i] === ',') {
      tokens.push({ type: TK.COMMA, value: ',', col: start, end: start + 1 });
      i++;
      continue;
    }

    // ── Word (keyword or identifier) ──
    if (/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ_]/.test(linea[i])) {
      while (i < linea.length && /[\wáéíóúüñÁÉÍÓÚÜÑ]/.test(linea[i])) i++;
      const word = linea.substring(start, i);
      const type = PALABRAS_RESERVADAS_SET.has(word.toLowerCase()) ? TK.KEYWORD : TK.IDENTIFIER;
      tokens.push({ type, value: word, col: start, end: i });
      continue;
    }

    // ── Number ──
    if (/\d/.test(linea[i])) {
      while (i < linea.length && /\d/.test(linea[i])) i++;
      if (i < linea.length && linea[i] === '.' && /\d/.test(linea[i + 1])) {
        i++; // skip dot
        while (i < linea.length && /\d/.test(linea[i])) i++;
      }
      tokens.push({ type: TK.NUMBER, value: linea.substring(start, i), col: start, end: i });
      continue;
    }

    // ── Unknown character ──
    tokens.push({ type: TK.UNKNOWN, value: linea[i], col: start, end: start + 1 });
    i++;
  }

  return tokens;
}

/**
 * Returns only significant tokens (no whitespace, no comment).
 */
function tokensSignificativos(tokens) {
  return tokens.filter(t => t.type !== TK.WHITESPACE && t.type !== TK.COMMENT);
}

// ─────────────────────────────────────────────
//  CURSOR CONTEXT HELPERS
// ─────────────────────────────────────────────

/**
 * Determines if a cursor position (column) within a line is inside
 * a string literal or a comment.
 * @param {string} lineText - the full line text
 * @param {number} col - 0-based column position
 * @returns {{inString: boolean, inComment: boolean}}
 */
function cursorContext(lineText, col) {
  let inStr = false;
  for (let i = 0; i < lineText.length && i <= col; i++) {
    if (lineText[i] === '"') {
      if (i === col) {
        return { inString: true, inComment: false };
      }
      inStr = !inStr;
    }
    if (!inStr && lineText[i] === '/' && lineText[i + 1] === '/' && i <= col) {
      return { inString: false, inComment: true };
    }
  }
  return { inString: inStr, inComment: false };
}

// ─────────────────────────────────────────────
//  ERROR STRUCTURE
// ─────────────────────────────────────────────

/**
 * Creates a standardized error object.
 */
function crearError(linea, colInicio, colFin, tipo, mensaje, token) {
  return {
    linea,           // 0-based line index
    columnaInicio: colInicio,
    columnaFin: colFin,
    tipo,
    mensaje,
    token: token || '',
  };
}

// ─────────────────────────────────────────────
//  SYMBOL TABLE
// ─────────────────────────────────────────────

class TablaSimbolos {
  constructor() {
    /** @type {Map<string, {tipo: string, inicializada: boolean, lineaDefinicion: number, nombreOriginal: string}>} */
    this.variables = new Map();
  }

  definir(nombreOriginal, tipo, lineaIdx) {
    const key = nombreOriginal.toLowerCase();
    this.variables.set(key, {
      tipo,
      inicializada: false,
      lineaDefinicion: lineaIdx,
      nombreOriginal,
    });
  }

  existeVariable(nombre) {
    return this.variables.has(nombre.toLowerCase());
  }

  estaInicializada(nombre) {
    const v = this.variables.get(nombre.toLowerCase());
    return v ? v.inicializada : false;
  }

  marcarInicializada(nombre) {
    const v = this.variables.get(nombre.toLowerCase());
    if (v) v.inicializada = true;
  }

  obtenerTipo(nombre) {
    const v = this.variables.get(nombre.toLowerCase());
    return v ? v.tipo : null;
  }

  obtenerNombres() {
    return Array.from(this.variables.values()).map(v => v.nombreOriginal);
  }

  clonar() {
    const copia = new TablaSimbolos();
    for (const [key, val] of this.variables) {
      copia.variables.set(key, { ...val });
    }
    return copia;
  }
}

// ─────────────────────────────────────────────
//  STATIC VALIDATOR
// ─────────────────────────────────────────────

/**
 * Validates the entire pseudocode document.
 * Returns { errores: Array, tablaSimbolos: TablaSimbolos, erroresPorLinea: Map }
 */
function validarDocumento(codigo) {
  const lineas = codigo.split('\n');
  const tabla = new TablaSimbolos();
  const todosErrores = [];
  const erroresPorLinea = new Map();

  for (let i = 0; i < lineas.length; i++) {
    const lineaRaw = lineas[i];
    const tokens = tokenizarLinea(lineaRaw);
    const sig = tokensSignificativos(tokens);

    if (sig.length === 0) continue;

    const erroresLinea = validarLinea(sig, tokens, i, tabla);

    if (erroresLinea.length > 0) {
      erroresPorLinea.set(i, erroresLinea);
      todosErrores.push(...erroresLinea);
    }
  }

  return { errores: todosErrores, tablaSimbolos: tabla, erroresPorLinea };
}

/**
 * Validates a single line given its tokens and the current symbol table.
 * Mutates tabla (adds Definir variables, marks initialized for assignments/Leer).
 */
function validarLinea(sig, allTokens, lineaIdx, tabla) {
  const errores = [];

  if (sig.length === 0) return errores;

  // ── 1. Check for unclosed strings ──
  for (const tk of allTokens) {
    if (tk.type === TK.STRING_UNCLOSED) {
      errores.push(crearError(
        lineaIdx, tk.col, tk.end,
        'string_sin_cerrar',
        'Texto sin cerrar con comillas dobles.',
        tk.value
      ));
    }
  }

  // ── 2. Check for adjacent value tokens without comma/operator (strings pegados) ──
  // This detects: "Hola""Mundo", "edad"edad, etc.
  // We look at significant tokens and check if two "value-like" tokens are adjacent
  // without an operator or comma between them.
  detectarTokensAdyacentesSinComa(sig, lineaIdx, errores);

  // If there are unclosed string errors, skip further validation for this line
  // since the token stream may be unreliable
  if (errores.some(e => e.tipo === 'string_sin_cerrar')) {
    return errores;
  }

  // ── 3. Standard instruction validation ──
  const primerToken = sig[0];
  const instruccion = primerToken.type === TK.KEYWORD ? primerToken.value.toLowerCase() : null;

  switch (instruccion) {
    case 'definir':
      validarDefinir(sig, lineaIdx, tabla, errores);
      break;

    case 'escribir':
      validarEscribir(sig, lineaIdx, tabla, errores);
      break;

    case 'leer':
      validarLeer(sig, lineaIdx, tabla, errores);
      break;

    case 'proceso':
    case 'finproceso':
      break; // structural keywords, no validation needed

    default:
      if (sig.length >= 3 && sig[1].type === TK.ASSIGN) {
        validarAsignacion(sig, lineaIdx, tabla, errores);
      } else if (primerToken.type === TK.IDENTIFIER) {
        if (!tabla.existeVariable(primerToken.value)) {
          errores.push(crearError(
            lineaIdx, primerToken.col, primerToken.end,
            'instruccion_no_reconocida',
            `Instrucción no reconocida: "${primerToken.value}"`,
            primerToken.value
          ));
        } else {
          errores.push(crearError(
            lineaIdx, primerToken.col, sig[sig.length - 1].end,
            'instruccion_no_reconocida',
            `Instrucción no reconocida.`,
            primerToken.value
          ));
        }
      } else {
        errores.push(crearError(
          lineaIdx, primerToken.col, sig[sig.length - 1].end,
          'instruccion_no_reconocida',
          `Instrucción no reconocida.`,
          primerToken.value
        ));
      }
      break;
  }

  return errores;
}

// ─────────────────────────────────────────────
//  DETECTION: Adjacent value tokens without comma
// ─────────────────────────────────────────────

/**
 * Checks significant tokens for two adjacent "value-like" tokens
 * that lack an operator or comma between them.
 *
 * Value-like tokens: STRING, STRING_UNCLOSED, IDENTIFIER, NUMBER
 *
 * Cases detected:
 *   "Hola""Mundo"        → STRING STRING
 *   "edad"edad           → STRING IDENTIFIER
 *   "texto"""            → STRING STRING (the "" is an empty string)
 *   nombre"hola"         → IDENTIFIER STRING
 *
 * Tokens that act as separators (and prevent this error):
 *   COMMA, OPERATOR, ASSIGN, LPAREN, RPAREN
 *
 * We skip the first token if it's a keyword (like Escribir) since
 * Escribir "hola" is valid (keyword followed by value).
 */
function detectarTokensAdyacentesSinComa(sig, lineaIdx, errores) {
  const esValor = (t) =>
    t.type === TK.STRING || t.type === TK.STRING_UNCLOSED ||
    t.type === TK.IDENTIFIER || t.type === TK.NUMBER;

  for (let i = 1; i < sig.length; i++) {
    const prev = sig[i - 1];
    const curr = sig[i];

    // Both must be value-like
    if (!esValor(prev) || !esValor(curr)) continue;

    // Skip if prev is a keyword (e.g. Escribir "hola" is fine)
    if (prev.type === TK.KEYWORD) continue;

    // These two value tokens are adjacent without separator → error
    // Mark the boundary between them
    errores.push(crearError(
      lineaIdx, prev.end, curr.col > prev.end ? curr.col : curr.end,
      'falta_coma_concatenar',
      'Falta una coma para poder concatenar.',
      ''
    ));
  }
}

// ─────────────────────────────────────────────
//  VALIDATION: Definir
// ─────────────────────────────────────────────

function validarDefinir(sig, lineaIdx, tabla, errores) {
  if (sig.length < 4) {
    errores.push(crearError(
      lineaIdx, sig[0].col, sig[sig.length - 1].end,
      'sintaxis_definir',
      'Sintaxis inválida. Use: Definir <var1>, <var2> Como <Entero|Real|Caracter>',
      ''
    ));
    return;
  }

  let comoIdx = -1;
  for (let i = 1; i < sig.length; i++) {
    if (sig[i].type === TK.KEYWORD && sig[i].value.toLowerCase() === 'como') {
      comoIdx = i;
      break;
    }
  }

  if (comoIdx === -1) {
    errores.push(crearError(
      lineaIdx, sig[0].col, sig[sig.length - 1].end,
      'sintaxis_definir',
      'Falta la palabra clave "Como" en la declaración.',
      ''
    ));
    return;
  }

  if (comoIdx + 1 >= sig.length) {
    errores.push(crearError(
      lineaIdx, sig[comoIdx].col, sig[comoIdx].end,
      'sintaxis_definir',
      'Falta el tipo de dato después de "Como". Use: Entero, Real o Caracter.',
      ''
    ));
    return;
  }

  const tipoToken = sig[comoIdx + 1];
  if (!TIPOS_VALIDOS.has(tipoToken.value.toLowerCase())) {
    errores.push(crearError(
      lineaIdx, tipoToken.col, tipoToken.end,
      'tipo_invalido',
      `Tipo de dato no reconocido: "${tipoToken.value}". Use: Entero, Real o Caracter.`,
      tipoToken.value
    ));
  }

  if (comoIdx + 2 < sig.length) {
    const extra = sig[comoIdx + 2];
    errores.push(crearError(
      lineaIdx, extra.col, sig[sig.length - 1].end,
      'sintaxis_definir',
      'Texto inesperado después del tipo de dato.',
      ''
    ));
  }

  const varTokens = sig.slice(1, comoIdx);

  if (varTokens.length === 0) {
    errores.push(crearError(
      lineaIdx, sig[0].end, sig[comoIdx].col,
      'sintaxis_definir',
      'Debe declarar al menos una variable después de "Definir".',
      ''
    ));
    return;
  }

  const tipo = TIPOS_VALIDOS.has(tipoToken.value.toLowerCase()) ? tipoToken.value.toLowerCase() : 'caracter';
  const definedInThisLine = new Set();

  let esperandoIdentificador = true;

  for (let i = 0; i < varTokens.length; i++) {
    const tk = varTokens[i];

    if (esperandoIdentificador) {
      if (tk.type === TK.COMMA) {
        errores.push(crearError(
          lineaIdx, tk.col, tk.end,
          'coma_invalida',
          'El uso de la , al Definir una variable siempre se debe declarar una variable antes y despues.',
          ','
        ));
        continue;
      }

      if (tk.type !== TK.IDENTIFIER) {
        if (tk.type === TK.KEYWORD) {
          errores.push(crearError(
            lineaIdx, tk.col, tk.end,
            'nombre_reservado',
            `"${tk.value}" es una palabra reservada y no puede usarse como variable.`,
            tk.value
          ));
        } else {
          errores.push(crearError(
            lineaIdx, tk.col, tk.end,
            'sintaxis_definir',
            `Se esperaba un nombre de variable, se encontró: "${tk.value}"`,
            tk.value
          ));
        }
        esperandoIdentificador = false;
        continue;
      }

      if (PALABRAS_RESERVADAS_SET.has(tk.value.toLowerCase())) {
        errores.push(crearError(
          lineaIdx, tk.col, tk.end,
          'nombre_reservado',
          `"${tk.value}" es una palabra reservada y no puede usarse como variable.`,
          tk.value
        ));
        esperandoIdentificador = false;
        continue;
      }

      const keyLower = tk.value.toLowerCase();

      if (definedInThisLine.has(keyLower)) {
        errores.push(crearError(
          lineaIdx, tk.col, tk.end,
          'variable_duplicada',
          `Variable "${tk.value}" ya se encuentra definida.`,
          tk.value
        ));
      } else if (tabla.existeVariable(keyLower)) {
        errores.push(crearError(
          lineaIdx, tk.col, tk.end,
          'variable_duplicada',
          `Variable "${tk.value}" ya se encuentra definida.`,
          tk.value
        ));
      } else {
        tabla.definir(tk.value, tipo, lineaIdx);
      }

      definedInThisLine.add(keyLower);
      esperandoIdentificador = false;
    } else {
      if (tk.type === TK.COMMA) {
        if (i === varTokens.length - 1) {
          errores.push(crearError(
            lineaIdx, tk.col, tk.end,
            'coma_invalida',
            'El uso de la , al Definir una variable siempre se debe declarar una variable antes y despues.',
            ','
          ));
        }
        esperandoIdentificador = true;
      } else {
        errores.push(crearError(
          lineaIdx, tk.col, tk.end,
          'sintaxis_definir',
          `Se esperaba una coma o "Como", se encontró: "${tk.value}"`,
          tk.value
        ));
      }
    }
  }
}

// ─────────────────────────────────────────────
//  VALIDATION: Escribir
// ─────────────────────────────────────────────

function validarEscribir(sig, lineaIdx, tabla, errores) {
  if (sig.length < 2) {
    errores.push(crearError(
      lineaIdx, sig[0].col, sig[0].end,
      'sintaxis_escribir',
      'Falta la expresión después de "Escribir".',
      ''
    ));
    return;
  }

  const exprTokens = sig.slice(1);
  validarListaExpresiones(exprTokens, lineaIdx, tabla, errores);
}

// ─────────────────────────────────────────────
//  VALIDATION: Leer
// ─────────────────────────────────────────────

function validarLeer(sig, lineaIdx, tabla, errores) {
  if (sig.length < 2) {
    errores.push(crearError(
      lineaIdx, sig[0].col, sig[0].end,
      'sintaxis_leer',
      'Falta la variable después de "Leer".',
      ''
    ));
    return;
  }

  if (sig.length > 2) {
    errores.push(crearError(
      lineaIdx, sig[2].col, sig[sig.length - 1].end,
      'sintaxis_leer',
      'Sintaxis inválida. Use: Leer <variable>',
      ''
    ));
  }

  const varToken = sig[1];
  if (varToken.type !== TK.IDENTIFIER) {
    errores.push(crearError(
      lineaIdx, varToken.col, varToken.end,
      'sintaxis_leer',
      `Se esperaba un nombre de variable después de "Leer", se encontró: "${varToken.value}"`,
      varToken.value
    ));
    return;
  }

  if (!tabla.existeVariable(varToken.value)) {
    errores.push(crearError(
      lineaIdx, varToken.col, varToken.end,
      'variable_no_definida',
      `Variable "${varToken.value}" no definida.`,
      varToken.value
    ));
    return;
  }

  tabla.marcarInicializada(varToken.value);
}

// ─────────────────────────────────────────────
//  VALIDATION: Asignación (var <- expr)
// ─────────────────────────────────────────────

function validarAsignacion(sig, lineaIdx, tabla, errores) {
  const varToken = sig[0];

  if (varToken.type !== TK.IDENTIFIER) {
    errores.push(crearError(
      lineaIdx, varToken.col, varToken.end,
      'sintaxis_asignacion',
      `Se esperaba una variable antes de "<-", se encontró: "${varToken.value}"`,
      varToken.value
    ));
    return;
  }

  if (!tabla.existeVariable(varToken.value)) {
    errores.push(crearError(
      lineaIdx, varToken.col, varToken.end,
      'variable_no_definida',
      `Variable "${varToken.value}" no definida. Use "Definir ${varToken.value} Como Tipo" primero.`,
      varToken.value
    ));
    return;
  }

  const exprTokens = sig.slice(2);
  if (exprTokens.length === 0) {
    errores.push(crearError(
      lineaIdx, sig[1].col, sig[1].end,
      'sintaxis_asignacion',
      'Falta la expresión después de "<-".',
      ''
    ));
    return;
  }

  validarExpresionTokens(exprTokens, lineaIdx, tabla, errores);

  tabla.marcarInicializada(varToken.value);
}

// ─────────────────────────────────────────────
//  VALIDATION: Expression List (for Escribir)
// ─────────────────────────────────────────────

function validarListaExpresiones(tokens, lineaIdx, tabla, errores) {
  const grupos = [];
  let grupoActual = [];

  for (const tk of tokens) {
    if (tk.type === TK.COMMA) {
      if (grupoActual.length > 0) {
        grupos.push(grupoActual);
      } else {
        errores.push(crearError(
          lineaIdx, tk.col, tk.end,
          'coma_invalida',
          'Coma sin expresión previa.',
          ','
        ));
      }
      grupoActual = [];
    } else {
      grupoActual.push(tk);
    }
  }
  if (grupoActual.length > 0) {
    grupos.push(grupoActual);
  }

  for (const grupo of grupos) {
    validarExpresionTokens(grupo, lineaIdx, tabla, errores);
  }
}

// ─────────────────────────────────────────────
//  VALIDATION: Expression tokens
// ─────────────────────────────────────────────

function validarExpresionTokens(tokens, lineaIdx, tabla, errores) {
  for (const tk of tokens) {
    if (tk.type === TK.IDENTIFIER) {
      if (!tabla.existeVariable(tk.value)) {
        errores.push(crearError(
          lineaIdx, tk.col, tk.end,
          'variable_no_definida',
          `Variable "${tk.value}" no definida.`,
          tk.value
        ));
      }
    } else if (tk.type === TK.STRING || tk.type === TK.STRING_UNCLOSED ||
               tk.type === TK.NUMBER ||
               tk.type === TK.OPERATOR || tk.type === TK.LPAREN ||
               tk.type === TK.RPAREN || tk.type === TK.ASSIGN) {
      // Valid expression tokens (STRING_UNCLOSED already has its own error)
    } else if (tk.type === TK.KEYWORD) {
      errores.push(crearError(
        lineaIdx, tk.col, tk.end,
        'token_inesperado',
        `Palabra reservada "${tk.value}" no esperada en esta expresión.`,
        tk.value
      ));
    }
  }
}

// ─────────────────────────────────────────────
//  EXTRACT VARIABLES (for autocomplete)
// ─────────────────────────────────────────────

function extraerVariablesDelCodigo(codigo) {
  const vars = [];
  const seen = new Set();
  const lineas = codigo.split('\n');

  for (const raw of lineas) {
    const tokens = tokenizarLinea(raw);
    const sig = tokensSignificativos(tokens);

    if (sig.length < 4) continue;
    if (sig[0].type !== TK.KEYWORD || sig[0].value.toLowerCase() !== 'definir') continue;

    let comoIdx = -1;
    for (let i = 1; i < sig.length; i++) {
      if (sig[i].type === TK.KEYWORD && sig[i].value.toLowerCase() === 'como') {
        comoIdx = i;
        break;
      }
    }
    if (comoIdx === -1) continue;

    for (let i = 1; i < comoIdx; i++) {
      if (sig[i].type === TK.IDENTIFIER) {
        const key = sig[i].value.toLowerCase();
        if (!seen.has(key) && !PALABRAS_RESERVADAS_SET.has(key)) {
          seen.add(key);
          vars.push(sig[i].value);
        }
      }
    }
  }

  return vars;
}

// ─────────────────────────────────────────────
//  DECORATION HELPERS
// ─────────────────────────────────────────────

function erroresADecoraciones(erroresLinea) {
  if (!erroresLinea) return [];
  return erroresLinea.map(e => ({
    col: e.columnaInicio,
    end: e.columnaFin,
    mensaje: e.mensaje,
  }));
}

function mensajesDeLinea(erroresLinea) {
  if (!erroresLinea) return '';
  return erroresLinea.map(e => e.mensaje).join('\n');
}

// ─────────────────────────────────────────────
//  STRIP COMMENT HELPER
// ─────────────────────────────────────────────

/**
 * Strips inline comment from a line, respecting properly closed strings.
 * If a string is opened but not closed, // inside it IS treated as a comment.
 */
function stripComment(linea) {
  let enComillas = false;
  for (let i = 0; i < linea.length; i++) {
    if (linea[i] === '"') {
      enComillas = !enComillas;
    } else if (!enComillas && linea[i] === '/' && linea[i + 1] === '/') {
      return linea.substring(0, i).trim();
    }
  }
  return linea.trim();
}

// ─────────────────────────────────────────────
//  EXPORTS (global for browser)
// ─────────────────────────────────────────────

const DocErrores = {
  TK,
  PALABRAS_RESERVADAS_SET,
  TIPOS_VALIDOS,
  tokenizarLinea,
  tokensSignificativos,
  cursorContext,
  crearError,
  TablaSimbolos,
  validarDocumento,
  validarLinea,
  extraerVariablesDelCodigo,
  erroresADecoraciones,
  mensajesDeLinea,
  stripComment,
};
