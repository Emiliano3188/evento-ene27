const API_URL = "PEGA_AQUI_TU_URL_DEL_APPS_SCRIPT";

document.addEventListener("DOMContentLoaded", cargarCanciones);

async function cargarCanciones() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const lista = document.getElementById("listaCanciones");
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

async function agregarCancion() {
  const input = document.getElementById("cancion");
  const cancion = input.value.trim();

  if (!cancion) return;

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify({ cancion })
    });

    input.value = "";
    cargarCanciones();

  } catch (error) {
    console.error("Error agregando canción:", error);
  }
}
