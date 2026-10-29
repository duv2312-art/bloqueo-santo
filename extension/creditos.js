// Lista la fuente de cada cita a partir de citas.js
const tabla = document.getElementById("tabla");
document.getElementById("total").textContent = `${CITAS.length} citas`;

for (const c of [...CITAS].sort((a, b) => a.a.localeCompare(b.a, "es"))) {
  const fila = document.createElement("tr");
  for (const valor of [c.a, c.r, c.f || ""]) {
    const celda = document.createElement("td");
    celda.textContent = valor;
    fila.append(celda);
  }
  tabla.append(fila);
}
