const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");
const result = document.getElementById("result");

let points = [
  { x: 50, y: 50 },
  { x: 250, y: 50 },
  { x: 250, y: 250 },
  { x: 50, y: 250 }
];

let img = new Image();
let imageLoaded = false;

// Chargement de l'image
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resetPoints();
      drawOverlay();
      updatePointPositions();
      imageLoaded = true;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

cameraInput.onchange = e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
};

fileInput.onchange = e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
};

function drawOverlay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
}

function resetPoints() {
  points = [
    { x: 50, y: 50 },
    { x: canvas.width - 50, y: 50 },
    { x: canvas.width - 50, y: canvas.height - 50 },
    { x: 50, y: canvas.height - 50 }
  ];
}

function updatePointPositions() {
  const rect = canvas.getBoundingClientRect();
  points.forEach((p, i) => {
    const el = document.getElementById("p" + i);
    el.style.left = rect.left + window.scrollX + p.x + "px";
    el.style.top = rect.top + window.scrollY + p.y + "px";
  });
}

// Gérer le déplacement tactile ou souris
points.forEach((p, i) => {
  const el = document.getElementById("p" + i);
  let dragging = false;

  const start = e => {
    dragging = true;
    e.preventDefault();
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
  };

  const move = e => {
    if (!dragging) return;
    const evt = e.touches ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    p.x = evt.clientX - rect.left;
    p.y = evt.clientY - rect.top;
    drawOverlay();
    updatePointPositions();
  };

  const end = () => {
    dragging = false;
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", end);
    document.removeEventListener("touchmove", move);
    document.removeEventListener("touchend", end);
  };

  el.addEventListener("mousedown", start);
  el.addEventListener("touchstart", start, { passive: false });
});

document.getElementById("scanBtn").onclick = () => {
  if (!imageLoaded) return alert("Aucune image chargée.");

  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  const width = maxX - minX;
  const height = maxY - minY;

  const imageData = ctx.getImageData(minX, minY, width, height);
  const code = jsQR(imageData.data, width, height);

  if (code) {
    result.textContent = "QR détecté : " + code.data;
  } else {
    result.textContent = "❌ Aucun QR code trouvé.";
  }
};
