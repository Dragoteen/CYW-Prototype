import { BrowserQRCodeReader } from 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.1/+esm';

const qrReader = new BrowserQRCodeReader();
const result = document.getElementById("result");

const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");

async function decodeImageFromFile(file) {
  const imgURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = imgURL;

  img.onload = async () => {
    try {
      const resultQR = await qrReader.decodeFromImageElement(img);
      result.textContent = "QR Code : " + resultQR.text;
    } catch (e) {
      console.warn(e);
      result.textContent = "❌ Aucun QR code détecté.";
    }
  };
}

cameraInput.onchange = e => {
  if (e.target.files[0]) decodeImageFromFile(e.target.files[0]);
};

fileInput.onchange = e => {
  if (e.target.files[0]) decodeImageFromFile(e.target.files[0]);
};
