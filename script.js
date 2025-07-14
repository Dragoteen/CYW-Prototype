let html5QrCode;

async function startScanner() {
  const previewElement = document.getElementById("preview");

  // Si une instance existe déjà, l'arrêter
  if (html5QrCode) {
    await html5QrCode.stop();
    html5QrCode.clear();
  }

  html5QrCode = new Html5Qrcode("preview");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      },
      (decodedText) => {
        html5QrCode.stop();
        document.querySelector("#codeResult span").textContent = decodedText;
        showMedaillonInfo(decodedText);
      },
      (errorMessage) => {
        // On ignore les erreurs momentanées de scan
      }
    );
  } catch (err) {
    console.error("Erreur lors du démarrage du scanner :", err);
  }
}

function showMedaillonInfo(code) {
  // Pour l’instant, juste un exemple de sortie
  document.getElementById("medaillonInfo").innerHTML = `
    <p><strong>Médaillon trouvé :</strong> ${code}</p>
    <!-- Ici tu peux ajouter une requête vers Google Sheets ou une base de données -->
  `;
}

document.getElementById("startScan").addEventListener("click", startScanner);
document.getElementById("resetScan").addEventListener("click", startScanner);
