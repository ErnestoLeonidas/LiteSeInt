/**
 * ============================================================
 *  parser.js — Construcción del AST LiteSeInt (v1.1.0 F3)
 * ============================================================
 *  Espejo de la lógica de LiteSeInt._parsear (core/LiteSeInt.js)
 *  pero produciendo nodos PascalCase definidos en core/ast.js.
 *
 *  En F3 este parser es un CONTRATO PARALELO al runtime — el
 *  runtime sigue ejecutando con su _parsear interno (legacy
 *  lowercase). F4 conmuta el runtime a este AST.
 *
 *  Por eso ambos coexisten en v1.1.0:
 *  - LiteSeInt._parsear  → nodos { tipo:'si', ... } (legacy)
 *  - parsearPrograma     → nodo  { tipo:'Programa', cuerpo:[{tipo:'Si',...}] }
 *
 *  Depende de:
 *  - core/tokenizer.js (stripComment, REGEX_HASTAQUE_LINEA vía
 *    DocErrores, pero también accesible directo).
 *  - core/ast.js (factories de nodos).
 * ============================================================
 */

const _REGEX_HASTAQUE_PARSER = /^(?:hastaque|hasta\s+que)\s+(.+)$/i;

function _encontrarPosAsignacionParser(linea) {
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

function _crearNodoSimpleAST(linea, lineaIdx, lineaRaw) {
  const loc = locDeLinea(lineaIdx, lineaRaw);
  if (/^definir\s+/i.test(linea))  return nodoDefinir(linea, loc);
  if (/^escribir\s+/i.test(linea)) return nodoEscribir(linea, loc);
  if (/^leer\s+/i.test(linea))     return nodoLeer(linea, loc);
  if (_encontrarPosAsignacionParser(linea) >= 0) return nodoAsignar(linea, loc);
  return nodoDesconocido(linea, loc);
}

/**
 * Parsea código LiteSeInt completo y devuelve el AST.
 * Salida: { tipo: 'Programa', astVersion: 2, cuerpo: [...], loc }
 *
 * El parser actual reutiliza la estrategia line-based del runtime
 * legacy: tokeniza por línea relevante y empuja frames a una pila
 * para los bloques (Si/Mientras/Repetir/Para/Segun).
 *
 * NO emite errores estáticos: para eso está DocErrores.validarDocumento.
 * Aquí solo construye el árbol; las líneas con sintaxis no reconocida
 * se materializan como nodos Desconocido para que el runtime las
 * detecte en ejecución (igual que hace LiteSeInt._parsear hoy).
 */
function parsearPrograma(codigo) {
  const lineas = codigo.split('\n');
  const cuerpoRaiz = [];
  const stack = []; // { tipo, nodo, parentBloque }
  let bloqueActual = cuerpoRaiz;

  for (let i = 0; i < lineas.length; i++) {
    const lineaRaw = lineas[i].trim();
    const linea = stripComment(lineaRaw);
    if (linea === '') continue;

    if (/^proceso(\s+\S+)?$/i.test(linea)) continue;
    if (/^finproceso$/i.test(linea)) continue;

    if (/^si\s+.+\s+entonces$/i.test(linea)) {
      const condicion = linea.replace(/^si\s+/i, '').replace(/\s+entonces$/i, '').trim();
      const loc = locDeLinea(i, lineaRaw);
      const nodo = nodoSi(condicion, [], null, loc);
      if (bloqueActual !== null) bloqueActual.push(nodo);
      stack.push({ tipo: 'Si', nodo, parentBloque: bloqueActual });
      bloqueActual = nodo.entonces;
      continue;
    }

    if (/^sino$/i.test(linea)) {
      const ctx = stack[stack.length - 1];
      if (ctx && ctx.tipo === 'Si') {
        ctx.nodo.sino = [];
        bloqueActual = ctx.nodo.sino;
      }
      continue;
    }

    if (/^finsi$/i.test(linea)) {
      const ctx = stack.pop();
      bloqueActual = ctx ? ctx.parentBloque : cuerpoRaiz;
      continue;
    }

    if (/^mientras\s+.+\s+hacer$/i.test(linea)) {
      const condicion = linea.replace(/^mientras\s+/i, '').replace(/\s+hacer$/i, '').trim();
      const loc = locDeLinea(i, lineaRaw);
      const nodo = nodoMientras(condicion, [], loc);
      if (bloqueActual !== null) bloqueActual.push(nodo);
      stack.push({ tipo: 'Mientras', nodo, parentBloque: bloqueActual });
      bloqueActual = nodo.cuerpo;
      continue;
    }

    if (/^finmientras$/i.test(linea)) {
      const ctx = stack.pop();
      bloqueActual = ctx ? ctx.parentBloque : cuerpoRaiz;
      continue;
    }

    if (/^repetir$/i.test(linea)) {
      const loc = locDeLinea(i, lineaRaw);
      const nodo = nodoRepetir([], null, loc, loc);
      if (bloqueActual !== null) bloqueActual.push(nodo);
      stack.push({ tipo: 'Repetir', nodo, parentBloque: bloqueActual });
      bloqueActual = nodo.cuerpo;
      continue;
    }

    const hqMatch = linea.match(_REGEX_HASTAQUE_PARSER);
    if (hqMatch) {
      const condicion = hqMatch[1].trim();
      const ctx = stack[stack.length - 1];
      if (ctx && ctx.tipo === 'Repetir') {
        ctx.nodo.condicion = condicion;
        ctx.nodo.locHastaQue = locDeLinea(i, lineaRaw);
        const parentBloque = ctx.parentBloque;
        stack.pop();
        bloqueActual = parentBloque;
      }
      continue;
    }

    const paraMatch = linea.match(
      /^para\s+(\w+)\s*=(?!=)\s*(.+?)\s+hasta\s+(.+?)(?:\s+con\s+paso\s+(.+?))?\s+hacer$/i
    );
    if (paraMatch) {
      const loc = locDeLinea(i, lineaRaw);
      const nodo = nodoPara(
        paraMatch[1].toLowerCase(),
        paraMatch[1],
        paraMatch[2].trim(),
        paraMatch[3].trim(),
        (paraMatch[4] || '1').trim(),
        [],
        loc
      );
      if (bloqueActual !== null) bloqueActual.push(nodo);
      stack.push({ tipo: 'Para', nodo, parentBloque: bloqueActual });
      bloqueActual = nodo.cuerpo;
      continue;
    }

    if (/^finpara$/i.test(linea)) {
      const ctx = stack.pop();
      bloqueActual = ctx ? ctx.parentBloque : cuerpoRaiz;
      continue;
    }

    if (/^segun\s+.+\s+hacer$/i.test(linea)) {
      const exprMatch = linea.match(/^segun\s+(.+?)\s+hacer$/i);
      const loc = locDeLinea(i, lineaRaw);
      const nodo = nodoSegun(exprMatch[1].trim(), [], null, loc);
      if (bloqueActual !== null) bloqueActual.push(nodo);
      stack.push({ tipo: 'Segun', nodo, parentBloque: bloqueActual });
      bloqueActual = null; // espera etiqueta de caso
      continue;
    }

    if (/^de\s+otro\s+modo\s*:$/i.test(linea)) {
      const ctx = stack[stack.length - 1];
      if (ctx && ctx.tipo === 'Segun') {
        ctx.nodo.otro = [];
        bloqueActual = ctx.nodo.otro;
      }
      continue;
    }

    if (/^finsegun$/i.test(linea)) {
      const ctx = stack.pop();
      bloqueActual = ctx ? ctx.parentBloque : cuerpoRaiz;
      continue;
    }

    const ctxTop = stack[stack.length - 1];
    if (ctxTop && ctxTop.tipo === 'Segun') {
      const casoMatch = linea.match(/^([^:]+):\s*(.*)$/);
      if (casoMatch) {
        const valores = casoMatch[1].split(',').map(v => v.trim());
        const casoNodo = nodoCaso(valores, []);
        ctxTop.nodo.casos.push(casoNodo);
        bloqueActual = casoNodo.cuerpo;
        const restLinea = casoMatch[2].trim();
        if (restLinea) {
          const instrNodo = _crearNodoSimpleAST(restLinea, i, lineaRaw);
          if (instrNodo) bloqueActual.push(instrNodo);
        }
        continue;
      }
    }

    if (bloqueActual !== null) {
      const nodo = _crearNodoSimpleAST(linea, i, lineaRaw);
      if (nodo) bloqueActual.push(nodo);
    }
  }

  const locPrograma = {
    linea: 0,
    columnaInicio: 0,
    columnaFin: lineas.length > 0 ? lineas[0].length : 0,
  };
  return nodoPrograma(cuerpoRaiz, locPrograma);
}

const LiteSeIntParser = {
  parsearPrograma,
};
