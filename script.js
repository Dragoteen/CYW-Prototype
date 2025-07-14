const btnTakePhoto = document.getElementById('btn-take-photo');
const btnSelectPhoto = document.getElementById('btn-select-photo');
const inputTakePhoto = document.getElementById('input-take-photo');
const inputSelectPhoto = document.getElementById('input-select-photo');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const message = document.getElementById('message');

btnTakePhoto.addEventListener('click', () => {
  inputTakePhoto.value = null; // reset file input
  inputTakePhoto.click();
});

btnSelectPhoto.addEventListener('click', () => {
  inputSelectPhoto.value = null; // reset file input
  inputSelectPhoto.click();
});

inputTakePhoto.addEventListener('change', e => {
  if (e.target.files && e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

inputSelectPhoto.addEventListener('change', e => {
  if (e.target.files && e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

async function handleFile(file) {
  message.textContent = "Chargement de l'image...";
  const img = new Image();
  img.onload = async () => {
    // Agrandissement & recadrage du canvas
    const MAX_WIDTH = 2048;
    let scale = 1;
    if(img.width > MAX_WIDTH) {
      scale = MAX_WIDTH / img.width;
    }
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Zoom centré sur le canvas
    const cropSize = canvas.width / 2;
    const sx = (canvas.width - cropSize) / 2;
    const sy = (canvas.height - cropSize) / 2;

    const imageData = ctx.getImageData(sx, sy, cropSize, cropSize);
    canvas.width = cropSize;
    canvas.height = cropSize;
    ctx.putImageData(imageData, 0, 0);

    canvas.style.display = 'block';

    message.textContent = "Analyse en cours...";
    try {
      const code = await decodeQRCodeFromCanvas(canvas);
      message.textContent = "QR Code détecté : " + code;
      // Ici tu peux ajouter la logique pour chercher dans ta base de données
    } catch (err) {
      message.textContent = "❌ Aucun QR code détecté.";
    }
  };

  img.onerror = () => {
    message.textContent = "Erreur lors du chargement de l'image.";
  };

  // Lecture du fichier en base64
  const reader = new FileReader();
  reader.onload = (ev) => {
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function decodeQRCodeFromCanvas(canvas) {
  return new Promise((resolve, reject) => {
    try {
      const luminanceSource = new ZXing.HTMLCanvasElementLuminanceSource(canvas);
      const binarizer = new ZXing.GlobalHistogramBinarizer(luminanceSource);
      const binaryBitmap = new ZXing.BinaryBitmap(binarizer);
      const reader = new ZXing.MultiFormatReader();
      const result = reader.decode(binaryBitmap);
      resolve(result.getText());
    } catch (e) {
      reject(e);
    }
  });
}
