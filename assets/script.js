const CancionesAPI_URL = "https://script.google.com/macros/s/AKfycbwaDEJOG8NpgCectMs2tKGmjPRQHyBN9-WEQQWUOg3ZSyNUTBg9tpEO7spf6ND_gGWG/exec";

document.addEventListener("DOMContentLoaded", () => {
  cargarCanciones();
  activarAnimacionScroll();
  iniciarPortadaSobre();
});

/* -------------------- */
/* CARGAR CANCIONES */
/* -------------------- */

async function cargarCanciones() {
  try {
    const res = await fetch(CancionesAPI_URL);
    const data = await res.json();

    const lista = document.getElementById("listaCanciones");

    if (!lista) return;

    lista.innerHTML = "";

    data.forEach(cancion => {
      const li = document.createElement("li");
      li.textContent = cancion;
      lista.appendChild(li);
    });

  } catch (error) {
    console.error("Error cargando canciones:", error);
  }
}

/* -------------------- */
/* AGREGAR CANCION */
/* -------------------- */

async function agregarCancion() {
  const input = document.getElementById("cancion");
  if (!input) return;

  const cancion = input.value.trim();
  if (!cancion) return;

  try {
    await fetch(CancionesAPI_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ cancion })
    });

    input.value = "";
    setTimeout(cargarCanciones, 1000);

  } catch (error) {
    console.error("Error agregando canción:", error);
  }
}

/* -------------------- */
/* ANIMACION SCROLL */
/* -------------------- */

function activarAnimacionScroll() {
  const sections = document.querySelectorAll(".section");
  if (!sections.length) return;

  const mostrarSeccionesVisibles = () => {
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;

      if (top < window.innerHeight - 100) {
        sec.classList.add("visible");
      }
    });
  };

  mostrarSeccionesVisibles();
  window.addEventListener("scroll", mostrarSeccionesVisibles);
}

/* -------------------- */
/* PORTADA SOBRE INICIAL */
/* -------------------- */

function iniciarPortadaSobre() {
  const overlay = document.getElementById("introOverlay");
  const abrirBtn = document.getElementById("abrirSobreBtn");
  const envelopeWrapper = document.getElementById("envelopeWrapper");
  const introGuestName = document.getElementById("introGuestName");
  const introFrontGuest = document.getElementById("introFrontGuest");
  const introKicker = document.querySelector(".intro-kicker");
  const introMessage = document.querySelector(".letter-message");

  console.log("init portada", { overlay, abrirBtn, envelopeWrapper });

  if (!overlay || !abrirBtn || !envelopeWrapper) return;

  const invitado = obtenerInvitadoCompleto();
  const nombreInvitado = invitado?.invitado
    ? capitalizarNombre(invitado.invitado)
    : obtenerNombreInvitadoIntro();

  const yaConfirmo = invitado?.estadoRsvp === "Confirma";

  if (introGuestName) {
    introGuestName.textContent = nombreInvitado ? `Para ${nombreInvitado}` : "Para ti";
  }

  if (introFrontGuest) {
    introFrontGuest.textContent = nombreInvitado ? `Para ${nombreInvitado}` : "Para ti";
  }

  if (yaConfirmo) {
    if (introKicker) {
      introKicker.textContent = "Tu asistencia ya fue confirmada";
    }

    if (introMessage) {
      introMessage.textContent =
        "Gracias por acompañarnos en este momento tan especial. Nos hace muy felices contar con vos.";
    }

    abrirBtn.textContent = "Ver invitación";
  }

  const yaVioIntro = sessionStorage.getItem("introSobreVisto");

  if (yaVioIntro === "true") {
    overlay.style.display = "none";
    document.body.classList.remove("intro-lock");
    return;
  }

  document.body.classList.add("intro-lock");

  abrirBtn.onclick = function () {
    console.log("CLICK SOBRE");
    abrirBtn.disabled = true;
    envelopeWrapper.classList.add("open");

    setTimeout(() => {
      overlay.classList.add("oculto");
    }, 900);

    setTimeout(() => {
      overlay.style.display = "none";
      document.body.classList.remove("intro-lock");
      sessionStorage.setItem("introSobreVisto", "true");
    }, 1800);
  };
}

function obtenerInvitadoCompleto() {
  try {
    const data = localStorage.getItem("invitado");
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Error leyendo invitado desde storage:", error);
    return null;
  }
}

function obtenerNombreInvitadoIntro() {
  const params = new URLSearchParams(window.location.search);

  const desdeQuery =
    params.get("nombre") ||
    params.get("invitado") ||
    params.get("guest");

  const desdeStorage =
    localStorage.getItem("nombreInvitado") ||
    sessionStorage.getItem("nombreInvitado") ||
    localStorage.getItem("invitadoNombre") ||
    sessionStorage.getItem("invitadoNombre");

  const nombreFinal = (desdeQuery || desdeStorage || "").trim();

  if (!nombreFinal) return "";

  return capitalizarNombre(nombreFinal);
}

function capitalizarNombre(texto) {
  return texto
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}