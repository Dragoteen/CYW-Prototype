const videoElement = document.getElementById('video');
const resultSpan = document.querySelector('#result span');
let codeReader;

async function startScanner() {
  // Nettoie d'abord si une instance existait
  if (codeReader) {
    await codeReader.reset();
  }

  codeReader = new ZXing.BrowserMultiFormatReader();

  try {
    const devices = await ZXing.BrowserCodeReader.listVideoInputDevices();
    const backCamera = devices.find(device => device.label.toLowerCase().includes('back')) || devices[0];

    await codeReader.decodeFromVideoDevice(backCamera.deviceId, videoElement, (result, err) => {
      if (result) {
        resultSpan.textContent = result.text;
        codeReader.reset(); // Stop scan après détection
        showMedaillonInfo(result.text);
      }
    });

  } catch (error) {
    console.error('Erreur accès caméra ou scan :', error);
    alert("Impossible d'accéder à la caméra.");
  }
}

function showMedaillonInfo(code) {
  // Ici tu peux connecter à ta Google Sheet ou afficher des infos personnalisées
  console.log("QR détecté :", code);
}

document.getElementById("startBtn").addEventListener("click", startScanner);
document.getElementById("resetBtn").addEventListener("click", startScanner);
