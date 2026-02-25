const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbzwuSYWFcpMTVTG4PoGaTWK38idvwW9mHpuRBH2nukKx5kUm2SUZnbZU_g3jTIhPhDL/exec";

async function subirFotos() {
  const archivos = document.getElementById("foto").files;
  const estado = document.getElementById("estado");

  if (!archivos.length) return;

  estado.textContent = "Subiendo fotos...";

  for (let archivo of archivos) {
    if (archivo.size > 5 * 1024 * 1024) {
      alert("Una foto supera los 5MB.");
      continue;
    }

    const reader = new FileReader();

    reader.onload = async function(e) {
      await fetch(UPLOAD_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          nombre: archivo.name,
          tipo: archivo.type,
          datos: e.target.result.split(',')[1]
        })
      });
    };

    reader.readAsDataURL(archivo);
  }

  setTimeout(() => {
    estado.textContent = "Fotos enviadas correctamente 🎉";
  }, 2000);
}