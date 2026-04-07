const API_URL = "https://script.google.com/macros/s/TU_SCRIPT/exec";

let invitadoGlobal = null;

/* =========================
   INIT GLOBAL
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  const codigoURL = obtenerCodigoDesdeURL();

  if (codigoURL) {
    await cargarInvitadoPorCodigo(codigoURL);
  } else {
    cargarDesdeStorage();
  }

  aplicarDatosEnUI();
});

/* =========================
   URL PARAM
========================= */
function obtenerCodigoDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("codigo");
}

/* =========================
   API
========================= */
async function cargarInvitadoPorCodigo(codigo) {
  try {
    const res = await fetch(`${API_URL}?accion=Invitados`);
    const data = await res.json();

    if (!Array.isArray(data)) return;

    const inv = data.find(i =>
      String(i.codigo).toLowerCase() === String(codigo).toLowerCase()
    );

    if (!inv) return;

    invitadoGlobal = inv;
    localStorage.setItem("invitado", JSON.stringify(inv));

  } catch (e) {
    console.error("Error cargando invitado", e);
  }
}

/* =========================
   STORAGE
========================= */
function cargarDesdeStorage() {
  const data = localStorage.getItem("invitado");
  if (data) {
    invitadoGlobal = JSON.parse(data);
  }
}

/* =========================
   UI GLOBAL
========================= */
function aplicarDatosEnUI() {
  if (!invitadoGlobal) return;

  // 👉 Saludo global (si existe el elemento)
  const saludo = document.getElementById("saludoInvitado");
  if (saludo) {
    saludo.textContent = `Hola ${invitadoGlobal.invitado} 👋`;
  }

  // 👉 Bloquear RSVP si ya confirmó
  if (invitadoGlobal.estadoRsvp === "Confirma") {
    const btn = document.querySelector(".btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Ya confirmaste ✅";
    }
  }
}

/* =========================
   GET INVITADO GLOBAL
========================= */
function getInvitado() {
  return invitadoGlobal;
}