// Ajustes del autor.
// paypal: tu usuario de PayPal.me (lo que va después de paypal.me/). Si se deja vacío,
// el icono del café no aparece.
const CONFIG = {
  paypal: "dosvan00",
  montos: [1, 2, 3],
  moneda: "USD",
};

function enlaceDonacion(monto) {
  const base = "https://www.paypal.com/paypalme/" + encodeURIComponent(CONFIG.paypal);
  return monto ? `${base}/${monto}${CONFIG.moneda}` : base;
}
