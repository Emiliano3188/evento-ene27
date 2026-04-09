const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbwqW5pW6sjCJ7MPl0QZg1vJTXDDJHzfU7-1bHlcgGFGOqfTx0TYnlQe3nMUH_OjP74t/exec";
                      

let invitadoSeleccionado = null;

/* =========================
   INIT (DOMContentLoaded)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const inv = getInvitado();

  if (!inv) {
    // 🔒 no está logueado → muestra login
    document.getElementById("loginInvitado").style.display = "block";
    document.getElementById("formRSVP").style.display = "none";
    return;
  }

  // 🔓 está logueado → muestra RSVP
  invitadoSeleccionado = inv;

  document.getElementById("loginInvitado").style.display = "none";
  document.getElementById("formRSVP").style.display = "block";

  // 🔥 autocargar datos
  mostrarDatosInvitado(inv);
  generarOpcionesConfirmacion(inv.cupos);
});

/* =========================
   LOGIN POR CODIGO
========================= */
async function validarAcceso() {
  const codigo = document.getElementById("inputCodigo").value.trim();

  if (!codigo) {
    mostrarErrorLogin("Ingresá un código válido");
    return;
  }

  try {
    const res = await fetch(`${RSVP_API_URL}?accion=Invitados`);
    const data = await res.json();

    const invitado = data.find(inv =>
      String(inv.codigo).toLowerCase() === codigo.toLowerCase()
    );

    if (!invitado) {
      mostrarErrorLogin("Código no encontrado");
      return;
    }

    // 🔥 guardar sesión global
    localStorage.setItem("invitado", JSON.stringify(invitado));

    // 🔄 recargar (app.js lo va a levantar)
    location.reload();

  } catch (error) {
    console.error(error);
    mostrarErrorLogin("Error al validar el código");
  }
}

function mostrarErrorLogin(msg) {
  const el = document.getElementById("errorLogin");
  el.textContent = msg;
}

/* =========================
   MOSTRAR DATOS
========================= */
function mostrarDatosInvitado(inv) {
  document.getElementById("datoInvitado").textContent = inv.invitado || "-";
  document.getElementById("datoCodigo").textContent = inv.codigo || "-";
  document.getElementById("datoCupos").textContent = inv.cupos || 0;

  document.getElementById("datosInvitado").style.display = "block";
  document.getElementById("bloqueConfirmacion").style.display = "block";
  document.getElementById("bloqueMensaje").style.display = "block";
  document.getElementById("bloqueBoton").style.display = "block";
}

/* =========================
   OPCIONES DE CONFIRMACION
========================= */
function generarOpcionesConfirmacion(cupos) {
  const select = document.getElementById("confirmacionSelect");
  select.innerHTML = "";

  const opcionNoAsiste = document.createElement("option");
  opcionNoAsiste.value = "0";
  opcionNoAsiste.textContent = "No asistiré";
  select.appendChild(opcionNoAsiste);

  for (let i = 1; i <= cupos; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Confirmo ${i} persona${i > 1 ? "s" : ""}`;
    select.appendChild(option);
  }
}

/* =========================
   GUARDAR RSVP
========================= */
async function guardarRSVP() {
  if (!invitadoSeleccionado) {
    mostrarEstado("Seleccioná un invitado válido.", true);
    return;
  }

  const confirmados = Number(document.getElementById("confirmacionSelect").value);
  const mensaje = document.getElementById("mensajeNovios").value.trim();
  const estadoRsvp = confirmados === 0 ? "No asiste" : "Confirma";

  const url = `${RSVP_API_URL}?accion=guardarRSVP`
    + `&codigo=${encodeURIComponent(invitadoSeleccionado.codigo)}`
    + `&confirmados=${confirmados}`
    + `&estadoRsvp=${encodeURIComponent(estadoRsvp)}`
    + `&mensaje=${encodeURIComponent(mensaje)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.ok) {
      mostrarEstado("✅ Confirmación guardada correctamente", false);
    } else {
      mostrarEstado(data.error || "Error al guardar", true);
    }

  } catch (error) {
    console.error("Error:", error);
    mostrarEstado("Error de conexión", true);
  }
}

/* =========================
   UI HELPERS
========================= */
function mostrarEstado(texto, esError) {
  const estado = document.getElementById("estadoRSVP");
  estado.textContent = texto;
  estado.className = esError ? "estado-rsvp error" : "estado-rsvp ok";
}