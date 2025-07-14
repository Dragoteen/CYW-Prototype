const inputImage = document.getElementById("inputImage");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const points = ["p1", "p2", "p3", "p4"].map(id => document.getElementById(id));
const resultDiv = document.getElementById("result");
let img = new Image();
let imgLoaded = false;

// Init positions
let positions = [
  { x: 50, y: 50 },
  { x: 200, y: 50 },
  { x: 200, y: 200 },
  { x: 50, y: 200 }
];

inputImage.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = Math.min(img.width, 400);
    canvas.height = (img.height * canvas.width) / img.width;
    imgLoaded = true;
    draw();
    updatePoints();
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

function draw() {
  if (!imgLoaded) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Dessiner le quadrilatère
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(positions[0].x, positions[0].y);
  for (let i = 1; i < 4; i++) ctx.lineTo(positions[i].x, positions[i].y);
  ctx.closePath();
  ctx.stroke();
}

function updatePoints() {
  positions.forEach((pos, i) => {
    const el = points[i];
    el.style.left = pos.x + "px";
    el.style.top = pos.y + "px";
  });
}

let dragIndex = null;
points.forEach((point, i) => {
  point.addEventListener("pointerdown", e => {
    dragIndex = i;
    point.setPointerCapture(e.pointerId);
  });
  point.addEventListener("pointermove", e => {
    if (dragIndex === i) {
      const rect = canvas.getBoundingClientRect();
      positions[i].x = e.clientX - rect.left;
      positions[i].y = e.clientY - rect.top;
      draw();
      updatePoints();
    }
  });
  point.addEventListener("pointerup", () => {
    dragIndex = null;
  });
});

document.getElementById("scanBtn").addEventListener("click", () => {
  if (!imgLoaded) return;

  const xMin = Math.min(...positions.map(p => p.x));
  const yMin = Math.min(...positions.map(p => p.y));
  const xMax = Math.max(...positions.map(p => p.x));
  const yMax = Math.max(...positions.map(p => p.y));

  const width = xMax - xMin;
  const height = yMax - yMin;

  const imageData = ctx.getImageData(xMin, yMin, width, height);
  const code = jsQR(imageData.data, width, height);

  if (code) {
    resultDiv.textContent = "Résultat : " + code.data;
  } else {
    resultDiv.textContent = "QR code non détecté.";
  }
});
