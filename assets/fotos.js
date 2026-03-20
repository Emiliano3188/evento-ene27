const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbwcfdQQ-QQ3sROi_zL85C88ljAZjGiLsfynxf5BJPHqpFH2A_p4sZs5Hva1FnDlExV9/exec";

async function subirFotos() {

  const archivos = document.getElementById("foto").files;
  const estado = document.getElementById("estado");

  if (!archivos.length) {
    estado.textContent = "Selecciona al menos una foto.";
    return;
  }

  estado.textContent = "Subiendo fotos...";

  let errores = 0;

  for (let archivo of archivos) {

    // límite razonable (15MB)
    if (archivo.size > 15 * 1024 * 1024) {
      alert(`La imagen ${archivo.name} supera los 15MB.`);
      errores++;
      continue;
    }

    const formData = new FormData();
    formData.append("file", archivo);

    try {

      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        body: archivo // enviamos directamente el archivo
      });

      if (!response.ok) {
        errores++;
      }

    } catch (error) {
      errores++;
    }
  }

  if (errores > 0) {
    estado.textContent = "Algunas fotos no se pudieron subir. Intenta nuevamente.";
  } else {
    estado.textContent = "Fotos enviadas correctamente 🎉";
  }
}