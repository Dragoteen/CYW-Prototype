import { BrowserQRCodeReader } from 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.1/+esm';

const qrReader = new BrowserQRCodeReader();
const result = document.getElementById("result");

const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function decodeImageWithCanvas(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = async () => {
      // Ajuster la taille du canvas à l’image
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.style.display = 'block';

      ctx.drawImage(img, 0, 0);

      try {
        const resultQR = await qrReader.decodeFromCanvas(canvas);
        result.textContent = "✅ QR Code : " + resultQR.text;
        console.log("QR détecté :", resultQR.text);
      } catch (err) {
        console.warn("QR non détecté :", err);
        result.textContent = "❌ Aucun QR code détecté.";
      }
    };

    img.onerror = () => {
      console.error("Erreur lors du chargement de l'image");
      result.textContent = "❌ Erreur de chargement de l'image.";
    };
  };

  reader.onerror = () => {
    console.error("Erreur de lecture du fichier");
    result.textContent = "❌ Erreur de lecture du fichier.";
  };

  reader.readAsDataURL(file);
}

cameraInput.onchange = (e) => {
  if (e.target.files[0]) decodeImageWithCanvas(e.target.files[0]);
};

fileInput.onchange = (e) => {
  if (e.target.files[0]) decodeImageWithCanvas(e.target.files[0]);
};
