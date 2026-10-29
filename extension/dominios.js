// Reduce un nombre de host al dominio que conviene bloquear:
// m.youtube.com -> youtube.com, www.eltiempo.com.co -> eltiempo.com.co
const SEGUNDO_NIVEL = ["com", "co", "org", "net", "gov", "gob", "edu", "ac", "mil"];

function dominioBase(host) {
  const partes = host.toLowerCase().replace(/\.$/, "").split(".");
  if (partes.length <= 2 || /^\d+$/.test(partes[partes.length - 1])) return partes.join(".");
  const [penultima, ultima] = partes.slice(-2);
  const n = ultima.length === 2 && SEGUNDO_NIVEL.includes(penultima) ? 3 : 2;
  return partes.slice(-n).join(".");
}
