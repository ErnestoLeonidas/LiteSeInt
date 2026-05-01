/* ==============================================
   app.js — UI Controller
   Conecta LiteSeInt con la interfaz de usuario.
   Depende de: Bootstrap, jQuery, doc_errores.js, LiteSeInt.js
   ============================================== */

// =========================================
// 1. STATE MANAGEMENT
// =========================================

let inputResolver = null;
const mobileConsoleQuery = window.matchMedia("(max-width: 768px)");
const EDITOR_HISTORY_LIMIT = 100;

const editorHistory = {
  undo: [],
  redo: [],
  applying: false,
};

let errorVisualState = {
  activo: false,
  erroresPorLinea: null,
  erroresMapa: {},
};

function resetErrorVisualState() {
  errorVisualState.activo = false;
  errorVisualState.erroresPorLinea = null;
  errorVisualState.erroresMapa = {};
}

// =========================================
// THEME SYSTEM
// =========================================

const THEME_KEY = 'liteseint_theme';
const THEMES = [
  { id: 'hacker', label: 'Hacker' },
  { id: 'ocean',  label: 'Ocean'  },
  { id: 'sunset', label: 'Sunset' },
  { id: 'papel',  label: 'Papel'  },
];

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = THEMES.find(t => t.id === saved) || THEMES[0];
  applyTheme(theme);
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme.id);
  const nameEl = document.getElementById('themeName');
  if (nameEl) nameEl.textContent = theme.label;
  try { localStorage.setItem(THEME_KEY, theme.id); } catch(e) {}
}

function cycleTheme() {
  const current = document.body.getAttribute('data-theme') || 'hacker';
  const idx = THEMES.findIndex(t => t.id === current);
  const next = THEMES[(idx + 1) % THEMES.length];
  applyTheme(next);
}

// =========================================
// PANEL DRAG-TO-SWAP
// =========================================

const PANEL_ORDER_KEY = 'liteseint_panel_order';
const CONSOLE_ECHO_KEY = 'liteseint_console_echo';

function initPanelDrag() {
  const container = document.querySelector('.main-container');
  if (!container) return;
  let dragging = null;

  container.querySelectorAll('[data-draggable]').forEach(panel => {
    const handle = panel.querySelector('.panel-drag-handle');
    if (!handle) return;

    handle.addEventListener('mousedown', () => {
      panel.setAttribute('draggable', 'true');
      const cleanup = () => {
        if (!dragging) panel.removeAttribute('draggable');
        document.removeEventListener('mouseup', cleanup);
      };
      document.addEventListener('mouseup', cleanup);
    });

    panel.addEventListener('dragstart', e => {
      dragging = panel;
      e.dataTransfer.effectAllowed = 'move';
      requestAnimationFrame(() => panel.classList.add('panel-dragging'));
    });

    panel.addEventListener('dragend', () => {
      panel.removeAttribute('draggable');
      panel.classList.remove('panel-dragging');
      container.querySelectorAll('[data-draggable]').forEach(p => p.classList.remove('panel-drag-over'));
      dragging = null;
    });

    panel.addEventListener('dragover', e => {
      if (!dragging || panel === dragging) return;
      e.preventDefault();
      panel.classList.add('panel-drag-over');
    });

    panel.addEventListener('dragleave', e => {
      if (!panel.contains(e.relatedTarget)) panel.classList.remove('panel-drag-over');
    });

    panel.addEventListener('drop', e => {
      e.preventDefault();
      panel.classList.remove('panel-drag-over');
      if (!dragging || dragging === panel) return;
      const siblings = [...container.querySelectorAll('[data-draggable]')];
      const srcIdx = siblings.indexOf(dragging);
      const tgtIdx = siblings.indexOf(panel);
      if (srcIdx < tgtIdx) container.insertBefore(dragging, panel.nextSibling);
      else container.insertBefore(dragging, panel);
      updateLearningPanelBorder();
      savePanelOrder();
    });
  });
}

function updateLearningPanelBorder() {
  const container = document.querySelector('.main-container');
  const lp = document.querySelector('.learning-panel');
  if (!container || !lp) return;
  const panels = [...container.querySelectorAll('[data-draggable]')];
  lp.classList.toggle('panel-on-right', panels[0] !== lp);
}

function savePanelOrder() {
  const container = document.querySelector('.main-container');
  const lp = document.querySelector('.learning-panel');
  if (!container || !lp) return;
  const isLeft = [...container.querySelectorAll('[data-draggable]')][0] === lp;
  try { localStorage.setItem(PANEL_ORDER_KEY, isLeft ? 'left' : 'right'); } catch(e) {}
}

function restorePanelOrder() {
  const saved = localStorage.getItem(PANEL_ORDER_KEY);
  if (!saved) return;
  const container = document.querySelector('.main-container');
  const lp = document.querySelector('.learning-panel');
  const ws = document.querySelector('.workspace-column');
  if (!container || !lp || !ws) return;
  const panels = [...container.querySelectorAll('[data-draggable]')];
  const currentlyLeft = panels[0] === lp;
  if (saved === 'right' && currentlyLeft) {
    container.appendChild(lp);
    updateLearningPanelBorder();
  } else if (saved === 'left' && !currentlyLeft) {
    container.insertBefore(lp, ws);
    updateLearningPanelBorder();
  }
}

// =========================================
// EXERCISE LIST TOGGLE
// =========================================

const EJ_LISTA_KEY = 'liteseint_ej_lista';

function initEjListaToggle() {
  const btn = document.getElementById('btnToggleEjLista');
  if (!btn) return;
  const saved = localStorage.getItem(EJ_LISTA_KEY);
  if (saved === 'hidden') setEjListaVisible(false);
  btn.addEventListener('click', () => {
    const collapsed = document.querySelector('.ej-workspace')?.classList.contains('ej-lista-colapsada');
    setEjListaVisible(collapsed);
  });
}

function setEjListaVisible(visible) {
  const workspace = document.querySelector('.ej-workspace');
  const btn = document.getElementById('btnToggleEjLista');
  if (!workspace) return;
  workspace.classList.toggle('ej-lista-colapsada', !visible);
  if (btn) {
    btn.textContent = visible ? '◀' : '▶';
    btn.title = visible ? 'Ocultar lista de ejercicios' : 'Mostrar lista de ejercicios';
  }
  try { localStorage.setItem(EJ_LISTA_KEY, visible ? 'visible' : 'hidden'); } catch(e) {}
}

// =========================================
// 2. INTÉRPRETE
// =========================================

const interprete = new LiteSeInt({
  onEscribir(texto) {
    consolaImprimir(texto, "output");
  },

  onLeer(nombreVar) {
    return new Promise((resolve) => {
      inputResolver = resolve;
      mostrarInputConsola(nombreVar);
    });
  },

  onError(lineaIdx, mensaje) {
    if (!errorVisualState.erroresMapa[lineaIdx]) {
      errorVisualState.erroresMapa[lineaIdx] = mensaje;
    } else {
      errorVisualState.erroresMapa[lineaIdx] += "\n" + mensaje;
    }
    consolaImprimir(`Error en línea ${lineaIdx + 1}: ${mensaje}`, "error");
    marcarErrorLinea(lineaIdx, errorVisualState.erroresMapa[lineaIdx]);
    errorVisualState.activo = true;
  },

  onLineaActiva(lineaIdx) {
    resaltarLineaEjecutando(lineaIdx);
  },

  onSistema(texto) {
    consolaImprimir(texto, "input-echo");
  },

  onFin() {
    /* handled in ejecutar() */
  },
});

// =========================================
// 3. CONSOLA
// =========================================

function consolaImprimir(texto, tipo = "output") {
  $("#consola").append($("<div>").addClass(`console-line ${tipo}`).text(texto));
  scrollConsola();
}

function scrollConsola() {
  const el = document.getElementById("consola");
  el.scrollTop = el.scrollHeight;
}

function setConsoleEchoVisible(visible) {
  const consola = document.getElementById("consola");
  const btn = document.getElementById("btnToggleConsoleEcho");
  if (!consola) return;
  consola.classList.toggle("hide-input-echo", !visible);
  if (btn) {
    btn.classList.toggle("btn-toggle-console-echo-hidden", !visible);
    btn.setAttribute("aria-label", visible ? "Ocultar trazas de consola" : "Mostrar trazas de consola");
    btn.title = visible ? "Ocultar trazas de consola" : "Mostrar trazas de consola";
  }
  try { localStorage.setItem(CONSOLE_ECHO_KEY, visible ? "visible" : "hidden"); } catch(e) {}
}

function initConsoleEchoToggle() {
  const btn = document.getElementById("btnToggleConsoleEcho");
  const saved = localStorage.getItem(CONSOLE_ECHO_KEY);
  setConsoleEchoVisible(saved === "visible");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const hidden = document.getElementById("consola")?.classList.contains("hide-input-echo");
    setConsoleEchoVisible(Boolean(hidden));
  });
}

function setMobileConsoleCollapsed(collapsed) {
  const shell = document.querySelector(".app-shell");
  if (!shell) return;
  shell.classList.toggle(
    "mobile-console-collapsed",
    mobileConsoleQuery.matches && collapsed,
  );
}

function toggleMobileConsoleCollapsed() {
  const shell = document.querySelector(".app-shell");
  if (!shell || !mobileConsoleQuery.matches) return;
  shell.classList.toggle("mobile-console-collapsed");
}

const ESTRUCTURA_INICIAL = "Proceso nombre_proceso\n\n\n\n\n\n\n\n\nFinProceso";
const PROCESO_PREFIX_LEN = "Proceso ".length; // 8

function obtenerNombreProceso() {
  const primera = $("#editor").val().split("\n")[0];
  const m = primera.match(/^Proceso\s+(.+?)\s*$/i);
  return m ? m[1] : "nombre_proceso";
}

function limpiarConsola() {
  detener();
  $("#consola").empty();
  invalidarErroresVisuales();
}

function limpiarTodo() {
  detener();
  const nombre = obtenerNombreProceso();
  const estructura = `Proceso ${nombre}\n\n\n\n\n\n\n\n\nFinProceso`;
  registrarHistorialEditor();
  $("#editor").val(estructura);
  $("#consola").empty();
  invalidarErroresVisuales();
  actualizarLineas();
  const editor = document.getElementById("editor");
  const pos = estructura.indexOf("\n") + 1;
  editor.setSelectionRange(pos, pos);
  editor.focus();
}

function getEditorHistorySnapshot(editor = document.getElementById("editor")) {
  if (!editor) return null;
  return {
    value: editor.value,
    selectionStart: editor.selectionStart,
    selectionEnd: editor.selectionEnd,
    scrollTop: editor.scrollTop,
    scrollLeft: editor.scrollLeft,
  };
}

function snapshotsIguales(a, b) {
  return (
    a &&
    b &&
    a.value === b.value &&
    a.selectionStart === b.selectionStart &&
    a.selectionEnd === b.selectionEnd
  );
}

function registrarHistorialEditor(editor = document.getElementById("editor")) {
  if (!editor || editorHistory.applying) return;
  const snapshot = getEditorHistorySnapshot(editor);
  const last = editorHistory.undo[editorHistory.undo.length - 1];
  if (snapshotsIguales(last, snapshot)) return;

  editorHistory.undo.push(snapshot);
  if (editorHistory.undo.length > EDITOR_HISTORY_LIMIT) {
    editorHistory.undo.shift();
  }
  editorHistory.redo = [];
}

function restaurarSnapshotEditor(snapshot) {
  const editor = document.getElementById("editor");
  if (!editor || !snapshot) return;

  editorHistory.applying = true;
  editor.value = snapshot.value;
  const maxPos = editor.value.length;
  editor.setSelectionRange(
    Math.min(snapshot.selectionStart, maxPos),
    Math.min(snapshot.selectionEnd, maxPos),
  );
  editor.scrollTop = snapshot.scrollTop;
  editor.scrollLeft = snapshot.scrollLeft;
  editorHistory.applying = false;

  ocultarAutocompletado();
  invalidarErroresVisuales();
  quitarResalteNombreInvalido();
  actualizarLineas();
  editor.focus();
}

function deshacerEditor() {
  const editor = document.getElementById("editor");
  if (!editor || editorHistory.undo.length === 0) return false;
  const actual = getEditorHistorySnapshot(editor);
  const previo = editorHistory.undo.pop();
  editorHistory.redo.push(actual);
  restaurarSnapshotEditor(previo);
  return true;
}

function rehacerEditor() {
  const editor = document.getElementById("editor");
  if (!editor || editorHistory.redo.length === 0) return false;
  const actual = getEditorHistorySnapshot(editor);
  const siguiente = editorHistory.redo.pop();
  editorHistory.undo.push(actual);
  restaurarSnapshotEditor(siguiente);
  return true;
}

function esAtajoDeshacer(e) {
  return (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z";
}

function esAtajoRehacer(e) {
  const mod = e.ctrlKey || e.metaKey;
  return mod && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"));
}

const NOMBRE_HIGHLIGHT_ID = "nombreProcesoHighlight";

function obtenerRangoNombreProceso() {
  const primera = $("#editor").val().split("\n")[0];
  const m = primera.match(/^(Proceso\s+)(\S.*?)(\s*)$/i);
  if (!m) return null;
  const colInicio = m[1].length;
  const colFin = colInicio + m[2].length;
  return { colInicio, colFin };
}

function posicionarResalteNombre(el) {
  const rango = obtenerRangoNombreProceso();
  const editor = document.getElementById("editor");
  if (!rango || !editor) {
    el.style.display = "none";
    return;
  }
  const metrics = getIndentGuideMetrics();
  const cw = metrics ? metrics.charWidth : 7.8;
  const lh = metrics ? metrics.lineHeight : 21.45;
  const pt = metrics ? metrics.paddingTop : 8;
  const pl = metrics ? metrics.paddingLeft : 16;

  const top = pt - editor.scrollTop;
  const left = pl + rango.colInicio * cw - editor.scrollLeft;
  const width = (rango.colFin - rango.colInicio) * cw;

  el.style.display = "block";
  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
  el.style.width = `${width}px`;
  el.style.height = `${lh}px`;
}

function resaltarNombreInvalido() {
  const area = document.querySelector(".editor-code-area");
  if (!area) return;
  let el = document.getElementById(NOMBRE_HIGHLIGHT_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = NOMBRE_HIGHLIGHT_ID;
    el.className = "nombre-proceso-highlight";
    area.appendChild(el);
  }
  posicionarResalteNombre(el);
}

function quitarResalteNombreInvalido() {
  const el = document.getElementById(NOMBRE_HIGHLIGHT_ID);
  if (el) el.remove();
}

function descargar() {
  const nombre = obtenerNombreProceso();
  if (nombre === "nombre_proceso") {
    resaltarNombreInvalido();
    Swal.fire({
      icon: "warning",
      title: "Nombre de proceso inválido",
      text: 'Cambia "nombre_proceso" por un nombre válido antes de descargar.',
      confirmButtonColor: "#00cc77",
      background: "#161b22",
      color: "#e6edf3",
    });
    return;
  }
  const contenido = $("#editor").val();
  const blob = new Blob([contenido], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.psc`;
  a.click();
  URL.revokeObjectURL(url);
}

// =========================================
// 4. INPUT INLINE EN CONSOLA
// =========================================

function mostrarInputConsola(nombreVar) {
  const $row = $("<div>").addClass("console-input-row");
  $row.html(`
    <span class="prompt-symbol">?</span>
    <span class="var-label">${nombreVar}:</span>
    <input type="text" class="console-input-field" id="consolaInputField"
           placeholder="Escribe un valor..." autocomplete="off" />
    <button class="console-input-send" id="consolaInputBtn">↵</button>
  `);

  $("#consola").append($row);
  scrollConsola();
  setTimeout(() => $("#consolaInputField").focus(), 50);

  $row.find("#consolaInputField").on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmarInputConsola($row);
    }
  });
  $row.find("#consolaInputBtn").on("click", () => confirmarInputConsola($row));
}

function confirmarInputConsola($row) {
  const valor = $row.find("#consolaInputField").val();
  $row.replaceWith(
    $("<div>")
      .addClass("console-line input-echo")
      .text(`  ↳ entrada: ${valor}`),
  );
  if (inputResolver) {
    const resolver = inputResolver;
    inputResolver = null;
    resolver(valor);
  }
}

// =========================================
// 5. ERROR VISUAL SYSTEM
// =========================================

function invalidarErroresVisuales() {
  resetErrorVisualState();
  $(".line-num-row").removeClass("has-error");
  $(".line-overlay").removeClass("has-error");
  $(".error-badge-btn").each(function () {
    const tip = bootstrap.Tooltip.getInstance(this);
    if (tip) tip.dispose();
  });
  setMirrorLayerHTML("errorDecoLayer", "");
}

function limpiarEjecucionHighlight() {
  $(".line-num-row.executing").removeClass("executing");
  $(".line-overlay.executing").removeClass("executing");
}

function aplicarErroresVisuales(erroresPorLinea) {
  invalidarErroresVisuales();
  errorVisualState.activo = true;
  errorVisualState.erroresPorLinea = erroresPorLinea;

  for (const [lineaIdx, erroresLinea] of erroresPorLinea) {
    const mensajes = erroresLinea.map((e) => e.mensaje).join("\n");
    errorVisualState.erroresMapa[lineaIdx] = mensajes;
    marcarErrorLinea(lineaIdx, mensajes);
  }

  renderizarSubrayados();
}

function marcarErrorLinea(lineaIdx, mensaje) {
  const $row = $(`.line-num-row[data-line="${lineaIdx}"]`);
  $row.addClass("has-error").removeClass("executing");

  const $overlay = $(`.line-overlay[data-line="${lineaIdx}"]`);
  $overlay.removeClass("executing").addClass("has-error");

  const $btn = $overlay.find(".error-badge-btn");
  $btn.attr("title", mensaje);

  const existing = bootstrap.Tooltip.getInstance($btn[0]);
  if (existing) existing.dispose();
  new bootstrap.Tooltip($btn[0], {
    placement: "left",
    trigger: "hover focus",
    html: false,
  });
}

function renderizarSubrayados() {
  const texto = $("#editor").val();
  const lineas = texto.split("\n");
  const errPorLinea = errorVisualState.erroresPorLinea;

  if (!errPorLinea || errPorLinea.size === 0) {
    setMirrorLayerHTML(
      "errorDecoLayer",
      lineas.map(() => "").join("\n"),
    );
    return;
  }

  const htmlLines = lineas.map((linea, idx) => {
    const erroresLinea = errPorLinea.get(idx);
    if (!erroresLinea || erroresLinea.length === 0) {
      return " ".repeat(linea.length);
    }
    return renderErrorUnderlines(linea, erroresLinea);
  });

  setMirrorLayerHTML("errorDecoLayer", htmlLines.join("\n"));
}

function renderErrorUnderlines(linea, errores) {
  if (linea.length === 0) return "";

  const errorMap = new Array(linea.length).fill(false);
  for (const err of errores) {
    const start = Math.max(0, err.columnaInicio);
    const end = Math.min(linea.length, err.columnaFin);
    for (let i = start; i < end; i++) {
      errorMap[i] = true;
    }
  }

  let result = "";
  let i = 0;
  while (i < linea.length) {
    const isError = errorMap[i];
    let j = i;
    while (j < linea.length && errorMap[j] === isError) j++;

    const segment = escapeHtml(linea.substring(i, j));
    if (isError) {
      result += `<span class="error-underline">${segment}</span>`;
    } else {
      result += segment;
    }
    i = j;
  }

  return result;
}

// =========================================
// 6. LINE NUMBERS + OVERLAYS
// =========================================

function actualizarLineas() {
  const texto = $("#editor").val();
  const numLineas = texto.split("\n").length;
  const total = Math.max(numLineas, 10);
  const $gutter = $("#lineNumbers");
  const $overlays = $("#lineOverlays");

  $gutter.empty();
  $overlays.empty();

  for (let i = 0; i < total; i++) {
    const $row = $("<div>").addClass("line-num-row").attr("data-line", i);
    $row.append($("<span>").addClass("exec-arrow").text(">"));
    $row.append(
      $("<span>")
        .addClass("num-text")
        .text(i + 1),
    );
    $gutter.append($row);

    const $overlay = $("<div>").addClass("line-overlay").attr("data-line", i);
    $overlay.append(
      $("<div>")
        .addClass("error-badge-container")
        .html(
          `<button class="error-badge-btn" data-line="${i}" tabindex="-1">!</button>`,
        ),
    );
    $overlays.append($overlay);
  }

  if (errorVisualState.activo) {
    for (const [idx, msg] of Object.entries(errorVisualState.erroresMapa)) {
      marcarErrorLinea(parseInt(idx), msg);
    }
  }

  actualizarSyntaxHighlight();
  actualizarIndentGuides();
}

function resaltarLineaEjecutando(lineaIdx) {
  $(".line-num-row.executing").removeClass("executing");
  $(".line-overlay.executing").removeClass("executing");
  $(`.line-num-row[data-line="${lineaIdx}"]`).addClass("executing");
  $(`.line-overlay[data-line="${lineaIdx}"]`).addClass("executing");
}

$("#editor").on("scroll", function () {
  const st = this.scrollTop;
  document.getElementById("lineNumbers").scrollTop = st;
  document.getElementById("lineOverlays").scrollTop = st;
  syncEditorMirrorScroll();
  const hl = document.getElementById(NOMBRE_HIGHLIGHT_ID);
  if (hl) posicionarResalteNombre(hl);
  actualizarIndentGuides();
});

function getMirrorLayerContent(layerId) {
  const layer = document.getElementById(layerId);
  if (!layer) return null;

  let content = layer.querySelector(".editor-mirror-content");
  if (!content) {
    content = document.createElement("div");
    content.className = "editor-mirror-content";
    layer.appendChild(content);
  }

  return content;
}

function setMirrorLayerHTML(layerId, html) {
  const content = getMirrorLayerContent(layerId);
  if (!content) return;
  content.innerHTML = html;
  syncEditorMirrorScroll();
}

function syncEditorMirrorScroll() {
  const editor = document.getElementById("editor");
  if (!editor) return;

  const transform = `translate(${-editor.scrollLeft}px, ${-editor.scrollTop}px)`;
  for (const layerId of ["syntaxLayer", "errorDecoLayer"]) {
    const content = getMirrorLayerContent(layerId);
    if (content) content.style.transform = transform;
  }
}

// =========================================
// 7. INDENT GUIDES
// =========================================

const DEFAULT_INDENT_STEP = 2;
let indentGuideRenderPending = false;
let indentGuideNeedsMeasure = true;
let resizeObserver = null;

function parseCssPx(value, fallback = 0) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCursorLineIndex(texto, selectionStart) {
  return texto.substring(0, selectionStart).split("\n").length - 1;
}

function getIndentGuideMetrics(force = false) {
  const editor = document.getElementById("editor");
  if (!editor) return null;

  if (!force && editor._indentGuideMetrics) {
    return editor._indentGuideMetrics;
  }

  const computed = window.getComputedStyle(editor);
  const lineHeight = parseCssPx(
    computed.lineHeight,
    parseCssPx(computed.fontSize, 13) * 1.65,
  );
  const paddingTop = parseCssPx(computed.paddingTop, 8);
  const paddingLeft = parseCssPx(computed.paddingLeft, 16);
  const tabSize = Math.max(
    1,
    parseInt(
      computed.tabSize ||
        computed.getPropertyValue("tab-size") ||
        DEFAULT_INDENT_STEP,
      10,
    ) || DEFAULT_INDENT_STEP,
  );

  const measurer = document.createElement("span");
  measurer.textContent = "0".repeat(32);
  measurer.style.position = "absolute";
  measurer.style.visibility = "hidden";
  measurer.style.pointerEvents = "none";
  measurer.style.whiteSpace = "pre";
  measurer.style.fontFamily = computed.fontFamily;
  measurer.style.fontSize = computed.fontSize;
  measurer.style.fontWeight = computed.fontWeight;
  measurer.style.letterSpacing = computed.letterSpacing;
  measurer.style.lineHeight = computed.lineHeight;

  editor.parentElement.appendChild(measurer);
  const charWidth = measurer.getBoundingClientRect().width / 32;
  measurer.remove();

  const metrics = {
    charWidth: Number.isFinite(charWidth) && charWidth > 0 ? charWidth : 7.8,
    lineHeight,
    paddingTop,
    paddingLeft,
    tabSize,
  };

  editor._indentGuideMetrics = metrics;
  return metrics;
}

function getLeadingIndentColumns(linea, tabSize) {
  let width = 0;
  for (const ch of linea) {
    if (ch === " ") {
      width += 1;
    } else if (ch === "\t") {
      width += tabSize - (width % tabSize);
    } else {
      break;
    }
  }
  return width;
}

function getVisualColumns(texto, tabSize) {
  let width = 0;
  for (const ch of texto) {
    if (ch === "\t") {
      width += tabSize - (width % tabSize);
    } else {
      width += 1;
    }
  }
  return width;
}

function computeEffectiveIndents(lineas, tabSize) {
  const n = lineas.length;
  const effectiveIndents = new Array(n).fill(0);
  const actualIndents = lineas.map((linea) => {
    if (linea.trim() === "") return null;
    return getLeadingIndentColumns(linea, tabSize);
  });

  for (let i = 0; i < n; i++) {
    if (actualIndents[i] !== null) {
      effectiveIndents[i] = actualIndents[i];
      continue;
    }

    let prev = null;
    for (let j = i - 1; j >= 0; j--) {
      if (actualIndents[j] !== null) {
        prev = actualIndents[j];
        break;
      }
    }

    let next = null;
    for (let j = i + 1; j < n; j++) {
      if (actualIndents[j] !== null) {
        next = actualIndents[j];
        break;
      }
    }

    if (prev === null && next === null) {
      effectiveIndents[i] = 0;
    } else if (prev === null) {
      effectiveIndents[i] = next;
    } else if (next === null) {
      effectiveIndents[i] = prev;
    } else {
      effectiveIndents[i] = Math.min(prev, next);
    }
  }

  return effectiveIndents;
}

function getVisibleGuideColumns(indentWidth, tabSize) {
  if (indentWidth <= 0) return [];

  const cols = [];
  const maxCol = Math.ceil(indentWidth / tabSize) * tabSize;

  for (let col = tabSize; col <= maxCol; col += tabSize) {
    const guideCenter = col - tabSize / 2;
    if (guideCenter <= indentWidth) {
      cols.push(col);
    }
  }

  return cols;
}

function computeGuideSegments(visibleGuideColsByLine, tabSize) {
  const segments = [];
  const maxIndent = Math.max(
    0,
    ...visibleGuideColsByLine.map((cols) =>
      cols.length ? cols[cols.length - 1] : 0,
    ),
  );

  for (let col = tabSize; col <= maxIndent; col += tabSize) {
    let start = null;

    for (let i = 0; i < visibleGuideColsByLine.length; i++) {
      const hasGuide = visibleGuideColsByLine[i].includes(col);
      if (hasGuide && start === null) {
        start = i;
      } else if (!hasGuide && start !== null) {
        segments.push({ col, startLine: start, endLine: i - 1 });
        start = null;
      }
    }

    if (start !== null) {
      segments.push({
        col,
        startLine: start,
        endLine: visibleGuideColsByLine.length - 1,
      });
    }
  }

  return segments;
}

function getGuideX(col, metrics) {
  const visualCenterCol = col - metrics.tabSize;
  const rawX = metrics.paddingLeft + visualCenterCol * metrics.charWidth;
  return Math.round(rawX) + 0.5;
}

function renderIndentGuides() {
  const editor = document.getElementById("editor");
  const layer = document.getElementById("indentGuideLayer");
  if (!editor || !layer) return;

  const metrics = getIndentGuideMetrics(indentGuideNeedsMeasure);
  indentGuideNeedsMeasure = false;
  if (!metrics) return;

  const texto = editor.value;
  const lineas = texto.split("\n");
  const cursorLine = getCursorLineIndex(texto, editor.selectionStart);
  const currentLineText = lineas[cursorLine] || "";
  const lineStartOffset =
    texto.lastIndexOf("\n", Math.max(0, editor.selectionStart - 1)) + 1;
  const currentLinePrefix = currentLineText.substring(
    0,
    Math.max(0, editor.selectionStart - lineStartOffset),
  );
  const currentLineIndent = getLeadingIndentColumns(
    currentLineText,
    metrics.tabSize,
  );
  const effectiveIndents = computeEffectiveIndents(lineas, metrics.tabSize);
  const visibleGuideColsByLine = effectiveIndents.map((indentWidth) =>
    getVisibleGuideColumns(indentWidth, metrics.tabSize),
  );
  const segments = computeGuideSegments(
    visibleGuideColsByLine,
    metrics.tabSize,
  );
  const activeGuideLimit = Math.min(
    getVisualColumns(currentLinePrefix, metrics.tabSize),
    currentLineIndent,
  );
  const activeGuideCols = getVisibleGuideColumns(
    activeGuideLimit,
    metrics.tabSize,
  );
  const scrollTop = editor.scrollTop;
  const scrollLeft = editor.scrollLeft;

  let html = "";

  for (const segment of segments) {
    const x = getGuideX(segment.col, metrics) - scrollLeft;
    const y =
      metrics.paddingTop + segment.startLine * metrics.lineHeight - scrollTop;
    const height =
      (segment.endLine - segment.startLine + 1) * metrics.lineHeight;
    html += `<div class="indent-guide" style="left:${x.toFixed(2)}px;top:${y.toFixed(2)}px;height:${height.toFixed(2)}px"></div>`;
  }

  if (
    cursorLine >= 0 &&
    cursorLine < lineas.length &&
    activeGuideCols.length > 0
  ) {
    const activeY =
      metrics.paddingTop + cursorLine * metrics.lineHeight - scrollTop;
    for (const col of activeGuideCols) {
      const x = getGuideX(col, metrics) - scrollLeft;
      html += `<div class="indent-guide active" style="left:${x.toFixed(2)}px;top:${activeY.toFixed(2)}px;height:${metrics.lineHeight.toFixed(2)}px"></div>`;
    }
  }

  layer.innerHTML = html;
}

function scheduleIndentGuideRender({ remeasure = false } = {}) {
  if (remeasure) {
    indentGuideNeedsMeasure = true;
    const editor = document.getElementById("editor");
    if (editor) delete editor._indentGuideMetrics;
  }

  if (indentGuideRenderPending) return;
  indentGuideRenderPending = true;

  requestAnimationFrame(() => {
    indentGuideRenderPending = false;
    renderIndentGuides();
  });
}

function actualizarIndentGuides(options) {
  scheduleIndentGuideRender(options);
}

$("#editor").on("click keyup mouseup", function () {
  actualizarIndentGuides();
});

// =========================================
// 8. SYNTAX HIGHLIGHTING
// =========================================

function actualizarSyntaxHighlight() {
  const texto = $("#editor").val();
  const lineas = texto.split("\n");
  const userVars = DocErrores.extraerVariablesDelCodigo(texto);
  const userVarsSet = new Set(userVars.map((v) => v.toLowerCase()));

  let depth = 0;
  const htmlLines = lineas.map((linea) => {
    const r = resaltarLinea_syntax(linea, userVarsSet, depth);
    depth = r.depth;
    return r.html;
  });
  setMirrorLayerHTML("syntaxLayer", htmlLines.join("\n"));
}

function resaltarLinea_syntax(linea, userVarsSet, depth = 0) {
  if (linea === "") return { html: "", depth };

  const tokens = DocErrores.tokenizarLinea(linea);
  let result = "";

  for (const tk of tokens) {
    const escaped = escapeHtml(tk.value);
    switch (tk.type) {
      case DocErrores.TK.KEYWORD:
        result += `<span class="sh-keyword">${escaped}</span>`;
        break;
      case DocErrores.TK.STRING:
      case DocErrores.TK.STRING_UNCLOSED:
        result += `<span class="sh-string">${escaped}</span>`;
        break;
      case DocErrores.TK.NUMBER:
        result += `<span class="sh-number">${escaped}</span>`;
        break;
      case DocErrores.TK.COMMENT:
        result += `<span class="sh-comment">${escaped}</span>`;
        break;
      case DocErrores.TK.ASSIGN:
        result += `<span class="sh-assign">${escaped}</span>`;
        break;
      case DocErrores.TK.OPERATOR:
        result += `<span class="sh-operator">${escaped}</span>`;
        break;
      case DocErrores.TK.LPAREN:
        result += `<span class="sh-bracket-${depth % 3}">${escaped}</span>`;
        depth++;
        break;
      case DocErrores.TK.RPAREN:
        depth = Math.max(0, depth - 1);
        result += `<span class="sh-bracket-${depth % 3}">${escaped}</span>`;
        break;
      case DocErrores.TK.IDENTIFIER:
        if (userVarsSet.has(tk.value.toLowerCase())) {
          result += `<span class="sh-variable">${escaped}</span>`;
        } else {
          result += `<span class="sh-plain">${escaped}</span>`;
        }
        break;
      default:
        result += `<span class="sh-plain">${escaped}</span>`;
        break;
    }
  }

  return { html: result, depth };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// =========================================
// 9. AUTOCOMPLETE
// =========================================

let acIndice = -1;

$("#editor").on("input", function () {
  if (errorVisualState.activo) {
    invalidarErroresVisuales();
  }
  quitarResalteNombreInvalido();
  actualizarLineas();
  mostrarAutocompletado();
});

$("#editor").on("paste", function () {
  setTimeout(() => {
    if (errorVisualState.activo) {
      invalidarErroresVisuales();
    }
    actualizarLineas();
  }, 10);
});

function getLineIndices(texto, selStart, selEnd) {
  const beforeStart = texto.substring(0, selStart);
  const beforeEnd = texto.substring(0, selEnd);
  const lineIdxStart = beforeStart.split("\n").length - 1;
  const lineIdxEnd = beforeEnd.split("\n").length - 1;
  return { lineIdxStart, lineIdxEnd };
}

function tabularLineas(editor) {
  const s = editor.selectionStart;
  const en = editor.selectionEnd;
  const v = editor.value;
  const lastNL = v.lastIndexOf("\nFinProceso");

  if (s < PROCESO_PREFIX_LEN || s > lastNL || en > lastNL) return;
  const { lineIdxStart, lineIdxEnd } = getLineIndices(v, s, en);
  const lineas = v.split("\n");
  const firstProcLine = 1;
  const lastProcLine = lineas.length - 2;

  const startIdx = Math.max(lineIdxStart, firstProcLine);
  const endIdx = Math.min(lineIdxEnd, lastProcLine);
  if (startIdx > endIdx) return;
  registrarHistorialEditor(editor);

  let positionCounter = 0;
  let offsetInStartLine = 0,
    offsetInEndLine = 0;
  for (let i = 0; i < lineas.length; i++) {
    if (i === lineIdxStart) offsetInStartLine = s - positionCounter;
    if (i === lineIdxEnd) offsetInEndLine = en - positionCounter;
    positionCounter += lineas[i].length + 1;
  }

  for (let i = startIdx; i <= endIdx; i++) {
    lineas[i] = "  " + lineas[i];
  }

  positionCounter = 0;
  let newSelStart = 0,
    newSelEnd = 0;
  for (let i = 0; i < lineas.length; i++) {
    if (i === lineIdxStart) {
      newSelStart =
        positionCounter +
        offsetInStartLine +
        (i >= startIdx && i <= endIdx ? 2 : 0);
    }
    if (i === lineIdxEnd) {
      newSelEnd =
        positionCounter +
        offsetInEndLine +
        (i >= startIdx && i <= endIdx ? 2 : 0);
    }
    positionCounter += lineas[i].length + 1;
  }

  editor.value = lineas.join("\n");
  editor.selectionStart = newSelStart;
  editor.selectionEnd = newSelEnd;
  actualizarLineas();
}

function destabularLineas(editor) {
  const s = editor.selectionStart;
  const en = editor.selectionEnd;
  const v = editor.value;
  const lastNL = v.lastIndexOf("\nFinProceso");

  if (s < PROCESO_PREFIX_LEN || s > lastNL || en > lastNL) return;

  const { lineIdxStart, lineIdxEnd } = getLineIndices(v, s, en);
  const lineas = v.split("\n");
  const firstProcLine = 1;
  const lastProcLine = lineas.length - 2;

  const startIdx = Math.max(lineIdxStart, firstProcLine);
  const endIdx = Math.min(lineIdxEnd, lastProcLine);

  let positionCounter = 0;
  let offsetInStartLine = 0,
    offsetInEndLine = 0;
  for (let i = 0; i < lineas.length; i++) {
    if (i === lineIdxStart) offsetInStartLine = s - positionCounter;
    if (i === lineIdxEnd) offsetInEndLine = en - positionCounter;
    positionCounter += lineas[i].length + 1;
  }

  const removalsPerLine = new Array(lineas.length).fill(0);
  let huboCambio = false;
  for (let i = startIdx; i <= endIdx; i++) {
    if (lineas[i].startsWith("  ")) {
      lineas[i] = lineas[i].substring(2);
      removalsPerLine[i] = 2;
      huboCambio = true;
    } else if (lineas[i].startsWith("\t")) {
      lineas[i] = lineas[i].substring(1);
      removalsPerLine[i] = 1;
      huboCambio = true;
    }
  }

  if (!huboCambio) return;
  registrarHistorialEditor(editor);

  positionCounter = 0;
  let newSelStart = 0,
    newSelEnd = 0;
  for (let i = 0; i < lineas.length; i++) {
    if (i === lineIdxStart) {
      newSelStart = Math.max(
        positionCounter + offsetInStartLine - removalsPerLine[i],
        positionCounter,
      );
    }
    if (i === lineIdxEnd) {
      newSelEnd = Math.max(
        positionCounter + offsetInEndLine - removalsPerLine[i],
        positionCounter,
      );
    }
    positionCounter += lineas[i].length + 1;
  }

  editor.value = lineas.join("\n");
  editor.selectionStart = newSelStart;
  editor.selectionEnd = newSelEnd;
  actualizarLineas();
}

$("#editor").on("keydown", function (e) {
  const $dd = $("#autocompleteDropdown");
  const visible = $dd.hasClass("visible");

  if (esAtajoDeshacer(e)) {
    e.preventDefault();
    deshacerEditor();
    return;
  }

  if (esAtajoRehacer(e)) {
    e.preventDefault();
    rehacerEditor();
    return;
  }

  if (visible) {
    const items = $dd.find(".autocomplete-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      acIndice = Math.min(acIndice + 1, items.length - 1);
      actualizarSeleccionAC(items);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      acIndice = Math.max(acIndice - 1, 0);
      actualizarSeleccionAC(items);
      return;
    }
    if (e.key === "Tab" || e.key === "Enter") {
      if (acIndice >= 0 && acIndice < items.length) {
        e.preventDefault();
        insertarAutocompletado($(items[acIndice]).data("texto"));
        ocultarAutocompletado();
        return;
      }
    }
    if (e.key === "Escape") {
      ocultarAutocompletado();
      return;
    }
  }

  if (e.key === "Tab" && !visible) {
    e.preventDefault();
    if (e.shiftKey) {
      destabularLineas(this);
    } else {
      tabularLineas(this);
    }
  }
});

function mostrarAutocompletado() {
  const editor = document.getElementById("editor");
  const cur = editor.selectionStart;
  const txt = editor.value;

  const textBefore = txt.substring(0, cur);
  const lastNewline = textBefore.lastIndexOf("\n");
  const lineUpToCursor = textBefore.substring(lastNewline + 1);

  const colInLine = lineUpToCursor.length;
  const fullLine = txt.split("\n")[textBefore.split("\n").length - 1] || "";
  const context = DocErrores.cursorContext(fullLine, colInLine - 1);

  if (context.inString || context.inComment) {
    ocultarAutocompletado();
    return;
  }

  let ini = cur - 1;
  while (ini >= 0 && /[\wáéíóúüñÁÉÍÓÚÜÑ]/.test(txt[ini])) ini--;
  ini++;
  const palabra = txt.substring(ini, cur);

  if (palabra.length < 2) {
    ocultarAutocompletado();
    return;
  }

  const userVars = DocErrores.extraerVariablesDelCodigo(txt).map((v) => ({
    texto: v,
    tipo: "variable",
  }));
  const todas = [...LiteSeInt.PALABRAS_RESERVADAS, ...userVars];

  const matches = todas.filter(
    (p) =>
      p.texto.toLowerCase().startsWith(palabra.toLowerCase()) &&
      p.texto.toLowerCase() !== palabra.toLowerCase(),
  );

  const seen = new Set();
  const unique = matches.filter((m) => {
    const key = m.texto.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!unique.length) {
    ocultarAutocompletado();
    return;
  }

  const $dd = $("#autocompleteDropdown").empty();
  acIndice = 0;

  unique.forEach((item, idx) => {
    const $it = $("<div>")
      .addClass("autocomplete-item")
      .attr("data-texto", item.texto)
      .html(
        `<span>${item.texto}</span><span class="kw-badge">${item.tipo}</span>`,
      )
      .on("click", () => {
        insertarAutocompletado(item.texto);
        ocultarAutocompletado();
      });
    if (idx === 0) $it.addClass("selected");
    $dd.append($it);
  });

  posicionarDropdown(cur);
  $dd.addClass("visible");
}

function posicionarDropdown(cursorPos) {
  const editor = document.getElementById("editor");
  const $dd = $("#autocompleteDropdown");
  const txt = editor.value.substring(0, cursorPos);
  const lineas = txt.split("\n");
  const lnIdx = lineas.length - 1;
  const col = lineas[lineas.length - 1].length;
  const wr = document.querySelector(".editor-wrapper").getBoundingClientRect();
  const metrics = getIndentGuideMetrics();
  const gutter = document.getElementById("lineNumbers");
  const lineHeight = metrics ? metrics.lineHeight : 21.45;
  const paddingTop = metrics ? metrics.paddingTop : 8;
  const paddingLeft = metrics ? metrics.paddingLeft : 16;
  const charWidth = metrics ? metrics.charWidth : 7.8;
  const gutterWidth = gutter ? gutter.offsetWidth : 45;

  const top = (lnIdx + 1) * lineHeight + paddingTop - editor.scrollTop;
  const left = col * charWidth + gutterWidth + paddingLeft - editor.scrollLeft;

  $dd.css({
    top: Math.min(top, wr.height - 190) + "px",
    left: Math.min(left, wr.width - 170) + "px",
  });
}

function insertarAutocompletado(palabra) {
  const editor = document.getElementById("editor");
  const cur = editor.selectionStart;
  const txt = editor.value;

  let ini = cur - 1;
  while (ini >= 0 && /[\wáéíóúüñÁÉÍÓÚÜÑ]/.test(txt[ini])) ini--;
  ini++;

  registrarHistorialEditor(editor);
  editor.value = txt.substring(0, ini) + palabra + " " + txt.substring(cur);
  const pos = ini + palabra.length + 1;
  editor.selectionStart = editor.selectionEnd = pos;
  editor.focus();
  actualizarLineas();
}

function actualizarSeleccionAC(items) {
  items.removeClass("selected");
  $(items[acIndice]).addClass("selected");
}

function ocultarAutocompletado() {
  $("#autocompleteDropdown").removeClass("visible");
  acIndice = -1;
}

$(document).on("click", function (e) {
  if (!$(e.target).closest("#editor, #autocompleteDropdown").length)
    ocultarAutocompletado();
});

// =========================================
// 10. CONTROLES PRINCIPALES
// =========================================

function setEstado(estado, texto) {
  $("#statusDot").removeClass("running error").addClass(estado);
  $("#statusText").text(texto);
}

async function ejecutar() {
  if (interprete.ejecutando) return;

  setMobileConsoleCollapsed(false);
  limpiarConsola();
  limpiarEjecucionHighlight();
  actualizarLineas();

  const codigo = $("#editor").val();
  if (codigo.trim() === "") return;

  const validacion = DocErrores.validarDocumento(codigo);

  if (validacion.errores.length > 0) {
    for (const err of validacion.errores) {
      consolaImprimir(
        `Error en línea ${err.linea + 1}: ${err.mensaje}`,
        "error",
      );
    }
    aplicarErroresVisuales(validacion.erroresPorLinea);
    setEstado("error", "Error");
    return;
  }

  setEstado("running", "Ejecutando...");
  $("#btnEjecutar").prop("disabled", true);
  $("#btnDetener").show();

  consolaImprimir("Inicio de ejecución", "system");

  const resultado = await interprete.ejecutar(codigo, validacion);

  if (resultado.detenido) {
    setEstado("", "Detenido");
  } else if (resultado.exito) {
    consolaImprimir("Fin de ejecución", "system");
    setEstado("", "Listo");
  } else {
    setEstado("error", "Error");
    if (resultado.erroresPorLinea && resultado.erroresPorLinea.size > 0) {
      errorVisualState.erroresPorLinea = resultado.erroresPorLinea;
      renderizarSubrayados();
    }
  }

  limpiarEjecucionHighlight();
  $("#btnEjecutar").prop("disabled", false);
  $("#btnDetener").hide();
}

function detener() {
  const estabaEjecutando = interprete.ejecutando;
  interprete.detener();
  if (inputResolver) {
    const r = inputResolver;
    inputResolver = null;
    r("");
  }
  if (estabaEjecutando) {
    consolaImprimir("Ejecución detenida por el usuario.", "system");
    setEstado("", "Detenido");
  }
  $("#btnEjecutar").prop("disabled", false);
  $("#btnDetener").hide();
  limpiarEjecucionHighlight();
}

// =========================================
// 11. EJEMPLOS
// =========================================

const EJEMPLOS = {
  hola: `// Mi primer programa
  Escribir "Hola mundo"
  `,

  saludo: `// Programa de saludo personalizado
  Definir nombre Como Caracter
  Escribir "¿Cómo te llamas?"
  Leer nombre
  Escribir "¡Hola, ", nombre, "! Bienvenido."  // saludo final
  `,

  notas: `// Calculadora de promedio de notas
  Definir nota1 Como Real
  Definir nota2 Como Real
  Definir promedio Como Real

  Escribir "Ingresa la primera nota:"
  Leer nota1
  Escribir "Ingresa la segunda nota:"
  Leer nota2

  promedio = (nota1 + nota2) / 2  // calcula promedio

  Escribir "El promedio es: ", promedio
  `,

  multivar: `// Ejemplo con múltiples variables en una línea
  Definir nombre, apellido, ciudad Como Caracter
  Definir edad Como Entero

  Escribir "Ingresa tu nombre:"
  Leer nombre
  Escribir "Ingresa tu apellido:"
  Leer apellido
  Escribir "Ingresa tu ciudad:"
  Leer ciudad
  Escribir "Ingresa tu edad:"
  Leer edad

  // Mostrar resultados
  Escribir "--- Datos ingresados ---"
  Escribir "Nombre: ", nombre, " ", apellido
  Escribir "Ciudad: ", ciudad
  Escribir "Edad: ", edad
  `,

  mayor: `// Determina cuál de dos números es mayor
  Definir a, b Como Real

  Escribir "Ingresa el primer número:"
  Leer a
  Escribir "Ingresa el segundo número:"
  Leer b

  Si a > b Entonces
    Escribir "El mayor es: ", a
  Sino
    Si b > a Entonces
      Escribir "El mayor es: ", b
    Sino
      Escribir "Los dos números son iguales."
    FinSi
  FinSi
  `,
  contador: `// Suma los números del 1 al N ingresado por el usuario
  Definir n, i, suma Como Entero

  Escribir "¿Hasta qué número sumar?"
  Leer n
  suma = 0
  i = 1

  Mientras i <= n Hacer
    suma = suma + i
    i = i + 1
  FinMientras

  Escribir "La suma de 1 a ", n, " es: ", suma
  `,

  tabla: `// Tabla de multiplicar de un número
  Definir num, i Como Entero

  Escribir "¿De qué número quieres la tabla?"
  Leer num

  Para i = 1 Hasta 10 Hacer
    Escribir num, " x ", i, " = ", num * i
  FinPara
  `,

  logico: `// Ejemplo del tipo Logico con Verdadero, Falso y No
  Definir activo, permitido Como Logico

  activo = Verdadero
  permitido = Falso

  Si activo Y No permitido Entonces
    Escribir "Acceso parcial: activo pero sin permiso"
  Sino
    Escribir "Otro estado"
  FinSi

  // Negación sobre variable
  permitido = No permitido
  Escribir "permitido ahora vale: ", permitido
  `,

  texto: `// Funciones nativas de texto: Longitud, Mayusculas, Minusculas
  Definir nombre, normalizado Como Caracter
  Definir largo Como Entero

  Escribir "Ingresa tu nombre:"
  Leer nombre

  normalizado = Mayusculas(nombre)
  largo = Longitud(normalizado)

  Escribir "En mayúsculas: ", normalizado
  Escribir "Tiene ", largo, " caracteres"

  Si Longitud(nombre) > 0 Entonces
    Escribir "En minúsculas: ", Minusculas(nombre)
  FinSi

  // Llamadas anidadas en una sola expresión
  Escribir "Largo del nombre en mayúsculas: ", Longitud(Mayusculas(nombre))
  `,

  numerico: `// Operadores y funciones numéricas: mod, ^, menos unario, Abs, Redon, Trunc
  Definir n, resto Como Entero
  Definir base, resultado Como Real

  Escribir "Ingresa un número entero:"
  Leer n

  resto = n mod 2
  Si resto == 0 Entonces
    Escribir n, " es par"
  Sino
    Escribir n, " es impar"
  FinSi

  base = -3.6
  Escribir "Abs(", base, ") = ", Abs(base)
  Escribir "Redon(", base, ") = ", Redon(base)
  Escribir "Trunc(", base, ") = ", Trunc(base)

  resultado = 2 * -3
  Escribir "2 * -3 = ", resultado

  resultado = 2 ^ -3
  Escribir "2 ^ -3 = ", resultado

  resultado = 2 ^ 10
  Escribir "2 ^ 10 = ", resultado
  `,

  diasemana: `// Nombre del día según su número (1=Lunes ... 7=Domingo)
  Definir dia Como Entero

  Escribir "Ingresa el número del día (1-7):"
  Leer dia

  Segun dia Hacer
    1: Escribir "Lunes"
    2: Escribir "Martes"
    3: Escribir "Miércoles"
    4: Escribir "Jueves"
    5: Escribir "Viernes"
    6, 7:
      Escribir "Fin de semana"
    De Otro Modo:
      Escribir "Número inválido. Ingresa del 1 al 7."
  FinSegun
  `,
};

function cargarEjemplo(nombre) {
  if (EJEMPLOS[nombre]) {
    const nombreProceso = obtenerNombreProceso();
    registrarHistorialEditor();
    $("#editor").val(
      `Proceso ${nombreProceso}\n${EJEMPLOS[nombre]}\nFinProceso`,
    );
    limpiarConsola();
    actualizarLineas();
  }
}

// =========================================
// 11.b BANCO DE EJERCICIOS Y DOCUMENTACION (panel de aprendizaje)
// =========================================

const NIVELES_LITESEINT = [
  { id: 1, titulo: "Introducción a los Algoritmos" },
  { id: 2, titulo: "Diagramas de Flujo y Pseudocódigo" },
  { id: 3, titulo: "Estructuras de Decisión" },
  { id: 4, titulo: "Estructuras de Repetición" },
  { id: 5, titulo: "Desafíos" },
  { id: 6, titulo: "Tipo Prueba Parte 1" },
  { id: 7, titulo: "Tipo Prueba Parte 2" },
];

const NIVELES_VISIBLES = [1, 2, 3, 4, 5, 6, 7];

const DOC_COMANDOS = [
  {
    nombre: "Proceso / FinProceso",
    sintaxis: "Proceso nombre\n  instrucciones\nFinProceso",
    ejemplo: "Proceso saludo\n  Escribir \"Hola\"\nFinProceso",
    descripcion: "Todo programa LiteSeInt empieza con Proceso y termina con FinProceso.",
    ejercicios: ["n1-001", "n1-002"],
  },
  {
    nombre: "Definir",
    sintaxis: "Definir variable[, otra] Como Entero|Real|Caracter|Logico",
    ejemplo: "Definir edad Como Entero\nDefinir nombre Como Caracter",
    descripcion: "Declara variables antes de usarlas e indica el tipo de dato que guardan.",
    ejercicios: ["n1-003", "n1-004"],
  },
  {
    nombre: "Asignación",
    sintaxis: "variable = expresion",
    ejemplo: "total = precio * cantidad",
    descripcion: "Guarda el resultado de una expresión en una variable ya definida.",
    ejercicios: ["n1-006", "n1-007"],
  },
  {
    nombre: "Leer",
    sintaxis: "Leer variable",
    ejemplo: "Escribir \"Ingresa tu edad:\"\nLeer edad",
    descripcion: "Pide un dato por consola y lo guarda en una variable compatible.",
    ejercicios: ["n1-005", "n2-001"],
  },
  {
    nombre: "Escribir",
    sintaxis: "Escribir expresion[, expresion...]",
    ejemplo: "Escribir \"Resultado: \", total",
    descripcion: "Muestra texto, números, variables o varias expresiones separadas por coma.",
    ejercicios: ["n1-001", "n1-002"],
  },
  {
    nombre: "Si / Sino / FinSi",
    sintaxis: "Si condicion Entonces\n  instrucciones\nSino\n  instrucciones\nFinSi",
    ejemplo: "Si edad >= 18 Entonces\n  Escribir \"Mayor\"\nSino\n  Escribir \"Menor\"\nFinSi",
    descripcion: "Ejecuta una rama u otra según una condición lógica.",
    ejercicios: ["n3-001", "n3-002"],
  },
  {
    nombre: "Mientras / FinMientras",
    sintaxis: "Mientras condicion Hacer\n  instrucciones\nFinMientras",
    ejemplo: "Mientras i <= 10 Hacer\n  Escribir i\n  i = i + 1\nFinMientras",
    descripcion: "Repite instrucciones mientras la condición siga siendo verdadera.",
    ejercicios: ["n4-001", "n4-002"],
  },
  {
    nombre: "Repetir / HastaQue",
    sintaxis: "Repetir\n  instrucciones\nHastaQue condicion",
    ejemplo: "Repetir\n  Leer clave\nHastaQue clave == \"ok\"",
    descripcion: "Ejecuta el bloque al menos una vez y luego evalúa la condición de salida.",
    ejercicios: ["n4-007", "n4-021"],
  },
  {
    nombre: "Para / FinPara",
    sintaxis: "Para i = inicio Hasta fin [Con Paso paso] Hacer\n  instrucciones\nFinPara",
    ejemplo: "Para i = 1 Hasta 5 Hacer\n  Escribir i\nFinPara",
    descripcion: "Repite un bloque con un contador que avanza automáticamente.",
    ejercicios: ["n4-005", "n4-006"],
  },
  {
    nombre: "Segun / FinSegun",
    sintaxis: "Segun expresion Hacer\n  valor: instrucciones\n  De Otro Modo: instrucciones\nFinSegun",
    ejemplo: "Segun dia Hacer\n  1: Escribir \"Lunes\"\n  De Otro Modo: Escribir \"Otro\"\nFinSegun",
    descripcion: "Selecciona una alternativa entre varios casos posibles.",
    ejercicios: ["n3-031", "n3-032"],
  },
  {
    nombre: "Funciones nativas",
    sintaxis: "Abs(x), Redon(x), Trunc(x), Longitud(texto), Mayusculas(texto), Minusculas(texto)",
    ejemplo: "Escribir Mayusculas(nombre)\nEscribir Redon(promedio)",
    descripcion: "Resuelven operaciones comunes de texto y números dentro de expresiones.",
    ejercicios: ["n2-010", "n2-011"],
  },
  {
    nombre: "Comentarios",
    sintaxis: "// texto",
    ejemplo: "// Calcula el promedio\npromedio = suma / 3",
    descripcion: "Documentan el programa y no se ejecutan.",
    ejercicios: ["n1-006", "n1-008"],
  },
];

const DOC_ERRORES_COMUNES = [
  {
    titulo: "Variable no definida",
    causa: "Usar una variable que nunca fue declarada con Definir.",
    arreglo: "Agrega Definir antes de leer, asignar o escribir esa variable.",
    ejemplo: "Definir edad Como Entero\nLeer edad",
  },
  {
    titulo: "Variable no inicializada",
    causa: "Leer el valor de una variable declarada pero sin dato útil para esa operación.",
    arreglo: "Asigna un valor inicial o usa Leer antes de operar con ella.",
    ejemplo: "suma = 0",
  },
  {
    titulo: "Falta FinSi",
    causa: "Abrir un Si y cerrar el programa o un bloque externo antes de cerrar la condición.",
    arreglo: "Cierra cada Si con FinSi en el mismo nivel de indentación.",
    ejemplo: "Si edad >= 18 Entonces\n  Escribir \"Mayor\"\nFinSi",
  },
  {
    titulo: "Falta FinMientras",
    causa: "Abrir un Mientras sin cerrar su bloque.",
    arreglo: "Agrega FinMientras después de las instrucciones repetidas.",
    ejemplo: "Mientras i <= 5 Hacer\n  i = i + 1\nFinMientras",
  },
  {
    titulo: "Sintaxis PSeInt no soportada",
    causa: "Usar alias fuera del dialecto LiteSeInt, como <-, Cadena, SiNo, MOD o DIV.",
    arreglo: "Usa =, Caracter, Sino y mod en minúscula.",
    ejemplo: "nombre = \"Ana\"\nresto = numero mod 2",
  },
  {
    titulo: "Confusión entre = y ==",
    causa: "Usar = para comparar dentro de una condición.",
    arreglo: "Usa = para asignar y == para comparar.",
    ejemplo: "Si clave == \"ok\" Entonces",
  },
];

const PROGRESO_KEY = "liteseint:exerciseProgress";
const ESTADOS_PROGRESO = ["pendiente", "en-curso", "completado"];
const ESTADO_LABEL = {
  "pendiente": "Pendiente",
  "en-curso": "En curso",
  "completado": "Completado",
};

let progresoEjercicios = {};
let ejercicioSeleccionadoId = null;

async function cargarBancoEjerciciosDesdeJson() {
  if (!window.EjerciciosLiteSeInt || !window.EjerciciosLiteSeInt.cargarDesdeJson) {
    throw new Error("No se cargó js/ejercicios-data.js antes de js/app.js.");
  }
  await window.EjerciciosLiteSeInt.cargarDesdeJson();
}

function cargarProgreso() {
  try {
    const raw = localStorage.getItem(PROGRESO_KEY);
    progresoEjercicios = raw ? JSON.parse(raw) : {};
    if (typeof progresoEjercicios !== "object" || progresoEjercicios === null) {
      progresoEjercicios = {};
    }
  } catch (_) {
    progresoEjercicios = {};
  }
}

function guardarProgreso() {
  try {
    localStorage.setItem(PROGRESO_KEY, JSON.stringify(progresoEjercicios));
  } catch (_) {
    /* ignorar */
  }
}

function estadoEjercicio(id) {
  const v = progresoEjercicios[id];
  return ESTADOS_PROGRESO.includes(v) ? v : "pendiente";
}

function setEstadoEjercicio(id, estado) {
  if (!ESTADOS_PROGRESO.includes(estado)) return;
  if (estado === "pendiente") {
    delete progresoEjercicios[id];
  } else {
    progresoEjercicios[id] = estado;
  }
  guardarProgreso();
}

function ejerciciosVisibles() {
  if (!window.EjerciciosLiteSeInt) return [];
  return window.EjerciciosLiteSeInt.listarAdaptados().filter(
    (e) => NIVELES_VISIBLES.includes(e.nivelLiteSeInt),
  );
}

function ejerciciosPorIds(ids) {
  if (!window.EjerciciosLiteSeInt) return [];
  return ids
    .map((id) => window.EjerciciosLiteSeInt.porId(id))
    .filter(Boolean)
    .filter((e) => e.estadoAdaptacion === "adaptado");
}

function crearLinkEjercicio(ejercicio) {
  return $("<button>")
    .addClass("learning-doc-exercise")
    .attr("type", "button")
    .text(`${ejercicio.numero || ejercicio.id} · ${ejercicio.titulo}`)
    .on("click", () => {
      cambiarVistaAprendizaje("ejercicios");
      seleccionarEjercicio(ejercicio.id);
    });
}

function renderizarDocsComandos() {
  const $cont = $("#learningViewComandos");
  if (!$cont.length) return;
  $cont.empty();
  $cont.append($("<p>").addClass("learning-doc-intro").text(
    "Referencia rápida de los comandos soportados por LiteSeInt, con ejemplos mínimos y ejercicios para practicar.",
  ));

  DOC_COMANDOS.forEach((doc) => {
    const $card = $("<article>").addClass("learning-doc-card");
    $card.append($("<h4>").text(doc.nombre));
    $card.append($("<p>").text(doc.descripcion));
    $card.append($("<div>").addClass("learning-doc-label").text("Sintaxis"));
    $card.append($("<pre>").text(doc.sintaxis));
    $card.append($("<div>").addClass("learning-doc-label").text("Ejemplo"));
    $card.append($("<pre>").text(doc.ejemplo));

    const ejercicios = ejerciciosPorIds(doc.ejercicios);
    if (ejercicios.length) {
      const $recs = $("<div>").addClass("learning-doc-recs");
      $recs.append($("<div>").addClass("learning-doc-label").text("Practicar con"));
      ejercicios.forEach((e) => $recs.append(crearLinkEjercicio(e)));
      $card.append($recs);
    }
    $cont.append($card);
  });
}

function renderizarRutaEstudiante() {
  const $cont = $("#learningViewRuta");
  if (!$cont.length) return;
  $cont.empty();
  $cont.append($("<p>").addClass("learning-doc-intro").text(
    "Ruta sugerida para avanzar desde programas lineales hasta patrones de procesamiento.",
  ));

  NIVELES_LITESEINT.forEach((nivel) => {
    const ejercicios = ejerciciosVisibles().filter((e) => e.nivelLiteSeInt === nivel.id);
    const completados = ejercicios.filter((e) => estadoEjercicio(e.id) === "completado").length;
    const recomendados = ejercicios.slice(0, 3);
    const $card = $("<article>").addClass("learning-route-card");
    $card.append($("<div>").addClass("learning-route-num").text(`N${nivel.id}`));
    const $body = $("<div>").addClass("learning-route-body");
    $body.append($("<h4>").text(nivel.titulo));
    $body.append($("<p>").text(`${completados}/${ejercicios.length} ejercicios completados`));
    if (recomendados.length) {
      const $recs = $("<div>").addClass("learning-doc-recs");
      recomendados.forEach((e) => $recs.append(crearLinkEjercicio(e)));
      $body.append($recs);
    }
    $card.append($body);
    $cont.append($card);
  });
}

function renderizarErroresComunes() {
  const $cont = $("#learningViewErrores");
  if (!$cont.length) return;
  $cont.empty();
  $cont.append($("<p>").addClass("learning-doc-intro").text(
    "Errores frecuentes del dialecto LiteSeInt y la forma directa de corregirlos.",
  ));

  DOC_ERRORES_COMUNES.forEach((err) => {
    const $card = $("<article>").addClass("learning-doc-card");
    $card.append($("<h4>").text(err.titulo));
    $card.append($("<p>").append($("<b>").text("Causa: ")).append(document.createTextNode(err.causa)));
    $card.append($("<p>").append($("<b>").text("Corrección: ")).append(document.createTextNode(err.arreglo)));
    $card.append($("<div>").addClass("learning-doc-label").text("Ejemplo"));
    $card.append($("<pre>").text(err.ejemplo));
    $cont.append($card);
  });
}

function renderizarAprendizajeIntegrado() {
  renderizarDocsComandos();
  renderizarRutaEstudiante();
  renderizarErroresComunes();
}

function cambiarVistaAprendizaje(view) {
  $(".learning-tab").toggleClass("active", false);
  $(`.learning-tab[data-learning-view="${view}"]`).addClass("active");
  $(".learning-view").removeClass("active");
  $(`[data-learning-panel-view="${view}"]`).addClass("active");
  $("#btnToggleEjLista").toggle(view === "ejercicios");
}

function initLearningTabs() {
  $(document).on("click", ".learning-tab", function () {
    cambiarVistaAprendizaje(this.dataset.learningView);
  });
}

function poblarFiltroNivel() {
  const group = document.getElementById('ejFiltroNivelGroup');
  if (!group) return;
  const activeVal = group.querySelector('.ej-pill.active')?.dataset.val ?? '';
  group.innerHTML = '';

  const label = document.createElement('span');
  label.className = 'ej-filter-label';
  label.textContent = 'Nivel:';
  group.appendChild(label);

  const allBtn = document.createElement('button');
  allBtn.className = 'ej-pill' + (activeVal === '' ? ' active' : '');
  allBtn.dataset.filter = 'nivel';
  allBtn.dataset.val = '';
  allBtn.textContent = 'Todo';
  group.appendChild(allBtn);

  const presentes = new Set(ejerciciosVisibles().map((e) => e.nivelLiteSeInt));
  for (const n of NIVELES_LITESEINT) {
    if (!presentes.has(n.id)) continue;
    const btn = document.createElement('button');
    btn.className = 'ej-pill' + (activeVal === String(n.id) ? ' active' : '');
    btn.dataset.filter = 'nivel';
    btn.dataset.val = String(n.id);
    btn.textContent = `N${n.id}`;
    group.appendChild(btn);
  }
}

function aplicarFiltros(lista) {
  const nivel = document.querySelector('#ejFiltroNivelGroup .ej-pill.active')?.dataset.val ?? '';
  const dif   = document.querySelector('#ejFiltroDifGroup .ej-pill.active')?.dataset.val ?? '';
  const estado = document.querySelector('#ejFiltroEstadoGroup .ej-pill.active')?.dataset.val ?? '';
  return lista.filter((e) => {
    if (nivel !== '' && String(e.nivelLiteSeInt) !== nivel) return false;
    if (dif   !== '' && e.dificultad !== dif) return false;
    if (estado !== '' && estadoEjercicio(e.id) !== estado) return false;
    return true;
  });
}

function renderizarResumenProgreso() {
  const $cont = $("#ejProgresoResumen");
  if (!$cont.length) return;
  const visibles = ejerciciosVisibles();
  const total = visibles.length;
  const conteo = {
    "completado": 0,
    "en-curso": 0,
    "pendiente": 0,
  };
  for (const e of visibles) {
    const st = estadoEjercicio(e.id);
    conteo[st] = (conteo[st] || 0) + 1;
  }
  const completados = conteo.completado;
  const enCurso = conteo["en-curso"];
  const pendientes = conteo.pendiente;
  const tooltip = [
    `Completados: ${completados}`,
    `En progreso: ${enCurso}`,
    `Pendientes: ${pendientes}`,
    `Total: ${total}`,
  ].join("\n");
  const crearTramo = (cantidad, estado, etiqueta) => {
    const proporcion = total > 0 ? cantidad / total : 0;
    const ancho = proporcion * 100;
    return `<span class="ej-progress-segment ${estado}" style="--seg-width:${ancho}%" aria-label="${etiqueta}: ${cantidad}"><span>${cantidad}</span></span>`;
  };

  $cont
    .attr("title", tooltip)
    .attr("data-tooltip", tooltip)
    .html(
      `<span class="ej-progress-label">progreso:</span>` +
      `<div class="ej-progress-modern-bar" aria-label="${tooltip}">` +
        crearTramo(completados, "done", "Completados") +
        crearTramo(enCurso, "running", "En curso") +
        crearTramo(pendientes, "pending", "Pendientes") +
      `</div>`,
    );
}

function renderizarListaEjercicios() {
  const $lista = $("#ejList");
  if (!$lista.length) return;
  const visibles = aplicarFiltros(ejerciciosVisibles());
  $lista.empty();

  if (visibles.length === 0) {
    $lista.append(
      $("<li>")
        .addClass("ej-empty")
        .text("No hay ejercicios con esos filtros."),
    );
    return;
  }

  visibles.forEach((e) => {
    const estado = estadoEjercicio(e.id);
    const $item = $("<li>")
      .addClass("ej-item")
      .addClass(`estado-${estado}`)
      .attr("data-id", e.id)
      .attr("role", "button")
      .attr("tabindex", "0");
    if (e.id === ejercicioSeleccionadoId) $item.addClass("selected");

    const $content = $("<div>").addClass("ej-item-content");
    const $head = $("<div>").addClass("ej-item-head");
    $head.append($("<span>").addClass("ej-item-numero").text(e.numero));
    $head.append($("<span>").addClass("ej-item-dif").addClass(`dif-${e.dificultad}`).text(e.dificultad));
    $head.append($("<span>").addClass(`ej-item-estado est-${estado}`).text(ESTADO_LABEL[estado]));
    $content.append($head);
    $content.append($("<p>").addClass("ej-item-titulo").text(e.titulo));
    const conceptos = (e.conceptos || []).slice(0, 4).join(" · ");
    if (conceptos) {
      $content.append($("<p>").addClass("ej-item-conceptos").text(conceptos));
    }

    $item.append($content);
    $lista.append($item);
  });
}

function renderizarEstadoCargaEjercicios(mensaje) {
  $("#ejList").empty().append($("<li>").addClass("ej-empty").text(mensaje));
  $("#ejProgresoResumen").empty();
}

function mostrarDetalleEjercicio(id) {
  const $det = $("#ejDetail");
  if (!$det.length) return;
  const e = window.EjerciciosLiteSeInt
    ? window.EjerciciosLiteSeInt.porId(id)
    : null;
  if (!e) {
    $det.html('<p class="ej-detail-empty">Selecciona un ejercicio para ver su enunciado.</p>');
    return;
  }

  ejercicioSeleccionadoId = e.id;
  const estado = estadoEjercicio(e.id);

  $det.empty();
  const $tags = $("<div>").addClass("ej-detail-tags");
  $tags.append($("<span>").addClass("ej-tag ej-tag-numero").text(e.numero));
  $tags.append($("<span>").addClass(`ej-tag ej-tag-dif dif-${e.dificultad}`).text(e.dificultad));
  $tags.append($("<span>").addClass(`ej-tag est-${estado}`).text(ESTADO_LABEL[estado]));
  if (e.codigoReferencia) {
    const $btnRef = $("<button>")
      .addClass("ej-ref-code-btn")
      .attr("type", "button")
      .attr("aria-label", "Ver código de referencia y reemplazar el editor")
      .attr("data-tooltip", "Ver código de referencia:\nReemplaza el contenido del editor previa confirmación")
      .html(`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      `)
      .on("click", () => cargarCodigoReferencia(e));
    $tags.append($btnRef);
  }
  $det.append($tags);

  if (e.conceptos && e.conceptos.length) {
    const $cs = $("<p>").addClass("ej-conceptos-list");
    $cs.append($("<span>").addClass("ej-section-label").text("Conceptos: "));
    $cs.append(document.createTextNode(e.conceptos.join(", ")));
    $det.append($cs);
  }

  $det.append($("<h4>").text(e.panelTitulo || e.titulo));

  const $enunciado = $("<p>").addClass("ej-enunciado");
  if (e.enunciadoHtml) $enunciado.html(e.enunciadoHtml);
  else $enunciado.text(e.enunciado);
  $det.append($enunciado);

  const crearEps = () => {
    if (!e.entradaProcesoSalida) return null;
    const eps = e.entradaProcesoSalida;
    const $eps = $("<div>").addClass("ej-eps");
    $eps.append($("<p>").addClass("ej-section-label").text("Entrada · Proceso · Salida"));
    if (eps.entrada) $eps.append($("<div>").addClass("ej-eps-row").html('<b>E:</b> ').append(document.createTextNode(eps.entrada)));
    if (eps.proceso) $eps.append($("<div>").addClass("ej-eps-row").html('<b>P:</b> ').append(document.createTextNode(eps.proceso)));
    if (eps.salida) $eps.append($("<div>").addClass("ej-eps-row").html('<b>S:</b> ').append(document.createTextNode(eps.salida)));
    return $eps;
  };

  if (e.entradaProcesoSalida) {
    if (e.pista) {
      const $pista = $("<details>").addClass("ej-pista");
      $pista.append($("<summary>").text("Ver pista"));
      const $pistaTexto = $("<p>");
      if (e.pistaHtml) $pistaTexto.html(e.pistaHtml);
      else $pistaTexto.text(e.pista);
      $pista.append($pistaTexto);
      $pista.append(crearEps());
      $det.append($pista);
    } else {
      $det.append(crearEps());
    }
  } else if (e.pista) {
    const $pista = $("<details>").addClass("ej-pista");
    $pista.append($("<summary>").text("Ver pista"));
    const $pistaTexto = $("<p>");
    if (e.pistaHtml) $pistaTexto.html(e.pistaHtml);
    else $pistaTexto.text(e.pista);
    $pista.append($pistaTexto);
    $det.append($pista);
  }

  if (e.salidaEsperada) {
    const $se = $("<div>").addClass("ej-salida");
    $se.append($("<p>").addClass("ej-section-label").text("Salida esperada"));
    $se.append($("<pre>").text(e.salidaEsperada));
    $det.append($se);
  }

  // Estado del ejercicio
  const $estado = $("<div>").addClass("ej-estado-control");
  $estado.append($("<p>").addClass("ej-section-label").text("Marcar como"));
  for (const st of ESTADOS_PROGRESO) {
    const $b = $("<button>")
      .addClass("ej-btn-estado")
      .addClass(`est-${st}`)
      .toggleClass("selected", st === estado)
      .text(ESTADO_LABEL[st])
      .on("click", () => {
        setEstadoEjercicio(e.id, st);
        renderizarListaEjercicios();
        renderizarResumenProgreso();
        renderizarRutaEstudiante();
        mostrarDetalleEjercicio(e.id);
      });
    $estado.append($b);
  }
  $det.append($estado);
}

function plantillaInicial(ejercicio) {
  const nombre = (ejercicio.titulo || "ejercicio")
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^[0-9]/, "p_$&") || "ejercicio";
  return `Proceso ${nombre}\n  // ${ejercicio.titulo}\n  // Enunciado: revisa el panel de aprendizaje.\n\n\nFinProceso`;
}

function reemplazarEditorConfirmando(nuevoCodigo, mensaje, siempreConfirmar = false) {
  const editor = document.getElementById("editor");
  if (!editor) return;
  const actual = editor.value;
  const limpio = actual.trim();
  const placeholder = ESTRUCTURA_INICIAL.trim();

  const reemplazar = () => {
    registrarHistorialEditor();
    editor.value = nuevoCodigo;
    limpiarConsola();
    actualizarLineas();
    editor.focus();
  };

  if (!siempreConfirmar && (limpio === "" || limpio === placeholder)) {
    reemplazar();
    return;
  }

  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "warning",
      title: "¿Reemplazar el código actual?",
      text: mensaje,
      showCancelButton: true,
      confirmButtonText: "Reemplazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#00cc77",
      background: "#161b22",
      color: "#e6edf3",
    }).then((res) => {
      if (res && res.isConfirmed) reemplazar();
    });
  } else if (window.confirm(mensaje + "\n\n¿Reemplazar el código actual?")) {
    reemplazar();
  }
}

function cargarPlantillaEjercicio(ejercicio) {
  reemplazarEditorConfirmando(
    plantillaInicial(ejercicio),
    "Esto reemplazará el contenido del editor por una plantilla en blanco para este ejercicio.",
  );
}

function cargarCodigoReferencia(ejercicio) {
  if (!ejercicio.codigoReferencia) return;
  reemplazarEditorConfirmando(
    ejercicio.codigoReferencia,
    "Esto reemplazará el contenido del editor por el código de referencia. Se recomienda intentar resolver el ejercicio antes de mirar la solución.",
    true,
  );
}

function seleccionarEjercicio(id) {
  ejercicioSeleccionadoId = id;
  $(".ej-item").removeClass("selected");
  $(`.ej-item[data-id="${id}"]`).addClass("selected");
  mostrarDetalleEjercicio(id);
}

async function inicializarBancoEjercicios() {
  cargarProgreso();
  renderizarEstadoCargaEjercicios("Cargando ejercicios desde JSON...");
  try {
    await cargarBancoEjerciciosDesdeJson();
  } catch (err) {
    console.error(err);
    renderizarEstadoCargaEjercicios("No se pudieron cargar los ejercicios desde los archivos JSON.");
    $("#ejDetail").html(
      '<p class="ej-detail-empty">Revisa que la página se esté sirviendo desde un servidor local y que el archivo JSON exista.</p>',
    );
    return;
  }
  poblarFiltroNivel();
  renderizarListaEjercicios();
  renderizarResumenProgreso();
  renderizarAprendizajeIntegrado();

  $(document).on("click", ".ej-pill", function () {
    const filter = this.dataset.filter;
    const groupId = filter === 'nivel' ? 'ejFiltroNivelGroup'
                  : filter === 'dif'   ? 'ejFiltroDifGroup'
                  : 'ejFiltroEstadoGroup';
    document.querySelectorAll(`#${groupId} .ej-pill`).forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    renderizarListaEjercicios();
  });
}

// =========================================
// 11.c CONSOLA REDIMENSIONABLE
// =========================================

const CONSOLE_HEIGHT_KEY = "liteseint:consoleHeight";
const CONSOLE_MIN_PX = 96;

function clampConsoleHeight(px) {
  const workspace = document.querySelector(".workspace-column");
  if (!workspace) return px;
  const total = workspace.getBoundingClientRect().height;
  const handle = document.getElementById("consoleResizeHandle");
  const handleH = handle ? handle.getBoundingClientRect().height : 6;
  const editorMin = 120;
  const max = Math.max(CONSOLE_MIN_PX, total - editorMin - handleH);
  return Math.min(Math.max(px, CONSOLE_MIN_PX), max);
}

function aplicarAlturaConsola(px) {
  const panel = document.getElementById("consolePanel");
  if (!panel) return;
  const altura = clampConsoleHeight(px);
  panel.style.height = `${altura}px`;
  scheduleIndentGuideRender({ remeasure: true });
}

function cargarAlturaConsolaPersistida() {
  try {
    const v = localStorage.getItem(CONSOLE_HEIGHT_KEY);
    if (!v) return;
    const px = parseInt(v, 10);
    if (Number.isFinite(px) && px > 0) aplicarAlturaConsola(px);
  } catch (_) {
    /* localStorage no disponible: ignorar */
  }
}

function guardarAlturaConsola(px) {
  try {
    localStorage.setItem(CONSOLE_HEIGHT_KEY, String(Math.round(px)));
  } catch (_) {
    /* localStorage no disponible: ignorar */
  }
}

function inicializarResizeConsola() {
  const handle = document.getElementById("consoleResizeHandle");
  const panel = document.getElementById("consolePanel");
  if (!handle || !panel) return;

  let dragging = false;
  let startY = 0;
  let startH = 0;

  const onPointerMove = (e) => {
    if (!dragging) return;
    const delta = startY - e.clientY;
    aplicarAlturaConsola(startH + delta);
  };

  const onPointerUp = (e) => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    const final = panel.getBoundingClientRect().height;
    guardarAlturaConsola(final);
  };

  handle.addEventListener("pointerdown", (e) => {
    if (mobileConsoleQuery.matches) return;
    e.preventDefault();
    dragging = true;
    startY = e.clientY;
    startH = panel.getBoundingClientRect().height;
    handle.classList.add("dragging");
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  });

  handle.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 32 : 8;
    const current = panel.getBoundingClientRect().height;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      aplicarAlturaConsola(current + step);
      guardarAlturaConsola(panel.getBoundingClientRect().height);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      aplicarAlturaConsola(current - step);
      guardarAlturaConsola(panel.getBoundingClientRect().height);
    }
  });
}

// =========================================
// 12. INIT
// =========================================

$(document).ready(function () {
  const editor = document.getElementById("editor");
  editor.value = ESTRUCTURA_INICIAL;
  actualizarLineas();
  initTheme();
  restorePanelOrder();
  initPanelDrag();
  initEjListaToggle();
  initLearningTabs();

  const pos = ESTRUCTURA_INICIAL.indexOf("\n") + 1;
  editor.setSelectionRange(pos, pos);
  editor.focus();
  actualizarIndentGuides({ remeasure: true });

  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      actualizarIndentGuides({ remeasure: true });
    });
    resizeObserver.observe(editor);
    const editorArea = editor.parentElement;
    if (editorArea) resizeObserver.observe(editorArea);
  }

  window.addEventListener("resize", () => {
    actualizarIndentGuides({ remeasure: true });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      actualizarIndentGuides({ remeasure: true });
    });
  }

  editor.addEventListener("beforeinput", function (e) {
    if (e.inputType === "historyUndo") {
      e.preventDefault();
      deshacerEditor();
      return;
    }
    if (e.inputType === "historyRedo") {
      e.preventDefault();
      rehacerEditor();
      return;
    }

    const val = this.value;
    const s = this.selectionStart;
    const se = this.selectionEnd;
    const lastNL = val.lastIndexOf("\nFinProceso");
    if (lastNL < 0) return;

    const isBackward = ['deleteContentBackward','deleteWordBackward','deleteSoftLineBackward','deleteHardLineBackward'].includes(e.inputType);
    const isForward  = ['deleteContentForward','deleteWordForward','deleteSoftLineForward','deleteHardLineForward'].includes(e.inputType);

    let rStart = s;
    let rEnd = se;
    if (isBackward && s === se) rStart = s - 1;
    if (isForward && s === se) rEnd = se + 1;

    if (rStart < PROCESO_PREFIX_LEN || rEnd > lastNL) {
      e.preventDefault();
      return;
    }

    registrarHistorialEditor(this);
  });

  $("#btnEjecutar").on("click", ejecutar);
  $("#btnDetener").on("click", detener);
  $("#btnLimpiarConsola").on("click", limpiarConsola);
  $("#btnLimpiarTodo").on("click", limpiarTodo);
  $("#btnDescargar").on("click", descargar);
  $("#btnTheme").on("click", cycleTheme);
  initConsoleEchoToggle();
  $(".console-header").on("click", function (e) {
    if ($(e.target).closest(".console-header-actions, button").length) return;
    toggleMobileConsoleCollapsed();
  });

  const handleMobileConsoleChange = () => {
    if (!mobileConsoleQuery.matches) {
      setMobileConsoleCollapsed(false);
    }
  };

  if (mobileConsoleQuery.addEventListener) {
    mobileConsoleQuery.addEventListener("change", handleMobileConsoleChange);
  } else if (mobileConsoleQuery.addListener) {
    mobileConsoleQuery.addListener(handleMobileConsoleChange);
  }

  $("#ejemplosSelect").on("change", function () {
    const nombre = $(this).val();
    if (!nombre) return;
    cargarEjemplo(nombre);
    $(this).val("");
  });

  // Banco de ejercicios: filtros, listado, detalle y progreso local
  inicializarBancoEjercicios();
  $(document).on("click", ".ej-item", function () {
    const id = $(this).attr("data-id");
    if (id) seleccionarEjercicio(id);
  });
  $(document).on("keydown", ".ej-item", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const id = $(this).attr("data-id");
      if (id) seleccionarEjercicio(id);
    }
  });
  $("#learningPanelToggle").on("click", function (e) {
    e.stopPropagation();
    $("#learningPanel").toggleClass("collapsed");
  });

  // Consola redimensionable
  inicializarResizeConsola();
  cargarAlturaConsolaPersistida();
  window.addEventListener("resize", () => {
    const panel = document.getElementById("consolePanel");
    if (panel) {
      aplicarAlturaConsola(panel.getBoundingClientRect().height);
    }
  });
});
