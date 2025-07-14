const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");
const result = document.getElementById("result");

// Fonction pour lire une image et essayer de décoder un QR code
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) {
        result.textContent = "QR Code : " + code.data;
      } else {
        result.textContent = "❌ Aucun QR code détecté.";
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

cameraInput.onchange = e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
};

fileInput.onchange = e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
};
