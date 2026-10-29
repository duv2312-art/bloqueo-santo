// Editar la lista de sitios bloqueados.
const lista = document.getElementById("lista");
const error = document.getElementById("error");
const nuevo = document.getElementById("nuevo");

function normalizar(texto) {
  let s = texto.trim().toLowerCase();
  if (!s) return "";
  if (!/^[a-z]+:\/\//.test(s)) s = "http://" + s;
  try {
    return dominioBase(new URL(s).hostname);
  } catch (_) {
    return "";
  }
}

async function leer() {
  const { sitios } = await chrome.storage.sync.get("sitios");
  return Array.isArray(sitios) ? sitios : [];
}

async function pintar() {
  const sitios = await leer();
  lista.replaceChildren();
  if (!sitios.length) {
    const li = document.createElement("li");
    li.className = "vacio";
    li.textContent = "No hay sitios bloqueados.";
    lista.append(li);
  }
  for (const s of sitios) {
    const li = document.createElement("li");
    const nombre = document.createElement("span");
    nombre.textContent = s;
    const acciones = document.createElement("span");
    acciones.className = "acciones";
    // Sin el permiso del sitio, el navegador no deja aplicar el bloqueo
    if (!(await chrome.permissions.contains(permisoDe(s)))) {
      const activar = document.createElement("button");
      activar.textContent = "Activar";
      activar.title = "Falta el permiso para bloquear este sitio";
      activar.addEventListener("click", async () => {
        if (await chrome.permissions.request(permisoDe(s))) pintar();
      });
      acciones.append(activar);
    }
    const quitar = document.createElement("button");
    quitar.textContent = "Quitar";
    quitar.addEventListener("click", async () => {
      await chrome.storage.sync.set({ sitios: (await leer()).filter((x) => x !== s) });
      await soltarPermiso(s);
      pintar();
    });
    acciones.append(quitar);
    li.append(nombre, acciones);
    lista.append(li);
  }
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const dominio = normalizar(nuevo.value);
  error.textContent = "";
  if (!dominio || !dominio.includes(".")) {
    error.textContent = "Escribe un dominio válido, por ejemplo tiktok.com";
    return;
  }
  // Se pide dentro del clic: el navegador solicita permiso solo para este sitio
  if (!(await chrome.permissions.request(permisoDe(dominio)))) {
    error.textContent = "Sin ese permiso el navegador no deja bloquear el sitio.";
    return;
  }
  const sitios = await leer();
  if (!sitios.includes(dominio)) await chrome.storage.sync.set({ sitios: [...sitios, dominio] });
  nuevo.value = "";
  pintar();
});

pintar();

// Permiso opcional de historial
const casilla = document.getElementById("historial");
const PERMISO = { permissions: ["history"] };
chrome.permissions.contains(PERMISO).then((tiene) => { casilla.checked = tiene; });
casilla.addEventListener("change", async () => {
  if (casilla.checked) casilla.checked = await chrome.permissions.request(PERMISO);
  else await chrome.permissions.remove(PERMISO);
});

if (CONFIG.paypal) {
  const apoyar = document.getElementById("apoyar");
  apoyar.hidden = false;
  apoyar.href = enlaceDonacion();
  apoyar.target = "_blank";
}
