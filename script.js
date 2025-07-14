const videoElement = document.getElementById('video');
const resultSpan = document.querySelector('#result span');
let codeReader = null;

async function startScanner() {
  // Si déjà actif, on reset
  if (codeReader) {
    await codeReader.reset();
  }

  codeReader = new ZXing.BrowserMultiFormatReader();

  try {
    const videoInputDevices = await ZXing.BrowserCodeReader.listVideoInputDevices();

    if (videoInputDevices.length === 0) {
      alert("Aucune caméra trouvée.");
      return;
    }

    const preferredDevice = videoInputDevices.find(device =>
      device.label.toLowerCase().includes('back')
    ) || videoInputDevices[0];

    // Lance le scanner
    await codeReader.decodeFromVideoDevice(preferredDevice.deviceId, videoElement, (result, error) => {
      if (result) {
        resultSpan.textContent = result.text;
        codeReader.reset(); // Stop le scan
        showMedaillonInfo(result.text);
      }
    });

  } catch (err) {
    console.error("Erreur d'accès caméra :", err);
    alert("Erreur : la caméra n'a pas pu être démarrée.");
  }
}

function showMedaillonInfo(code) {
  document.getElementById("result").innerHTML = `Code scanné : <span>${code}</span>`;
}

document.getElementById("startBtn").addEventListener("click", startScanner);
document.getElementById("resetBtn").addEventListener("click", startScanner);
