const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");
const result = document.getElementById("result");

let points = [
  { x: 10, y: 10 },
  { x: 290, y: 10 },
  { x: 290, y: 290 },
  { x: 10, y: 290 }
];

let img = new Image();
let imageLoaded = false;

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    img.onload = () => {
      const scale = 300 / img.width;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      points = [
        { x: 10, y: 10 },
        { x: canvas.width - 10, y: 10 },
        { x: canvas.width - 10, y: canvas.height - 10 },
        { x: 10, y: canvas.height - 10 }
      ];
      drawOverlay();
      updatePoints();
      imageLoaded = true;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

cameraInput.addEventListener("change", e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

fileInput.addEventListener("change", e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

function drawOverlay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.stroke();
}

function updatePoints() {
  const rect = canvas.getBoundingClientRect();
  points.forEach((p, i) => {
    const el = document.getElementById("p" + i);
    el.style.left = rect.left + window.scrollX + p.x + "px";
    el.style.top = rect.top + window.scrollY + p.y + "px";
  });
}

points.forEach((pt, i) => {
  const el = document.getElementById("p" + i);
  let dragging = false;

  const start = e => {
    dragging = true;
    e.preventDefault();

    const move = ev => {
      if (!dragging) return;
      const touch = ev.touches ? ev.touches[0] : ev;
      const rect = canvas.getBoundingClientRect();
      pt.x = touch.clientX - rect.left;
      pt.y = touch.clientY - rect.top;
      drawOverlay();
      updatePoints();
    };

    const end = () => {
      dragging = false;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
  };

  el.addEventListener("mousedown", start);
  el.addEventListener("touchstart", start, { passive: false });
});

document.getElementById("scanBtn").addEventListener("click", () => {
  if (!imageLoaded) return;

  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));

  const width = maxX - minX;
  const height = maxY - minY;

  const imageData = ctx.getImageData(minX, minY, width, height);
  const code = jsQR(imageData.data, width, height);

  if (code) {
    result.textContent = "QR trouvé : " + code.data;
    sendToGoogleSheet(code.data);
  } else {
    result.textContent = "QR non détecté.";
  }
});

// 🔗 Envoie vers Google Sheets (via Web App déployée)
function sendToGoogleSheet(qrData) {
  const url =
    "https://script.google.com/macros/s/https://api.sheety.co/d7cbcb1c41ac163fbaff577fe727b2bd/collectionYoKaiWatch [jp]Médaillons/medaillons/exec?code=" +
    encodeURIComponent(qrData);

  fetch(url)
    .then(r => r.json())
    .then(data => {
      result.textContent += "\n🔎 Médaillon : " + data.nom || "Introuvable";
    })
    .catch(err => {
      console.error(err);
      result.textContent += "\n❌ Erreur API";
    });
}
