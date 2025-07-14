const videoElement = document.getElementById('video');
const resultSpan = document.querySelector('#result span');
let codeReader;

async function startScanner() {
  if (codeReader) {
    await codeReader.reset();
  }
  codeReader = new ZXing.BrowserMultiFormatReader();

  try {
    await codeReader.decodeOnceFromVideoDevice(undefined, videoElement)
      .then(result => {
        resultSpan.textContent = result.text;
        codeReader.reset();
      })
      .catch(err => {
        console.error("Erreur scan :", err);
        alert("Erreur lors du scan : " + err);
      });
  } catch (e) {
    console.error("Erreur caméra :", e);
    alert("Impossible d'accéder à la caméra");
  }
}

document.getElementById('startBtn').addEventListener('click', startScanner);
document.getElementById('resetBtn').addEventListener('click', startScanner);
