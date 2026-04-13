const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbxgy-hf0Twx_tHVmUUbW28Scku9kd5cshqUjfSGUp0exDKO_pdB5xaq8sXknjczNTde/exec";

let invitadoSeleccionado = null;

/* =========================
   CONFIG FECHA LIMITE
========================= */
const FECHA_LIMITE_RSVP = new Date("2026-11-30T23:59:59");

/* =========================
   INIT (DOMContentLoaded)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const inv = getInvitado();

  if (!inv) {
    document.getElementById("loginInvitado").style.display = "block";
    document.getElementById("formRSVP").style.display = "none";
    return;
  }

  invitadoSeleccionado = inv;

  document.getElementById("loginInvitado").style.display = "none";
  document.getElementById("formRSVP").style.display = "block";

  mostrarDatosInvitado(inv);
  generarOpcionesConfirmacion(inv.cupos);
  cargarRespuestaGuardada(inv);
  aplicarEstadoEdicion(inv);
  
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

    localStorage.setItem("invitado", JSON.stringify(invitado));
    localStorage.setItem("nombreInvitado", invitado.invitado || "");

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

  // 👇 PLACEHOLDER (VA PRIMERO)
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Seleccioná tu respuesta";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  // 👇 OPCIÓN NO ASISTE
  const opcionNoAsiste = document.createElement("option");
  opcionNoAsiste.value = "0";
  opcionNoAsiste.textContent = "No asistiré";
  select.appendChild(opcionNoAsiste);

  // 👇 OPCIONES SEGÚN CUPOS
  for (let i = 1; i <= cupos; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Confirmo ${i} persona${i > 1 ? "s" : ""}`;
    select.appendChild(option);
  }
}

/* =========================
   ESTADO DE EDICION
========================= */
function puedeEditarRSVP() {
  const ahora = new Date();
  return ahora <= FECHA_LIMITE_RSVP;
}

function aplicarEstadoEdicion(inv) {
  const select = document.getElementById("confirmacionSelect");
  const mensaje = document.getElementById("mensajeNovios");
  const btn = document.querySelector("#bloqueBoton .btn");
  const leyenda = document.getElementById("leyendaCierreRSVP");

  if (!select || !mensaje || !btn || !leyenda) return;

  if (puedeEditarRSVP()) {
    leyenda.textContent =
      "Podrás confirmar o modificar tu respuesta hasta el 30 de Noviembre de 2026.";
    return;
  }

  select.disabled = true;
  mensaje.disabled = true;
  btn.disabled = true;
  btn.textContent = "RSVP cerrado";

  leyenda.textContent =
    "El plazo para confirmar o modificar la asistencia finalizó el 30 de Noviembre de 2026.";

  if (inv && inv.estadoRsvp === "Confirma") {
    mostrarEstado("Tu asistencia ya había sido registrada previamente ✅", false);
  } else if (inv && inv.estadoRsvp === "No asiste") {
    mostrarEstado("Tu respuesta ya había sido registrada previamente.", false);
  } else {
    mostrarEstado("El plazo para responder ya finalizó.", true);
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

  if (!puedeEditarRSVP()) {
    mostrarEstado("El plazo para confirmar o modificar finalizó el 30 de Noviembre de 2026.", true);
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

      invitadoSeleccionado.confirmados = confirmados;
      invitadoSeleccionado.estadoRsvp = estadoRsvp;
      invitadoSeleccionado.mensaje = mensaje;

      localStorage.setItem("invitado", JSON.stringify(invitadoSeleccionado));
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

function generarOpcionesConfirmacion(cupos) {
  const select = document.getElementById("confirmacionSelect");
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Seleccioná tu respuesta";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  const opcionNoAsiste = document.createElement("option");
  opcionNoAsiste.value = "0";
  opcionNoAsiste.textContent = "No asistiré";
  select.appendChild(opcionNoAsiste);

  for (let i = 1; i <= cupos; i++) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `Confirmo ${i} persona${i > 1 ? "s" : ""}`;
    select.appendChild(option);
  }
}
function cargarRespuestaGuardada(inv) {
  if (!inv) return;

  const select = document.getElementById("confirmacionSelect");
  const textarea = document.getElementById("mensajeNovios");

  if (select) {
    if (inv.estadoRsvp === "No asiste") {
      select.value = "0";
    } else if (inv.confirmados && inv.confirmados > 0) {
      select.value = String(inv.confirmados);
    }
  }

  if (textarea) {
    textarea.value = inv.mensaje ? inv.mensaje : "";
  }
}