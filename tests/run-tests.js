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
  const docErrores = fs.readFileSync(path.join(root, 'js/doc_errores.js'), 'utf8');
  const liteSeInt = fs.readFileSync(path.join(root, 'js/LiteSeInt.js'), 'utf8');
  vm.runInContext(`${docErrores}\nglobalThis.DocErrores = DocErrores;`, ctx);
  vm.runInContext(`${liteSeInt}\nglobalThis.LiteSeInt = LiteSeInt;`, ctx);
  return ctx;
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
