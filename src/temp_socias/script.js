/* =====================================================
   E+Minera · Red de Socias
   Vanilla JS — modular structure, data-driven
   ===================================================== */

/* ---------- DATA (embedded for file:// usage) ---------- */
const DATA = {
  categories: [
    {
      id: "industrial",
      name: "Servicios Industriales",
      subtitle: "Industrial · Innovación · Tech",
      color: "#F06432",
      colorSoft: "rgba(240,100,50,0.18)",
      members: [
        { name: "Pamela Garrido", company: "EMESER", area: "Industrial" },
        { name: "Cristina Araya", company: "Araya Briones", area: "Industrial" },
        { name: "Georgina Kong", company: "Servicios Kong", area: "Industrial" },
        { name: "Martha Aguilera", company: "Electroram", area: "Industrial" },
        { name: "Alejandra Gimenez", company: "Novamine", area: "Industrial" },
        { name: "Valeria Castillo", company: "Gruval", area: "Industrial" },
        { name: "Francisca Tello", company: "Tegmin", area: "Industrial" },
        { name: "Paulina González", company: "Robotika", area: "Innovación · Tech" },
        { name: "Yocelin Quiroz", company: "C&N Obras Civiles", area: "Industrial" },
        { name: "Giovanna Soriano", company: "Servicios LYG", area: "Industrial" },
        { name: "Marjorie Trivick", company: "Trivick Group / Future of Data", area: "Innovación · Tech" },
        { name: "Virla Ibáñez", company: "Provee Spa", area: "Industrial" },
        { name: "Yasna Sepúlveda", company: "Alpha Support", area: "Industrial" },
        { name: "Katharina Haltenhoff", company: "Mueblería La Americana", area: "Industrial" },
        { name: "Teresa Gajardo", company: "TMETAL", area: "Industrial" },
        { name: "Karina Palma", company: "Manlim Spa", area: "Innovación · Tech" }
      ]
    },
    {
      id: "asesorias",
      name: "Asesorías",
      subtitle: "Consultoría · Estrategia · Comunidades",
      color: "#BE78C8",
      colorSoft: "rgba(190,120,200,0.18)",
      members: [
        { name: "Paola Quezada", company: "Agencia Redes", area: "Asesorías" },
        { name: "Monica Herrera", company: "Startmomentum Consulting", area: "Asesorías" },
        { name: "Tatiana Martinez", company: "MIJ Soluciones Contables", area: "Asesorías" },
        { name: "Andrea Vivanco", company: "Training Centre", area: "Asesorías" },
        { name: "Tatiana Sanhueza", company: "TAT Engineer IA", area: "Asesorías" },
        { name: "Marcela Maldonado", company: "Ulter SpA", area: "Asesorías" },
        { name: "Liseth Otero", company: "Grupo Lidero con Valentía", area: "Asesorías" },
        { name: "Paola Mardones", company: "Asesoramiento PMA", area: "Asesorías" },
        { name: "Ruth Rodríguez", company: "SMI Chile", area: "Asesorías" },
        { name: "Karla Sepúlveda", company: "Consultora", area: "Asesorías" },
        { name: "Mary Valdes", company: "Consultora", area: "Asesorías" }
      ]
    },
    {
      id: "salud",
      name: "Salud",
      subtitle: "Bienestar · Clínica",
      color: "#F0B428",
      colorSoft: "rgba(240,180,40,0.18)",
      members: [
        { name: "Lidia Rubio", company: "Clínica Alura", area: "Salud" },
        { name: "Odette Quijada", company: "Aurora Med", area: "Salud" }
      ]
    },
    {
      id: "circular",
      name: "Economía Circular",
      subtitle: "Sostenibilidad · Reciclaje",
      color: "#14BEB4",
      colorSoft: "rgba(20,190,180,0.18)",
      members: [
        { name: "Rosa Ester Salazar", company: "Grupo ROES / ECOCIR", area: "Economía Circular" }
      ]
    }
  ]
};

/* ---------- DIAL GEOMETRY ----------
   4 segments. We render at -160..160 viewBox, centered on (0,0).
   Outer radius 130, inner radius 70 (donut). Each segment 90deg.
   Segment angle origins: top=270, right=0 (mathematical), so we use a
   helper that takes "startDeg" measured from top, clockwise.
------------------------------------- */
const DIAL = { rOuter: 130, rInner: 70, gap: 3 }; // gap in degrees between segments
const SEG_ORDER = ["salud", "circular", "asesorias", "industrial"]; // visual order (clockwise from top-left)
// Position mapping: salud=top-left, circular=top-right, asesorias=bottom-right, industrial=bottom-left
const SEG_ANGLES = {
  salud:      { start: 270, end: 360 }, // top-left quadrant (270..360 from top, clockwise)
  circular:   { start:   0, end:  90 }, // top-right
  asesorias:  { start:  90, end: 180 }, // bottom-right
  industrial: { start: 180, end: 270 }  // bottom-left
};

function polar(angleDegFromTop, r) {
  // angle measured from top (12 o'clock), clockwise
  const rad = (angleDegFromTop - 90) * Math.PI / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

function arcPath(startDeg, endDeg, rOuter, rInner) {
  const gap = DIAL.gap;
  const s = startDeg + gap / 2;
  const e = endDeg - gap / 2;
  const large = (e - s) > 180 ? 1 : 0;
  const p1 = polar(s, rOuter);
  const p2 = polar(e, rOuter);
  const p3 = polar(e, rInner);
  const p4 = polar(s, rInner);
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z"
  ].join(" ");
}

/* ---------- STATE ---------- */
const state = { activeId: null, lock: false };
const byId = Object.fromEntries(DATA.categories.map(c => [c.id, c]));

/* ---------- RENDER: SEGMENTS ---------- */
function renderSegments() {
  const root = document.getElementById("segments");
  root.innerHTML = "";

  SEG_ORDER.forEach((id, idx) => {
    const cat = byId[id];
    const { start, end } = SEG_ANGLES[id];
    const mid = (start + end) / 2;
    const labelR = (DIAL.rOuter + DIAL.rInner) / 2;
    const lp = polar(mid, labelR);

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "segment");
    g.setAttribute("data-id", id);
    g.setAttribute("role", "tab");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", `${cat.name}, ${cat.members.length} socias`);
    g.setAttribute("aria-selected", "false");
    g.style.color = cat.color;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "segment-arc");
    path.setAttribute("d", arcPath(start, end, DIAL.rOuter, DIAL.rInner));
    path.setAttribute("fill", cat.color);
    g.appendChild(path);

    // segment label (count)
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("class", "segment-label");
    txt.setAttribute("x", lp.x.toFixed(2));
    txt.setAttribute("y", lp.y.toFixed(2));
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("dominant-baseline", "middle");
    txt.textContent = `${cat.members.length}`;
    g.appendChild(txt);

    root.appendChild(g);

    // events
    g.addEventListener("mouseenter", () => activate(id));
    g.addEventListener("mouseleave", () => { if (!state.lock) deactivate(); });
    g.addEventListener("click", () => toggleLock(id));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleLock(id);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = SEG_ORDER[(idx + 1) % SEG_ORDER.length];
        document.querySelector(`.segment[data-id="${next}"]`).focus();
        activate(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = SEG_ORDER[(idx - 1 + SEG_ORDER.length) % SEG_ORDER.length];
        document.querySelector(`.segment[data-id="${prev}"]`).focus();
        activate(prev);
      } else if (e.key === "Escape") {
        unlock();
        deactivate();
      }
    });
    g.addEventListener("focus", () => activate(id));
  });
}

/* ---------- RENDER: LEGEND ---------- */
function renderLegend() {
  const ul = document.getElementById("legend");
  ul.innerHTML = "";
  DATA.categories.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.id = cat.id;
    li.style.setProperty("--swatch", cat.color);
    li.style.color = cat.color;
    li.innerHTML = `<span class="legend-swatch"></span><span style="color:var(--ink-soft)">${cat.name}</span>`;
    li.addEventListener("mouseenter", () => activate(cat.id));
    li.addEventListener("mouseleave", () => { if (!state.lock) deactivate(); });
    li.addEventListener("click", () => toggleLock(cat.id));
    ul.appendChild(li);
  });
}

/* ---------- RENDER: META COUNT ---------- */
function renderMeta() {
  const total = DATA.categories.reduce((s, c) => s + c.members.length, 0);
  document.getElementById("metaCount").textContent = total;
}

/* ---------- ACTIVATE / DEACTIVATE ---------- */
function activate(id) {
  if (state.lock && state.activeId !== id) return;
  state.activeId = id;
  const cat = byId[id];
  const dial = document.getElementById("dial");
  dial.classList.add("has-active");

  document.querySelectorAll(".segment").forEach(s => {
    const isActive = s.dataset.id === id;
    s.classList.toggle("is-active", isActive);
    s.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  document.querySelectorAll(".legend li").forEach(li => {
    li.classList.toggle("is-active", li.dataset.id === id);
  });

  // Core
  document.getElementById("coreLabel").innerHTML = cat.name;
  document.getElementById("coreCount").textContent = `${cat.members.length} socias`;

  // Panel
  const panel = document.getElementById("panel");
  panel.classList.add("is-active");
  panel.style.setProperty("--accent", cat.color);
  panel.style.setProperty("--accent-soft", cat.colorSoft);

  document.getElementById("panelTag").textContent = `${String(cat.members.length).padStart(2, "0")} · ${cat.id.toUpperCase()}`;
  document.getElementById("panelTitle").textContent = cat.name;
  document.getElementById("panelSub").textContent = cat.subtitle;

  const body = document.getElementById("panelBody");
  body.innerHTML = "";
  const list = document.createElement("ul");
  list.className = "member-list";
  cat.members.forEach(m => {
    const li = document.createElement("li");
    li.className = "member";
    const initials = m.name.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase();
    li.innerHTML = `
      <div class="member-avatar">${initials}</div>
      <div class="member-info">
        <div class="member-name">${m.name}</div>
        <div class="member-company">${m.company || "—"}</div>
      </div>
      <div class="member-area">${m.area}</div>
    `;
    list.appendChild(li);
  });
  body.appendChild(list);
}

function deactivate() {
  state.activeId = null;
  document.getElementById("dial").classList.remove("has-active");
  document.querySelectorAll(".segment").forEach(s => {
    s.classList.remove("is-active");
    s.setAttribute("aria-selected", "false");
  });
  document.querySelectorAll(".legend li").forEach(li => li.classList.remove("is-active"));

  document.getElementById("coreLabel").innerHTML = "Selecciona<br/>un área";
  document.getElementById("coreCount").textContent = "";

  const panel = document.getElementById("panel");
  panel.classList.remove("is-active");
  panel.style.removeProperty("--accent");
  panel.style.removeProperty("--accent-soft");

  document.getElementById("panelTag").textContent = "—";
  document.getElementById("panelTitle").textContent = "Selecciona un área";
  document.getElementById("panelSub").textContent =
    "Pasa el cursor o toca un segmento para descubrir las socias de cada categoría.";
  document.getElementById("panelBody").innerHTML = `
    <div class="panel-empty">
      <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="3 4"/></svg>
      <p>Esperando interacción…</p>
    </div>`;
}

function toggleLock(id) {
  if (state.lock && state.activeId === id) {
    unlock();
    deactivate();
  } else {
    state.lock = true;
    activate(id);
  }
}
function unlock() { state.lock = false; }

/* ---------- INIT ---------- */
function init() {
  renderSegments();
  renderLegend();
  renderMeta();

  // Click outside dial+panel to deactivate (only when locked)
  document.addEventListener("click", (e) => {
    if (!state.lock) return;
    if (e.target.closest(".dial") || e.target.closest(".panel") || e.target.closest(".legend")) return;
    unlock();
    deactivate();
  });
}

document.addEventListener("DOMContentLoaded", init);
