const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");
const result = document.getElementById("result");

const points = [
  { x: 50, y: 50 },
  { x: 200, y: 50 },
  { x: 200, y: 200 },
  { x: 50, y: 200 }
];

let img = new Image();
let imageLoaded = false;

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    img.onload = () => {
      const scale = 300 / img.width;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      imageLoaded = true;

      // Initialiser les points
      points[0] = { x: 50, y: 50 };
      points[1] = { x: canvas.width - 50, y: 50 };
      points[2] = { x: canvas.width - 50, y: canvas.height - 50 };
      points[3] = { x: 50, y: canvas.height - 50 };
      updateCanvas();
      updatePoints();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((p, i) => {
    if (i > 0) ctx.lineTo(p.x, p.y);
  });
  ctx.lineTo(points[0].x, points[0].y);
  ctx.stroke();
}

function updatePoints() {
  points.forEach((p, i) => {
    const el = document.getElementById("p" + i);
    const rect = canvas.getBoundingClientRect();
    el.style.left = canvas.offsetLeft + p.x + "px";
    el.style.top = canvas.offsetTop + p.y + "px";
  });
}

// Gérer déplacement des boules
points.forEach((pt, i) => {
  const el = document.getElementById("p" + i);
  let isDragging = false;

  el.addEventListener("pointerdown", e => {
    isDragging = true;

    const move = ev => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      pt.x = ev.clientX - rect.left;
      pt.y = ev.clientY - rect.top;
      updateCanvas();
      updatePoints();
    };

    const up = () => {
      isDragging = false;
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  });
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
    result.textContent = "Résultat : " + code.data;
  } else {
    result.textContent = "QR non détecté.";
  }
});
