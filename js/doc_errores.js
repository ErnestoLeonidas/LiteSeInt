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

const PALABRAS_RESERVADAS_SET = new Set([
  'definir', 'escribir', 'leer', 'como', 'entero', 'real', 'caracter',
  'proceso', 'finproceso',
  'si', 'entonces', 'sino', 'finsi',
  'mientras', 'hacer', 'finmientras',
  'repetir', 'hastaque', 'que',
  'para', 'hasta', 'con', 'paso', 'finpara',
  'segun', 'finsegun', 'de', 'otro', 'modo',
  'y', 'o', 'no',
]);

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
  ASSIGN:           'assign',            // =
  COMMA:            'comma',
  COLON:            'colon',             // : used in Segun case labels
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

    // ── Comparison operators (2 chars): ==, <=, >=, !=, <> ──
    if ('=<>!'.includes(linea[i])) {
      const two = linea.substring(i, i + 2);
      if (two === '==' || two === '<=' || two === '>=' || two === '!=' || two === '<>') {
        tokens.push({ type: TK.OPERATOR, value: two, col: start, end: start + 2 });
        i += 2;
        continue;
      }
      // ── Assignment operator: single '=' ──
      if (linea[i] === '=') {
        tokens.push({ type: TK.ASSIGN, value: '=', col: start, end: start + 1 });
        i++;
        continue;
      }
      // ── Comparison: single '<' or '>' ──
      if (linea[i] === '<' || linea[i] === '>') {
        tokens.push({ type: TK.OPERATOR, value: linea[i], col: start, end: start + 1 });
        i++;
        continue;
      }
      // '!' solo → cae a UNKNOWN
    }

    // ── Arithmetic operators ──
    if ('+-*/'.includes(linea[i])) {
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

    // ── Colon ──
    if (linea[i] === ':') {
      tokens.push({ type: TK.COLON, value: ':', col: start, end: start + 1 });
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

  const agregarError = (i, err) => {
    if (!erroresPorLinea.has(i)) erroresPorLinea.set(i, []);
    erroresPorLinea.get(i).push(err);
    todosErrores.push(err);
  };

  // Paso 1: validación línea a línea
  for (let i = 0; i < lineas.length; i++) {
    const lineaRaw = lineas[i];
    const tokens = tokenizarLinea(lineaRaw);
    const sig = tokensSignificativos(tokens);
    if (sig.length === 0) continue;
    const erroresLinea = validarLinea(sig, tokens, i, tabla);
    for (const e of erroresLinea) agregarError(i, e);
  }

  // Paso 2: balance de bloques (Si, Segun, Repetir y Para se manejan en Paso 3/4/5/6)
  const BLOQUES = [
    { abre: 'mientras', cierra: 'finmientras',   etiqueta: 'Mientras', cierraLabel: 'FinMientras' },
  ];

  const stackBloques = [];
  for (let i = 0; i < lineas.length; i++) {
    const linea = stripComment(lineas[i].trim());
    if (linea === '') continue;
    const primera = linea.split(/\s+/)[0].toLowerCase();

    for (const b of BLOQUES) {
      if (primera === b.abre) {
        stackBloques.push({ ...b, linea: i });
        break;
      }
      if (primera === b.cierra) {
        if (stackBloques.length === 0 || stackBloques[stackBloques.length - 1].cierra !== b.cierra) {
          agregarError(i, crearError(
            i, 0, linea.length, 'bloque_desbalanceado',
            `"${linea.split(/\s+/)[0]}" sin bloque de apertura correspondiente.`, ''
          ));
        } else {
          stackBloques.pop();
        }
        break;
      }
    }
  }

  for (const ctx of stackBloques) {
    agregarError(ctx.linea, crearError(
      ctx.linea, 0, 0, 'bloque_sin_cerrar',
      `Bloque "${ctx.etiqueta}" sin cierre (falta ${ctx.cierraLabel}).`, ''
    ));
  }

  // Paso 3: validación estructural de Si / Sino / FinSi
  validarBloquesSi(lineas, agregarError);

  // Paso 4: validación estructural de Segun / De Otro Modo / FinSegun
  validarBloquesSegun(lineas, agregarError);

  // Paso 5: validación estructural de Repetir / Hasta Que
  validarBloquesRepetir(lineas, agregarError);

  // Paso 6: validación estructural de Para / FinPara
  validarBloquesPara(lineas, tabla, agregarError);

  return { errores: todosErrores, tablaSimbolos: tabla, erroresPorLinea };
}

// ─────────────────────────────────────────────
//  VALIDATION: Si / Sino / FinSi
// ─────────────────────────────────────────────

/**
 * Pasada estructural sobre el documento completo.
 * Rastrea bloques Si abiertos con una pila para soportar anidación.
 * Emite errores de:
 *   - cabecera inválida (condición, Entonces, texto extra)
 *   - Sino fuera de bloque, Sino duplicado, Sino con texto extra
 *   - FinSi fuera de bloque, FinSi con texto extra
 *   - ramas vacías (entre Si/Sino y Sino/FinSi)
 *   - Si no cerrado al fin del documento
 */
function validarBloquesSi(lineas, agregarError) {
  const stack = [];

  const contarContenido = (top) => {
    if (top.tieneSino) top.contenidoFalse++;
    else top.contenidoTrue++;
  };

  for (let i = 0; i < lineas.length; i++) {
    const lineaRaw = lineas[i];
    const allTokens = tokenizarLinea(lineaRaw);
    const sig = tokensSignificativos(allTokens);
    if (sig.length === 0) continue;

    const primera = sig[0];
    const palabra = primera.type === TK.KEYWORD ? primera.value.toLowerCase() : null;

    if (palabra === 'si') {
      if (stack.length > 0) contarContenido(stack[stack.length - 1]);
      validarCabeceraSi(lineaRaw, sig, i, agregarError);
      stack.push({ lineaSi: i, tieneSino: false, contenidoTrue: 0, contenidoFalse: 0 });
      continue;
    }

    if (palabra === 'sino') {
      if (stack.length === 0) {
        agregarError(i, crearError(
          i, primera.col, primera.end, 'sino_sin_si',
          '"Sino" sin una sentencia "Si" abierta.', primera.value
        ));
      } else {
        const top = stack[stack.length - 1];
        if (top.tieneSino) {
          agregarError(i, crearError(
            i, primera.col, primera.end, 'sino_duplicado',
            'La sentencia "Si" ya contiene un bloque "Sino".', primera.value
          ));
        } else {
          if (top.contenidoTrue === 0) {
            agregarError(i, crearError(
              i, primera.col, primera.end, 'rama_verdadera_vacia',
              'Debe haber al menos una instrucción entre "Si ... Entonces" y "Sino" o "FinSi".', ''
            ));
          }
          top.tieneSino = true;
        }
      }
      if (sig.length > 1) {
        const extra = sig[1];
        const last = sig[sig.length - 1];
        agregarError(i, crearError(
          i, extra.col, last.end, 'sino_texto_extra',
          '"Sino" no debe tener argumentos ni texto adicional.', ''
        ));
      }
      continue;
    }

    if (palabra === 'finsi') {
      if (stack.length === 0) {
        agregarError(i, crearError(
          i, primera.col, primera.end, 'finsi_sin_si',
          '"FinSi" sin una sentencia "Si" abierta.', primera.value
        ));
      } else {
        const top = stack.pop();
        if (top.tieneSino) {
          if (top.contenidoFalse === 0) {
            agregarError(i, crearError(
              i, primera.col, primera.end, 'rama_falsa_vacia',
              'Debe haber al menos una instrucción entre "Sino" y "FinSi".', ''
            ));
          }
        } else {
          if (top.contenidoTrue === 0) {
            agregarError(i, crearError(
              i, primera.col, primera.end, 'rama_verdadera_vacia',
              'Debe haber al menos una instrucción entre "Si ... Entonces" y "Sino" o "FinSi".', ''
            ));
          }
        }
      }
      if (sig.length > 1) {
        const extra = sig[1];
        const last = sig[sig.length - 1];
        agregarError(i, crearError(
          i, extra.col, last.end, 'finsi_texto_extra',
          '"FinSi" no debe tener argumentos ni texto adicional.', ''
        ));
      }
      continue;
    }

    // Cualquier otra línea no vacía cuenta como instrucción real
    if (stack.length > 0) contarContenido(stack[stack.length - 1]);
  }

  for (const ctx of stack) {
    const longitud = lineas[ctx.lineaSi] ? lineas[ctx.lineaSi].length : 0;
    agregarError(ctx.lineaSi, crearError(
      ctx.lineaSi, 0, longitud, 'si_sin_cerrar',
      'Falta "FinSi" para cerrar la sentencia "Si".', ''
    ));
  }
}

function validarCabeceraSi(lineaRaw, sig, lineaIdx, agregarError) {
  const siToken = sig[0];

  let entoncesIdx = -1;
  for (let i = 1; i < sig.length; i++) {
    if (sig[i].type === TK.KEYWORD && sig[i].value.toLowerCase() === 'entonces') {
      entoncesIdx = i;
      break;
    }
  }

  const condTokens = entoncesIdx === -1 ? sig.slice(1) : sig.slice(1, entoncesIdx);

  if (condTokens.length === 0) {
    const colFin = entoncesIdx === -1 ? siToken.end : sig[entoncesIdx].end;
    agregarError(lineaIdx, crearError(
      lineaIdx, siToken.col, colFin, 'si_sin_condicion',
      'Falta la condición en la sentencia "Si".', ''
    ));
  }

  if (entoncesIdx === -1) {
    agregarError(lineaIdx, crearError(
      lineaIdx, siToken.col, sig[sig.length - 1].end, 'si_sin_entonces',
      'Falta la palabra clave "Entonces" en la sentencia "Si".', ''
    ));
    return;
  }

  if (entoncesIdx + 1 < sig.length) {
    const extra = sig[entoncesIdx + 1];
    const last = sig[sig.length - 1];
    agregarError(lineaIdx, crearError(
      lineaIdx, extra.col, last.end, 'entonces_texto_extra',
      'No debe haber texto después de "Entonces".', ''
    ));
  }

  validarComparacionesEnCondicion(
    lineaRaw, siToken.end, sig[entoncesIdx].col, lineaIdx, agregarError
  );
}

/**
 * Recorre un rango de condición respetando strings y comentarios, y
 * reporta operadores de comparación no permitidos.
 * Permitidos: ==, <>, <=, >=, !=, <, >
 * Cualquier otro (ej. =, !, =<, =>) es error. El operador "=" es asignación,
 * no comparación, por lo que tampoco es válido aquí.
 * `contexto` nombra la estructura para el mensaje (ej. "Si", "Hasta Que").
 */
function validarComparacionesEnCondicion(lineaRaw, colInicio, colFin, lineaIdx, agregarError, contexto) {
  const VALIDOS_DOBLE = new Set(['==', '<>', '<=', '>=', '!=']);
  const nombreCtx = contexto || 'Si';
  let inStr = false;
  let i = colInicio;

  while (i < colFin) {
    const ch = lineaRaw[i];
    if (ch === '"') { inStr = !inStr; i++; continue; }
    if (inStr) { i++; continue; }
    if (ch === '/' && lineaRaw[i + 1] === '/') break;

    if (ch === '<' || ch === '>' || ch === '=' || ch === '!') {
      const two = lineaRaw.substring(i, i + 2);

      if (VALIDOS_DOBLE.has(two)) {
        i += 2;
        continue;
      }

      if (ch === '<' || ch === '>') {
        i++;
        continue;
      }

      agregarError(lineaIdx, crearError(
        lineaIdx, i, i + 1, 'comparador_invalido',
        `Operador de comparación no válido en la condición del "${nombreCtx}".`, ch
      ));
      i++;
      continue;
    }

    i++;
  }
}

// ─────────────────────────────────────────────
//  VALIDATION: Segun / De Otro Modo / FinSegun
// ─────────────────────────────────────────────

/**
 * Pasada estructural sobre el documento completo para Segun.
 * Mantiene una pila para soportar anidación. Rastrea:
 *   - cabecera (expresión y palabra "Hacer")
 *   - etiquetas de caso (valores + ":")
 *   - valores duplicados dentro del mismo Segun
 *   - "De Otro Modo:" único y posterior a los casos
 *   - contenido real por cada segmento (caso o De Otro Modo)
 *   - cierre con "FinSegun"
 */
function validarBloquesSegun(lineas, agregarError) {
  const stack = [];

  for (let i = 0; i < lineas.length; i++) {
    const lineaRaw = lineas[i];
    const allTokens = tokenizarLinea(lineaRaw);
    const sig = tokensSignificativos(allTokens);
    if (sig.length === 0) continue;

    const primera = sig[0];
    const palabra = primera.type === TK.KEYWORD ? primera.value.toLowerCase() : null;

    if (palabra === 'segun') {
      if (stack.length > 0 && stack[stack.length - 1].ultimoSegmento) {
        stack[stack.length - 1].ultimoSegmento.contenido++;
      }
      validarCabeceraSegun(sig, i, agregarError);
      stack.push({
        lineaSegun: i,
        tieneDeOtroModo: false,
        casos: new Set(),
        ultimoSegmento: null,
        tieneAlgunCaso: false,
      });
      continue;
    }

    if (palabra === 'finsegun') {
      if (stack.length === 0) {
        agregarError(i, crearError(
          i, primera.col, primera.end, 'finsegun_sin_segun',
          '"FinSegun" sin una sentencia "Segun" abierta.', primera.value
        ));
      } else {
        const top = stack.pop();
        finalizarSegmentoAntesFinSegun(top, agregarError);
        if (!top.tieneAlgunCaso && !top.tieneDeOtroModo) {
          agregarError(i, crearError(
            i, primera.col, primera.end, 'segun_sin_casos',
            'La sentencia "Segun" debe tener al menos un caso o un bloque "De Otro Modo".', ''
          ));
        }
      }
      if (sig.length > 1) {
        const extra = sig[1];
        const last = sig[sig.length - 1];
        agregarError(i, crearError(
          i, extra.col, last.end, 'finsegun_texto_extra',
          '"FinSegun" no debe tener argumentos ni texto adicional.', ''
        ));
      }
      continue;
    }

    if (palabra === 'de' && esDeOtroModo(sig)) {
      if (stack.length === 0) {
        agregarError(i, crearError(
          i, primera.col, sig[2].end, 'deotromodo_sin_segun',
          '"De Otro Modo" sin una sentencia "Segun" abierta.', ''
        ));
      } else {
        const top = stack[stack.length - 1];
        finalizarSegmentoEnMedio(top, agregarError);
        if (top.tieneDeOtroModo) {
          agregarError(i, crearError(
            i, primera.col, sig[2].end, 'deotromodo_duplicado',
            'La sentencia "Segun" ya contiene un bloque "De Otro Modo".', ''
          ));
        } else {
          if (!top.tieneAlgunCaso) {
            agregarError(i, crearError(
              i, primera.col, sig[2].end, 'deotromodo_antes_casos',
              '"De Otro Modo" debe aparecer después de al menos un caso.', ''
            ));
          }
          top.tieneDeOtroModo = true;
        }
        top.ultimoSegmento = { tipo: 'deotromodo', contenido: 0, linea: i };
      }

      if (sig.length === 3) {
        agregarError(i, crearError(
          i, sig[0].col, sig[2].end, 'deotromodo_sin_colon',
          '"De Otro Modo" debe terminar con ":".', ''
        ));
      } else if (sig[3].type !== TK.COLON) {
        agregarError(i, crearError(
          i, sig[3].col, sig[sig.length - 1].end, 'deotromodo_texto_extra',
          '"De Otro Modo" no debe tener texto adicional.', ''
        ));
      } else if (sig.length > 4) {
        const extra = sig[4];
        const last = sig[sig.length - 1];
        agregarError(i, crearError(
          i, extra.col, last.end, 'deotromodo_texto_extra',
          '"De Otro Modo" no debe tener texto adicional.', ''
        ));
      }
      continue;
    }

    // Etiqueta de caso: contiene ":" y estamos dentro de un Segun abierto
    const colonIdx = sig.findIndex(t => t.type === TK.COLON);
    if (colonIdx >= 0 && stack.length > 0) {
      const top = stack[stack.length - 1];
      finalizarSegmentoEnMedio(top, agregarError);

      if (top.tieneDeOtroModo) {
        const last = sig[sig.length - 1];
        agregarError(i, crearError(
          i, primera.col, last.end, 'caso_despues_deotromodo',
          'No puede haber casos después de "De Otro Modo".', ''
        ));
      }

      validarEtiquetaCaso(sig, colonIdx, i, top, agregarError);

      if (!top.tieneDeOtroModo) {
        top.tieneAlgunCaso = true;
      }
      top.ultimoSegmento = { tipo: 'caso', contenido: 0, linea: i };
      continue;
    }

    // Cualquier otra línea cuenta como contenido del segmento actual
    if (stack.length > 0 && stack[stack.length - 1].ultimoSegmento) {
      stack[stack.length - 1].ultimoSegmento.contenido++;
    }
  }

  for (const ctx of stack) {
    const longitud = lineas[ctx.lineaSegun] ? lineas[ctx.lineaSegun].length : 0;
    agregarError(ctx.lineaSegun, crearError(
      ctx.lineaSegun, 0, longitud, 'segun_sin_cerrar',
      'Falta "FinSegun" para cerrar la sentencia "Segun".', ''
    ));
  }
}

function esDeOtroModo(sig) {
  if (sig.length < 3) return false;
  if (sig[0].type !== TK.KEYWORD || sig[0].value.toLowerCase() !== 'de') return false;
  if (sig[1].type !== TK.KEYWORD || sig[1].value.toLowerCase() !== 'otro') return false;
  if (sig[2].type !== TK.KEYWORD || sig[2].value.toLowerCase() !== 'modo') return false;
  return true;
}

function validarCabeceraSegun(sig, lineaIdx, agregarError) {
  const segunToken = sig[0];

  let hacerIdx = -1;
  for (let i = 1; i < sig.length; i++) {
    if (sig[i].type === TK.KEYWORD && sig[i].value.toLowerCase() === 'hacer') {
      hacerIdx = i;
      break;
    }
  }

  const exprTokens = hacerIdx === -1 ? sig.slice(1) : sig.slice(1, hacerIdx);

  if (exprTokens.length === 0) {
    const colFin = hacerIdx === -1 ? segunToken.end : sig[hacerIdx].end;
    agregarError(lineaIdx, crearError(
      lineaIdx, segunToken.col, colFin, 'segun_sin_expresion',
      'Falta la expresión en la sentencia "Segun".', ''
    ));
  }

  if (hacerIdx === -1) {
    agregarError(lineaIdx, crearError(
      lineaIdx, segunToken.col, sig[sig.length - 1].end, 'segun_sin_hacer',
      'Falta la palabra clave "Hacer" en la sentencia "Segun".', ''
    ));
    return;
  }

  if (hacerIdx + 1 < sig.length) {
    const extra = sig[hacerIdx + 1];
    const last = sig[sig.length - 1];
    agregarError(lineaIdx, crearError(
      lineaIdx, extra.col, last.end, 'hacer_texto_extra',
      'No debe haber texto después de "Hacer".', ''
    ));
  }
}

function validarEtiquetaCaso(sig, colonIdx, lineaIdx, top, agregarError) {
  const colonToken = sig[colonIdx];
  const valoresTokens = sig.slice(0, colonIdx);
  const afterColon = sig.slice(colonIdx + 1);

  if (afterColon.length > 0) {
    const first = afterColon[0];
    const last = afterColon[afterColon.length - 1];
    agregarError(lineaIdx, crearError(
      lineaIdx, first.col, last.end, 'caso_texto_extra',
      'No debe haber texto después de ":" en la línea del caso.', ''
    ));
  }

  if (valoresTokens.length === 0) {
    agregarError(lineaIdx, crearError(
      lineaIdx, colonToken.col, colonToken.end, 'caso_sin_valor',
      'Falta al menos un valor en el caso del "Segun".', ''
    ));
    return;
  }

  let esperandoValor = true;
  let ultimaEraComa = false;
  let ultimoTokenComa = null;
  let huboValor = false;

  for (const tk of valoresTokens) {
    if (tk.type === TK.COMMA) {
      if (esperandoValor) {
        agregarError(lineaIdx, crearError(
          lineaIdx, tk.col, tk.end, 'caso_coma_invalida',
          'Coma inválida en la lista de valores del caso.', ','
        ));
      }
      esperandoValor = true;
      ultimaEraComa = true;
      ultimoTokenComa = tk;
    } else {
      ultimaEraComa = false;
      if (esperandoValor) {
        if (esValorDeCaso(tk)) {
          const key = valorDeCasoKey(tk);
          if (top.casos.has(key)) {
            agregarError(lineaIdx, crearError(
              lineaIdx, tk.col, tk.end, 'caso_duplicado',
              'Valor de caso duplicado en la sentencia "Segun".', tk.value
            ));
          } else {
            top.casos.add(key);
          }
          huboValor = true;
        } else {
          agregarError(lineaIdx, crearError(
            lineaIdx, tk.col, tk.end, 'caso_valor_invalido',
            `Valor de caso no válido: "${tk.value}".`, tk.value
          ));
        }
        esperandoValor = false;
      } else {
        agregarError(lineaIdx, crearError(
          lineaIdx, tk.col, tk.end, 'caso_sintaxis',
          'Se esperaba una coma entre los valores del caso.', ''
        ));
      }
    }
  }

  if (ultimaEraComa) {
    agregarError(lineaIdx, crearError(
      lineaIdx, ultimoTokenComa.col, ultimoTokenComa.end, 'caso_coma_invalida',
      'Coma inválida en la lista de valores del caso.', ','
    ));
  }

  if (!huboValor) {
    agregarError(lineaIdx, crearError(
      lineaIdx, colonToken.col, colonToken.end, 'caso_sin_valor',
      'Falta al menos un valor en el caso del "Segun".', ''
    ));
  }
}

function esValorDeCaso(tk) {
  return tk.type === TK.NUMBER || tk.type === TK.STRING || tk.type === TK.IDENTIFIER;
}

function valorDeCasoKey(tk) {
  if (tk.type === TK.NUMBER) return `num:${tk.value}`;
  if (tk.type === TK.STRING) return `str:${tk.value}`;
  if (tk.type === TK.IDENTIFIER) return `id:${tk.value.toLowerCase()}`;
  return `raw:${tk.value}`;
}

function finalizarSegmentoEnMedio(top, agregarError) {
  if (!top.ultimoSegmento) return;
  if (top.ultimoSegmento.contenido > 0) return;
  const prev = top.ultimoSegmento;
  if (prev.tipo === 'caso') {
    agregarError(prev.linea, crearError(
      prev.linea, 0, 0, 'caso_vacio',
      'Debe haber al menos una instrucción después de este caso del "Segun".', ''
    ));
  }
}

function finalizarSegmentoAntesFinSegun(top, agregarError) {
  if (!top.ultimoSegmento) return;
  if (top.ultimoSegmento.contenido > 0) return;
  const prev = top.ultimoSegmento;
  if (prev.tipo === 'deotromodo') {
    agregarError(prev.linea, crearError(
      prev.linea, 0, 0, 'deotromodo_vacio',
      'Debe haber al menos una instrucción entre "De Otro Modo:" y "FinSegun".', ''
    ));
  } else if (prev.tipo === 'caso') {
    agregarError(prev.linea, crearError(
      prev.linea, 0, 0, 'ultimo_bloque_vacio',
      'Falta contenido en el último bloque del "Segun" antes de "FinSegun".', ''
    ));
  }
}

// ─────────────────────────────────────────────
//  VALIDATION: Repetir / Hasta Que
// ─────────────────────────────────────────────

/**
 * Pasada estructural sobre el documento completo para Repetir.
 * Mantiene una pila para soportar anidación. Valida:
 *   - "Repetir" en línea propia, sin texto adicional
 *   - "Hasta Que <condición>" con condición no vacía
 *   - operadores de comparación permitidos en la condición
 *   - al menos una instrucción real entre "Repetir" y "Hasta Que"
 *   - "Hasta" incompleto sin "Que"
 *   - "Hasta Que" sin un "Repetir" abierto
 *   - "Repetir" sin cerrar al final del documento
 */
function validarBloquesRepetir(lineas, agregarError) {
  const stack = [];

  for (let i = 0; i < lineas.length; i++) {
    const lineaRaw = lineas[i];
    const allTokens = tokenizarLinea(lineaRaw);
    const sig = tokensSignificativos(allTokens);
    if (sig.length === 0) continue;

    const primera = sig[0];
    const palabra = primera.type === TK.KEYWORD ? primera.value.toLowerCase() : null;

    if (palabra === 'repetir') {
      if (stack.length > 0) stack[stack.length - 1].contenido++;

      if (sig.length > 1) {
        const extra = sig[1];
        const last = sig[sig.length - 1];
        agregarError(i, crearError(
          i, extra.col, last.end, 'repetir_texto_extra',
          '"Repetir" no debe tener argumentos ni texto adicional.', ''
        ));
      }

      stack.push({ lineaRepetir: i, contenido: 0 });
      continue;
    }

    if (palabra === 'hasta') {
      const esHastaQue = sig.length >= 2
        && sig[1].type === TK.KEYWORD
        && sig[1].value.toLowerCase() === 'que';

      if (!esHastaQue) {
        agregarError(i, crearError(
          i, primera.col, sig[sig.length - 1].end, 'hastaque_incompleto',
          'La sentencia "Hasta Que" está incompleta.', ''
        ));
        continue;
      }

      const queToken = sig[1];
      const condTokens = sig.slice(2);

      if (stack.length === 0) {
        const last = sig[sig.length - 1];
        agregarError(i, crearError(
          i, primera.col, last.end, 'hastaque_sin_repetir',
          '"Hasta Que" sin una sentencia "Repetir" abierta.', ''
        ));
      }

      if (condTokens.length === 0) {
        agregarError(i, crearError(
          i, primera.col, queToken.end, 'hastaque_sin_condicion',
          'Falta la condición en la sentencia "Hasta Que".', ''
        ));
      } else {
        validarComparacionesEnCondicion(
          lineaRaw, queToken.end, lineaRaw.length, i, agregarError, 'Hasta Que'
        );
      }

      if (stack.length > 0) {
        const top = stack.pop();
        if (top.contenido === 0) {
          agregarError(i, crearError(
            i, primera.col, queToken.end, 'repetir_vacio',
            'Debe haber al menos una instrucción entre "Repetir" y "Hasta Que".', ''
          ));
        }
      }
      continue;
    }

    if (stack.length > 0) stack[stack.length - 1].contenido++;
  }

  for (const ctx of stack) {
    const longitud = lineas[ctx.lineaRepetir] ? lineas[ctx.lineaRepetir].length : 0;
    agregarError(ctx.lineaRepetir, crearError(
      ctx.lineaRepetir, 0, longitud, 'repetir_sin_cerrar',
      'Falta "Hasta Que" para cerrar la sentencia "Repetir".', ''
    ));
  }
}

// ─────────────────────────────────────────────
//  VALIDATION: Para / FinPara
// ─────────────────────────────────────────────

/**
 * Pasada estructural sobre el documento completo para Para.
 * Mantiene una pila para soportar anidación. Valida:
 *   - cabecera: variable de control, =, expr inicial, Hasta, expr final,
 *     Con Paso opcional (sin duplicados, con expresión, no cero literal), Hacer
 *   - texto extra después de Hacer
 *   - variable de control e identificadores en expresiones definidos
 *   - al menos una instrucción real entre la cabecera y FinPara
 *   - FinPara en línea propia, sin texto extra
 *   - FinPara sin Para abierto
 *   - Para sin cerrar al final del documento
 */
function validarBloquesPara(lineas, tabla, agregarError) {
  const stack = [];

  for (let i = 0; i < lineas.length; i++) {
    const lineaRaw = lineas[i];
    const allTokens = tokenizarLinea(lineaRaw);
    const sig = tokensSignificativos(allTokens);
    if (sig.length === 0) continue;

    const primera = sig[0];
    const palabra = primera.type === TK.KEYWORD ? primera.value.toLowerCase() : null;

    if (palabra === 'para') {
      if (stack.length > 0) stack[stack.length - 1].contenido++;
      validarCabeceraPara(sig, i, tabla, agregarError);
      stack.push({ lineaPara: i, contenido: 0 });
      continue;
    }

    if (palabra === 'finpara') {
      if (stack.length === 0) {
        agregarError(i, crearError(
          i, primera.col, primera.end, 'finpara_sin_para',
          '"FinPara" sin una sentencia "Para" abierta.', primera.value
        ));
      } else {
        const top = stack.pop();
        if (top.contenido === 0) {
          agregarError(i, crearError(
            i, primera.col, primera.end, 'para_vacio',
            'Debe haber al menos una instrucción entre "Para ... Hacer" y "FinPara".', ''
          ));
        }
      }
      if (sig.length > 1) {
        const extra = sig[1];
        const last = sig[sig.length - 1];
        agregarError(i, crearError(
          i, extra.col, last.end, 'finpara_texto_extra',
          '"FinPara" no debe tener argumentos ni texto adicional.', ''
        ));
      }
      continue;
    }

    if (stack.length > 0) stack[stack.length - 1].contenido++;
  }

  for (const ctx of stack) {
    const longitud = lineas[ctx.lineaPara] ? lineas[ctx.lineaPara].length : 0;
    agregarError(ctx.lineaPara, crearError(
      ctx.lineaPara, 0, longitud, 'para_sin_cerrar',
      'Falta "FinPara" para cerrar la sentencia "Para".', ''
    ));
  }
}

function esKeyword(tk, nombre) {
  return tk && tk.type === TK.KEYWORD && tk.value.toLowerCase() === nombre;
}

function buscarKeywordEnRango(sig, desde, nombre) {
  for (let i = desde; i < sig.length; i++) {
    if (esKeyword(sig[i], nombre)) return i;
  }
  return -1;
}

function validarIdentificadoresDefinidos(tokens, lineaIdx, tabla, agregarError, tipoErr, mensaje) {
  for (const tk of tokens) {
    if (tk.type !== TK.IDENTIFIER) continue;
    if (!tabla.existeVariable(tk.value)) {
      agregarError(lineaIdx, crearError(
        lineaIdx, tk.col, tk.end, tipoErr, mensaje, tk.value
      ));
    }
  }
}

function validarCabeceraPara(sig, lineaIdx, tabla, agregarError) {
  const paraTok = sig[0];
  let idx = 1;

  // 1. Variable de control
  if (idx >= sig.length) {
    agregarError(lineaIdx, crearError(
      lineaIdx, paraTok.col, paraTok.end, 'para_sin_variable',
      'Falta la variable de control en la sentencia "Para".', ''
    ));
    return;
  }

  if (sig[idx].type !== TK.IDENTIFIER) {
    if (sig[idx].type === TK.ASSIGN) {
      agregarError(lineaIdx, crearError(
        lineaIdx, paraTok.col, sig[idx].end, 'para_sin_variable',
        'Falta la variable de control en la sentencia "Para".', ''
      ));
    } else {
      agregarError(lineaIdx, crearError(
        lineaIdx, sig[idx].col, sig[idx].end, 'para_variable_invalida',
        'Se esperaba una variable válida en la sentencia "Para".', sig[idx].value
      ));
    }
    return;
  }

  const varControl = sig[idx];
  if (!tabla.existeVariable(varControl.value)) {
    agregarError(lineaIdx, crearError(
      lineaIdx, varControl.col, varControl.end, 'para_variable_no_definida',
      'Variable de control no definida en la sentencia "Para".', varControl.value
    ));
  }
  idx++;

  // 2. Operador =
  if (idx >= sig.length || sig[idx].type !== TK.ASSIGN) {
    const col = idx < sig.length ? sig[idx].col : varControl.end;
    const end = idx < sig.length ? sig[idx].end : varControl.end;
    agregarError(lineaIdx, crearError(
      lineaIdx, varControl.col, end, 'para_sin_asignacion',
      'Falta el operador "=" en la sentencia "Para".', ''
    ));
    return;
  }
  const assignTok = sig[idx];
  idx++;

  // 3. Expresión inicial hasta "Hasta"
  const hastaIdx = buscarKeywordEnRango(sig, idx, 'hasta');
  if (hastaIdx === -1) {
    if (idx >= sig.length) {
      agregarError(lineaIdx, crearError(
        lineaIdx, assignTok.col, assignTok.end, 'para_sin_expresion_inicial',
        'Falta la expresión inicial en la sentencia "Para".', ''
      ));
    }
    agregarError(lineaIdx, crearError(
      lineaIdx, paraTok.col, sig[sig.length - 1].end, 'para_sin_hasta',
      'Falta la palabra clave "Hasta" en la sentencia "Para".', ''
    ));
    return;
  }

  const exprInicial = sig.slice(idx, hastaIdx);
  if (exprInicial.length === 0) {
    agregarError(lineaIdx, crearError(
      lineaIdx, assignTok.col, sig[hastaIdx].end, 'para_sin_expresion_inicial',
      'Falta la expresión inicial en la sentencia "Para".', ''
    ));
  } else {
    validarIdentificadoresDefinidos(
      exprInicial, lineaIdx, tabla, agregarError,
      'variable_no_definida_para', 'Variable no definida en la cabecera de la sentencia "Para".'
    );
  }
  const hastaTok = sig[hastaIdx];
  idx = hastaIdx + 1;

  // 4. Expresión final hasta "Con" o "Hacer"
  const conIdx = buscarKeywordEnRango(sig, idx, 'con');
  const hacerIdx0 = buscarKeywordEnRango(sig, idx, 'hacer');
  let finalEnd;
  if (conIdx !== -1 && (hacerIdx0 === -1 || conIdx < hacerIdx0)) {
    finalEnd = conIdx;
  } else if (hacerIdx0 !== -1) {
    finalEnd = hacerIdx0;
  } else {
    finalEnd = sig.length;
  }

  const exprFinal = sig.slice(idx, finalEnd);
  if (exprFinal.length === 0) {
    const colFin = finalEnd < sig.length ? sig[finalEnd].end : hastaTok.end;
    agregarError(lineaIdx, crearError(
      lineaIdx, hastaTok.col, colFin, 'para_sin_expresion_final',
      'Falta la expresión final en la sentencia "Para".', ''
    ));
  } else {
    validarIdentificadoresDefinidos(
      exprFinal, lineaIdx, tabla, agregarError,
      'variable_no_definida_para', 'Variable no definida en la cabecera de la sentencia "Para".'
    );
  }
  idx = finalEnd;

  // 5. Con Paso opcional (uno o más detectados; >1 dispara duplicado)
  let tienePaso = false;
  while (idx < sig.length && esKeyword(sig[idx], 'con')) {
    const conTok = sig[idx];
    if (tienePaso) {
      agregarError(lineaIdx, crearError(
        lineaIdx, conTok.col, conTok.end, 'para_con_paso_duplicado',
        'La sentencia "Para" ya contiene un bloque "Con Paso".', ''
      ));
    }
    idx++;

    if (idx >= sig.length || !esKeyword(sig[idx], 'paso')) {
      const colFin = idx < sig.length ? sig[idx].end : conTok.end;
      agregarError(lineaIdx, crearError(
        lineaIdx, conTok.col, colFin, 'con_sin_paso',
        'Después de "Con" debe ir la palabra clave "Paso".', ''
      ));
      break;
    }
    const pasoTok = sig[idx];
    idx++;

    const nextCon = buscarKeywordEnRango(sig, idx, 'con');
    const nextHacer = buscarKeywordEnRango(sig, idx, 'hacer');
    let pasoEnd;
    if (nextCon !== -1 && (nextHacer === -1 || nextCon < nextHacer)) {
      pasoEnd = nextCon;
    } else if (nextHacer !== -1) {
      pasoEnd = nextHacer;
    } else {
      pasoEnd = sig.length;
    }

    const exprPaso = sig.slice(idx, pasoEnd);
    if (exprPaso.length === 0) {
      const colFin = pasoEnd < sig.length ? sig[pasoEnd].end : pasoTok.end;
      agregarError(lineaIdx, crearError(
        lineaIdx, pasoTok.col, colFin, 'para_sin_expresion_paso',
        'Falta la expresión de paso en la sentencia "Para".', ''
      ));
    } else {
      validarIdentificadoresDefinidos(
        exprPaso, lineaIdx, tabla, agregarError,
        'variable_no_definida_para', 'Variable no definida en la cabecera de la sentencia "Para".'
      );
      if (exprPaso.length === 1 && exprPaso[0].type === TK.NUMBER) {
        const n = parseFloat(exprPaso[0].value);
        if (!isNaN(n) && n === 0) {
          agregarError(lineaIdx, crearError(
            lineaIdx, exprPaso[0].col, exprPaso[0].end, 'paso_cero',
            'El valor de "Paso" no puede ser cero.', exprPaso[0].value
          ));
        }
      }
    }

    idx = pasoEnd;
    tienePaso = true;
  }

  // 6. Hacer
  if (idx >= sig.length || !esKeyword(sig[idx], 'hacer')) {
    const last = sig[sig.length - 1];
    agregarError(lineaIdx, crearError(
      lineaIdx, paraTok.col, last.end, 'para_sin_hacer',
      'Falta la palabra clave "Hacer" en la sentencia "Para".', ''
    ));
    return;
  }
  idx++;

  // 7. Texto después de Hacer
  if (idx < sig.length) {
    const extra = sig[idx];
    const last = sig[sig.length - 1];
    agregarError(lineaIdx, crearError(
      lineaIdx, extra.col, last.end, 'hacer_texto_extra',
      'No debe haber texto después de "Hacer".', ''
    ));
  }
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
  const colonIdx = sig.findIndex(t => t.type === TK.COLON);
  const esCasoSegun =
    colonIdx > 0 &&
    !(sig[0].type === TK.KEYWORD && sig[0].value.toLowerCase() === 'de');

  if (esCasoSegun) {
    const restoSig = sig.slice(colonIdx + 1);
    if (restoSig.length > 0) {
      errores.push(...validarLinea(restoSig, restoSig, lineaIdx, tabla));
    }
    return errores;
  }

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
      break;

    // ── Estructuras de control — aceptadas sin validación profunda ──
    case 'si':
    case 'sino':
    case 'finsi':
    case 'mientras':
    case 'finmientras':
    case 'repetir':
    case 'hastaque':
    case 'para':
    case 'finpara':
    case 'segun':
    case 'finsegun':
    case 'de':       // De Otro Modo:
    case 'entonces': // no debería aparecer solo, pero evita falso positivo
    case 'hacer':
    case 'hasta':
    case 'que':
    case 'con':
    case 'paso':
    case 'otro':
    case 'modo':
    case 'y':
    case 'o':
    case 'no':
      break;

    default:
      // Etiqueta de caso en Segun: cualquier línea cuyo último token significativo es COLON
      if (sig[sig.length - 1].type === TK.COLON) {
        break;
      }
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
//  VALIDATION: Asignación (var = expr)
// ─────────────────────────────────────────────

function validarAsignacion(sig, lineaIdx, tabla, errores) {
  const varToken = sig[0];

  if (varToken.type !== TK.IDENTIFIER) {
    errores.push(crearError(
      lineaIdx, varToken.col, varToken.end,
      'sintaxis_asignacion',
      `Se esperaba una variable antes de "=", se encontró: "${varToken.value}"`,
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
      'Falta la expresión después de "=".',
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
