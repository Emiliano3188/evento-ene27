const API_URL = "https://script.google.com/macros/s/AKfycbxh8HHttDdvc4vOgW-LliLGQO9QuLH4mUk_aUnfhz3lybk2FbxYGj3oIdH3r-L8l0mO/exec";

document.addEventListener("DOMContentLoaded", () => {
  cargarCanciones();
  activarAnimacionScroll();
});


/* -------------------- */
/* CARGAR CANCIONES */
/* -------------------- */

async function cargarCanciones() {

  try {

    const res = await fetch(API_URL);
    const data = await res.json();

    const lista = document.getElementById("listaCanciones");

    if(!lista) return;

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
  const cancion = input.value.trim();

  if (!cancion) return;

  try {

    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ cancion })
    });

    input.value = "";

    setTimeout(cargarCanciones,1000);

  } catch (error) {

    console.error("Error agregando canción:", error);

  }

}


/* -------------------- */
/* ANIMACION SCROLL */
/* -------------------- */

function activarAnimacionScroll(){

  const sections = document.querySelectorAll(".section");

  window.addEventListener("scroll", () => {

    sections.forEach(sec => {

      const top = sec.getBoundingClientRect().top;

      if(top < window.innerHeight - 100){
        sec.classList.add("visible");
      }

    });

  });

}

/* PETALOS CAYENDO */

function crearPetalo(){

const petalo = document.createElement("div");

petalo.className = "petalo";

petalo.style.left = Math.random()*100 + "vw";

petalo.style.animationDuration = (8 + Math.random()*6) + "s";

petalo.style.transform = `rotate(${Math.random()*360}deg)`;

document.body.appendChild(petalo);

setTimeout(()=>{
petalo.remove();
},15000);

}

/* velocidad de aparición */

setInterval(crearPetalo,1800);

