const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function loadRuntime() {
  const ctx = {
    console,
    setTimeout,
    clearTimeout,
    Promise,
  };
  vm.createContext(ctx);
  const tokenizer = fs.readFileSync(path.join(root, 'core/tokenizer.js'), 'utf8');
  const symbolTable = fs.readFileSync(path.join(root, 'core/symbol-table.js'), 'utf8');
  const validator = fs.readFileSync(path.join(root, 'core/validator.js'), 'utf8');
  const docErrores = fs.readFileSync(path.join(root, 'core/doc_errores.js'), 'utf8');
  const ast = fs.readFileSync(path.join(root, 'core/ast.js'), 'utf8');
  const parser = fs.readFileSync(path.join(root, 'core/parser.js'), 'utf8');
  const exprEval = fs.readFileSync(path.join(root, 'core/expression-evaluator.js'), 'utf8');
  const liteSeInt = fs.readFileSync(path.join(root, 'core/LiteSeInt.js'), 'utf8');
  const ejercicios = fs.readFileSync(path.join(root, 'js/ejercicios-data.js'), 'utf8');
  vm.runInContext(`${tokenizer}\n${symbolTable}\n${validator}\n${docErrores}\nglobalThis.DocErrores = DocErrores; globalThis.LiteSeIntSymbolTable = LiteSeIntSymbolTable;`, ctx);
  vm.runInContext(`${ast}\n${parser}\nglobalThis.LiteSeIntAST = LiteSeIntAST; globalThis.LiteSeIntParser = LiteSeIntParser;`, ctx);
  vm.runInContext(`${exprEval}\nglobalThis.LiteSeIntExprEval = LiteSeIntExprEval;`, ctx);
  vm.runInContext(`${liteSeInt}\nglobalThis.LiteSeInt = LiteSeInt;`, ctx);
  vm.runInContext(`${ejercicios}\nglobalThis.EjerciciosLiteSeInt = globalThis.EjerciciosLiteSeInt;`, ctx);
  const ejerciciosJson = ctx.EjerciciosLiteSeInt.EJERCICIOS_JSON_PATHS.flatMap((jsonPath) => {
    const data = JSON.parse(fs.readFileSync(path.join(root, jsonPath), 'utf8'));
    return ctx.EjerciciosLiteSeInt.ejerciciosDesdeData(data, jsonPath);
  });
  ctx.EjerciciosLiteSeInt.instalarBanco(ejerciciosJson);
  return ctx;
}

function leerAppConstArray(nombre) {
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const inicio = app.indexOf(`const ${nombre} = [`);
  assert(inicio >= 0, `No se encontró ${nombre} en js/app.js`);
  const bracketInicio = app.indexOf('[', inicio);
  let profundidad = 0;
  let quote = null;
  let escaped = false;
  for (let i = bracketInicio; i < app.length; i++) {
    const ch = app[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '[') profundidad++;
    if (ch === ']') profundidad--;
    if (profundidad === 0) {
      const snippet = app.slice(inicio, i + 1);
      const ctx = {};
      vm.createContext(ctx);
      vm.runInContext(`${snippet}; globalThis.valor = ${nombre};`, ctx);
      return ctx.valor;
    }
  }
  throw new Error(`No se pudo extraer ${nombre} desde js/app.js`);
}

function validar(ctx, codigo) {
  return ctx.DocErrores.validarDocumento(codigo).errores;
}

async function ejecutar(ctx, codigo, opciones = {}) {
  const salida = [];
  const errores = [];
  let resolverEntrada = null;
  const interprete = new ctx.LiteSeInt({
    onEscribir: (texto) => salida.push(texto),
    onError: (linea, mensaje) => errores.push({ linea: linea + 1, mensaje }),
    onLeer: () => new Promise((resolve) => {
      resolverEntrada = resolve;
    }),
  });
  interprete.velocidadPausa = 0;

  const ejecucion = interprete.ejecutar(codigo);

  if (opciones.detenerDuranteLeer) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    interprete.detener();
    if (resolverEntrada) resolverEntrada('');
  }

  const resultado = await ejecucion;
  return { resultado, salida, errores };
}

const tests = [];

function test(nombre, fn) {
  tests.push({ nombre, fn });
}

test('rechaza documentos sin Proceso y FinProceso', () => {
  const ctx = loadRuntime();
  const errores = validar(ctx, 'Definir x Como Entero\nx = 1\nEscribir x');
  assert(errores.some((e) => e.tipo === 'proceso_faltante'));
  assert(errores.some((e) => e.tipo === 'finproceso_faltante'));
});

test('detecta cierres cruzados entre bloques anidados', () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir x Como Entero',
    'x = 0',
    'Si Verdadero Entonces',
    '  Mientras x < 1 Hacer',
    '    Escribir "dentro"',
    '  FinSi',
    'FinMientras',
    'FinProceso',
  ].join('\n');
  const errores = validar(ctx, codigo);
  assert(errores.some((e) => e.tipo === 'bloque_cierre_cruzado'));
});

test('ejecuta Segun con expresion en la cabecera', async () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir dia Como Entero',
    'dia = 1',
    'Segun dia + 0 Hacer',
    '  1: Escribir "ok"',
    'FinSegun',
    'FinProceso',
  ].join('\n');
  assert.strictEqual(validar(ctx, codigo).length, 0);
  const { resultado, salida } = await ejecutar(ctx, codigo);
  assert.strictEqual(resultado.exito, true);
  assert.deepStrictEqual(salida, ['ok']);
});

test('evalua Y, O y No dentro de asignaciones logicas', async () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir a, b, c Como Logico',
    'a = Verdadero',
    'b = Falso',
    'c = a Y No b',
    'Escribir c',
    'c = b O Falso',
    'Escribir c',
    'FinProceso',
  ].join('\n');
  assert.strictEqual(validar(ctx, codigo).length, 0);
  const { resultado, salida } = await ejecutar(ctx, codigo);
  assert.strictEqual(resultado.exito, true);
  assert.deepStrictEqual(salida, ['Verdadero', 'Falso']);
});

// =====================================================
// Banco de ejercicios y material pedagógico
// =====================================================

const CAMPOS_OBLIGATORIOS = [
  'id', 'origen', 'modulo', 'experiencia', 'nivelLiteSeInt',
  'numero', 'dificultad', 'gradoAyuda', 'titulo', 'conceptos', 'enunciado',
  'entradaProcesoSalida', 'salidaEsperada', 'pista',
  'codigoReferencia', 'estadoAdaptacion', 'motivoExclusion',
];

test('banco de ejercicios: ids unicos', () => {
  const ctx = loadRuntime();
  const ej = ctx.EjerciciosLiteSeInt.EJERCICIOS;
  const vistos = new Set();
  for (const e of ej) {
    assert(!vistos.has(e.id), `ID duplicado: ${e.id}`);
    vistos.add(e.id);
  }
});

test('banco de ejercicios: carga 245 ejercicios desde N1 a N7', () => {
  const ctx = loadRuntime();
  const ej = ctx.EjerciciosLiteSeInt.EJERCICIOS;
  assert.strictEqual(ej.length, 245);
  const conteo = new Map();
  for (const e of ej) {
    conteo.set(e.nivelLiteSeInt, (conteo.get(e.nivelLiteSeInt) || 0) + 1);
  }
  assert.deepStrictEqual(
    [...conteo.entries()].sort((a, b) => a[0] - b[0]),
    [[1, 20], [2, 40], [3, 40], [4, 60], [5, 15], [6, 40], [7, 30]],
  );
});

test('banco de ejercicios: campos obligatorios presentes', () => {
  const ctx = loadRuntime();
  const ej = ctx.EjerciciosLiteSeInt.EJERCICIOS;
  for (const e of ej) {
    for (const campo of CAMPOS_OBLIGATORIOS) {
      assert(campo in e, `Falta campo "${campo}" en ${e.id}`);
    }
  }
});

test('banco de ejercicios: solo estados, dificultades y grados permitidos', () => {
  const ctx = loadRuntime();
  const { EJERCICIOS, ESTADOS_VALIDOS, DIFICULTADES_VALIDAS, GRADOS_VALIDOS } =
    ctx.EjerciciosLiteSeInt;
  for (const e of EJERCICIOS) {
    assert(ESTADOS_VALIDOS.includes(e.estadoAdaptacion),
      `Estado inválido en ${e.id}: ${e.estadoAdaptacion}`);
    assert(DIFICULTADES_VALIDAS.includes(e.dificultad),
      `Dificultad inválida en ${e.id}: ${e.dificultad}`);
    assert(GRADOS_VALIDOS.includes(e.gradoAyuda),
      `Grado inválido en ${e.id}: ${e.gradoAyuda}`);
    assert(Number.isInteger(e.nivelLiteSeInt) && e.nivelLiteSeInt >= 0 && e.nivelLiteSeInt <= 9,
      `Nivel fuera de rango en ${e.id}: ${e.nivelLiteSeInt}`);
    assert.strictEqual(
      e.numero,
      `N${e.nivelLiteSeInt}-${String(Number(e.id.split('-')[1])).padStart(2, '0')}`,
      `Numero inválido en ${e.id}: ${e.numero}`,
    );
  }
});

test('banco de ejercicios: codigoReferencia adaptado no contiene sintaxis prohibida', () => {
  const ctx = loadRuntime();
  const adaptados = ctx.EjerciciosLiteSeInt.listarAdaptados();
  for (const e of adaptados) {
    const codigo = e.codigoReferencia;
    assert(!/<-/.test(codigo), `${e.id}: contiene "<-"`);
    assert(!/\bCadena\b/.test(codigo), `${e.id}: contiene "Cadena"`);
    assert(!/\bSiNo\b/.test(codigo), `${e.id}: contiene "SiNo"`);
    assert(!/\bMOD\b/.test(codigo), `${e.id}: contiene "MOD"`);
    assert(!/\bDIV\b/.test(codigo), `${e.id}: contiene "DIV"`);
    const lineasNoComentario = codigo
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, '').trimEnd());
    for (const linea of lineasNoComentario) {
      assert(!/;\s*$/.test(linea),
        `${e.id}: línea termina con ";": "${linea}"`);
    }
  }
});

test('banco de ejercicios: codigoReferencia adaptado pasa validacion estatica', () => {
  const ctx = loadRuntime();
  const adaptados = ctx.EjerciciosLiteSeInt.listarAdaptados();
  for (const e of adaptados) {
    const errores = validar(ctx, e.codigoReferencia);
    assert.strictEqual(
      errores.length,
      0,
      `${e.id} tiene errores estáticos: ${JSON.stringify(errores)}`,
    );
  }
});

test('banco de ejercicios: todos los visibles estan adaptados', () => {
  const ctx = loadRuntime();
  const visibles = ctx.EjerciciosLiteSeInt.listarAdaptados();
  for (const e of visibles) {
    assert.strictEqual(
      e.estadoAdaptacion,
      'adaptado',
      `${e.id} visible pero no adaptado`,
    );
  }
  assert(visibles.length > 0, 'No hay ejercicios visibles');
});

test('app: niveles visibles alineados con N1 a N7', () => {
  const nivelesVisibles = leerAppConstArray('NIVELES_VISIBLES');
  assert.deepStrictEqual(Array.from(nivelesVisibles), [1, 2, 3, 4, 5, 6, 7]);
});

test('documentacion de comandos: ejercicios recomendados existen', () => {
  const ctx = loadRuntime();
  const docs = leerAppConstArray('DOC_COMANDOS');
  assert(docs.length >= 17, `DOC_COMANDOS tiene solo ${docs.length} entradas`);
  for (const doc of docs) {
    assert(Array.isArray(doc.ejercicios), `${doc.nombre}: ejercicios debe ser array`);
    for (const id of doc.ejercicios) {
      assert(ctx.EjerciciosLiteSeInt.porId(id), `${doc.nombre}: ejercicio inexistente ${id}`);
    }
  }
});

test('documentacion de comandos: ejemplos no usan sintaxis PSeInt prohibida', () => {
  const docs = leerAppConstArray('DOC_COMANDOS');
  const prohibidos = [
    [/<-/, '<-'],
    [/\bCadena\b/, 'Cadena'],
    [/\bSiNo\b/, 'SiNo'],
    [/\bMOD\b/, 'MOD'],
    [/\bDIV\b/, 'DIV'],
  ];
  for (const doc of docs) {
    for (const campo of ['sintaxis', 'ejemplo', 'ejemplo2']) {
      if (!doc[campo]) continue;
      for (const [regex, label] of prohibidos) {
        assert(!regex.test(doc[campo]), `${doc.nombre}.${campo}: contiene ${label}`);
      }
    }
  }
});

test('documentacion de errores: ejemplos corregidos validan', () => {
  const ctx = loadRuntime();
  const errores = leerAppConstArray('DOC_ERRORES_COMUNES');
  assert(errores.length >= 16, `DOC_ERRORES_COMUNES tiene solo ${errores.length} entradas`);
  for (const err of errores) {
    const res = validar(ctx, err.ejemplo);
    assert.strictEqual(
      res.length,
      0,
      `${err.titulo}: ejemplo corregido tiene errores: ${JSON.stringify(res)}`,
    );
  }
});

test('documentacion de errores: ejemplos incorrectos reproducen errores o son de runtime', () => {
  const ctx = loadRuntime();
  const errores = leerAppConstArray('DOC_ERRORES_COMUNES');
  for (const err of errores) {
    if (!err.ejemploMal) continue;
    const res = validar(ctx, err.ejemploMal);
    const esRuntime = /Al ejecutar/i.test(err.sintoma || '');
    assert(
      res.length > 0 || esRuntime,
      `${err.titulo}: ejemplo incorrecto no falla en validación ni está marcado como runtime`,
    );
  }
});

test('parser: produce Programa raiz con astVersion 2 y cuerpo array', () => {
  const ctx = loadRuntime();
  const codigo = 'Proceso p\nDefinir x Como Entero\nx = 1\nEscribir x\nFinProceso';
  const ast = ctx.LiteSeIntParser.parsearPrograma(codigo);
  assert.strictEqual(ast.tipo, 'Programa');
  assert.strictEqual(ast.astVersion, 2);
  assert.ok(Array.isArray(ast.cuerpo));
  assert.ok(ast.loc && typeof ast.loc.linea === 'number');
});

test('parser: emite nodos PascalCase para instrucciones simples', () => {
  const ctx = loadRuntime();
  const codigo = 'Proceso p\nDefinir x Como Entero\nLeer x\nx = x + 1\nEscribir x\nFinProceso';
  const cuerpo = ctx.LiteSeIntParser.parsearPrograma(codigo).cuerpo;
  const tipos = Array.from(cuerpo, (n) => n.tipo);
  assert.deepStrictEqual(tipos, ['Definir', 'Leer', 'Asignar', 'Escribir']);
  for (const nodo of cuerpo) {
    assert.ok(nodo.loc, `nodo ${nodo.tipo} sin loc`);
    assert.strictEqual(typeof nodo.loc.linea, 'number');
    assert.strictEqual(typeof nodo.loc.columnaInicio, 'number');
    assert.strictEqual(typeof nodo.loc.columnaFin, 'number');
  }
});

test('parser: construye nodo Si con entonces y sino', () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir x Como Entero',
    'x = 1',
    'Si x > 0 Entonces',
    '  Escribir "pos"',
    'Sino',
    '  Escribir "neg"',
    'FinSi',
    'FinProceso',
  ].join('\n');
  const cuerpo = ctx.LiteSeIntParser.parsearPrograma(codigo).cuerpo;
  const si = cuerpo.find((n) => n.tipo === 'Si');
  assert.ok(si, 'no se encontro nodo Si');
  assert.strictEqual(si.condicion, 'x > 0');
  assert.strictEqual(si.entonces.length, 1);
  assert.strictEqual(si.entonces[0].tipo, 'Escribir');
  assert.ok(Array.isArray(si.sino));
  assert.strictEqual(si.sino.length, 1);
  assert.strictEqual(si.sino[0].tipo, 'Escribir');
});

test('parser: construye nodo Mientras con condicion y cuerpo', () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir i Como Entero',
    'i = 0',
    'Mientras i < 3 Hacer',
    '  Escribir i',
    '  i = i + 1',
    'FinMientras',
    'FinProceso',
  ].join('\n');
  const m = ctx.LiteSeIntParser.parsearPrograma(codigo).cuerpo.find((n) => n.tipo === 'Mientras');
  assert.ok(m);
  assert.strictEqual(m.condicion, 'i < 3');
  assert.strictEqual(m.cuerpo.length, 2);
  assert.strictEqual(m.cuerpo[0].tipo, 'Escribir');
  assert.strictEqual(m.cuerpo[1].tipo, 'Asignar');
});

test('parser: construye nodo Para con desde, hasta y paso', () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir i Como Entero',
    'Para i = 1 Hasta 10 Con Paso 2 Hacer',
    '  Escribir i',
    'FinPara',
    'FinProceso',
  ].join('\n');
  const p = ctx.LiteSeIntParser.parsearPrograma(codigo).cuerpo.find((n) => n.tipo === 'Para');
  assert.ok(p);
  assert.strictEqual(p.variable, 'i');
  assert.strictEqual(p.variableOriginal, 'i');
  assert.strictEqual(p.desde, '1');
  assert.strictEqual(p.hasta, '10');
  assert.strictEqual(p.paso, '2');
  assert.strictEqual(p.cuerpo.length, 1);
});

test('parser: construye nodo Repetir con condicion de HastaQue', () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir i Como Entero',
    'i = 0',
    'Repetir',
    '  i = i + 1',
    'HastaQue i >= 3',
    'FinProceso',
  ].join('\n');
  const r = ctx.LiteSeIntParser.parsearPrograma(codigo).cuerpo.find((n) => n.tipo === 'Repetir');
  assert.ok(r);
  assert.strictEqual(r.condicion, 'i >= 3');
  assert.strictEqual(r.cuerpo.length, 1);
  assert.ok(r.locHastaQue && typeof r.locHastaQue.linea === 'number');
});

test('parser: construye nodo Segun con casos y rama otro', () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir d Como Entero',
    'd = 1',
    'Segun d Hacer',
    '  1: Escribir "uno"',
    '  2, 3: Escribir "dos o tres"',
    '  De Otro Modo:',
    '    Escribir "otro"',
    'FinSegun',
    'FinProceso',
  ].join('\n');
  const s = ctx.LiteSeIntParser.parsearPrograma(codigo).cuerpo.find((n) => n.tipo === 'Segun');
  assert.ok(s);
  assert.strictEqual(s.expresion, 'd');
  assert.strictEqual(s.casos.length, 2);
  assert.deepStrictEqual(Array.from(s.casos[0].valores), ['1']);
  assert.deepStrictEqual(Array.from(s.casos[1].valores), ['2', '3']);
  assert.ok(Array.isArray(s.otro));
  assert.strictEqual(s.otro.length, 1);
});

test('parser: roundtrip JSON preserva el AST', () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir x Como Entero',
    'Si x > 0 Entonces',
    '  Para x = 1 Hasta 3 Hacer',
    '    Escribir x',
    '  FinPara',
    'Sino',
    '  Escribir "neg"',
    'FinSi',
    'FinProceso',
  ].join('\n');
  const ast = ctx.LiteSeIntParser.parsearPrograma(codigo);
  const json = ctx.LiteSeIntAST.serializarAST(ast);
  const rehidratado = ctx.LiteSeIntAST.deserializarAST(json);
  assert.strictEqual(rehidratado.tipo, 'Programa');
  assert.strictEqual(rehidratado.astVersion, 2);
  assert.deepStrictEqual(rehidratado, ast);
  assert.strictEqual(ctx.LiteSeIntAST.serializarAST(rehidratado), json);
});

test('parser: los 245 ejercicios visibles parsean sin throw y producen Programa', () => {
  const ctx = loadRuntime();
  const visibles = ctx.EjerciciosLiteSeInt.listarAdaptados().filter((e) => e.codigoReferencia);
  assert.ok(visibles.length >= 200, `se esperaban al menos 200 ejercicios visibles, hubo ${visibles.length}`);
  for (const ej of visibles) {
    const ast = ctx.LiteSeIntParser.parsearPrograma(ej.codigoReferencia);
    assert.strictEqual(ast.tipo, 'Programa', `${ej.id}: tipo raiz no es Programa`);
    assert.strictEqual(ast.astVersion, 2, `${ej.id}: astVersion incorrecto`);
    assert.ok(Array.isArray(ast.cuerpo), `${ej.id}: cuerpo no es array`);
  }
});

test('symbol-table: TablaSimbolos define, marca inicializada y clona', () => {
  const ctx = loadRuntime();
  const tabla = new ctx.LiteSeIntSymbolTable.TablaSimbolos();
  tabla.definir('Edad', 'entero', 3);
  assert.strictEqual(tabla.existeVariable('edad'), true);
  assert.strictEqual(tabla.estaInicializada('edad'), false);
  assert.strictEqual(tabla.obtenerTipo('edad'), 'entero');
  tabla.marcarInicializada('edad');
  assert.strictEqual(tabla.estaInicializada('edad'), true);
  const clon = tabla.clonar();
  tabla.marcarInicializada('inexistente');
  assert.deepStrictEqual(Array.from(clon.obtenerNombres()), ['Edad']);
});

test('symbol-table: ScopeChain comienza con scope global y resuelve nombres', () => {
  const ctx = loadRuntime();
  const chain = new ctx.LiteSeIntSymbolTable.ScopeChain();
  assert.strictEqual(chain.profundidad(), 1);
  chain.global().definir('total', 'entero', 0);
  const hallado = chain.lookup('total');
  assert.ok(hallado, 'lookup global debió encontrar la variable');
  assert.strictEqual(hallado.obtenerTipo('total'), 'entero');
  assert.strictEqual(chain.lookup('inexistente'), null);
});

test('symbol-table: ScopeChain push/pop respeta visibilidad de scopes anidados', () => {
  const ctx = loadRuntime();
  const chain = new ctx.LiteSeIntSymbolTable.ScopeChain();
  chain.global().definir('global_var', 'real', 0);
  const local = chain.push();
  local.definir('local_var', 'caracter', 5);
  assert.strictEqual(chain.profundidad(), 2);
  assert.ok(chain.lookup('local_var'), 'local visible desde scope actual');
  assert.ok(chain.lookup('global_var'), 'global sigue visible desde scope anidado');
  chain.pop();
  assert.strictEqual(chain.profundidad(), 1);
  assert.strictEqual(chain.lookup('local_var'), null, 'local desaparece tras pop');
  assert.throws(() => chain.pop(), /scope global/i);
});

test('runtime: ejercicios sin Leer ejecutan sin errores sobre el AST nuevo', async () => {
  const ctx = loadRuntime();
  const sinLeer = ctx.EjerciciosLiteSeInt.listarAdaptados()
    .filter((e) => e.codigoReferencia && !/\bLeer\b/i.test(e.codigoReferencia));
  assert.ok(sinLeer.length >= 10, `se esperaban >=10 ejercicios sin Leer, hubo ${sinLeer.length}`);
  for (const ej of sinLeer) {
    const { resultado, errores } = await ejecutar(ctx, ej.codigoReferencia);
    assert.strictEqual(
      resultado.exito,
      true,
      `${ej.id} falló: ${errores.length ? errores[0].mensaje : 'sin mensaje'}`
    );
    assert.strictEqual(errores.length, 0, `${ej.id} reportó errores runtime: ${JSON.stringify(errores)}`);
  }
});

test('detener durante Leer marca la ejecucion como detenida', async () => {
  const ctx = loadRuntime();
  const codigo = [
    'Proceso p',
    'Definir nombre Como Caracter',
    'Leer nombre',
    'Escribir nombre',
    'FinProceso',
  ].join('\n');
  const { resultado, salida } = await ejecutar(ctx, codigo, { detenerDuranteLeer: true });
  assert.strictEqual(resultado.detenido, true);
  assert.strictEqual(resultado.exito, false);
  assert.deepStrictEqual(salida, []);
});

(async () => {
  let fallas = 0;

  for (const { nombre, fn } of tests) {
    try {
      await fn();
      console.log(`ok - ${nombre}`);
    } catch (err) {
      fallas++;
      console.error(`not ok - ${nombre}`);
      console.error(err && err.stack ? err.stack : err);
    }
  }

  if (fallas > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(`\n${tests.length} pruebas pasaron.`);
})();
