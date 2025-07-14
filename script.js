import { BrowserQRCodeReader } from 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.1/+esm';

const qrReader = new BrowserQRCodeReader();
const result = document.getElementById("result");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");

function decodeImageWithCanvas(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = async () => {
      // Redimensionnement automatique (max 1024px)
      const MAX_WIDTH = 1024;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Afficher le canvas pour debug
      canvas.style.display = 'block';

      // Dessiner image redimensionnée
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const resultQR = await qrReader.decodeFromCanvas(canvas);
        result.textContent = "✅ QR Code détecté : " + resultQR.text;
        console.log("QR détecté :", resultQR.text);
      } catch (err) {
        console.warn("Aucun QR code détecté :", err);
        result.textContent = "❌ Aucun QR code détecté.";
      }
    };

    img.onerror = () => {
      result.textContent = "❌ Erreur de chargement de l'image.";
    };
  };

  reader.onerror = () => {
    result.textContent = "❌ Erreur de lecture du fichier.";
  };

  reader.readAsDataURL(file);
}

// Événements
cameraInput.onchange = (e) => {
  if (e.target.files[0]) decodeImageWithCanvas(e.target.files[0]);
};

fileInput.onchange = (e) => {
  if (e.target.files[0]) decodeImageWithCanvas(e.target.files[0]);
};
