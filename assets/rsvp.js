
const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbxuXrhH1Aq1z0vHtQeNw3KOBlrOm9bt-giqR0txunmGH3hWQjqb7etv0I-h4QTPlJ11/exec";

let invitados = [];
let invitadoSeleccionado = null;
document.addEventListener("DOMContentLoaded", () => {
  cargarInvitados();

  const inputBusqueda = document.getElementById("busquedaInvitado");

  let timeoutBusqueda;

  inputBusqueda.addEventListener("input", () => {
    clearTimeout(timeoutBusqueda);

    timeoutBusqueda = setTimeout(() => {
      manejarSeleccionInvitado();
    }, 400);
  });
});
// document.addEventListener("DOMContentLoaded", () => {
//   cargarInvitados();

//   const inputBusqueda = document.getElementById("busquedaInvitado");
//   inputBusqueda.addEventListener("input", manejarSeleccionInvitado);
// });

/* =========================
   CARGAR INVITADOS
========================= */
async function cargarInvitados() {
  try {
    const res = await fetch(`${RSVP_API_URL}?accion=Invitados`);
    const data = await res.json();

    invitados = Array.isArray(data) ? data : [];

    const datalist = document.getElementById("Invitados");
    datalist.innerHTML = "";

    invitados.forEach(inv => {
      const nombre = String(inv.invitado || "").trim();
      if (!nombre) return;

      const option = document.createElement("option");
      option.value = nombre;
      datalist.appendChild(option);
    });

  } catch (error) {
    console.error("Error cargando invitados:", error);
    mostrarEstado("No se pudo cargar la lista de invitados.", true);
  }
}

/* =========================
   BUSQUEDA INTELIGENTE
========================= */
function manejarSeleccionInvitado() {
  const texto = document.getElementById("busquedaInvitado").value
    .trim()
    .toLowerCase();

  if (!texto) {
    ocultarBloquesRSVP();
    return;
  }

  // 🔥 BUSQUEDA TOLERANTE (contiene texto)
  invitadoSeleccionado = invitados.find(inv => {
    const nombre = String(inv.invitado || "").toLowerCase();
    return nombre.includes(texto);
  });

  if (!invitadoSeleccionado) {
    ocultarBloquesRSVP();
    return;
  }

  mostrarDatosInvitado(invitadoSeleccionado);
  generarOpcionesConfirmacion(invitadoSeleccionado.cupos);
}

/* =========================
   MOSTRAR DATOS
========================= */
function mostrarDatosInvitado(inv) {
  document.getElementById("datoInvitado").textContent = inv.invitado;
  document.getElementById("datoCodigo").textContent = inv.codigo;
  document.getElementById("datoCupos").textContent = inv.cupos;

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

  const payload = {
    accion: "guardarRSVP",
    codigo: invitadoSeleccionado.codigo,
    confirmados,
    estadoRsvp,
    mensaje,
    observaciones: ""
  };

  try {
    const res = await fetch(RSVP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.ok) {
      mostrarEstado("Tu respuesta fue guardada correctamente. ¡Gracias!", false);
    } else {
      mostrarEstado(data.error || "No se pudo guardar la confirmación.", true);
    }

  } catch (error) {
    console.error("Error guardando RSVP:", error);
    mostrarEstado("Ocurrió un error al guardar la confirmación.", true);
  }
}

/* =========================
   UI HELPERS
========================= */
function ocultarBloquesRSVP() {
  document.getElementById("datosInvitado").style.display = "none";
  document.getElementById("bloqueConfirmacion").style.display = "none";
  document.getElementById("bloqueMensaje").style.display = "none";
  document.getElementById("bloqueBoton").style.display = "none";
}

function mostrarEstado(texto, esError) {
  const estado = document.getElementById("estadoRSVP");
  estado.textContent = texto;
  estado.className = esError ? "estado-rsvp error" : "estado-rsvp ok";
}