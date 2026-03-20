
const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbybGQaCLsyZ-EdSTo_xYk6BbUtNjcLjpqRLGwrEaZJVXgfuDzcTwHMEJGxz2kzVwSJ5/exec";

let invitados = [];
let invitadoSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarInvitados();

  const inputBusqueda = document.getElementById("busquedaInvitado");
  inputBusqueda.addEventListener("input", manejarSeleccionInvitado);
  inputBusqueda.addEventListener("change", manejarSeleccionInvitado);
});

async function cargarInvitados() {
  try {
    const res = await fetch(`${RSVP_API_URL}?accion=listarInvitados`);
    const data = await res.json();

    invitados = Array.isArray(data) ? data : [];

    const datalist = document.getElementById("listaInvitados");
    datalist.innerHTML = "";

    invitados.forEach(inv => {
      const option = document.createElement("option");
      option.value = inv.invitado;
      datalist.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando invitados:", error);
    mostrarEstado("No se pudo cargar la lista de invitados.", true);
  }
}

function manejarSeleccionInvitado() {
  const texto = document.getElementById("busquedaInvitado").value.trim().toLowerCase();

  invitadoSeleccionado = invitados.find(
    inv => inv.invitado.trim().toLowerCase() === texto
  );

  if (!invitadoSeleccionado) {
    ocultarBloquesRSVP();
    return;
  }

  mostrarDatosInvitado(invitadoSeleccionado);
  generarOpcionesConfirmacion(invitadoSeleccionado.cupos);
}

function mostrarDatosInvitado(inv) {
  document.getElementById("datoInvitado").textContent = inv.invitado;
  document.getElementById("datoCodigo").textContent = inv.codigo;
  document.getElementById("datoCupos").textContent = inv.cupos;

  document.getElementById("datosInvitado").style.display = "block";
  document.getElementById("bloqueConfirmacion").style.display = "block";
  document.getElementById("bloqueMensaje").style.display = "block";
  document.getElementById("bloqueBoton").style.display = "block";
}

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