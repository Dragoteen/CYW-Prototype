const SHEET_URL = "https://api.sheety.co/d7cbcb1c41ac163fbaff577fe727b2bd/collectionYoKaiWatch [jp]Médaillons/medaillons";

let database = [];

async function fetchDatabase() {
  const res = await fetch(SHEET_URL);
  database = await res.json();
}

document.getElementById("startScan").addEventListener("click", async () => {
  if (database.length === 0) await fetchDatabase();

  const html5QrCode = new Html5Qrcode("preview");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      html5QrCode.stop();
      document.querySelector("#codeResult span").textContent = decodedText;
      showMedaillonInfo(decodedText);
    },
    (errorMessage) => {}
  );
});

function showMedaillonInfo(code) {
  const result = database.find(m => m.code === code);
  const resultDiv = document.getElementById("result");

  if (result) {
    document.getElementById("nomMedaillon").textContent = result.nom;
    document.getElementById("typeMedaillon").textContent = "Type : " + result.type;
    document.getElementById("imageMedaillon").src = result.image;
    resultDiv.style.display = "block";
  } else {
    document.getElementById("nomMedaillon").textContent = "Médaillon non trouvé.";
    document.getElementById("typeMedaillon").textContent = "";
    document.getElementById("imageMedaillon").src = "";
    resultDiv.style.display = "block";
  }
}
