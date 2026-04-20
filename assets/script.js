const CancionesAPI_URL = "https://script.google.com/macros/s/AKfycbxg_eL_Kfk58E8paJQsH4w2YAnAWsO3X0uorXUhDyq80_2LnzXNovDeZ7da-5nZHFRT/exec";

document.addEventListener("DOMContentLoaded", () => {
  cargarCanciones();
  activarAnimacionScroll();
  iniciarPortadaSobre();
  protegerImagenes();
});

/* -------------------- */
/* CARGAR CANCIONES */
/* -------------------- */

async function cargarCanciones() {
  try {
    const res = await fetch(`${CancionesAPI_URL}?accion=listar`);
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
    const url = `${CancionesAPI_URL}?accion=agregarCancion&cancion=${encodeURIComponent(cancion)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.ok) {
      input.value = "";
      cargarCanciones();
    } else {
      alert(data.error || "No se pudo agregar la canción");
    }

  } catch (error) {
    console.error("Error agregando canción:", error);
    alert("Error al agregar la canción");
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
        "El amor es aquello que todos ansiamos, pero que muy pocos tienen el valor de buscar...";
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
    abrirBtn.classList.add("oculto"); 
    abrirBtn.disabled = true;
    envelopeWrapper.classList.add("open");

    setTimeout(() => {
      overlay.classList.add("oculto");
    }, 5000);

    setTimeout(() => {
      overlay.style.display = "none";
      document.body.classList.remove("intro-lock");
      sessionStorage.setItem("introSobreVisto", "true");
    }, 5900);
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

/* -------------------- */
/* PROTEGER IMAGENES */
/* -------------------- */

function protegerImagenes() {
  const imagenes = document.querySelectorAll(".carousel img");

  imagenes.forEach(img => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-wrap";

    const protector = document.createElement("div");
    protector.className = "img-protect";

    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(protector);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  protegerImagenes();
});

/* -------------------- */
/* BLOQUEAR CLICK DERECHO */
/* -------------------- */

document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

document.querySelectorAll("img").forEach(img => {
  img.addEventListener("dragstart", e => e.preventDefault());
});