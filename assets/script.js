const API_URL = "https://script.google.com/macros/s/AKfycbxh8HHttDdvc4vOgW-LliLGQO9QuLH4mUk_aUnfhz3lybk2FbxYGj3oIdH3r-L8l0mO/exec";

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
      mode: "no-cors",
      body: JSON.stringify({ cancion })
    });

    input.value = "";
    setTimeout(cargarCanciones, 1000);

  } catch (error) {
    console.error("Error agregando canción:", error);
  }
}
