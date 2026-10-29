// Página que aparece en lugar del sitio bloqueado.
const TOTAL_FONDOS = 24;
const CATEGORIAS = {
  escritura: "Palabra de Dios",
  catecismo: "Catecismo de la Iglesia",
  santos: "Santos y maestros espirituales",
};

const $ = (id) => document.getElementById(id);
const capas = [$("fondoA"), $("fondoB")];
let capaActual = 0;

// Muestra el dominio que se intentó abrir
try {
  if (location.hash.length > 1) $("sitio").textContent = urlOriginal(location.hash).hostname.replace(/^www\./, "");
} catch (_) { /* sin dominio, queda el texto por defecto */ }

// Guarda las últimas citas y fondos vistos para no repetir pronto
async function leerVistas() {
  try {
    const { vistas } = await chrome.storage.local.get("vistas");
    return vistas || { citas: [], fondos: [] };
  } catch (_) {
    return { citas: [], fondos: [] };
  }
}
async function guardarVistas(v) {
  try { await chrome.storage.local.set({ vistas: v }); } catch (_) {}
}

function elegir(total, recientes, memoria) {
  const libres = [];
  for (let i = 0; i < total; i++) if (!recientes.includes(i)) libres.push(i);
  const pool = libres.length ? libres : [...Array(total).keys()];
  const i = pool[Math.floor(Math.random() * pool.length)];
  return { i, recientes: [i, ...recientes].slice(0, memoria) };
}

function ponerFondo(n) {
  const url = `fondos/vitral_${String(n).padStart(2, "0")}.webp`;
  const img = new Image();
  img.onload = () => {
    const siguiente = capas[1 - capaActual];
    siguiente.style.backgroundImage = `url("${url}")`;
    siguiente.classList.add("visible");
    capas[capaActual].classList.remove("visible");
    capaActual = 1 - capaActual;
  };
  img.src = url;
}

function ponerCita(c) {
  $("categoria").textContent = CATEGORIAS[c.c] || "";
  $("cita").textContent = c.t;
  $("cita").classList.toggle("larga", c.t.length > 210);
  $("autor").textContent = c.a;
  $("ref").textContent = c.rc || c.r || "";
}

let vistas;
async function mostrar(conTransicion) {
  vistas = vistas || (await leerVistas());
  const cita = elegir(CITAS.length, vistas.citas, Math.floor(CITAS.length * 0.6));
  const fondo = elegir(TOTAL_FONDOS, vistas.fondos, Math.floor(TOTAL_FONDOS * 0.5));
  vistas = { citas: cita.recientes, fondos: fondo.recientes };
  guardarVistas(vistas);

  ponerFondo(fondo.i);
  if (!conTransicion) return ponerCita(CITAS[cita.i]);
  const t = $("tarjeta");
  t.classList.add("saliendo");
  setTimeout(() => { ponerCita(CITAS[cita.i]); t.classList.remove("saliendo"); }, 650);
}

$("otra").addEventListener("click", () => mostrar(true));
// Va a una pestaña nueva: volver atrás podría traer de la caché el sitio recién bloqueado
$("volver").addEventListener("click", () => {
  chrome.tabs.update({ url: "chrome://newtab" });
});
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) { e.preventDefault(); mostrar(true); }
});

mostrar(false);
